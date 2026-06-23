import { Component, Input } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { ProjectPlanService } from 'src/app/core/services/ProjectPlan.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

export interface ProjectPlan {
  projectType: string;
}

@Component({
  selector: 'app-tab-general',
  templateUrl: './tab-general.component.html',
  styleUrl: './tab-general.component.scss'
})
export class TabGeneralComponent {

  constructor(
    private ebudgetService: EbudgetService,
    private ProjectPlanService: ProjectPlanService,
    private budgetYearService: BudgetYearService
  ) { }

  @Input() model: any;

  projectType: any = '';
  Project_Type_Id: Number = 0;

  Mas_Department_Lists: any[] = [];
  Mas_Plan_Lists: any[] = [];
  Mas_Expense_Lists: any[] = [];
  Mas_Product: any[] = [];
  Mas_Activity: any[] = [];
  Mas_Budget_Types: any[] = [];

  Used_BG: any;
  operations: any[] = [];

  get data() {

    return this.model?.Project_Plan || this.model
  }

  get showPlanningSelectors() {

    const budgetType =
      this.model?.Budget_Type ??
      this.data?.Budget_Type;

    return Number(budgetType) !== 1;
  }

  compareById(a: any, b: any): boolean {

    if (!a || !b) return a === b;

    const ids = [
      'Department_Id',
      'Expense_Id',
      'Plan_Id',
      'Product_Id',
      'Activity_Id',
      'Budget_Type_Id'
    ];

    return ids.some(key =>
      a?.[key] != null &&
      b?.[key] != null &&
      Number(a[key]) === Number(b[key])
    );
  }
  currentYear: any
  ngOnInit(): void {

    this.budgetYearService.yearChanged$
      .subscribe(async year => {

        if (year) {

          if (year < 2500) {

            year = year + 543;

          }

          this.currentYear = year;


        }

      });


    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
      BgYear: this.currentYear
    };

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Department_Lists = res.Mas_Department_Lists || [];
      this.Mas_Plan_Lists = res.Mas_Plan_Lists || [];
      this.Mas_Expense_Lists = res.Mas_Expense_Lists || [];

      const projectId =
        this.data?.Project_Id || this.data?.Project_Plan?.Project_Id

