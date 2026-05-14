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
    window.location.reload();
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

  targetList: any[] = [
    {
      Request_Detail_Id: 0,
      unit: '',

      oct: 0,
      nov: 0,
      dec: 0,

      jan: 0,
      feb: 0,
      mar: 0,

      apr: 0,
      may: 0,
      jun: 0,

      jul: 0,
      aug: 0,
      sep: 0
    }
  ];

  unit = ''
  isIndicator = false

  targetDetail: any = {}

  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Budget_Types: any[] = []
  Mas_Expense_Group: any[] = []

  expenseItem: any = null

  div_modal = false

  expenseOptions: any[] = [];

  formTitle: any

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

  ngOnInit(): void {

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
      BgYear: "2569"
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Department_Lists = res.Mas_Department_Lists || [];
      this.Mas_Plan_Lists = res.Mas_Plan_Lists || [];
      this.Mas_Expense_Lists = res.Mas_Expense_Lists || [];

      if (this.model?.Budget_Request?.Request_Id) {

        this.mapInitialData()
      }
    });

    this.Get_Dropdown_list()
  }

  ngOnChanges() {

    if (this.model?.Budget_Request?.Request_Id) {

      this.mapInitialData()
    }
  }

  // ngOnChanges_Group() {

  //   let model3 = {
  //     FUNC_CODE: "FUNC-GET_Mas_Expense_Group_By_FK_Budget_Type_Id",
  //     Budget_Type_Id: this.model.selectedBudgetPropos
  //   };

  //   this.serviceebud.GatewayGetData(model3).subscribe((res: any) => {

  //     this.Mas_Expense_Group = res.List_Mas_Expense_Group || [];

  //   });
  // }

  mapInitialData() {

    this.model.selectedDepartment =
      this.model?.Project_Plan?.Department_Id;

    this.model.selectedPlanPropos =
      this.model?.Budget_Request?.Fk_Plan_Id;

    this.model.selectedProductPropos =
      this.model?.Budget_Request?.Fk_Product_Id;

    this.model.selectedActivityPropos =
      this.model?.Budget_Request?.Fk_Activity_Id;

    this.model.selectedBudgetPropos =
      this.model?.Budget_Request?.Fk_Budget_Type;

    this.model.selectedGroupPropos =
      this.model?.Budget_Request?.Fk_Expense_Type;

    this.model.selectedExpenseTypeId =
      this.model?.Budget_Request?.Fk_Expense_List;

    // 🔥 set readonly text
    this.model.selectedBudgetName =
      this.model?.Budget_Request?.Budget_Type || '';

    this.model.selectedGroupName =
      this.model?.Budget_Request?.Expense_Type || '';

    // 🔥 target detail
    if (this.model?.Budget_Request_Detail?.length > 0) {

      this.targetList =
        this.model.Budget_Request_Detail.map((d: any) => ({

          Request_Detail_Id:
            d.Request_Detail_Id || 0,

          unit:
            d.Unit_Name || '',

          oct:
            d.Oct_Target || 0,

          nov:
            d.Nov_Target || 0,

          dec:
            d.Dec_Target || 0,

          jan:
            d.Jan_Target || 0,

          feb:
            d.Feb_Target || 0,

          mar:
            d.Mar_Target || 0,

          apr:
            d.Apr_Target || 0,

          may:
            d.May_Target || 0,

          jun:
            d.Jun_Target || 0,

          jul:
            d.Jul_Target || 0,

          aug:
            d.Aug_Target || 0,

          sep:
            d.Sep_Target || 0,

          amount_oct:
            d.Oct_Amount || 0,

          amount_nov:
            d.Nov_Amount || 0,

          amount_dec:
            d.Dec_Amount || 0,

          amount_jan:
            d.Jan_Amount || 0,

          amount_feb:
            d.Feb_Amount || 0,

          amount_mar:
            d.Mar_Amount || 0,

          amount_apr:
            d.Apr_Amount || 0,

          amount_may:
            d.May_Amount || 0,

          amount_jun:
            d.Jun_Amount || 0,

          amount_jul:
            d.Jul_Amount || 0,

          amount_aug:
            d.Aug_Amount || 0,

          amount_sep:
            d.Sep_Amount || 0

        }));
      this.targetDetail =
        [...this.model.Budget_Request_Detail];
    }

    if (this.model.selectedPlanPropos) {

      this.Onchange_type_Plan();

    }

    // 🔥 โหลดหมวดงบ + หมวดค่าใช้จ่ายจาก expense
    if (this.model.selectedExpenseTypeId) {

      this.onExpenseChange(
        this.model.selectedExpenseTypeId
      );
    }
  }
  getTargetSum(t: any): number {

    return (
      (Number(t.oct) || 0) +
      (Number(t.nov) || 0) +
      (Number(t.dec) || 0) +

      (Number(t.jan) || 0) +
      (Number(t.feb) || 0) +
      (Number(t.mar) || 0) +

      (Number(t.apr) || 0) +
      (Number(t.may) || 0) +
      (Number(t.jun) || 0) +

      (Number(t.jul) || 0) +
      (Number(t.aug) || 0) +
      (Number(t.sep) || 0)
    );
  }
  getGrandTotal(): number {

    return this.targetList.reduce(
      (sum: number, t: any) => {

        return sum + this.getTargetSum(t);

      },
      0
    );
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

    if (!this.model.selectedPlanPropos) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Product",
      Mas_Plan: {
        Plan_Id: this.model.selectedPlanPropos
      }
    };

    this.model.Budget_Request.Fk_Plan_Id =
      this.model.selectedPlanPropos;

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Product =
        res.Mas_Product_Lists || [];

      if (this.model.Budget_Request.Fk_Product_Id) {

        this.model.selectedProductPropos =
          this.model.Budget_Request.Fk_Product_Id;
      }

      if (this.model.selectedProductPropos) {

        this.Onchange_type_Product();
      }
    });
  }

  Onchange_type_Product() {

    if (!this.model.selectedProductPropos) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Activity",
      Mas_Product: {
        Product_Id: this.model.selectedProductPropos
      }
    };

    this.model.Budget_Request.Fk_Product_Id =
      this.model.selectedProductPropos;

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Activity =
        res.Mas_Activity_Lists || [];

      if (this.model.Fk_Activity_Id) {

        this.model.selectedActivityPropos =
          this.model.Budget_Request.Fk_Activity_Id;
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


  addTargetRow() {

    this.targetList.push({

      Request_Detail_Id: 0,
      unit: '',

      oct: 0,
      nov: 0,
      dec: 0,

      jan: 0,
      feb: 0,
      mar: 0,

      apr: 0,
      may: 0,
      jun: 0,

      jul: 0,
      aug: 0,
      sep: 0

    });
  }
  async removeTargetRow(index: number, data: any) {
    const userConfirmed = await confirmAlert('info', 'ต้องการลบข้อมูล ?', '');

    if (userConfirmed) {
      if (data.Request_Detail_Id) {

        const model = {
          FUNC_CODE: "FUNC-Delete_Budget_Request_Detail",

          Request_Detail_Id: data.Request_Detail_Id
        };

        this.serviceebud.GatewayGetData(model).subscribe(async () => {
          this.targetList.splice(index, 1);


        });
      }
    } else {
      this.targetList.splice(index, 1);
    }


  }
  saveTarget(modal: any) {

    this.targetDetail =
      this.targetList.map((t: any) => ({

        Request_Detail_Id:
          t.Request_Detail_Id || 0,

        Unit_Name:
          t.unit,

        Oct_Target:
          t.oct || 0,

        Nov_Target:
          t.nov || 0,

        Dec_Target:
          t.dec || 0,

        Jan_Target:
          t.jan || 0,

        Feb_Target:
          t.feb || 0,

        Mar_Target:
          t.mar || 0,

        Apr_Target:
          t.apr || 0,

        May_Target:
          t.may || 0,

        Jun_Target:
          t.jun || 0,

        Jul_Target:
          t.jul || 0,

        Aug_Target:
          t.aug || 0,

        Sep_Target:
          t.sep || 0,

        Sum_Target:
          (t.oct || 0) +
          (t.nov || 0) +
          (t.dec || 0) +
          (t.jan || 0) +
          (t.feb || 0) +
          (t.mar || 0) +
          (t.apr || 0) +
          (t.may || 0) +
          (t.jun || 0) +
          (t.jul || 0) +
          (t.aug || 0) +
          (t.sep || 0)

      }));

    modal.close();
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

          this.expenseOptions =
            Array.isArray(response.Mas_Expense_Lists)
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

      this.Mas_Budget_Types =
        res.Mas_Budget_Type_Lists || [];

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

    this.serviceebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.Mas_Expense_Group =
          response.List_Mas_Expense_Group || [];

        this.Mas_Budget_Types =
          response.Mas_Budget_Types || [];

        // 🔥 auto select
        const budget =
          this.Mas_Budget_Types?.[0];

        const group =
          this.Mas_Expense_Group?.[0];

        this.model.selectedBudgetPropos =
          budget?.Budget_Type_Id;
        this.model.selectedBudgetName =
          budget?.Budget_Type_Name || '';

        this.model.selectedGroupPropos =
          group?.Fk_Expense_Group_Id;

        this.model.selectedGroupName =
          group?.Expense_Group_Name || '';

        // 🔥 title
        const expense =
          this.expenseOptions.find(
            x => x.Expense_Id == item
          );

        this.formTitle =
          expense?.Expense_Name || '';

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
        this.model.selectedPlanPropos
      );

    const selectedProductObj =
      findById(
        this.Mas_Product,
        'Product_Id',
        this.model.selectedProductPropos
      );

    const selectedActivityObj =
      findById(
        this.Mas_Activity,
        'Activity_Id',
        this.model.selectedActivityPropos
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
        this.model.selectedBudgetPropos
      );

    const selectedGroupObj =
      findById(
        this.Mas_Expense_Group,
        'Expense_Group_Id',
        this.model.selectedGroupPropos
      );

    const selectedDepartmentObj =
      findById(
        this.Mas_Department_Lists,
        'Department_Id',
        this.model.Department_Id
      );

    const payload = {

      BgYear: "2569",

      Request_Id:
        this.model.Budget_Request.Request_Id,

      FK_Project_Plan_Id:
        this.model.Budget_Request.FK_Project_Plan_Id,
      Total:
        this.getGrandTotal(),
      Department_Id:
        this.model.Department_Id,

      Department_Name:
        selectedDepartmentObj?.Department_Name,

      Fk_Plan_Id:
        this.model.selectedPlanPropos,

      Plan_Name:
        selectedPlanObj?.Plan_Name,

      Fk_Product_Id:
        this.model.selectedProductPropos,

      Product_Name:
        selectedProductObj?.Product_Name,

      Fk_Activity_Id:
        this.model.selectedActivityPropos,

      Activity_Name:
        selectedActivityObj?.Activity_Name,

      Fk_Expense_List:
        this.model.selectedExpenseTypeId,

      Expense_List:
        selectedExpenseTypeIdObj?.Expense_Name,

      Fk_Budget_Type:
        this.model.selectedBudgetPropos,

      Budget_Type:
        selectedBudgetObj?.Budget_Type_Name,

      Fk_Expense_Type:
        this.model.selectedGroupPropos,

      Expense_Type:
        selectedGroupObj?.Expense_Group_Name,

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
      typeof obj === 'object'
        ? obj?.[key]
        : obj;

    const data =
      this.model?.Project_Plan ||
      this.model;

    const payload_plan = {

      BgYear: "2569",

      ...(data?.Project_Id && {
        Project_Id: data.Project_Id
      }),

      Department_Id: getId(
        this.model.selectedDepartment,
        'Department_Id'
      ),

      Department_Name:
        this.model.selectedDepartment?.Department_Name,

      Fk_Plan_Id: getId(
        this.model.selectedPlan,
        'Plan_Id'
      ),

      Plan_Name:
        this.model.selectedPlan?.Plan_Name,

      Fk_Expense_List: getId(
        this.model.projectType,
        'Expense_Id'
      ),

      Expense_List:
        this.model.projectType?.Expense_Name,

      Fk_Product_Id: getId(
        this.model.selectedProduct,
        'Product_Id'
      ),

      Product_Name:
        this.model.selectedProduct?.Product_Name,

      Fk_Activity_Id: getId(
        this.model.selectedActivity,
        'Activity_Id'
      ),

      Activity_Name:
        this.model.selectedActivity?.Activity_Name,

      Fk_Budget_Type: getId(
        this.model.selectedBudget,
        'Budget_Type_Id'
      ),

      Budget_Type:
        this.model.selectedBudget?.Budget_Type_Name,

      ...(data?.Project_Name && {
        Project_Name: data.Project_Name
      }),

      ...(data?.Used_BG != null && {
        Used_BG: data.Used_BG
      }),

      ...(data?.Project_Type_Id != null && {
        Project_Type_Id: data.Project_Type_Id
      }),

      ...(data?.Project_Year_Count && {
        Project_Year_Count: data.Project_Year_Count
      }),

      ...(data?.Project_Year_Number && {
        Project_Year_Number: data.Project_Year_Number
      }),

      ...(data?.Operation1 != null && {
        Operation1: data.Operation1
      }),

      ...(data?.Operation2 != null && {
        Operation2: data.Operation2
      }),

      ...(data?.Proposer_Name && {
        Proposer_Name: data.Proposer_Name
      }),

      ...(data?.Proposer_Position && {
        Proposer_Position: data.Proposer_Position
      }),
    };

    this.model.Project_Plan_Detail =
      this.mapActivities();


    const userConfirmed =
      await confirmAlert(
        'info',
        'ต้องการบันทึกข้อมูล ?',
        ''
      );

    if (userConfirmed) {

      const model = {

        FUNC_CODE:
          this.model.Budget_Request.Request_Id > 0
            ? "FUNC-Update_Budget_Request"
            : "FUNC-Insert_Budget_Request",

        ...(this.model?.Project_Plan &&
          Object.keys(this.model.Project_Plan).length > 0 && {
          Project_Plan: payload_plan
        }),

        Budget_Request: payload,

        Budget_Request_Detail:
          this.targetDetail,

        Budget_Request_Detail_Item:
          this.model.Budget_Request_Detail_Item,

        Project_Detail: {
          ...this.model.Project_Detail,

          Start_Date:
            this.toDotNetDate(
              this.model.Project_Detail.Start_Date
            ),

          End_Date:
            this.toDotNetDate(
              this.model.Project_Detail.End_Date
            )
        },

        Project_Objective:
          this.model.Project_Objective,

        Project_Plan_Detail:
          this.model.Project_Plan_Detail,

        Project_Plan_Level1:
          this.model.Project_Plan_Level1,

        Project_Plan_Level2:
          this.model.Project_Plan_Level2,

        Project_Plan_Level1_Sub:
          this.model.Project_Plan_Level1_Sub,

        Project_Outcome:
          this.model.Project_Outcome,

        Project_Output:
          this.model.Project_Output,

        Project_Plan_Level3:
          this.model.Project_Plan_Level3,

        Project_Coordinator:
          this.model.Project_Coordinator,

        Project_Cabinet:
          this.model.Project_Cabinet,

        Project_Security:
          this.model.Project_Security,

        Project_Expected:
          this.model.Project_Expected,

        Project_TargetGroup:
          this.model.Project_TargetGroup,
      };

      this.serviceebud.GatewayGetData(model)
        .subscribe(async () => {

          await basicAlert(
            'success',
            'บันทึกข้อมูลแล้ว',
            ''
          );

          this.modalRef.close();

          window.location.reload();
        });

    }
  }

  mapActivities() {

    const activities =
      this.model.activities || [];

    return activities.map((act: any, i: number) => ({

      Project_Detail_Id: act.id,
      Activity_Name: act.name,
      Responsible: act.owner,
      Seq: act.Seq ?? (i + 1),

      Used_BG: act.noBudget ? 0 : 1,
      Is_Consult: act.consult ? 1 : 0,

      Months:
        act.quarters.flatMap((q: any) => q.months),

      OtherExpenses:
        act.otherExpenses || [],

      SubActivities:
        (act.SubActivities || []).map((sub: any, j: number) => ({

          Project_Detail_Id:
            sub.Project_Detail_Id,

          Activity_Name:
            sub.name,

          Responsible:
            sub.owner,

          Seq:
            sub.Seq ?? (j + 1),

          Used_BG:
            sub.noBudget ? 0 : 1,

          Is_Consult:
            sub.consult ? 1 : 0,

          Months:
            sub.quarters.flatMap((q: any) => q.months),

          OtherExpenses:
            sub.otherExpenses || []

        }))

    }));
  }

  validateBeforeSave(activities: any[]): boolean {

    if (this.model.Project_Id) {
      return true;
    }

    for (let i = 0; i < activities.length; i++) {

      const act = activities[i];

      const m = Number(
        this.calcMultiplierTotalFromModel(act).toFixed(2)
      );

      const p = Number(
        this.getActivityTotal(act).toFixed(2)
      );

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

    if (act.SubActivities?.length) {

      return act.SubActivities.reduce((sum: number, sub: any) => {

        return sum +
          this.calcMultiplierTotalFromModel(sub);

      }, 0);
    }

    return (act.otherExpenses || [])
      .reduce((sum: number, item: any) => {

        return sum +
          (item.total || item.Total || 0);

      }, 0);
  }

  getActivityTotal(act: any): number {

    let total = 0;

    act.quarters.forEach((q: any) => {

      q.months.forEach((m: any) => {

        total += Number(m.budget) || 0;

      });
    });

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

    const timestamp =
      new Date(dateStr).getTime();

    return `/Date(${timestamp})/`;
  }

  change_expense() {

  }
}