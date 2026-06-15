import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { DecimalPipe } from '@angular/common';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

@Component({
  selector: 'app-project-budget-proposal',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './BudgetProposal.component.html',
  styleUrls: ['./BudgetProposal.component.scss'],
  styles: [`
    .readonly-select {
      pointer-events: none;
      background-color: var(--vz-secondary-bg, #e9ecef);
      color: #6c757d;
      opacity: 1;
    }
  `]
})
export class ProjectBudgetProposalComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , public sortService: PaginationService, public servicebud: EbudgetService
    , private authService: AuthenticationService, private budgetYearService: BudgetYearService) {
  }
  allData: any[] = [];
  model: any
  department: any[] = []
  griddata: any[] = [];
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
    Project_Plan_Level2: {},
    Project_Cabinet: [],
    Project_Security: [],
    Project_Plan_Level3: {}

  };
  modalRef: any;
  total$!: Observable<number>;
  currentYear: any
  project_budget = {
    projectType: '',
    Budget_Id: 0
  };
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  selectedDepartmentId: any = null;

  griddataTemp: any[] = [];
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

  get Total(): number {
    return this.griddata.reduce((sum: number, item: any) => {
      return sum + Number(item?.Total || 0);
    }, 0);
  }
  userSession: any

  get isDepartmentLocked(): boolean {
    return this.userSession?.permissionData?.VIEW_DATA == 3;
  }

  private resetDepartmentSelection(): void {
    this.selectedDepartmentId = this.isDepartmentLocked
      ? this.userSession?.permissionData?.Department_id ?? null
      : null;
  }

  ngOnInit(): void {
    const sessionStr = localStorage.getItem('userSession');

    if (sessionStr) {
      this.userSession = JSON.parse(sessionStr);
    }
    try {

      if (this.userSession.permissionData.VIEW_DATA == 3) {
        this.selectedDepartmentId = this.userSession.permissionData.Department_id
      } else {

      }
    } catch (error) {

    }
    this.sortService.pageSize = 20;
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
      FUNC_CODE: "FUNC-Get_Budget_Request",
      BgYear: this.currentYear
    };

    var getData = this.servicebud.GatewayGetData(model);

    getData.subscribe((response: any) => {

      this.allData = Array.isArray(response.List_Budget_Request_Data_Table.Data)
        ? response.List_Budget_Request_Data_Table.Data
        : [];

      this.griddataTemp = [...this.allData];

      this.griddata = [...this.allData];
      this.sortService.page = 1;

      this.department = Array.isArray(response.Mas_Department_Lists)
        ? response.Mas_Department_Lists
        : [];

      if (this.selectedDepartmentId != null) {
        const matchedDepartment = this.department.find(
          (item: any) => String(item.Department_Id) === String(this.selectedDepartmentId)
        );

        if (matchedDepartment) {
          this.selectedDepartmentId = matchedDepartment.Department_Id;
        }
      }

      this.applyFilter();

    });

  }
  applyFilter() {
    this.sortService.page = 1;

    let data = [...this.griddataTemp];

    if (this.selectedDepartmentId) {

      data = data.filter(
        x => x.Department_Id == this.selectedDepartmentId
      );

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

  }
  filterDepartment() {

    if (!this.selectedDepartmentId) {

      this.griddata = [...this.griddataTemp];
      return;

    }

    this.griddata = this.griddataTemp.filter(
      x => x.Department_Id == this.selectedDepartmentId
    );

  }

  fullModal(modal: any, data: any) {

    if (!this.selectedDepartmentId && !data.Request_Id) {
      basicAlert('info', 'เลือกหน่วยงาน', '')
      return
    }

    this.model = null;

    if (data?.Request_Id) {
      let model = {
        FUNC_CODE: "FUNC-GET_BUDGET_REQUEST_BY_ID",
        Request_Id: data.Request_Id,
        Project_Id: data.FK_Project_Plan_Id || data.FK_Project_Plan_Id_copy || 0
      };
      this.servicebud.GatewayGetData(model)
        .subscribe((res: any) => {

          this.model = {
            Budget_Type: 1,
            Budget_Request: {
              ...(res.Budget_Request || {}),
              Status_Id: res.Budget_Request?.Status_Id ?? data.Status_Id ?? 0
            },
            Status_Id: res.Budget_Request?.Status_Id ?? data.Status_Id ?? 0,
            Budget_Request_Attach_File: this.mapFileUploadList(
              res.FILE_UPLOAD_List || res.Budget_Request_Attach_File || [],
              res.Budget_Request || {}
            ),
            Budget_Request_Detail_Item: res.Budget_Request_Detail_Item || [],
            Budget_Request_Detail: res.Budget_Request_Detail || [],
            Project_Plan: res.Project_Plan || {},
            Project_Detail: res.Project_Detail || {},
            Project_Objective: res.Project_Objective || [],
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
            FILE_UPLOAD_List: res.FILE_UPLOAD_List || []
          };
          const details = res.Project_Plan_Detail || [];
          const items = res.Project_Plan_Detail_Item || [];

          details.forEach((d: any) => {
            d.Project_Detail_Id = Number(d.Project_Detail_Id);
            d.Parent_Id = d.Parent_Id ? Number(d.Parent_Id) : null;
          });

          const activities = this.mapPlanDetail(details);
          this.mapItems(items, activities);

          this.model.activities = activities;
          this.openFullModal(modal);
        });
    } else {
      this.model = {
        Budget_Type: 1,
        Budget_Request: {},
        Budget_Request_Attach_File: [],
        Status_Id: 0,
        Department_Id: this.selectedDepartmentId,
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
        selectedDepartment: null,
        projectType: null,
        selectedPlan: null,
        selectedProduct: null,
        selectedActivity: null,
        selectedBudget: null,

      };
      this.openFullModal(modal);
    }
  }

  openFullModal(modal: any) {

    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });

    this.modalRef.result.then(
      (result: any) => {
        this.resetDepartmentSelection();
        this.model = null;
        this.get_data()
      },
      (reason: any) => {
        this.resetDepartmentSelection();
        this.model = null;
        this.get_data()
      }
    );

  }
  projectSearchTerm = '';

  selectedProjectIds: number[] = [];

  get allCopyProjectsSelected(): boolean {
    const visibleIds =
      this.filteredCopyProjectList.map(item => Number(item.Project_Id));

    return visibleIds.length > 0 &&
      visibleIds.every(id => this.selectedProjectIds.includes(id));
  }

  get hasSelectedCopyProjects(): boolean {
    return this.selectedProjectIds.length > 0;
  }

  toggleSelectAllCopyProjects(checked: boolean) {
    const visibleIds =
      this.filteredCopyProjectList.map(item => Number(item.Project_Id));

    if (checked) {
      this.selectedProjectIds = Array.from(
        new Set([
          ...this.selectedProjectIds,
          ...visibleIds
        ])
      );
      return;
    }

    this.selectedProjectIds =
      this.selectedProjectIds.filter(id => !visibleIds.includes(id));
  }

  toggleCopyProject(projectId: number, checked: boolean) {
    const id = Number(projectId);

    if (checked) {
      if (!this.selectedProjectIds.includes(id)) {
        this.selectedProjectIds = [...this.selectedProjectIds, id];
      }
      return;
    }

    this.selectedProjectIds = this.selectedProjectIds.filter(x => x !== id);
  }

  isCopyProjectSelected(projectId: number): boolean {
    return this.selectedProjectIds.includes(Number(projectId));
  }

  copyProjectList: any[] = [];

  copyProjectListTemp: any[] = [];
  get filteredCopyProjectList(): any[] {
    const keyword =
      (this.projectSearchTerm || '').trim().toLowerCase();

    if (!keyword) {
      return this.copyProjectList;
    }

    return this.copyProjectList.filter(item => {
      return [
        item.BgYear,
        item.Department_Name,
        item.Plan_Name,
        item.Product_Name,
        item.Activity_Name,
        item.Project_Name,
        item.Status_Name,
        item.Total
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }

  copyModal(content: any) {
    let model = {
      FUNC_CODE: "FUNC-Get_Project_Plan_7",
      BgYear: this.currentYear
    }
    var getData = this.servicebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      let allData = Array.isArray(response.List_Project_Plan_Table.Data)
        ? response.List_Project_Plan_Table.Data
        : [];
      let griddata = [...allData]
      this.copyProjectList = [...griddata];
      this.projectSearchTerm = '';

      this.selectedProjectIds = [];

      this.modalService.open(content, {
        size: 'xl',
        backdrop: 'static'
      });
    })
  }
  copyProjectToRequest(copyModal: any) {

    if (!this.selectedProjectIds.length) {
      return;
    }
    let model = {
      FUNC_CODE: "FUNC-Project_Plan_Copy",
      Project_Ids: this.selectedProjectIds
    }
    var getData = this.servicebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      basicAlert('success', 'คัดลอกรายการแล้ว', '')
      copyModal.close();
      this.get_data()
    })



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
  mapPlanDetail(data: any[]) {

    return data.map(x => ({

      id: Number(x.Project_Detail_Id),
      name: x.Activity_Name,
      owner: x.Responsible,

      noBudget: x.Used_BG === 0,
      consult: x.Is_Consult === 1,

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

        noBudget: s.Used_BG === 0,
        consult: s.Is_Consult === 1,

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
  async deletePlan(data: any) {
    const userConfirmed = await confirmAlert('info', 'ต้องการลบข้อมูล ?', '');

    if (userConfirmed) {

      const model = {
        FUNC_CODE: "FUNC-Delete_Budget_Request",

        Request_Id: data.Request_Id
      };

      this.servicebud.GatewayGetData(model).subscribe(async () => {
        basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
        this.get_data();

      });
    }
  }

  saveTarget() {

  }

  private mapFileUploadList(fileUploadList: any[], budgetRequest: any): any[] {
    if (!Array.isArray(fileUploadList)) {
      return [];
    }

    const requestId =
      budgetRequest?.Request_Id || 0;

    const requestExpenseId =
      budgetRequest?.Fk_Expense_List || 0;

    return fileUploadList.map((item: any) => {
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
        TYPE_ID: item.TYPE_ID || item.Type_Id || 0,
        FK_IDA: item.FK_IDA || item.Fk_Ida || requestId,
        Client_Attachment_Id:
          item.CLIENT_ATTACHMENT_ID ||
          item.Client_Attachment_Id ||
          '',
        Ref_Module:
          item.REF_MODULE ||
          item.Ref_Module ||
          'BUDGET_REQUEST',
        Ref_Level:
          item.REF_LEVEL ||
          item.Ref_Level ||
          'EXPENSE',
        Request_Id:
          item.FK_REQUEST_ID ||
          item.Fk_Request_Id ||
          item.Request_Id ||
          requestId,
        Fk_Expense_Id:
          item.FK_EXPENSE_ID ||
          item.Fk_Expense_Id ||
          item.Expense_Id ||
          requestExpenseId,
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
}
