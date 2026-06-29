import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
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
import { ProjectPlanService } from 'src/app/core/services/ProjectPlan.service'
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { TabGuidelineComponent } from 'src/app/shared/planingtab/components/tab-guideline/tab-guideline.component';
@Component({
  selector: 'projectPlanning',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './projectPlanning.component.html',
  styles: [`
    .readonly-select {
      pointer-events: none;
      background-color: var(--vz-secondary-bg, #e9ecef);
      opacity: 1;
    }

    .readonly-select ::ng-deep .ng-select-container {
      background-color: var(--vz-secondary-bg, #e9ecef);
      opacity: 1;
    }

    .readonly-select ::ng-deep .ng-value,
    .readonly-select ::ng-deep .ng-value.ng-value-disabled {
      background-color: #e2e6ea;
      color: #212529;
    }

    .readonly-select ::ng-deep .ng-value-label,
    .readonly-select ::ng-deep .ng-placeholder {
      color: #212529;
    }
  `]
})
export class ProjectPlanningComponent {
  @ViewChild(TabGuidelineComponent)
  guidelineComp!: TabGuidelineComponent;
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    selectedDepartment: null,
    projectType: null,
    selectedPlan: null,
    selectedProduct: null,
    selectedActivity: null,
    selectedBudget: null,

