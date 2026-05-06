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
    if (!this.selectedDepartmentId) {
      basicAlert('info', 'เลือกหน่วยงาน', '')
      return
    }
    if (data?.Request_Id) {
      let model = {
        FUNC_CODE: "FUNC-GET_BUDGET_REQUEST_BY_ID",
        Request_Id: data.Request_Id
      };
      this.servicebud.GatewayGetData(model)
        .subscribe((res: any) => {

          this.model = {
            ...(res.Budget_Request || {}),
            Budget_Request_Detail_Item: res.Budget_Request_Detail_Item || {},

          };
        });
    } else {
      this.model = {
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
  deletePlan(data: any) {

  }

  saveTarget() {

  }
}
