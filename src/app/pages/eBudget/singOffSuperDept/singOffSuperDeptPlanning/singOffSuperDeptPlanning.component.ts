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
  selector: 'app-signoff-super-dept-planning',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './singOffSuperDeptPlanning.component.html',
  styles: ``
})
export class SignoffSuperDeptPlanningComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , public sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService, private budgetYearService: BudgetYearService) {
  }
  allData: any[] = [];
  selectedDepartmentName: string | null = null;
  selectedPlanName: string | null = null;
  selectedProductName: string | null = null;
  selectedActivityName: string | null = null;
  departmentFilterOptions: any[] = [];
  planFilterOptions: any[] = [];
  productFilterOptions: any[] = [];
  activityFilterOptions: any[] = [];

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
  get Total(): number {
    return this.griddata.reduce(
      (sum: number, item: any) =>
        sum + Number(item.Total || item.budget || 0),
      0
    );
  }

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
      FUNC_CODE: "FUNC-Get_Project_plan_Sign_Off_SuperDept",
      BgYear: this.currentYear
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.allData = Array.isArray(response.List_Project_Plan_Main.Data)
        ? response.List_Project_Plan_Main.Data
        : [];
      this.buildFilterOptions();
            this.applyFilter();

    })
  }
  private getUniqueFilterOptions(data: any[], key: string): any[] {
    const seen = new Set<string>();

    return data
      .map((item: any) => (item?.[key] || '').toString().trim())
      .filter((name: string) => {
        if (!name || seen.has(name)) {
          return false;
        }

        seen.add(name);
        return true;
      })
      .map((name: string) => ({ name }));
  }

  private buildFilterOptions() {
    this.updateCascadingFilterOptions();
  }

  private hasFilterOption(options: any[], value: string | null): boolean {
    return !value || options.some(option => option.name === value);
  }

  private filterByDepartment(data: any[]): any[] {
    return this.selectedDepartmentName
      ? data.filter(x => x.Department_Name == this.selectedDepartmentName)
      : data;
  }

  private updateCascadingFilterOptions() {
    this.departmentFilterOptions = this.getUniqueFilterOptions(this.allData, 'Department_Name');
    if (!this.hasFilterOption(this.departmentFilterOptions, this.selectedDepartmentName)) {
      this.selectedDepartmentName = null;
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    const departmentData = this.filterByDepartment([...this.allData]);

    this.planFilterOptions = this.getUniqueFilterOptions(departmentData, 'Plan_Name');
    if (!this.hasFilterOption(this.planFilterOptions, this.selectedPlanName)) {
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    const planData = this.selectedPlanName
      ? departmentData.filter(x => x.Plan_Name == this.selectedPlanName)
      : departmentData;

    this.productFilterOptions = this.getUniqueFilterOptions(planData, 'Product_Name');
    if (!this.hasFilterOption(this.productFilterOptions, this.selectedProductName)) {
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    const productData = this.selectedProductName
      ? planData.filter(x => x.Product_Name == this.selectedProductName)
      : planData;

    this.activityFilterOptions = this.getUniqueFilterOptions(productData, 'Activity_Name');
    if (!this.hasFilterOption(this.activityFilterOptions, this.selectedActivityName)) {
      this.selectedActivityName = null;
    }
  }

  onDepartmentFilterChange() {
    this.selectedPlanName = null;
    this.selectedProductName = null;
    this.selectedActivityName = null;
    this.applyFilter();
  }

  onPlanFilterChange() {
    this.selectedProductName = null;
    this.selectedActivityName = null;
    this.applyFilter();
  }

  onProductFilterChange() {
    this.selectedActivityName = null;
    this.applyFilter();
  }

  applyFilter() {
    this.sortService.page = 1;

    let data = [...this.allData];
    this.updateCascadingFilterOptions();

    data = this.filterByDepartment(data);

    if (this.selectedPlanName) {
      data = data.filter(x => x.Plan_Name == this.selectedPlanName);
    }

    if (this.selectedProductName) {
      data = data.filter(x => x.Product_Name == this.selectedProductName);
    }

    if (this.selectedActivityName) {
      data = data.filter(x => x.Activity_Name == this.selectedActivityName);
    }

    const keyword = (this.service.searchTerm || '').toLowerCase().trim();

    if (keyword) {
      data = data.filter((row: any) =>
        Object.values(row)
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    this.griddata = data;
  }

  filterSearch() {
    this.applyFilter();
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

  async CancelSignOff(projectId: number) {

    const userConfirmed = await confirmAlert(
      'info',
      'ต้องการยกเลิก Sign Off ข้อมูลโครงการ ?',
      ''
    );

    if (!userConfirmed) return;

    const cancelRemark = (await cancelTracking() || '').trim();

    // if (!cancelRemark) {
    //   // basicAlert('warning', 'กรุณาระบุหมายเหตุ', '');
    //   return;
    // }

    const payload = [
      {
        Project_Id: projectId,
        Status_Number: 8
      }
    ];
    const SignOff_Remark = {
      Remark_Id: 0,
      Remark: cancelRemark,
      Status_Id: 8,
      Fk_Plan_Id: projectId,
      Plan_Type: 1
    };

    let model = {
      FUNC_CODE: "FUNC-Cancel_SignOff_SuperDept_Project_Plan",
      List_Project_Plan: payload,
      SignOff_Remark: SignOff_Remark
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      basicAlert('success', 'ยกเลิกการ Sign Off ข้อมูลโครงการแล้ว', '');

      this.get_data();

    });

  }
  async SignOff() {

    const userConfirmed = await confirmAlert('info', 'ต้องการ Sign Off ข้อมูลโครงการ ?', '');

    if (!userConfirmed) return;

    const selectedRows = this.griddata.filter(x => x.selected);

    if (selectedRows.length === 0) {
      basicAlert('warning', 'กรุณาเลือกรายการ', '');
      return;
    }

    const payload = selectedRows.map(x => ({
      Project_Id: x.Project_Id,
      Status_Number: 8
    }));

    let model = {
      FUNC_CODE: "FUNC-SignOff_SuperDept_Project_Plan",
      List_Project_Plan: payload
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
      basicAlert('success', 'บันทึก Sign Off ข้อมูลโครงการแล้ว', '');
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
