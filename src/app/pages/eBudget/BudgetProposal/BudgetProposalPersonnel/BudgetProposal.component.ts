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
  styles: ``
})
export class ProjectBudgetProposalComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public servicebud: EbudgetService
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

      this.department = Array.isArray(response.Mas_Department_Lists)
        ? response.Mas_Department_Lists
        : [];

    });

  }
  applyFilter() {

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
    console.log('data', data);

    if (!this.selectedDepartmentId && !data.Request_Id) {
      basicAlert('info', 'เลือกหน่วยงาน', '')
      return
    }
    if (data?.Request_Id) {
      let model = {
        FUNC_CODE: "FUNC-GET_BUDGET_REQUEST_BY_ID",
        Request_Id: data.Request_Id,
        Project_Id: data.FK_Project_Plan_Id || data.FK_Project_Plan_Id_copy || 0
      };
      this.servicebud.GatewayGetData(model)
        .subscribe((res: any) => {

          this.model = {
            Budget_Request: res.Budget_Request || {},
            Budget_Request_Detail_Item: res.Budget_Request_Detail_Item || {},
            Budget_Request_Detail: res.Budget_Request_Detail || {},
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
      this.model = {
        Budget_Request: {},
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
    }

    console.log('่ก่อน model', this.model);

    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
    this.modalRef.result.then(
      (result: any) => {
        this.selectedDepartmentId = null
        this.get_data()
      },
      (reason: any) => {
        this.selectedDepartmentId = null
        this.get_data()
      }
    );
  }
  projectSearchTerm = '';

  selectedProjectId: number | null = null;

  copyProjectList: any[] = [];

  copyProjectListTemp: any[] = [];
  copyModal(content: any) {
    let model = {
      FUNC_CODE: "FUNC-Get_Project_Plan_7",
      BgYear: this.currentYear
    }
    var getData = this.servicebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      let allData = Array.isArray(response.List_Project_Plan)
        ? response.List_Project_Plan
        : [];
      let griddata = [...allData]
      this.copyProjectList = [...griddata];

      this.selectedProjectId = null;

      this.modalService.open(content, {
        size: 'xl',
        backdrop: 'static'
      });
    })
  }
  copyProjectToRequest(copyModal: any) {

    if (!this.selectedProjectId) {
      return;
    }
    let model = {
      FUNC_CODE: "FUNC-Project_Plan_Copy",
      Request_Id: this.selectedProjectId
    }
    var getData = this.servicebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      basicAlert('success', 'คัดลอกรายการแล้ว', '')
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
}
