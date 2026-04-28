import { Component, Input } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { ProjectPlanService } from 'src/app/core/services/ProjectPlan.service'

export interface ProjectPlan {
  projectType: string;
}
@Component({
  selector: 'app-tab-general',

  templateUrl: './tab-general.component.html',
  styleUrl: './tab-general.component.scss'
})
export class TabGeneralComponent {
  constructor(private ebudgetService: EbudgetService, private ProjectPlanService: ProjectPlanService) {
  }
  @Input() model: any
  projectType: any = ''
  Project_Type_Id: Number = 0;

  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Budget_Types: any[] = []

  Used_BG: any

  compareById(a: any, b: any): boolean {
    if (!a || !b) return a === b;

    return (
      a.Department_Id === b.Department_Id ||
      a.Expense_Id === b.Expense_Id ||
      a.Plan_Id === b.Plan_Id ||
      a.Product_Id === b.Product_Id ||
      a.Activity_Id === b.Activity_Id ||
      a.Budget_Type_Id === b.Budget_Type_Id
    );
  }

  ngOnInit(): void {
    this.setDefault()
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
      BgYear: "2569"
    };

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Department_Lists = res.Mas_Department_Lists || [];
      this.Mas_Plan_Lists = res.Mas_Plan_Lists || [];
      this.Mas_Expense_Lists = res.Mas_Expense_Lists || [];

    });
  }
  ngOnChanges() {

    if (this.model) {
      this.setDefault(); 
    }

    if (this.model?.Project_Id) {
      this.mapInitialData();
    }
  }
  onBudgetChangebox() {
    const isNoBudget = this.model.Used_BG == 1;

    this.model.activities?.forEach((act: any) => {
      act.noBudget = isNoBudget;

      if (isNoBudget) {
        act.quarters?.forEach((q: any) => {
          q.months?.forEach((m: any) => {
            m.budget = null;
            m.selected = false;
          });
        });
      }

      act.SubActivities?.forEach((sub: any) => {
        sub.noBudget = isNoBudget;
      });
    });
  }
  setDefault() {

    if (!this.model) {
      this.model = {};
    }

    if (this.model.Used_BG == null) {
      this.model.Used_BG = 1;
    }

    if (this.model.Project_Type_Id == null) {
      this.model.Project_Type_Id = 1;
    }

    if (this.model.Operation1 == null) {
      this.model.Operation1 = 1;
    }

    if (this.model.Operation2 == null) {
      this.model.Operation2 = 0;
    }

  }
  mapInitialData() {
    debugger
    const find = (list: any[], key: string, value: any) =>
      list.find(x => x[key] == value);

    this.model.selectedDepartment =
      find(this.Mas_Department_Lists, 'Department_Id', this.model.Department_Id);

    this.model.projectType =
      find(this.Mas_Expense_Lists, 'Expense_Id', this.model.Fk_Expense_List);

    this.model.selectedPlan =
      find(this.Mas_Plan_Lists, 'Plan_Id', this.model.Fk_Plan_Id);

    // 🔥 chain load ต่อ
    if (this.model.projectType) {
      this.Onchange_type();
    }

    if (this.model.selectedPlan) {
      this.Onchange_type_Plan();
    }
  }


  Onchange_type_Department() {
    this.ProjectPlanService.setProjectPlan({
      Department: this.model.selectedDepartment
    });
  }
  Onchange_type() {

    if (!this.model.projectType) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type",
      Mas_Expense_List: {
        Expense_Id: this.model.projectType.Expense_Id
      }
    };

    this.model.Fk_Expense_List = this.model.projectType.Expense_Id;

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Budget_Types = res.Mas_Budget_Types || [];

      // 👉 map budget ตอน edit
      if (this.model.Fk_Budget_Type) {
        this.model.selectedBudget =
          this.Mas_Budget_Types.find(x => x.Budget_Type_Id == this.model.Fk_Budget_Type);
      }

      // 👉 auto select ถ้ามีตัวเดียว
      if (this.Mas_Budget_Types.length === 1) {
        this.model.selectedBudget = this.Mas_Budget_Types[0];
      }
    });
  }

  // =========================
  // 🔥 PLAN → PRODUCT
  // =========================
  Onchange_type_Plan() {

    if (!this.model.selectedPlan) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Product",
      Mas_Plan: {
        Plan_Id: this.model.selectedPlan.Plan_Id
      }
    };

    this.model.Fk_Plan_Id = this.model.selectedPlan.Plan_Id;

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Product = res.Mas_Product_Lists || [];

      // 👉 map product ตอน edit
      if (this.model.Fk_Product_Id) {
        this.model.selectedProduct =
          this.Mas_Product.find(x => x.Product_Id == this.model.Fk_Product_Id);
      }

      // 👉 load activity ต่อ
      if (this.model.selectedProduct) {
        this.Onchange_type_Product();
      }
    });
  }

  // =========================
  // 🔥 PRODUCT → ACTIVITY
  // =========================
  Onchange_type_Product() {

    if (!this.model.selectedProduct) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Activity",
      Mas_Product: {
        Product_Id: this.model.selectedProduct.Product_Id
      }
    };

    this.model.Fk_Product_Id = this.model.selectedProduct.Product_Id;

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Activity = res.Mas_Activity_Lists || [];

      // 👉 map activity ตอน edit
      if (this.model.Fk_Activity_Id) {
        this.model.selectedActivity =
          this.Mas_Activity.find(x => x.Activity_Id == this.model.Fk_Activity_Id);
      }
    });
  }

  onActivityChange(activity: any) {
    this.model.Fk_Activity_Id = activity?.Activity_Id;
  }

  onBudgetChange(budget: any) {
    this.model.Fk_Budget_Type = budget?.Budget_Type_Id;
  }
  onNatureChange(value: number) {
    this.model.Used_BG = value;
  }
  onNatureChange_project(value: number) {
    this.model.Used_BG = value;
  }



  onProject_Type_IdChange(value: number) {
    this.Project_Type_Id = value;


    this.model.Project_Type_Id = value;
  }
  onOperationChange(e: any, type: number) {

    if (type === 1) {
      this.model.Operation1 = e.target.checked ? 1 : 0;
    }

    if (type === 2) {
      this.model.Operation2 = e.target.checked ? 2 : 0;
    }
  }

  isChecked(value: number): boolean {
    if (!this.model.Operation) return false;
    return this.model.Operation.split(',').includes(value.toString());
  }
  operations: any
  onChange(e: any) {
    const val = Number(e.target.value);

    if (e.target.checked) {
      this.operations.push(val);
    } else {
      this.operations = this.operations.filter((x: any) => x !== val);
    }
  }
}