    Used_BG: null,
    Project_Type_Id: null,
    totalYears: null,
    currentYear: null,
    Operation1: 0,
    Operation2: 0
  };
  griddata: any[] = [
  ];
  allData: any[] = [];
  project_planing: any = {
    Project_Plan: {
      Department_Id: null,
      Fk_Expense_Type: null,
      Fk_Plan_Id: null,
      Fk_Product_Id: null,
      Fk_Activity_Id: null,
      Fk_Budget_Type: null,
      Project_Name: '',
    },

    Project_Detail: {},
    Project_Objective: [],
    Project_Output: [],
    Project_Outcome: [],
    Project_Plan_Level1: [],
    Project_Plan_Level1_Sub: [],
    Project_Cabinet: [],
    Project_Security: [],
    Project_Plan_Level3: {}

  };
  modalRef: any;
  total$!: Observable<number>;
  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Product_Lists: any[] = []
  Mas_Activity_Lists: any[] = []
  Mas_Budget_Types: any[] = []


  constructor(private modalService: NgbModal, public service: GridJsService
    , public sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService, private ProjectPlanService: ProjectPlanService
    , private budgetYearService: BudgetYearService) {
  }

  viewReport(item: any): void {
    if (!item?.Project_Id) {
      return;
    }

    const query = new URLSearchParams({
      BgYear: String(item.BgYear ?? this.currentYear),
      Project_Id: String(item.Project_Id),
      Project_Type: '1'
    });

    const url =
      `https://app.celestsoft.com/CLS_ERP_BUDGET_REPORT/Report/Budget_Report_R007.aspx?${query.toString()}`;

    window.open(url, '_blank');
  }
  currentYear: any
  userSession: any

  get isDepartmentLocked(): boolean {
    return this.userSession?.permissionData?.VIEW_DATA == 3;
  }

  get lockedDepartmentId(): any {
    return this.userSession?.permissionData?.Department_id ??
      this.userSession?.permissionData?.Department_Id ??
      null;
  }

  ngOnInit(): void {
    this.sortService.pageSize = this.service.pageSize;

    const sessionStr = localStorage.getItem('userSession');

    if (sessionStr) {
      this.userSession = JSON.parse(sessionStr);
    }
    try {

      if (this.userSession.permissionData.VIEW_DATA == 3) {
        this.syncLockedDepartmentFilter();
      } else {

      }
    } catch (error) {

    }



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
  department: any[] = []
  griddataTemp: any[] = [];
  selectedDepartmentIds: any[] = [];
  selectedPlanName: string | null = null;
  selectedProductName: string | null = null;
  selectedActivityName: string | null = null;
  planFilterOptions: any[] = [];
  productFilterOptions: any[] = [];
  activityFilterOptions: any[] = [];

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

  get_data() {
    let model = {
      FUNC_CODE: "FUNC-Get_Project_Plan",
      BgYear: this.currentYear
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      this.allData = Array.isArray(response.List_Project_Plan_Data_Table.Data)
        ? response.List_Project_Plan_Data_Table.Data
        : [];
      this.griddataTemp = [...this.allData];
      this.loadMasSearchOptions();
    })
  }

  private loadMasSearchOptions() {
    const model = {
      FUNC_CODE: "FUNC-GET_Mas_Search",
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.department = Array.isArray(response.Mas_Department_Lists)
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

      if (this.selectedDepartmentId != null) {
        const matchedDepartment = this.department.find(
          (item: any) => String(item.Department_Id) === String(this.selectedDepartmentId)
        );

        if (matchedDepartment) {
          this.selectedDepartmentId = matchedDepartment.Department_Id;
          this.selectedDepartmentIds = [matchedDepartment.Department_Id];
        }
      }

      this.syncLockedDepartmentFilter();
      this.buildFilterOptions();
      this.griddata = [...this.allData];
      this.applyFilter();
      this.currentTab = 1
      this.firstLoad = true;
    });
  }

  get Total(): number {

    return this.griddata.reduce(

      (sum: number, item: any) =>

        sum + Number(item.Total || 0),

      0

    );

  }
  selectedDepartmentId: any = null;
  private buildFilterOptions() {
    this.updateCascadingFilterOptions();
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

  private syncLockedDepartmentFilter() {
    if (!this.isDepartmentLocked || this.lockedDepartmentId == null) {
      return;
    }

    const matchedDepartment = this.department.find(
      (item: any) => String(item.Department_Id) === String(this.lockedDepartmentId)
    );

    this.selectedDepartmentId = matchedDepartment?.Department_Id ?? this.lockedDepartmentId;
    this.selectedDepartmentIds = [this.selectedDepartmentId];
  }

  private getSelectedDepartmentIds(): any[] {
    return this.selectedDepartmentIds.length
      ? this.selectedDepartmentIds
      : (this.selectedDepartmentId ? [this.selectedDepartmentId] : []);
  }

  private filterByDepartment(data: any[]): any[] {
    const selectedDepartmentIds = this.getSelectedDepartmentIds();

    if (!selectedDepartmentIds.length) {
      return data;
    }

    return data.filter(
      x => selectedDepartmentIds.some(
        departmentId => String(x.Department_Id) === String(departmentId)
      )
    );
  }

  private hasFilterOption(options: any[], value: string | null): boolean {
    return !value || options.some(option => option.name === value);
  }

  private updateCascadingFilterOptions() {
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
    if (this.isDepartmentLocked) {
      this.syncLockedDepartmentFilter();
      this.applyFilter();
      return;
    }

    if (this.selectedDepartmentIds.length === 1) {
      this.selectedDepartmentId = this.selectedDepartmentIds[0];
    } else if (!this.isDepartmentLocked) {
      this.selectedDepartmentId = null;
    }

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
    let data = [...this.griddataTemp];
    this.syncLockedDepartmentFilter();
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

    if (this.service.searchTerm) {

      const keyword = this.service.searchTerm.toLowerCase();

      data = data.filter(x =>

        (x.Department_Name || '').toLowerCase().includes(keyword) ||
        (x.Plan_Name || '').toLowerCase().includes(keyword) ||
        (x.Product_Name || '').toLowerCase().includes(keyword) ||
        (x.Activity_Name || '').toLowerCase().includes(keyword) ||
        (x.Budget_Type || '').toLowerCase().includes(keyword) ||
        (x.Project_Name || '').toLowerCase().includes(keyword) ||
        (x.Status_Name || '').toLowerCase().includes(keyword) ||
        String(x.Total || '').includes(keyword)

      );

    }

    this.griddata = data;
    this.sortService.page = 1;

  }
  filterSearch() {
    this.applyFilter();
  }
  fullModal(modal: any, data: any) {

    this.currentTab = 1;
    this.firstLoad = true;
    if (data?.Project_Id) {

      let model = {
        FUNC_CODE: "FUNC-GET_PROJECT_PLAN_BY_ID",
        Project_Id: data.Project_Id
      };

      this.serviceebud.GatewayGetData(model)
        .subscribe((res: any) => {

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

    } else {
      if (!this.selectedDepartmentId) {
        basicAlert('info', 'เลือกหน่วยงาน', '')
        return
      }
      this.project_planing = {
        Project_Plan: {},

        Project_Detail: [],
        Project_Objective: [],

        Project_Plan_Level1: [],
        Project_Plan_Level1_Sub: [],
        Project_Plan_Level2: {},
        Project_Cabinet: [],
        Project_Security: [],
        Project_Plan_Level3: {
          Government_Policy_Id1: null,
          Government_Policy_Id2: null,
          Action_Plan_Id: null,
          Urgent1_Checked: false,
          Urgent1_Name: '',
          Urgent2_Checked: false,
          Urgent2_Name: '',
          Mid1_Checked: false,
          Mid1_Name: '',
          Mid2_Checked: false,
          Mid2_Name: '',
          ProjectPlaningAlignment: '',
          PpatPlanName: '',
          PpatStrategy_Id: '',
          PpatMeasure_Id: '',
          PpatIndicator_Id: '',
          Project_Plan_Id: null,
          Tactics_Id: null,
          Measure_Id: null,
          Indicators_Id: null,
          Plan5_Master_Plan_Id: null,
          Plan5_Goals_Id: null,
          Plan5_Indicator_Id: null,
          Plan5_Description: '',
          Project_Plan_Goals_Id5: null,
          Indicators_Id5: null,
          Goals_Guidelines_Id5: null,
          Plan5_Subplan_Id: null,
          Plan5_Target_Y1_Id: null,
          Plan5_Subplan_Desc: '',
          Plan5_Guideline_Id: null,
          Project_Plan_Id5: null,
          Plan5_ValueChain_Main_Id: null,
          Plan5_ValueChain_Factor_Main_Id: null,
          Plan5_ValueChain_Support_Id: null,
          Plan5_ValueChain_Factor_Support_Id: null,

          Master_Plan_Id: null,
          Plan_Goals_Id: null,
          Plan_Tactics_Id: null,
          Sub_Master_Plan_Id: null,
          Sub_Plan_Goals_Id: null,
          ValueChain_Main_Id: null,
          ValueChain_Factor_Main_Id: null,
          ValueChain_Support_Id: null,
          ValueChain_Factor_Support_Id: null,

          Plan5_Project_Plan_Id: null,
          Project_Plan_Goals_Id: null,
          Goals_Guidelines_Id: null,
          Guidelines_Id: null,
          Project_Plan_Id_5: null,
          Project_Plan_Goals_Id_5: null,
          Indicators_Id_5: null,
          Goals_Guidelines_Id_5: null
        },
        selectedDepartment: this.selectedDepartmentId,
        projectType: null,
        selectedPlan: null,
        selectedProduct: null,
        selectedActivity: null,
        selectedBudget: null,
      };
    }

    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'full-screen-modal' //'modal-95'
      
    });
  }
  copyProjectList: any[] = [];
  copySearch: string = '';
  selectedCopyProjectId: number | null = null;
  copyModal(content: any) {

    let model = {
      FUNC_CODE: "FUNC-Get_Project_Plan_7",
      BgYear: this.currentYear
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      let allData = Array.isArray(response.List_Project_Plan)
        ? response.List_Project_Plan
        : [];
      let griddata = [...allData]
      this.copyProjectList = [...griddata];

      this.selectedCopyProjectId = null;

      this.modalService.open(content, {
        size: 'xl',
        backdrop: 'static'
      });
    })


  }
  confirmCopyProject(copyModal: any) {

    if (!this.selectedCopyProjectId) {
      return;
    }
    let model = {
      FUNC_CODE: "FUNC-Project_Plan_Copy",
      Project_Id: this.selectedCopyProjectId
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      basicAlert('success', 'คัดลอกรายการแล้ว', '')
    })


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

      quarters: this.convertMonths(x.Months),

      // 🔥 เพิ่มตรงนี้
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

        quarters: this.convertMonths(s.Months),

        // 🔥 เพิ่มตรงนี้
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

    const mapped = months.map((m, i) => ({
      month: MONTHS[i],
      selected: m.Selected,
      budget: m.Budget
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

    // 🔥 reset ก่อน
    Object.values(map).forEach((a: any) => {
      a.otherExpenses = [];
      a.multiplierTotal = 0; // <<<<<< สำคัญ
    });

    items.forEach(i => {

      const key = Number(i.Fk_Project_Detail_Id);
      const target = map[key];

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

        // 🔥 บรรทัดนี้คือคำตอบ
        target.multiplierTotal += (i.Total || 0);
      }

    });
  }

  currentTab = 1;
  firstLoad = true;

  get isSaveLocked(): boolean {
    return Number(this.userSession?.permissionData?.VIEW_DATA || 0) === 3;
  }

  goTab(tab: number) {
    this.currentTab = tab;
    this.firstLoad = false;
  }

  async deletePlan(data: any) {

    const userConfirmed = await confirmAlert('info', 'ต้องการลบข้อมูล ?', '');

    if (userConfirmed) {
      const payload = {
        Project_Id: data.Project_Id,
      }
      const model = {
        FUNC_CODE: "FUNC-Delete_Project_Plan",

        Project_Plan: payload
      };

      this.serviceebud.GatewayGetData(model).subscribe(async () => {
        basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
        this.get_data();

      });
    }

  }
  Project_Plan: any
  async savePlan(modal: any) {
    if (this.isSaveLocked) {
      basicAlert('warning', '\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e44\u0e14\u0e49', '');
      return;
    }

    const getId = (obj: any, key: string) =>
      typeof obj === 'object' ? obj?.[key] : obj;

    if (!this.validateHeader()) return;
    if (!this.validateRequiredPlanningTabs()) return;
    const data =
      this.project_planing?.Project_Plan ||
      this.project_planing;

    const payload = {

      BgYear: this.currentYear,

      Project_Id: data.Project_Id,

      Department_Id: getId(
        this.project_planing.selectedDepartment,
        'Department_Id'
      ),

      Department_Name:
        this.project_planing.selectedDepartment?.Department_Name,

      Fk_Plan_Id: getId(
        this.project_planing.selectedPlan,
        'Plan_Id'
      ),

      Plan_Name:
        this.project_planing.selectedPlan?.Plan_Name,

      Fk_Expense_List: getId(
        this.project_planing.projectType,
        'Expense_Id'
      ),

      Expense_List:
        this.project_planing.projectType?.Expense_Name,

      Fk_Product_Id: getId(
        this.project_planing.selectedProduct,
        'Product_Id'
      ),

      Product_Name:
        this.project_planing.selectedProduct?.Product_Name,

      Fk_Activity_Id: getId(
        this.project_planing.selectedActivity,
        'Activity_Id'
      ),

      Activity_Name:
        this.project_planing.selectedActivity?.Activity_Name,

      Fk_Budget_Type: getId(
        this.project_planing.selectedBudget,
        'Budget_Type_Id'
      ),

      Budget_Type:
        this.project_planing.selectedBudget?.Budget_Type_Name,

      Project_Name:
        data.Project_Name,

      Used_BG:
        data.Used_BG,

      Project_Type_Id:
        data.Project_Type_Id,

      Project_Year_Count:
        data.Project_Year_Count,

      Project_Year_Number:
        data.Project_Year_Number,

      Operation1:
        data.Operation1,

      Operation2:
        data.Operation2,

      Proposer_Name:
        data.Proposer_Name,

      Proposer_Position:
        data.Proposer_Position,
      Create_User: this.userSession.authenData?.IDENTIFY,
      Update_User: this.userSession.authenData.IDENTIFY
    };

    this.project_planing.Project_Plan_Detail = this.mapActivities();


    if (!this.validateBeforeSave(this.project_planing.activities)) {
      return;
    }

    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (!userConfirmed) return;

    const projectDetail =
      this.createProjectDetailPayload();

    const model = {
      FUNC_CODE: this.project_planing.Project_Id > 0
        ? "FUNC-Update_Project_Plan"
        : "FUNC-Insert_Project_Plan",

      Project_Plan: payload,

      Project_Detail: projectDetail,
      Project_Objective: this.project_planing.Project_Objective,
      Project_Plan_Detail: this.project_planing.Project_Plan_Detail,
      Project_Plan_Level1: this.project_planing.Project_Plan_Level1,
      Project_Plan_Level2: this.project_planing.Project_Plan_Level2,
      Project_Plan_Level1_Sub: this.project_planing.Project_Plan_Level1_Sub,
      Project_Outcome: this.project_planing.Project_Outcome,
      Project_Output: this.project_planing.Project_Output,
      Project_Plan_Level3: this.project_planing.Project_Plan_Level3,
      Project_Coordinator: this.project_planing.Project_Coordinator,
      Project_Cabinet: this.project_planing.Project_Cabinet,
      Project_Security: this.project_planing.Project_Security,
      Project_Expected: this.project_planing.Project_Expected,
      Project_TargetGroup: this.project_planing.Project_TargetGroup,
    };

    this.serviceebud.GatewayGetData(model).subscribe(async (response: any) => {
      this.applySavedProjectId(response);

      try {
        await this.uploadProjectPrincipleFiles();
      } catch (error) {
        await basicAlert(
          'warning',
          'บันทึกข้อมูลแล้ว แต่แนบไฟล์ไม่สำเร็จ',
          ''
        );
        return;
      }

      await basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
      this.get_data();
      modal.dismiss();
    });
  }

  private createProjectDetailPayload(): any {
    const detail =
      Array.isArray(this.project_planing.Project_Detail)
        ? {}
        : (this.project_planing.Project_Detail || {});

    const projectDetail: any = { ...detail };
    delete projectDetail.PrincipleFiles;

    return {
      ...projectDetail,
      Start_Date:
        this.toDotNetDate(detail.Start_Date),
      End_Date:
        this.toDotNetDate(detail.End_Date)
    };
  }

  private applySavedProjectId(response: any) {
    const projectId =
      response?.Project_Id ||
      response?.Project_Plan?.Project_Id ||
      response?.PROJECT_PLAN?.Project_Id ||
      response?.Data?.Project_Id ||
      response?.data?.Project_Id ||
      response?.Result?.Project_Id ||
      response?.PROJECT_ID ||
      response?.ID ||
      response?.Project_Plan_Id;

    if (!projectId) {
      return;
    }

    this.project_planing.Project_Id = projectId;

    if (this.project_planing.Project_Plan) {
      this.project_planing.Project_Plan.Project_Id = projectId;
    }
  }

  private extractProjectPrincipleFiles(response: any, projectId: any): any[] {
    const projectDetail =
      response?.Project_Detail || {};

    const rawList =
      response?.FILE_UPLOAD_List ||
      response?.Project_Plan_Attach_File ||
      response?.Project_Attach_File ||
      response?.FILE_UPLOAD_List?.Data ||
      response?.FILE_UPLOAD_List ||
      response?.Attach_File?.Data ||
      response?.Attach_File ||
      projectDetail?.FILE_UPLOAD_List ||
      projectDetail?.Project_Plan_Attach_File ||
      projectDetail?.Project_Attach_File ||
      projectDetail?.FILE_UPLOAD_List?.Data ||
      projectDetail?.FILE_UPLOAD_List ||
      projectDetail?.Attach_File?.Data ||
      projectDetail?.Attach_File ||
      projectDetail?.PrincipleFiles ||
      [];

    const list =
      this.mapFileUploadList(rawList, projectId);

    return list.filter((item: any) => {
      const typeId =
        item?.TYPE_ID ?? item?.Type_Id ?? item?.type_id;

      const fkIda =
        item?.FK_IDA ?? item?.Fk_Ida ?? item?.fk_ida ?? item?.Fk_Project_Id ?? item?.Project_Id;

      const refModule =
        item?.REF_MODULE ?? item?.Ref_Module ?? '';

      const refLevel =
        item?.REF_LEVEL ?? item?.Ref_Level ?? '';

      const active =
        item?.Active ?? item?.ACTIVE ?? 1;

      return Number(active) !== 0 &&
        (!typeId || Number(typeId) === 2) &&
        (!fkIda || String(fkIda) === String(projectId)) &&
        (!refModule || refModule === 'PROJECT_PLAN') &&
        (!refLevel || refLevel === 'PRINCIPLE');
    });
  }

  private mapFileUploadList(fileUploadList: any, projectId: any): any[] {
    const list =
      Array.isArray(fileUploadList?.Data)
        ? fileUploadList.Data
        : (Array.isArray(fileUploadList) ? fileUploadList : []);

    return list.map((item: any) => {
      const fileName =
        item.File_Name ||
        item.FILE_NAME ||
        item.NAME_FAKE ||
        item.Name_Fake ||
        '';

      const generatedFile =
        item.GEN_FILE ||
        item.Gen_File ||
        item.NAME_REAL ||
        item.Name_Real ||
        '';

      return {
        IDA: item.IDA || item.Ida || 0,
        TYPE_ID: item.TYPE_ID || item.Type_Id || 2,
        FK_IDA: item.FK_IDA || item.Fk_Ida || projectId,
        Client_Attachment_Id:
          item.CLIENT_ATTACHMENT_ID ||
          item.Client_Attachment_Id ||
          '',
        Ref_Module:
          item.REF_MODULE ||
          item.Ref_Module ||
          'PROJECT_PLAN',
        Ref_Level:
          item.REF_LEVEL ||
          item.Ref_Level ||
          'PRINCIPLE',
        Request_Id:
          item.FK_REQUEST_ID ||
          item.Fk_Request_Id ||
          item.Request_Id ||
          projectId,
        Project_Id:
          item.Project_Id ||
          item.FK_IDA ||
          item.Fk_Ida ||
          projectId,
        Fk_Project_Id:
          item.Fk_Project_Id ||
          item.FK_PROJECT_ID ||
          item.Project_Id ||
          item.FK_IDA ||
          item.Fk_Ida ||
          projectId,
        Fk_Expense_Id:
          item.FK_EXPENSE_ID ||
          item.Fk_Expense_Id ||
          item.Expense_Id ||
          0,
        Fk_Request_Detail_Item_Id:
          item.FK_REQUEST_DETAIL_ITEM_ID ||
          item.Fk_Request_Detail_Item_Id ||
          0,
        Row_Guid:
          item.ROW_GUID ||
          item.Row_Guid ||
          null,
        File_Name: fileName || generatedFile,
        File_Size:
          item.FILE_SIZE ||
          item.File_Size ||
          0,
        File_Type:
          item.FILE_TYPE ||
          item.File_Type ||
          '',
        NAME_FAKE: fileName,
        NAME_REAL:
          item.NAME_REAL ||
          item.Name_Real ||
          generatedFile,
        GEN_FILE: generatedFile,
        PATH_FILE:
          item.PATH_FILE ||
          item.Path_File ||
          '',
        File_Url:
          item.File_Url ||
          item.FILE_URL ||
          item.View_Url ||
          item.VIEW_URL ||
          item.URL ||
          '',
        FILE_DATE:
          item.FILE_DATE ||
          item.File_Date ||
          null,
        Active:
          item.Active ?? item.ACTIVE ?? 1,
        Is_New: false,
        Pending_Delete: false,
        file: null
      };
    });
  }

  private uploadProjectPrincipleFiles(): Promise<void> {
    const projectDetail =
      this.project_planing?.Project_Detail || {};

    const allAttachFiles =
      Array.isArray(projectDetail.PrincipleFiles)
        ? projectDetail.PrincipleFiles
        : [];

    const attachFiles =
      allAttachFiles.filter((x: any) =>
        x?.file instanceof File &&
        !x?.Pending_Delete &&
        Number(x?.Active ?? 1) !== 0
      );

    const deletedFiles =
      allAttachFiles.filter((x: any) =>
        x?.Pending_Delete &&
        !!(x?.IDA || x?.GEN_FILE || x?.PATH_FILE)
      );

    if (attachFiles.length === 0 && deletedFiles.length === 0) {
      return Promise.resolve();
    }

    const formData = new FormData();
    const projectId =
      this.project_planing?.Project_Id ||
      this.project_planing?.Project_Plan?.Project_Id ||
      0;

    if (!projectId) {
      return Promise.reject('Project_Id is required for file upload.');
    }

    attachFiles.forEach((item: any) => {
      formData.append('FILES', item.file, item.file.name);
    });

    formData.append(
      'MODEL',
      JSON.stringify({
        FUNC_CODE: 'FUNC-Upload_Project_Plan_File',
        Project_Id: projectId,
        Request_Id: projectId,
        Files: attachFiles.map((item: any) => ({
          IDA: item.IDA || 0,
          Client_Attachment_Id: item.Client_Attachment_Id || '',
          Ref_Module: item.Ref_Module || 'PROJECT_PLAN',
          Ref_Level: item.Ref_Level || 'PRINCIPLE',
          Request_Id: projectId,
          Project_Id: projectId,
          Fk_Project_Id: projectId,
          Fk_Expense_Id: 0,
          Fk_Request_Detail_Item_Id: 0,
          Row_Guid: item.Row_Guid || null,
          File_Name: item.File_Name || item.file?.name,
          File_Size: item.File_Size || item.file?.size,
          File_Type: item.File_Type || item.file?.type,
          NAME_FAKE: item.NAME_FAKE || item.File_Name || item.file?.name,
          NAME_REAL: item.NAME_REAL || '',
          Create_By: this.userSession?.permissionData?.IDENTIFY || '',
          ATTACH: item.ATTACH || 1,
          Active: 1
        })),
        Deleted_Files: deletedFiles.map((item: any) => ({
          IDA: item.IDA || 0,
          Client_Attachment_Id: item.Client_Attachment_Id || '',
          Ref_Module: item.Ref_Module || 'PROJECT_PLAN',
          Ref_Level: item.Ref_Level || 'PRINCIPLE',
          Request_Id: projectId,
          Project_Id: projectId,
          Fk_Project_Id: projectId,
          Fk_Expense_Id: 0,
          Fk_Request_Detail_Item_Id: 0,
          Row_Guid: item.Row_Guid || null,
          File_Name: item.File_Name || item.NAME_FAKE || '',
          NAME_FAKE: item.NAME_FAKE || item.File_Name || '',
          NAME_REAL: item.NAME_REAL || item.GEN_FILE || '',
          GEN_FILE: item.GEN_FILE || '',
          PATH_FILE: item.PATH_FILE || '',
          Update_By: this.userSession?.permissionData?.IDENTIFY || '',
          ATTACH: item.ATTACH || 1,
          Active: 0
        }))
      })
    );

    return new Promise((resolve, reject) => {
      this.serviceebud.UploadData(formData).subscribe({
        next: () => resolve(),
        error: error => reject(error)
      });
    });
  }
  validateHeader(): boolean {

    const data =
      this.project_planing?.Project_Plan ||
      this.project_planing;

    const fields = [
      {
        value: this.project_planing.selectedDepartment,
        msg: 'เลือกหน่วยงาน'
      },
      {
        value: this.project_planing.selectedPlan,
        msg: 'เลือกแผนงาน'
      },
      {
        value: this.project_planing.projectType,
        msg: 'เลือกประเภทโครงการ'
      },
      {
        value: this.project_planing.selectedProduct,
        msg: 'เลือกผลผลิต'
      },
      {
        value: this.project_planing.selectedActivity,
        msg: 'เลือกกิจกรรม'
      },
      {
        value: this.project_planing.selectedBudget,
        msg: 'เลือกหมวดงบ'
      },

    ];

    for (const f of fields) {

      if (!f.value) {
        basicAlert('info', f.msg, '');
        return false;
      }
    }

    return true;
  }

  private isEmptyRequiredValue(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim() === '';
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return false;
  }

  private hasFilledRows(rows: any, keys: string[]): boolean {
    if (!Array.isArray(rows)) {
      return false;
    }

    return rows.some((row: any) =>
      keys.every(key => !this.isEmptyRequiredValue(row?.[key]))
    );
  }

  private failRequired(tab: number, message: string): false {
    this.currentTab = tab;
    this.firstLoad = tab === 1;
    basicAlert('info', message, '');
    return false;
  }

  private requireValue(value: any, message: string, tab: number): boolean {
    if (this.isEmptyRequiredValue(value)) {
      return this.failRequired(tab, message);
    }

    return true;
  }

  private validateRequiredPlanningTabs(): boolean {
    const data =
      this.project_planing?.Project_Plan ||
      this.project_planing;

    const showPlanningSelectors =
      Number(this.project_planing?.Budget_Type ?? data?.Budget_Type) !== 1;

    const generalFields = [
      ...(showPlanningSelectors ? [
        { value: this.project_planing.projectType, msg: 'กรุณาเลือกประเภทโครงการ' },
        { value: this.project_planing.selectedPlan, msg: 'กรุณาเลือกแผนงาน' },
        { value: this.project_planing.selectedProduct, msg: 'กรุณาเลือกผลผลิต' },
        { value: this.project_planing.selectedActivity, msg: 'กรุณาเลือกกิจกรรม' },
      ] : []),
      { value: this.project_planing.selectedBudget, msg: 'กรุณาเลือกหมวดงบ' },
      { value: data?.Used_BG, msg: 'กรุณาเลือกลักษณะโครงการ' },
      { value: data?.Project_Name, msg: 'กรุณากรอกชื่อโครงการ' },
      { value: data?.Project_Type_Id, msg: 'กรุณาเลือกประเภทโครงการ ใหม่/ต่อเนื่อง' },
    ];

    for (const field of generalFields) {
      if (!this.requireValue(field.value, field.msg, 1)) {
        return false;
      }
    }

    if (Number(data?.Operation1 || 0) !== 1 && Number(data?.Operation2 || 0) !== 1) {
      return this.failRequired(1, 'กรุณาเลือกการดำเนินการ');
    }

    const level1 =
      Array.isArray(this.project_planing.Project_Plan_Level1)
        ? (this.project_planing.Project_Plan_Level1[0] || {})
        : (this.project_planing.Project_Plan_Level1 || {});

    const level2 = this.project_planing.Project_Plan_Level2 || {};
    const level3 = this.project_planing.Project_Plan_Level3 || {};

    const alignmentFields = [
      { value: level1.Strategic_Id, msg: 'กรุณาเลือกยุทธศาสตร์ชาติด้าน' },
      { value: level1.Issues_Id, msg: 'กรุณาเลือกประเด็นยุทธศาสตร์' },
      { value: level1.Issues_Sub_Id, msg: 'กรุณาเลือกประเด็นย่อย' },
      { value: level1.Target, msg: 'กรุณากรอกเป้าหมายยุทธศาสตร์ชาติ' },
      { value: level2.Master_Plan_Id, msg: 'กรุณาเลือกแผนแม่บทฯ ประเด็น' },
      { value: level2.Plan_Goals_Id, msg: 'กรุณาเลือกเป้าหมายระดับประเด็น (Y2)' },
      { value: level2.Plan_Tactics_Id, msg: 'กรุณาเลือกตัวชี้วัดเป้าหมายระดับประเด็น' },
      { value: level2.Description, msg: 'กรุณากรอกความสอดคล้องของโครงการกับแผนแม่บทฯ' },
      { value: level2.Subplan_Id, msg: 'กรุณาเลือกแผนย่อยของแผนแม่บทฯ' },
      { value: level2.Target_Y1_Id, msg: 'กรุณาเลือกเป้าหมายแผนแม่บทย่อย (Y1)' },
      { value: level2.SubplanDesc, msg: 'กรุณากรอกความสอดคล้องของโครงการกับเป้าหมายแผนย่อย' },
      { value: level2.DevGuideline_Id, msg: 'กรุณาเลือกแนวทางการพัฒนาภายใต้แผนย่อย' },
      { value: level2.Landmark_Id, msg: 'กรุณาเลือกหมุดหมายแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ' },
      { value: level2.Landmark_Gloals_Id, msg: 'กรุณาเลือกเป้าหมายแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ' },
      { value: level2.Landmark_Tacticts_Id, msg: 'กรุณาเลือกตัวชี้วัดแผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ' },
      { value: level2.Landmark_Guidelines_Id, msg: 'กรุณาเลือกกลยุทธ์การพัฒนา' },
      { value: level2.Landmark_Sub_Guidelines_Id, msg: 'กรุณาเลือกกลยุทธ์ย่อย' },
      // { value: level3.Master_Plan_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ 5 ปี ประเด็น' },
      // { value: level3.Plan_Goals_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ 5 ปี เป้าหมายระดับประเด็น' },
      // { value: level3.Plan_Tactics_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ 5 ปี ตัวชี้วัด' },
      // { value: level3.Description, msg: 'กรุณากรอกความสอดคล้องของแผนปฏิบัติราชการ 5 ปี' },
      // { value: level3.Sub_Master_Plan_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ 5 ปี แผนย่อย' },
      // { value: level3.Sub_Plan_Goals_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ 5 ปี เป้าหมายแผนย่อย' },
      // { value: level3.SubplanDesc, msg: 'กรุณากรอกความสอดคล้องของแผนปฏิบัติราชการ 5 ปี กับเป้าหมายแผนย่อย' },
      // { value: level3.Guidelines_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ 5 ปี แนวทางการพัฒนา' },
      { value: level3.Project_Plan_Id_5, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 5 ปี แผนงาน' },
      { value: level3.Project_Plan_Goals_Id_5, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 5 ปี เป้าหมาย' },
      { value: level3.Indicators_Id_5, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 5 ปี ตัวชี้วัด' },
      { value: level3.Goals_Guidelines_Id_5, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 5 ปี แนวทางการพัฒนา' },
      { value: level3.Project_Plan_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 1 ปี แผนงาน' },
      { value: level3.Project_Plan_Goals_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 1 ปี เป้าหมาย' },
      { value: level3.Indicators_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 1 ปี ตัวชี้วัด' },
      { value: level3.Measure_Id, msg: 'กรุณาเลือกแผนปฏิบัติราชการ ป.ป.ท. แผน 1 ปี แนวทางการพัฒนา' },
    ];

    for (const field of alignmentFields) {
      if (!this.requireValue(field.value, field.msg, 2)) {
        return false;
      }
    }

    const detail =
      Array.isArray(this.project_planing.Project_Detail)
        ? {}
        : (this.project_planing.Project_Detail || {});

    if (!this.requireValue(detail.Principle, 'กรุณากรอกหลักการและเหตุผล', 3)) {
      return false;
    }

    if (!this.hasFilledRows(this.project_planing.Project_Objective, ['Name'])) {
      return this.failRequired(3, 'กรุณากรอกวัตถุประสงค์');
    }

    if (!this.hasFilledRows(this.project_planing.Project_Output, ['Name', 'Target', 'Unit'])) {
      return this.failRequired(3, 'กรุณากรอกเป้าหมายเชิงผลผลิตให้ครบ');
    }

    if (!this.hasFilledRows(this.project_planing.Project_Outcome, ['Name'])) {
      return this.failRequired(3, 'กรุณากรอกเป้าหมายเชิงผลลัพธ์');
    }

    if (!this.hasFilledRows(this.project_planing.Project_Expected, ['Name'])) {
      return this.failRequired(3, 'กรุณากรอกผลที่คาดว่าจะได้รับ');
    }

    if (!this.hasFilledRows(this.project_planing.Project_TargetGroup, ['Name', 'Amount', 'Unit'])) {
      return this.failRequired(3, 'กรุณากรอกกลุ่มเป้าหมาย / ผู้ที่ได้รับผลประโยชน์ให้ครบ');
    }

    if (!this.requireValue(detail.Area, 'กรุณากรอกพื้นที่การดำเนินการ', 3)) {
      return false;
    }

    if (!this.requireValue(detail.Start_Date, 'กรุณาเลือกวันที่เริ่มต้นโครงการ', 3)) {
      return false;
    }

    if (!this.requireValue(detail.End_Date, 'กรุณาเลือกวันที่สิ้นสุดโครงการ', 3)) {
      return false;
    }

    return true;
  }
  toDotNetDate(dateStr: any): string | null {

    if (!dateStr) return null;

    if (typeof dateStr === 'string' && /\/Date\(\d+\)\//.test(dateStr)) {
      return dateStr;
    }

    let timestamp: number;

    if (
      typeof dateStr === 'object' &&
      dateStr.year &&
      dateStr.month &&
      dateStr.day
    ) {
      timestamp =
        new Date(dateStr.year, dateStr.month - 1, dateStr.day).getTime();
    } else {
      timestamp = new Date(dateStr).getTime();
    }

    if (isNaN(timestamp)) {
      return null;
    }

    return `/Date(${timestamp})/`;
  }
  activities: any
  mapActivities() {

    const activities = [...(this.project_planing.activities || [])];

    return activities.map((act: any, i: number) => ({

      Project_Detail_Id: act.id,
      Activity_Name: act.name,
      Responsible: act.owner,
      Seq: i + 1,

      Used_BG: act.noBudget ? 0 : 1,
      Is_Consult: act.consult ? 1 : 0,
      Operation1: act.consultSelf ? 1 : 0,
      Operation2: act.consultHire ? 1 : 0,

      Months: this.mapMonthsForSave(act.quarters),

      OtherExpenses: this.mapOtherExpensesForSave(act.otherExpenses),

      SubActivities: [...(act.SubActivities || [])]
        .map((sub: any, j: number) => ({

          Project_Detail_Id: sub.Project_Detail_Id,
          Activity_Name: sub.name,
          Responsible: sub.owner,
          Seq: j + 1,

          Used_BG: sub.noBudget ? 0 : 1,
          Is_Consult: sub.consult ? 1 : 0,
          Operation1: sub.consultSelf ? 1 : 0,
          Operation2: sub.consultHire ? 1 : 0,

          Months: this.mapMonthsForSave(sub.quarters),

          OtherExpenses: this.mapOtherExpensesForSave(sub.otherExpenses)

        }))

    }));
  }

  private mapMonthsForSave(quarters: any[]): any[] {
    return (quarters || [])
      .flatMap((q: any) => q.months || [])
      .map((month: any) => ({
        ...month,
        budget: this.toSaveNumber(month?.budget)
      }));
  }

  private mapOtherExpensesForSave(items: any[]): any[] {
    return (items || []).map((item: any) => {
      const times = this.toSaveNumber(item.Times ?? item.times);
      const people = this.toSaveNumber(item.People ?? item.people);
      const rate = this.toSaveNumber(item.Rate ?? item.rate);
      const input3 = this.toSaveNumber(item.input3);
      const input4 = this.toSaveNumber(item.input4);
      const input5 = this.toSaveNumber(item.input5);
      const total =
        item.Total ?? item.total ?? this.multiplyFilledValues([
          times,
          people,
          rate,
          input3,
          input4,
          input5
        ]);

      return {
        ...item,
        Times: times,
        People: people,
        Rate: rate,
        input3,
        input4,
        input5,
        Total: this.toSaveNumber(total),
        total: this.toSaveNumber(total)
      };
    });
  }

  private toSaveNumber(value: any): number {
    if (value === null || value === undefined || value === '') {
      return 0;
    }

    const normalized =
      String(value).replace(/,/g, '').trim();

    const numberValue = Number(normalized);

    return isNaN(numberValue) ? 0 : numberValue;
  }

  private multiplyFilledValues(values: number[]): number {
    const filledValues =
      values.filter(value => value > 0);

    if (!filledValues.length) {
      return 0;
    }

    return filledValues.reduce(
      (total, value) => total * value,
      1
    );
  }
  randomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  addRandomRow() {

    const departments = ['สำนักบริหาร', 'ฝ่ายแผนงาน', 'ฝ่ายประชาสัมพันธ์', 'สำนัก IT'];
    const plans = ['พัฒนาบุคลากร', 'สื่อสารองค์กร', 'เพิ่มประสิทธิภาพระบบ', 'บริการประชาชน'];
    const outputs = [
      'บุคลากรมีศักยภาพเพิ่มขึ้น',
      'ประชาชนรับรู้ข้อมูลข่าวสาร',
      'ระบบทำงานเร็วขึ้น',
      'การให้บริการมีประสิทธิภาพ'
    ];
    const activities = [
      'อบรมการใช้ระบบสารสนเทศ',
      'จัดทำสื่อประชาสัมพันธ์',
      'พัฒนาระบบฐานข้อมูล',
      'จัดประชุมเชิงปฏิบัติการ'
    ];
    const status_name = [

      'รออนุมัติ',
    ]

    const budgetTypes = ['งบดำเนินงาน', 'งบลงทุน', 'งบรายจ่ายอื่น'];

    const newRow = {
      id: this.griddata.length + 1,
      department: this.randomItem(departments),
      plan: this.randomItem(plans),
      output: this.randomItem(outputs),
      activity: this.randomItem(activities),
      budgetType: this.randomItem(budgetTypes),
      project: 'โครงการ ' + Math.floor(Math.random() * 100),
      budget: Math.floor(Math.random() * 90000) + 10000,
      status_name: this.randomItem(status_name),
      Status_Number: 2
    };

    this.griddata.push(newRow);

  }
  maxTab = 5;

  nextTab() {
    if (this.currentTab < this.maxTab) {
      this.currentTab++;
    }
  }

  prevTab() {
    if (this.currentTab > 1) {
      this.currentTab--;
    }
  }
  getActivityTotal(act: any): number {

    // 🔥 ตอน GET ใช้ DB
    if (act.SubActivities?.length) {
      return this.getSubActivitiesTotal(act);
    }

    let total = 0;

    (act.quarters || []).forEach((q: any) => {

      (q.months || []).forEach((m: any) => {

        total += this.toSaveNumber(m.budget);

      });

    });

    return total;
  }
  getSubActivitiesTotal(act: any): number {

    let total = 0;

    (act.SubActivities || []).forEach((sub: any) => {

      sub.quarters?.forEach((q: any) => {
        q.months?.forEach((m: any) => {
          total += this.toSaveNumber(m.budget);
        });
      });

    });

    return total;
  }
  calcMultiplierTotalFromModel(act: any): number {

    // 🔥 มี sub → รวม sub
    if (act.SubActivities?.length) {
      return act.SubActivities.reduce((sum: number, sub: any) => {
        return sum + this.calcMultiplierTotalFromModel(sub);
      }, 0);
    }

    // 🔥 คำนวณจาก otherExpenses ตรงๆ
    if (act.otherExpenses?.length) {
      return act.otherExpenses.reduce((sum: number, item: any) => {
        return sum + this.toSaveNumber(item.total || item.Total || 0);
      }, 0);
    }

    return this.toSaveNumber(act.multiplierTotal);
  }
  prepareBeforeSave(activities: any[]) {

    activities.forEach(act => {

      // 🔥 คำนวณ main
      act.multiplierTotal = this.calcMultiplierTotalFromModel(act);

      // 🔥 ถ้ามี sub → คำนวณ sub ด้วย
      if (act.SubActivities?.length) {
        act.SubActivities.forEach((sub: any) => {
          sub.multiplierTotal = this.calcMultiplierTotalFromModel(sub);
        });
      }

    });

  }
  validateBeforeSave(activities: any[]): boolean {

    for (let i = 0; i < activities.length; i++) {

      const act = activities[i];

      const m = Number(this.calcMultiplierTotalFromModel(act).toFixed(2));
      const p = Number(this.getActivityTotal(act).toFixed(2));

      if (Math.abs(m - p) > 0.01) {

        basicAlert(
          'warning',
          `กิจกรรมที่ ${i + 1} ยอดไม่เท่ากัน`,
          `ผลคูณ = ${m.toLocaleString()} | วางแผน = ${p.toLocaleString()}`
        );

        return false;
      }
    }

    return true;
  }

}
