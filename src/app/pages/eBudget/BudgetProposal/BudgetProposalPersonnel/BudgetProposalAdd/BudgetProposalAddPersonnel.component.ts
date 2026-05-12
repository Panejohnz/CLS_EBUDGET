import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-project-budget-proposal-add',
  templateUrl: './BudgetProposalAdd.component.html',
  styleUrl: './BudgetProposalAdd.cpmponent.scss'
})
export class ProjectBudgetProposalAddPersonnelComponent {

  @Input() model: any;
  @Input() modalRef: any;

  constructor(
    public serviceebud: EbudgetService,
    private modalService: NgbModal
  ) { }

  closeModal() {

    this.modalRef.dismiss();

  }
  project_budget: any
  plan: any = {
    projectName: '',
    unit: '',
    totalTarget: 0,
    month: {
      oct: 0, nov: 0, dec: 0,
      jan: 0, feb: 0, mar: 0,
      apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0
    }
  }
  targetList: any = [
    {
      oct: 0, nov: 0, dec: 0,
      jan: 0, feb: 0, mar: 0,
      apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0
    }
  ]
  unit = ''
  isIndicator = false

  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Budget_Types: any[] = []
  Mas_Expense_Group: any[] = []
  expenseItem: any = null
  div_modal = false
  mapExpenseType(id: number): string {

    const map: any = {
      56: 'computer',
      57: 'vehicle',
      58: 'media',
      59: 'household',
      60: 'electric',
      61: 'office',
      62: 'innovation',
      63: 'other'
    };

    return map[id] || 'other';
  }
  div_list(expenseItem: any) {
    this.div_modal = true
  }
  expenseOptions: any[] = [];
  ngOnInit(): void {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
      BgYear: "2569"
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Department_Lists = res.Mas_Department_Lists || [];
      this.Mas_Plan_Lists = res.Mas_Plan_Lists || [];
      this.Mas_Expense_Lists = res.Mas_Expense_Lists || [];

      if (this.model?.Budget_Request.Request_Id) {

        this.mapInitialData()
      }
    });

    this.Get_Dropdown_list()
    console.log('เข้า model', this.model);
  }
  ngOnChanges() {


  }
  mapInitialData() {

    this.model.selectedDepartment =
      this.model?.Budget_Request.Department_Id;

    this.model.selectedPlan =
      this.model?.Budget_Request.Fk_Plan_Id;

    this.model.selectedProduct =
      this.model?.Budget_Request.Fk_Product_Id;

    this.model.selectedActivity =
      this.model?.Budget_Request.Fk_Activity_Id;

    this.model.selectedBudget =
      this.model?.Budget_Request.Fk_Expense_Type;

    this.model.selectedGroup =
      this.model?.Budget_Request.Fk_Budget_Type;

    this.model.selectedExpenseTypeId =
      this.model?.Budget_Request.Fk_Expense_List;

    if (this.model.selectedPlan) {

      this.Onchange_type_Plan();

    }

  }
  Onchange_type() {


    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type_Main",
    };


    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Budget_Types = res.Mas_Budget_Type_Lists || [];

    });
  }
  Onchange_type_Plan() {

    if (!this.model.selectedPlan) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Product",
      Mas_Plan: {
        Plan_Id: this.model.selectedPlan
      }
    };

    this.model.Budget_Request.Fk_Plan_Id = this.model.selectedPlan;

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Product = res.Mas_Product_Lists || [];

      if (this.model.Budget_Request.Fk_Product_Id) {
        this.model.selectedProduct =
          this.model.Budget_Request.Fk_Product_Id;
      }

      if (this.model.selectedProduct) {
        this.Onchange_type_Product();
      }
    });
  }
  openTargetModal(content: any) {

    if (this.targetList.length === 0) {
      this.addTargetRow();
    }

    this.modalService.open(content, {
      fullscreen: true
    });

  }
  Get_Dropdown_list() {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Expense_List",
      Mas_Expense_List: {
        Fk_Expense_Type_Id: 1
      }
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {

        if (response.RESULT == null) {

          this.expenseOptions = Array.isArray(response.Mas_Expense_Lists)
            ? response.Mas_Expense_Lists
            : [];


        } else {
          basicAlert('warning', 'ผิดพลาด', '');
        }

      });
    let model2 = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type_Main",
    };


    this.serviceebud.GatewayGetData(model2).subscribe((res: any) => {

      this.Mas_Budget_Types = res.Mas_Budget_Type_Lists || [];

    });
    let model3 = {
      FUNC_CODE: "FUNC-GET_Mas_Expense_Group",
    };


    this.serviceebud.GatewayGetData(model3).subscribe((res: any) => {

      this.Mas_Expense_Group = res.List_Mas_Expense_Group || [];

    });
  }
  onExpenseChange(item: any) {
    if (!item) return;
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Sub_List",
      Mas_Expense_Type: {
        Fk_Budget_Type_Id: item
      },
      Mas_Budget_Type: {
        Budget_Type_Id: item
      }
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {

        this.plan.subActivity = item.Fk_Expense_Type_Id;
        this.plan.subUnitActivity = item.Fk_Budget_Type_Id;
        this.formTitle = item.Expense_Name

        console.log('หาย', this.model);

      })

  }

  Onchange_type_Product() {

    if (!this.model.selectedProduct) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Activity",
      Mas_Product: {
        Product_Id: this.model.selectedProduct
      }
    };

    this.model.Budget_Request.Fk_Product_Id = this.model.selectedProduct;

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Activity = res.Mas_Activity_Lists || [];

      // 👉 map activity ตอน edit
      if (this.model.Fk_Activity_Id) {
        this.model.selectedActivity =
          this.model.Budget_Request.Fk_Activity_Id;
      }
    });
  }
  addTargetRow() {

    this.targetList.push({
      oct: null,
      nov: null,
      dec: null,
      jan: null,
      feb: null,
      mar: null,
      apr: null,
      may: null,
      jun: null,
      jul: null,
      aug: null,
      sep: null
    });

  }
  async save() {

    const findById = (
      list: any[],
      key: string,
      value: any
    ) => list.find(x => x[key] == value);

    const selectedPlanObj =
      findById(
        this.Mas_Plan_Lists,
        'Plan_Id',
        this.model.selectedPlan
      );

    const selectedProductObj =
      findById(
        this.Mas_Product,
        'Product_Id',
        this.model.selectedProduct
      );

    const selectedActivityObj =
      findById(
        this.Mas_Activity,
        'Activity_Id',
        this.model.selectedActivity
      );

    const selectedExpenseTypeIdObj =
      findById(
        this.expenseOptions,
        'Expense_Id',
        this.model.selectedExpenseTypeId
      );

    const selectedBudgetObj =
      findById(
        this.Mas_Budget_Types,
        'Budget_Type_Id',
        this.model.selectedBudget
      );

    const selectedGroupObj =
      findById(
        this.Mas_Expense_Group,
        'Expense_Group_Id',
        this.model.selectedGroup
      );

    const selectedDepartmentObj =
      findById(
        this.Mas_Department_Lists,
        'Department_Id',
        this.model.Department_Id
      );

    const payload = {

      BgYear: "2569",

      Request_Id: this.model.Budget_Request.Request_Id,

      Department_Id: this.model.Department_Id,

      Department_Name:
        selectedDepartmentObj?.Department_Name,

      Fk_Plan_Id: this.model.selectedPlan,

      Plan_Name:
        selectedPlanObj?.Plan_Name,

      Fk_Product_Id: this.model.selectedProduct,

      Product_Name:
        selectedProductObj?.Product_Name,

      Fk_Activity_Id: this.model.selectedActivity,

      Activity_Name:
        selectedActivityObj?.Activity_Name,

      Fk_Expense_List:
        this.model.selectedExpenseTypeId,

      Expense_List:
        selectedExpenseTypeIdObj?.Expense_Name,

      Fk_Budget_Type:
        this.model.selectedGroup,

      Budget_Type:
        selectedGroupObj?.Expense_Group_Name,

      Fk_Expense_Type:
        this.model.selectedBudget,

      Expense_Type:
        selectedBudgetObj?.Budget_Type_Name,

      Project_Name:
        this.model.Budget_Request.Project_Name,

      Used_BG:
        this.model.Budget_Request.Used_BG,

      Project_Type_Id:
        this.model.Budget_Request.Project_Type_Id,

      Project_Year_Count:
        this.model.Budget_Request.Project_Year_Count,

      Project_Year_Number:
        this.model.Budget_Request.Project_Year_Number,

      Operation1:
        this.model.Budget_Request.Operation1,

      Operation2:
        this.model.Budget_Request.Operation2,

      Proposer_Name:
        this.model.Budget_Request.Proposer_Name,

      Proposer_Position:
        this.model.Budget_Request.Proposer_Position

    };

    const getId = (obj: any, key: string) =>
      typeof obj === 'object' ? obj?.[key] : obj;
    const payload_plan = {
      BgYear: "2569",
      Project_Id: this.model.Project_Id,

      Department_Id: getId(this.model.selectedDepartment, 'Department_Id'),
      Department_Name: this.model.selectedDepartment?.Department_Name,

      Fk_Plan_Id: getId(this.model.selectedPlan, 'Plan_Id'),
      Plan_Name: this.model.selectedPlan?.Plan_Name,

      Fk_Expense_List: getId(this.model.projectType, 'Expense_Id'),
      Expense_List: this.model.projectType?.Expense_Name,

      Fk_Product_Id: getId(this.model.selectedProduct, 'Product_Id'),
      Product_Name: this.model.selectedProduct?.Product_Name,

      Fk_Activity_Id: getId(this.model.selectedActivity, 'Activity_Id'),
      Activity_Name: this.model.selectedActivity?.Activity_Name,

      Fk_Budget_Type: getId(this.model.selectedBudget, 'Budget_Type_Id'),
      Budget_Type: this.model.selectedBudget?.Budget_Type_Name,

      Project_Name: this.model.Project_Name,
      Used_BG: this.model.Used_BG,
      Project_Type_Id: this.model.Project_Type_Id,

      Project_Year_Count: this.model.Project_Year_Count,
      Project_Year_Number: this.model.Project_Year_Number,

      Operation1: this.model.Operation1,
      Operation2: this.model.Operation2,
      Proposer_Name: this.model.Proposer_Name,
      Proposer_Position: this.model.Proposer_Position,
    };

    this.model.Project_Plan_Detail = this.mapActivities();


    // if (!this.validateBeforeSave(this.model.activities)) {
    //   return;
    // }
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {
      const model = {
        FUNC_CODE: this.model.Budget_Request.Request_Id > 0
          ? "FUNC-Update_Budget_Request"
          : "FUNC-Insert_Budget_Request",
        Project_Plan: payload_plan,
        Budget_Request: payload,
        Budget_Request_Detail_Item: this.model.Budget_Request_Detail_Item,
        Project_Detail: {
          ...this.model.Project_Detail,

          Start_Date: this.toDotNetDate(this.model.Project_Detail.Start_Date),
          End_Date: this.toDotNetDate(this.model.Project_Detail.End_Date)
        },
        Project_Objective: this.model.Project_Objective,
        Project_Plan_Detail: this.model.Project_Plan_Detail,
        Project_Plan_Level1: this.model.Project_Plan_Level1,
        Project_Plan_Level2: this.model.Project_Plan_Level2,
        Project_Plan_Level1_Sub: this.model.Project_Plan_Level1_Sub,
        Project_Outcome: this.model.Project_Outcome,
        Project_Output: this.model.Project_Output,
        Project_Plan_Level3: this.model.Project_Plan_Level3,
        Project_Coordinator: this.model.Project_Coordinator,
        Project_Cabinet: this.model.Project_Cabinet,
        Project_Security: this.model.Project_Security,
        Project_Expected: this.model.Project_Expected,
        Project_TargetGroup: this.model.Project_TargetGroup,
      };

      this.serviceebud.GatewayGetData(model).subscribe(() => {
        basicAlert('success', 'บันทึกข้อมูลแล้ว', '');

        this.modalRef.close();
      });

    }

  }
  mapActivities() {

    const activities = this.model.activities || [];

    return activities.map((act: any, i: number) => ({

      Project_Detail_Id: act.id,
      Activity_Name: act.name,
      Responsible: act.owner,
      Seq: act.Seq ?? (i + 1),

      Used_BG: act.noBudget ? 0 : 1,
      Is_Consult: act.consult ? 1 : 0,

      Months: act.quarters.flatMap((q: any) => q.months),

      OtherExpenses: act.otherExpenses || [],

      SubActivities: (act.SubActivities || []).map((sub: any, j: number) => ({

        Project_Detail_Id: sub.Project_Detail_Id,
        Activity_Name: sub.name,
        Responsible: sub.owner,
        Seq: sub.Seq ?? (j + 1),

        Used_BG: sub.noBudget ? 0 : 1,
        Is_Consult: sub.consult ? 1 : 0,

        Months: sub.quarters.flatMap((q: any) => q.months),

        OtherExpenses: sub.otherExpenses || []

      }))

    }));
  }
  validateBeforeSave(activities: any[]): boolean {

    if (this.model.Project_Id) {
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
  toDotNetDate(dateStr: string): string | null {
    if (!dateStr) return null;

    const timestamp = new Date(dateStr).getTime();
    return `/Date(${timestamp})/`;
  }
  formTitle: any

  change_expense() {

  }


  // fullModal(modal: any) {

  //   this.modalRef = this.modalService.open(modal, {
  //     backdrop: 'static',
  //     windowClass: 'modal-95'
  //   })
  // }
}