      if (projectId) {
        this.mapInitialData();
      }
    });
  }

  ngOnChanges() {

    this.budgetYearService.yearChanged$
      .subscribe(async year => {

        if (year) {

          if (year < 2500) {

            year = year + 543;

          }

          this.currentYear = year;


        }

      });

    if (this.model) {
      this.setDefault();
    }
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
      BgYear: this.currentYear
    };

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Department_Lists = res.Mas_Department_Lists || [];
      this.Mas_Plan_Lists = res.Mas_Plan_Lists || [];
      this.Mas_Expense_Lists = res.Mas_Expense_Lists || [];

      const projectId =
        this.data?.Project_Id || this.data?.Project_Plan?.Project_Id

      if (projectId) {
        this.mapInitialData();

      }
    });
  }

  setDefault() {

    if (!this.model) {
      this.model = {};
    }

    if (this.data.Used_BG == null) {
      this.data.Used_BG = 1;
    }

    if (this.data.Project_Type_Id == null) {
      this.data.Project_Type_Id = 1;
    }

    if (this.data.Operation1 == null) {
      this.data.Operation1 = 1;
    }

    if (this.data.Operation2 == null) {
      this.data.Operation2 = 0;
    }
  }

  mapInitialData() {

    const find = (list: any[], key: string, value: any) =>
      list.find(x => Number(x[key]) === Number(value));

    const valueOf = (...values: any[]) =>
      values.find(value => value !== undefined && value !== null && value !== '');

    const idValue = (key: string, ...values: any[]) => {
      const value = valueOf(...values);
      return typeof value === 'object'
        ? value?.[key]
        : value;
    };

    this.model.selectedDepartment =
      find(
        this.Mas_Department_Lists,
        'Department_Id',
        idValue(
          'Department_Id',
          this.data.Department_Id,
          this.model.selectedDepartment
        )
      );

    this.model.projectType =
      find(
        this.Mas_Expense_Lists,
        'Expense_Id',
        idValue(
          'Expense_Id',
          this.data.Fk_Expense_List,
          this.data.Fk_Expense_Type,
          this.data.Fk_Expense_Id,
          this.model.projectType
        )
      );

    this.model.selectedPlan =
      find(
        this.Mas_Plan_Lists,
        'Plan_Id',
        idValue(
          'Plan_Id',
          this.data.Fk_Plan_Id,
          this.model.selectedPlan
        )
      );

    if (this.model.projectType) {
      this.Onchange_type();
    }

    if (this.model.selectedPlan) {
      this.Onchange_type_Plan();
    }
  }

  Onchange_type_Department() {

    this.data.Department_Id =
      this.model.selectedDepartment?.Department_Id;

    this.ProjectPlanService.setProjectPlan({
      Department: this.model.selectedDepartment
    });
  }

  Onchange_type() {

    if (!this.model.projectType) return;

    if (typeof this.model.projectType !== 'object') {
      this.model.projectType =
        this.Mas_Expense_Lists.find(
          x => Number(x.Expense_Id) === Number(this.model.projectType)
        );
    }

    if (!this.model.projectType) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type",
      Mas_Expense_List: {
        Expense_Id: this.model.projectType.Expense_Id
      }
    };

    this.data.Fk_Expense_List =
      this.model.projectType.Expense_Id;

    this.data.Fk_Expense_Type =
      this.model.projectType.Expense_Id;

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Budget_Types =
        res.Mas_Budget_Types || [];

      const budgetTypeId =
        typeof this.model.selectedBudget === 'object'
          ? this.model.selectedBudget?.Budget_Type_Id
          : (this.data.Fk_Budget_Type || this.model.selectedBudget);

      if (budgetTypeId) {

        this.model.selectedBudget =
          this.Mas_Budget_Types.find(
            x => Number(x.Budget_Type_Id) === Number(budgetTypeId)
          );
      }

      if (this.Mas_Budget_Types.length === 1) {

        this.model.selectedBudget =
          this.Mas_Budget_Types[0];

        this.data.Fk_Budget_Type =
          this.Mas_Budget_Types[0].Budget_Type_Id;
      }
    });
  }

  Onchange_type_Plan() {

    if (!this.model.selectedPlan) return;

    if (typeof this.model.selectedPlan !== 'object') {
      this.model.selectedPlan =
        this.Mas_Plan_Lists.find(
          x => Number(x.Plan_Id) === Number(this.model.selectedPlan)
        );
    }

    if (!this.model.selectedPlan) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Product",
      Mas_Plan: {
        Plan_Id: this.model.selectedPlan.Plan_Id
      }
    };

    this.data.Fk_Plan_Id =
      this.model.selectedPlan.Plan_Id;

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Product =
        res.Mas_Product_Lists || [];

      const productId =
        typeof this.model.selectedProduct === 'object'
          ? this.model.selectedProduct?.Product_Id
          : (this.data.Fk_Product_Id || this.model.selectedProduct);

      if (productId) {

        this.model.selectedProduct =
          this.Mas_Product.find(
            x => Number(x.Product_Id) === Number(productId)
          );
      }

      if (this.model.selectedProduct) {
        this.Onchange_type_Product();
      }
    });
  }

  Onchange_type_Product() {

    if (!this.model.selectedProduct) return;

    if (typeof this.model.selectedProduct !== 'object') {
      this.model.selectedProduct =
        this.Mas_Product.find(
          x => Number(x.Product_Id) === Number(this.model.selectedProduct)
        );
    }

    if (!this.model.selectedProduct) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Activity",
      Mas_Product: {
        Product_Id: this.model.selectedProduct.Product_Id
      }
    };

    this.data.Fk_Product_Id =
      this.model.selectedProduct.Product_Id;

    this.ebudgetService.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Activity =
        res.Mas_Activity_Lists || [];

      const activityId =
        typeof this.model.selectedActivity === 'object'
          ? this.model.selectedActivity?.Activity_Id
          : (this.data.Fk_Activity_Id || this.model.selectedActivity);

      if (activityId) {

        this.model.selectedActivity =
          this.Mas_Activity.find(
            x => Number(x.Activity_Id) === Number(activityId)
          );
      }
    });
  }

  onActivityChange(activity: any) {

    if (activity && typeof activity !== 'object') {
      activity =
        this.Mas_Activity.find(
          x => Number(x.Activity_Id) === Number(activity)
        );
    }

    this.model.selectedActivity = activity;

    this.data.Fk_Activity_Id =
      activity?.Activity_Id;
  }

  onBudgetChange(budget: any) {

    if (budget && typeof budget !== 'object') {
      budget =
        this.Mas_Budget_Types.find(
          x => Number(x.Budget_Type_Id) === Number(budget)
        );
    }

    this.model.selectedBudget = budget;

    this.data.Fk_Budget_Type =
      budget?.Budget_Type_Id;
  }

  onBudgetChangebox(value?: number) {

    if (value != null) {
      this.data.Used_BG = Number(value);
    }

    const isNoBudget =
      Number(this.data.Used_BG) === 2;

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

        if (isNoBudget) {

          sub.quarters?.forEach((q: any) => {

            q.months?.forEach((m: any) => {

              m.budget = null;
              m.selected = false;
            });
          });
        }
      });
    });
  }

  onNatureChange(value: number) {
    this.data.Used_BG = value;
  }

  onNatureChange_project(value: number) {
    this.data.Used_BG = value;
  }

  onProject_Type_IdChange(value: number) {

    this.Project_Type_Id = value;

    this.data.Project_Type_Id = value;
  }

  onOperationChange(e: any, type: number) {

    if (type === 1) {
      this.data.Operation1 =
        e.target.checked ? 1 : 0;
    }

    if (type === 2) {
      this.data.Operation2 =
        e.target.checked ? 1 : 0;
    }
  }

  isChecked(value: number): boolean {

    if (!this.data.Operation) return false;

    return this.data.Operation
      .split(',')
      .includes(value.toString());
  }

  onChange(e: any) {

    const val = Number(e.target.value);

    if (e.target.checked) {
      this.operations.push(val);
    } else {
      this.operations =
        this.operations.filter(
          (x: any) => x !== val
        );
    }
  }
}
