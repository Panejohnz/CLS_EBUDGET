import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { DecimalPipe } from '@angular/common';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-project-budget-proposal',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './BudgetProposal.component.html',
  styles: ``
})
export class ProjectBudgetProposalComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public servicebud: EbudgetService
    , private authService: AuthenticationService,) {
  }
  allData: any[] = [];
  department: any[] = [{ name: 'หน่วยงาน 1' }, { name: 'หน่วยงาน 2' }]
  griddata = [
    {
      department: 'กองแผนงาน',
      plan: 'พัฒนาระบบบริหารจัดการภาครัฐ',
      output: 'ระบบบริหารจัดการข้อมูลกลาง',
      activity: 'พัฒนาระบบ e-Monitoring',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการพัฒนาระบบ e-Budget',
      budget: 2500000,
      Status_Number: 7,
      status_name: 'ไม่ผ่าน'
    },

    {
      department: 'กองคลัง',
      plan: 'เพิ่มประสิทธิภาพการบริหารงบประมาณ',
      output: 'ระบบติดตามงบประมาณ',
      activity: 'ปรับปรุงระบบรายงานงบประมาณ',
      budgetType: 'งบลงทุน',
      project: 'โครงการพัฒนาระบบรายงานงบ',
      budget: 1800000,
      Status_Number: 2,
      status_name: 'รอตรวจสอบ'
    },

    {
      department: 'กองเทคโนโลยีสารสนเทศ',
      plan: 'พัฒนาโครงสร้างพื้นฐานดิจิทัล',
      output: 'ระบบคลาวด์ภาครัฐ',
      activity: 'ติดตั้งระบบ Server กลาง',
      budgetType: 'งบลงทุน',
      project: 'โครงการศูนย์ข้อมูลกลาง',
      budget: 5200000,
      Status_Number: 8,
      status_name: 'อนุมัติแล้ว'
    },

    {
      department: 'กองนโยบาย',
      plan: 'ยกระดับการบริหารนโยบาย',
      output: 'ระบบวิเคราะห์ข้อมูลเชิงนโยบาย',
      activity: 'พัฒนา Dashboard วิเคราะห์ข้อมูล',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการระบบ BI ภาครัฐ',
      budget: 950000,
      Status_Number: 2,
      status_name: 'รอตรวจสอบ'
    },

    {
      department: 'กองพัสดุ',
      plan: 'เพิ่มประสิทธิภาพการจัดซื้อจัดจ้าง',
      output: 'ระบบจัดซื้อจัดจ้างอิเล็กทรอนิกส์',
      activity: 'พัฒนาระบบ e-Procurement',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการพัฒนาระบบจัดซื้อจัดจ้าง',
      budget: 1200000,
      Status_Number: 8,
      status_name: 'อนุมัติแล้ว'
    }
  ];
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
  project_budget = {
    projectType: '',
    Budget_Id: 0
  };
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  ngOnInit(): void {
    this.allData = Array.isArray(this.griddata)
      ? this.griddata
      : [];
    this.griddata = [...this.allData];
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


  fullModal(modal: any, data: any) {

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
      selectedDepartment: null,
      projectType: null,
      selectedPlan: null,
      selectedProduct: null,
      selectedActivity: null,
      selectedBudget: null,
    };
    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }
  deletePlan(data: any) {

  }

  saveTarget() {

  }
}
