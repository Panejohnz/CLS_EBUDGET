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
  styles: [`
    .readonly-project-detail {
      pointer-events: none;
    }
  `]
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
  Mas_Department_Lists: any[] = [];
  Mas_Plan_Lists: any[] = [];
  Mas_Product_Lists: any[] = [];
  Mas_Activity_Lists: any[] = [];

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
  currentTab = 1;
  firstLoad = true;
  project_planing: any = {};

  getGuidelineActivitiesTotal(): number {
    const totalOf = (activity: any): number => {
      if (activity?.SubActivities?.length) {
        return activity.SubActivities.reduce((sum: number, sub: any) => sum + totalOf(sub), 0);
      }

      return (activity?.quarters || []).reduce((sum: number, quarter: any) =>
        sum + (quarter?.months || []).reduce((monthSum: number, month: any) =>
          monthSum + Number(month?.budget || 0), 0), 0);
    };

    return (this.project_planing?.activities || []).reduce((sum: number, activity: any) => sum + totalOf(activity), 0);
  }
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
  userSession: any = {};

  get isDepartmentLocked(): boolean { return Number(this.userSession?.permissionData?.VIEW_DATA || 0) === 3; }
  get lockedDepartmentId(): any {
    const permission = this.userSession?.permissionData || {};
    return permission.Department_id ?? permission.Department_Id ?? permission.department_id ?? null;
  }
  private syncLockedDepartmentFilter(): void {
    if (!this.isDepartmentLocked) return;
    const permission = this.userSession?.permissionData || {};
    const department = this.Mas_Department_Lists.find((item: any) => String(item.Department_Id) === String(this.lockedDepartmentId));
    this.selectedDepartmentName = department?.Department_Name ?? permission.Department_Name ?? null;
  }
  ngOnInit(): void {
    this.userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
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
      BgYear: this.currentYear,
      ...(this.isDepartmentLocked && this.lockedDepartmentId != null && { Department_Id: this.lockedDepartmentId })
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.allData = Array.isArray(response.List_Project_Plan_Main.Data)
        ? response.List_Project_Plan_Main.Data
        : [];
      this.loadMasSearchOptions();

    })
  }
  private loadMasSearchOptions() {
    const model = {
      FUNC_CODE: "FUNC-GET_Mas_Search",
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.Mas_Department_Lists = Array.isArray(response.Mas_Department_Lists)
        ? response.Mas_Department_Lists
        : [];
      this.Mas_Plan_Lists = Array.isArray(response.Mas_Plan_Lists)
        ? response.Mas_Plan_Lists
        : [];
      this.Mas_Product_Lists = Array.isArray(response.Mas_Product_Lists)
        ? response.Mas_Product_Lists
        : [];
      this.Mas_Activity_Lists = Array.isArray(response.Mas_Activity_Lists)
        ? response.Mas_Activity_Lists
        : [];

      this.syncLockedDepartmentFilter();
      this.buildFilterOptions();
      this.applyFilter();
    });
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
    this.departmentFilterOptions = this.getUniqueFilterOptions(this.Mas_Department_Lists, 'Department_Name');
    if (!this.hasFilterOption(this.departmentFilterOptions, this.selectedDepartmentName)) {
      this.selectedDepartmentName = null;
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    this.planFilterOptions = this.getUniqueFilterOptions(this.Mas_Plan_Lists, 'Plan_Name');
    if (!this.hasFilterOption(this.planFilterOptions, this.selectedPlanName)) {
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    this.productFilterOptions = this.getUniqueFilterOptions(this.Mas_Product_Lists, 'Product_Name');
    if (!this.hasFilterOption(this.productFilterOptions, this.selectedProductName)) {
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    this.activityFilterOptions = this.getUniqueFilterOptions(this.Mas_Activity_Lists, 'Activity_Name');
    if (!this.hasFilterOption(this.activityFilterOptions, this.selectedActivityName)) {
      this.selectedActivityName = null;
    }
  }

  onDepartmentFilterChange() {
    if (this.isDepartmentLocked) { this.syncLockedDepartmentFilter(); this.applyFilter(); return; }
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
    this.syncLockedDepartmentFilter();

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
    if (!data?.Project_Id) {
      return;
    }

    this.currentTab = 1;
    this.firstLoad = true;
    this.project_planing = {};

    const model = {
      FUNC_CODE: "FUNC-GET_PROJECT_PLAN_BY_ID",
      Project_Id: data.Project_Id
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
      this.project_planing = {
        ...(res.Project_Plan || {}),
        Status_Id: res.Project_Plan?.Status_Id ?? data.Status_Id ?? 0,
        Project_Detail: {
          ...(res.Project_Detail || {}),
          PrincipleFiles: this.extractProjectPrincipleFiles(res, data.Project_Id)
        },
        Project_Objective: res.Project_Objective || [],
        Project_Plan_Attach_File: this.mapFileUploadList(
          res.FILE_UPLOAD_List || res.Project_Plan_Attach_File || [],
          data.Project_Id
        ),
        Project_Plan_Level1: res.Project_Plan_Level1 || [],
        Project_Plan_Level1_Sub: res.Project_Plan_Level1_Sub || [],
        Project_Cabinet: res.Project_Cabinet || [],
        Project_Security: res.Project_Security || [],
        Project_Plan_Level2: res.Project_Plan_Level2 || {},
        Project_Plan_Level3: res.Project_Plan_Level3 || {},
        Project_Coordinator: res.Project_Coordinator || [],
        selectedDepartment: res.Project_Plan?.Department_Id,
        projectType: res.Project_Plan?.Fk_Expense_Type,
        selectedPlan: res.Project_Plan?.Fk_Plan_Id,
        selectedProduct: res.Project_Plan?.Fk_Product_Id,
        selectedActivity: res.Project_Plan?.Fk_Activity_Id,
        selectedBudget: res.Project_Plan?.Fk_Budget_Type,
        Project_Id: data.Project_Id,
        Project_Output: res.Project_Output || [],
        Project_Outcome: res.Project_Outcome || [],
        Project_Expected: res.Project_Expected || [],
        Project_TargetGroup: res.Project_TargetGroup || [],
      };

      const details = res.Project_Plan_Detail || [];
      const items = res.Project_Plan_Detail_Item || [];

      details.forEach((d: any) => {
        d.Project_Detail_Id = Number(d.Project_Detail_Id);
        d.Parent_Id = d.Parent_Id ? Number(d.Parent_Id) : null;
      });

      const activities = this.mapPlanDetail(details);
      this.mapItems(items, activities);
      this.project_planing.activities = activities;
    });


    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'full-screen-modal'
    });
  }

  goTab(tab: number) {
    this.currentTab = tab;
    this.firstLoad = false;
  }

  mapPlanDetail(data: any[]) {
    return data.map(x => ({
      id: Number(x.Project_Detail_Id),
      name: x.Activity_Name,
      owner: x.Responsible,
      Seq: Number(x.Seq ?? 0) || 0,
      noBudget: x.Used_BG === 0,
      consult: x.Is_Consult === 1,
      consultSelf: Number(x.Operation1 || 0) === 1,
      consultHire: Number(x.Operation2 || 0) === 1,
      quarters: this.convertMonths(x.Months || []),
      sumAmount: Number(x.Sum_Amount ?? x.Sum_Amount_Total ?? 0),
      _edited: false,
      otherExpenses: [],
      multiplierTotal: 0,
      SubActivities: (x.SubActivities || []).map((s: any) => ({
        id: Number(s.Project_Detail_Id),
        Project_Detail_Id: Number(s.Project_Detail_Id),
        name: s.Activity_Name,
        owner: s.Responsible,
        Seq: Number(s.Seq ?? 0) || 0,
        noBudget: s.Used_BG === 0,
        consult: s.Is_Consult === 1,
        consultSelf: Number(s.Operation1 || 0) === 1,
        consultHire: Number(s.Operation2 || 0) === 1,
        quarters: this.convertMonths(s.Months || []),
        sumAmount: Number(s.Sum_Amount) || 0,
        _edited: false,
        otherExpenses: [],
        multiplierTotal: 0
      }))
    }));
  }

  convertMonths(months: any[]) {
    const MONTHS = [
      'ต.ค.', 'พ.ย.', 'ธ.ค.',
      'ม.ค.', 'ก.พ.', 'มี.ค.',
      'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.'
    ];

    const mapped = MONTHS.map((month, i) => ({
      month,
      selected: months[i]?.Selected,
      budget: months[i]?.Budget
    }));

    return [
      { quarter: 1, months: mapped.slice(0, 3) },
      { quarter: 2, months: mapped.slice(3, 6) },
      { quarter: 3, months: mapped.slice(6, 9) },
      { quarter: 4, months: mapped.slice(9, 12) }
    ];
  }

  mapItems(items: any[], activities: any[]) {
    const map: any = {};

    const walk = (list: any[]) => {
      list.forEach(a => {
        map[Number(a.id)] = a;

        if (a.SubActivities?.length) {
          walk(a.SubActivities);
        }
      });
    };

    walk(activities);

    Object.values(map).forEach((a: any) => {
      a.otherExpenses = [];
      a.multiplierTotal = 0;
    });

    items.forEach(i => {
      const target = map[Number(i.Fk_Project_Detail_Id)];

      if (target) {
        target.otherExpenses.push({
          id: i.Project_Item_Id,
          name: i.Expense_Name,
          times: i.Times,
          people: i.People,
          rate: i.Rate,
          total: i.Total,
          input3: i.input3,
          input4: i.input4,
          input5: i.input5
        });

        target.multiplierTotal += (i.Total || 0);
      }
    });
  }

  private extractProjectPrincipleFiles(response: any, projectId: any): any[] {
    const projectDetail = response?.Project_Detail || {};
    const rawList =
      response?.FILE_UPLOAD_List ||
      response?.Project_Plan_Attach_File ||
      response?.Project_Attach_File ||
      response?.Attach_File?.Data ||
      response?.Attach_File ||
      projectDetail?.FILE_UPLOAD_List ||
      projectDetail?.Project_Plan_Attach_File ||
      projectDetail?.Project_Attach_File ||
      projectDetail?.Attach_File?.Data ||
      projectDetail?.Attach_File ||
      projectDetail?.PrincipleFiles ||
      [];

    const list = this.mapFileUploadList(rawList, projectId);

    return list.filter((item: any) => {
      const typeId = item?.TYPE_ID ?? item?.Type_Id ?? item?.type_id;
      const fkIda = item?.FK_IDA ?? item?.Fk_Ida ?? item?.fk_ida ?? item?.Fk_Project_Id ?? item?.Project_Id;
      const refModule = item?.REF_MODULE ?? item?.Ref_Module ?? '';
      const refLevel = item?.REF_LEVEL ?? item?.Ref_Level ?? '';
      const active = item?.Active ?? item?.ACTIVE ?? 1;

      return Number(active) !== 0 &&
        (!typeId || Number(typeId) === 2) &&
        (!fkIda || String(fkIda) === String(projectId)) &&
        (!refModule || refModule === 'PROJECT_PLAN') &&
        (!refLevel || refLevel === 'PRINCIPLE');
    });
  }

  private mapFileUploadList(fileUploadList: any, projectId: any): any[] {
    const list = Array.isArray(fileUploadList?.Data)
      ? fileUploadList.Data
      : (Array.isArray(fileUploadList) ? fileUploadList : []);

    return list.map((item: any) => ({
      IDA: item.IDA || item.Ida || 0,
      TYPE_ID: item.TYPE_ID || item.Type_Id || 2,
      FK_IDA: item.FK_IDA || item.Fk_Ida || projectId,
      Client_Attachment_Id: item.CLIENT_ATTACHMENT_ID || item.Client_Attachment_Id || '',
      Ref_Module: item.REF_MODULE || item.Ref_Module || 'PROJECT_PLAN',
      Ref_Level: item.REF_LEVEL || item.Ref_Level || 'PRINCIPLE',
      Request_Id: item.FK_REQUEST_ID || item.Fk_Request_Id || item.Request_Id || projectId,
      Project_Id: item.Project_Id || projectId,
      File_Name: item.File_Name || item.FILE_NAME || item.NAME_FAKE || item.Name_Fake || '',
      Gen_File: item.GEN_FILE || item.Gen_File || item.NAME_REAL || item.Name_Real || '',
      Active: item.Active ?? item.ACTIVE ?? 1
    }));
  }
  deletePlan(data: any) {

  }
}
