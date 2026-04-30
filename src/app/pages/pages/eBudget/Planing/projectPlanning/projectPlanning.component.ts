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
import { ProjectPlanService } from 'src/app/core/services/ProjectPlan.service'
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { TabGuidelineComponent } from 'src/app/shared/planingtab/components/tab-guideline/tab-guideline.component';
@Component({
  selector: 'projectPlanning',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './projectPlanning.component.html'
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
    Project_Plan_Level3: {}

  };
  modalRef: any;
  total$!: Observable<number>;
  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Budget_Types: any[] = []


  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService, private ProjectPlanService: ProjectPlanService, private budgetYearService: BudgetYearService) {
  }
  currentYear: any
  ngOnInit(): void {

    this.get_data()

    this.budgetYearService.yearChanged$.subscribe(year => {
      if (year) {
        this.currentYear = year
        this.allData = Array.isArray(this.griddata)
          ? this.griddata
          : [];
        this.griddata = [...this.allData];
      }
    });


  }
  get_data() {
    let model = {
      FUNC_CODE: "FUNC-Get_Project_Plan",
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      this.allData = Array.isArray(response.List_Project_Plan_Data_Table.Data)
        ? response.List_Project_Plan_Data_Table.Data
        : [];
      this.griddata = [...this.allData];
      this.currentTab = 1
      this.firstLoad = true;
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
            Project_Detail: res.Project_Detail || {},
            Project_Objective: res.Project_Objective || [],
            Project_Plan_Level1: res.Project_Plan_Level1 || [],
            Project_Plan_Level1_Sub: res.Project_Plan_Level1_Sub || [],
            Project_Cabinet: res.Project_Cabinet || [],
            Project_Plan_Level2: res.Project_Plan_Level2 || [],
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
          console.log('DETAIL', details);
          const activities = this.mapPlanDetail(details);
          this.mapItems(items, activities);

          this.project_planing.activities = activities;
        });

    } else {
      this.project_planing = {
        Project_Plan: {},

        Project_Detail: [],
        Project_Objective: [],

        Project_Plan_Level1: [],
        Project_Plan_Level1_Sub: [],
        Project_Plan_Level2: {},
        Project_Cabinet: [],
        Project_Plan_Level3: {
          Urgent1_Checked: false,
          Urgent1_Name: '',
          Government_Policy_Id1: null,
          Government_Policy_Sub_Id1: null,
          Government_Policy_Id2: null,
          Government_Policy_Sub_Id2: null,
          Urgent2_Checked: false,
          Urgent2_Name: '',
          Project_Plan_Id: null,
          Tactics_Id: null,
          Measure_Id: null,
          Indicators_Id: null,
          Mid1_Checked: false,
          Mid1_Name: '',

          Mid2_Checked: false,
          Mid2_Name: '',

          ProjectPlaningAlignment: '',

          PpatPlanName: '',
          PpatStrategy_Id: '',
          PpatMeasure_Id: '',
          PpatIndicator_Id: ''
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
  mapMonths(x: any) {

    const months = [
      { selected: x.Oct_Target === 1, budget: x.Oct_Amount },
      { selected: x.Nov_Target === 1, budget: x.Nov_Amount },
      { selected: x.Dec_Target === 1, budget: x.Dec_Amount },
      { selected: x.Jan_Target === 1, budget: x.Jan_Amount },
      { selected: x.Feb_Target === 1, budget: x.Feb_Amount },
      { selected: x.Mar_Target === 1, budget: x.Mar_Amount },
      { selected: x.Apr_Target === 1, budget: x.Apr_Amount },
      { selected: x.May_Target === 1, budget: x.May_Amount },
      { selected: x.Jun_Target === 1, budget: x.Jun_Amount },
      { selected: x.Jul_Target === 1, budget: x.Jul_Amount },
      { selected: x.Aug_Target === 1, budget: x.Aug_Amount },
      { selected: x.Sep_Target === 1, budget: x.Sep_Amount }
    ];

    return [
      { quarter: 1, months: months.slice(0, 3) },
      { quarter: 2, months: months.slice(3, 6) },
      { quarter: 3, months: months.slice(6, 9) },
      { quarter: 4, months: months.slice(9, 12) }
    ];
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

  goTab(tab: number) {
    this.currentTab = tab;
    this.firstLoad = false; // 👈 พอกดครั้งแรก จบโหมดเริ่มต้น
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

    const getId = (obj: any, key: string) =>
      typeof obj === 'object' ? obj?.[key] : obj;

    const payload = {
      BgYear: "2569",
      Project_Id: this.project_planing.Project_Id,

      Department_Id: getId(this.project_planing.selectedDepartment, 'Department_Id'),
      Department_Name: this.project_planing.selectedDepartment?.Department_Name,

      Fk_Plan_Id: getId(this.project_planing.selectedPlan, 'Plan_Id'),
      Plan_Name: this.project_planing.selectedPlan?.Plan_Name,

      Fk_Expense_List: getId(this.project_planing.projectType, 'Expense_Id'),
      Expense_List: this.project_planing.projectType?.Expense_Name,

      Fk_Product_Id: getId(this.project_planing.selectedProduct, 'Product_Id'),
      Product_Name: this.project_planing.selectedProduct?.Product_Name,

      Fk_Activity_Id: getId(this.project_planing.selectedActivity, 'Activity_Id'),
      Activity_Name: this.project_planing.selectedActivity?.Activity_Name,

      Fk_Budget_Type: getId(this.project_planing.selectedBudget, 'Budget_Type_Id'),
      Budget_Type: this.project_planing.selectedBudget?.Budget_Type_Name,

      Project_Name: this.project_planing.Project_Name,
      Used_BG: this.project_planing.Used_BG,
      Project_Type_Id: this.project_planing.Project_Type_Id,

      Project_Year_Count: this.project_planing.Project_Year_Count,
      Project_Year_Number: this.project_planing.Project_Year_Number,

      Operation1: this.project_planing.Operation1,
      Operation2: this.project_planing.Operation2,
      Proposer_Name: this.project_planing.Proposer_Name,
      Proposer_Position: this.project_planing.Proposer_Position,


    };

    this.project_planing.Project_Plan_Detail = this.mapActivities();


    if (!this.validateBeforeSave(this.project_planing.activities)) {
      return;
    }

    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (!userConfirmed) return;

    const model = {
      FUNC_CODE: this.project_planing.Project_Id > 0
        ? "FUNC-Update_Project_Plan"
        : "FUNC-Insert_Project_Plan",

      Project_Plan: payload,

      Project_Detail: {
        ...this.project_planing.Project_Detail,

        Start_Date: this.toDotNetDate(this.project_planing.Project_Detail.Start_Date),
        End_Date: this.toDotNetDate(this.project_planing.Project_Detail.End_Date)
      },
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
      Project_Expected: this.project_planing.Project_Expected,
      Project_TargetGroup: this.project_planing.Project_TargetGroup,
    };

    this.serviceebud.GatewayGetData(model).subscribe(() => {
      basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
      this.get_data();
      modal.dismiss();
    });
  }
  toDotNetDate(dateStr: string): string | null {
    if (!dateStr) return null;

    const timestamp = new Date(dateStr).getTime();
    return `/Date(${timestamp})/`;
  }
  activities: any
  mapActivities() {

    const activities = this.project_planing.activities || [];

    return activities.map((act: any) => ({

      // 🔥 MAIN
      Project_Detail_Id: act.id,
      Activity_Name: act.name,
      Responsible: act.owner,

      Used_BG: act.noBudget ? 0 : 1,
      Is_Consult: act.consult ? 1 : 0,

      Months: act.quarters.flatMap((q: any) => q.months),

      OtherExpenses: act.otherExpenses || [],

      // 🔥 สำคัญสุด
      SubActivities: (act.SubActivities || []).map((sub: any) => ({
        Project_Detail_Id: sub.Project_Detail_Id,
        Activity_Name: sub.name,
        Responsible: sub.owner,

        Used_BG: sub.noBudget ? 0 : 1,
        Is_Consult: sub.consult ? 1 : 0,

        Months: sub.quarters.flatMap((q: any) => q.months),

        OtherExpenses: sub.otherExpenses || []

      }))

    }));

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

    let total = 0;

    // รวมกิจกรรมหลัก
    act.quarters.forEach((q: any) => {
      q.months.forEach((m: any) => {
        total += Number(m.budget) || 0;
      });
    });

    // รวมกิจกรรมย่อย
    total += this.getSubActivitiesTotal(act);

    return total;
  }
  getSubActivitiesTotal(act: any): number {

    let total = 0;

    (act.SubActivities || []).forEach((sub: any) => {

      sub.quarters?.forEach((q: any) => {
        q.months?.forEach((m: any) => {
          total += Number(m.budget) || 0;
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
    return (act.otherExpenses || []).reduce((sum: number, item: any) => {
      return sum + (item.total || item.Total || 0);
    }, 0);
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

    if (this.project_planing.Project_Id) {
      return true;
    }
    for (let i = 0; i < activities.length; i++) {

      const act = activities[i];

      const m = Number(this.calcMultiplierTotalFromModel(act).toFixed(2));
      const p = Number(this.getActivityTotal(act).toFixed(2));

      if (m !== p) {
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
