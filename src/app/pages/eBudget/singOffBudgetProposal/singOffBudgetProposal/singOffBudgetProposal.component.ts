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
  selector: 'app-sing-off-budget-proposal',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './singOffBudgetProposal.component.html',
  styles: ``
})
export class SingOffBudgetProposalComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , public sortService: PaginationService, public serviceebud: EbudgetService
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
  get pagedGriddata(): any[] {
    return this.sortService.changePage(this.griddata);
  }

  get pageStartIndex(): number {
    const total = this.griddata.length;
    if (!total) return 0;

    const pageSize = Number(this.sortService.pageSize) || 1;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, Number(this.sortService.page) || 1), maxPage);
    return (safePage - 1) * pageSize + 1;
  }

  get pageEndIndex(): number {
    const total = this.griddata.length;
    if (!total) return 0;

    const pageSize = Number(this.sortService.pageSize) || 1;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, Number(this.sortService.page) || 1), maxPage);
    return Math.min(safePage * pageSize, total);
  }

  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };

  currentYear: any
  ngOnInit(): void {
    this.sortService.pageSize = this.service.pageSize;

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
      FUNC_CODE: "FUNC-Get_Budget_Request_Sign_Off",
      BgYear: this.currentYear
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.allData = Array.isArray(response.List_Budget_Request_Main.Data)
        ? response.List_Budget_Request_Main.Data
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

      // ไม่เลือกแถวที่ status = 3
      if (item.Status_Id != 3) {
        item.selected = checked;
      }

    });

  }

  async CancelSignoff(Request_Id: number) {

    const userConfirmed = await confirmAlert(
      'info',
      'ต้องการยกเลิก Sign Off ข้อมูลคำของบประมาณ ?',
      ''
    );

    if (!userConfirmed) return;

    const payload = [
      {
        Request_Id: Request_Id,
        Status_Number: 8
      }
    ];

    let model = {
      FUNC_CODE: "FUNC-Cancel_SignOff_Budget_Request",
      List_Budget_Request: payload
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      basicAlert('success', 'ยกเลิกการ Sign Off ข้อมูลคำของบประมาณแล้ว', '');

      this.get_data();

    });

  }


  async SignOff() {

    const userConfirmed = await confirmAlert('info', 'ต้องการ Sign Off ข้อมูลคำของบประมาณ ?', '');

    if (!userConfirmed) return;

    const selectedRows = this.griddata.filter(x => x.selected);

    if (selectedRows.length === 0) {
      basicAlert('warning', 'กรุณาเลือกรายการ', '');
      return;
    }

    const payload = selectedRows.map(x => ({
      Request_Id: x.Request_Id,
      Status_Number: 8
    }));

    let model = {
      FUNC_CODE: "FUNC-SignOff_Budget_Request",
      List_Budget_Request: payload
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
      basicAlert('success', 'บันทึก Sign Off ข้อมูลคำของบประมาณแล้ว', '');
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

