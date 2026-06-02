import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import { get } from 'lodash';
import Swal from 'sweetalert2';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

@Component({
    selector: 'app-sing-off-super-dept-action',
    providers: [GridJsService, DecimalPipe, EbudgetService],
    templateUrl: './singOffSuperDeptAction.component.html',
    styles: ``
})
export class SingOffSuperDeptActionComponent {
    constructor(private modalService: NgbModal, public service: GridJsService
        , private sortService: PaginationService, public serviceebud: EbudgetService
        , private authService: AuthenticationService, private budgetYearService: BudgetYearService) {
    }
    allData: any[] = [];
    griddata: any[] = [
        {
            selected: false,
            department: 'สำนักยุทธศาสตร์',
            plan: 'แผนพัฒนาระบบสารสนเทศ',
            output: 'ระบบบริหารจัดการข้อมูล',
            activity: 'พัฒนาระบบ Dashboard',
            budgetType: 'งบดำเนินงาน',
            project: 'ระบบข้อมูลกลาง',
            budget: 250000,
            Status_Number: 2,
            status_name: 'รออนุมัติ'
        },
        {
            selected: false,
            department: 'กองแผนงาน',
            plan: 'แผนพัฒนาบุคลากร',
            output: 'อบรมเพิ่มทักษะ',
            activity: 'อบรม Data Analytics',
            budgetType: 'งบลงทุน',
            project: 'พัฒนาศักยภาพบุคลากร',
            budget: 120000,
            Status_Number: 8,
            status_name: 'อนุมัติแล้ว'
        }
    ];
    modalRef: any;
    total$!: Observable<number>;

    emptyplan: any = {
        Plan_Id: 0,
        Plan_Name: '',
        Active: 1
    };
    currentYear: any
    ngOnInit(): void {

        this.budgetYearService.yearChanged$.subscribe(async year => {
            if (year) {
                if (year < 2500) {
                    year = year + 543
                }
                this.currentYear = year

                this.get_data()
            }
        });



    }
    get_data() {
        let model = {
            FUNC_CODE: "FUNC-Get_Budget_Plan_SingOff_SuperDeptAction",
            BgYear: this.currentYear
        }
        var getData = this.serviceebud.GatewayGetData(model);
        getData.subscribe((response: any) => {
            this.allData = Array.isArray(response.List_Budget_Plan_Main.Data)
                ? response.List_Budget_Plan_Main.Data
                : [];
            this.griddata = [...this.allData];

        })
    }
    filterSearch() {

        const keyword = (this.service.searchTerm || '').toLowerCase().trim();

        if (!keyword) {
            this.griddata = [...this.allData];
            return;
        }

        this.griddata = this.allData.filter((row: any) =>
            Object.values(row)
                .join(' ')
                .toLowerCase()
                .includes(keyword)
        );
    }

    toggleAll(event: any) {

        const checked = event.target.checked;

        this.griddata.forEach((item: any) => {

            // ไม่เลือกแถวที่ status = 6
            if (item.Status_Id != 6) {
                item.selected = checked;
            }

        });

    }
    // toggleAll(event: any) {
    //   const checked = event.target.checked;

    //   this.griddata.forEach(item => {
    //     item.selected = checked;
    //   });
    // }
    // async CancelSignOff() {
    //   const userConfirmed = await confirmAlert('info', 'ต้องการยกเลิกการยืนยันโครงการ ?', '');

    //   if (!userConfirmed) return;

    //   const selectedRows = this.griddata.filter(x => x.selected);

    //   if (selectedRows.length === 0) {
    //     basicAlert('warning', 'กรุณาเลือกรายการ', '');
    //     return;
    //   }

    //   if (userConfirmed) {
    //     const payload = selectedRows.map(x => ({
    //       Project_Id: x.Project_Id,
    //       Status_Number: 8
    //     }));

    //     let model = {
    //       FUNC_CODE: "FUNC-Cancel_SignOff_SuperDept_Project_Plan",
    //       List_Project_Plan: payload
    //     };
    //     this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
    //       basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
    //       this.get_data();
    //     });
    //   }
    // }

    async CancelSignOff(Plan_Id: number) {

        const userConfirmed = await confirmAlert(
            'info',
            'ต้องการยกเลิก Sign off แผนปฎิบัติการ ?',
            ''
        );

        if (!userConfirmed) return;

        const payload = [
            {
                Plan_Id: Plan_Id,
            }
        ];

        let model = {
            FUNC_CODE: "FUNC-Cancel_SingOff_SuperDeptAction_Budget_Plan",
            List_Budget_Plan: payload
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

            basicAlert('success', 'ยกเลิกการ Sign off แผนปฎิบัติการ แล้ว', '');

            this.get_data();

        });

    }
    async SignOff() {

        const userConfirmed = await confirmAlert('info', 'ต้องการ Sign off แผนปฎิบัติการ ?', '');

        if (!userConfirmed) return;

        const selectedRows = this.griddata.filter(x => x.selected);

        if (selectedRows.length === 0) {
            basicAlert('warning', 'กรุณาเลือกรายการ', '');
            return;
        }

        const payload = selectedRows.map(x => ({
            Plan_Id: x.Plan_Id,
        }));

        let model = {
            FUNC_CODE: "FUNC-SingOff_SuperDeptAction_Budget_Plan",
            List_Budget_Plan: payload
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
            basicAlert('success', 'บันทึก Sign off แผนปฎิบัติการ แล้ว', '');
            this.get_data(); // reload
        });

    }

    fullModal(modal: any, data: any) {


        this.modalRef = this.modalService.open(modal, {
            backdrop: 'static',
            windowClass: 'modal-95'
        });
    }
    deletePlan(data: any) {

    }
}
