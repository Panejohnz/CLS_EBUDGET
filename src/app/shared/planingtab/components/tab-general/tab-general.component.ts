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
  @Input() project_planing: any
  @Input() model: any
  projectType: any = ''
  projectNature: Number = 0;
  totalYears: number | null = null;
  currentYear: number | null = null;
  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Budget_Types: any[] = []
  selectedDepartment: any = ''
  selectedPlan: any = ''
  selectedProduct: any = ''
  selectedActivity: any = ''
  selectedBudget: any = ''
  projectNatureType: any
  ngOnInit(): void {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
      BgYear: "2569"
    };
    this.ebudgetService.GatewayGetData(model).subscribe((response: any) => {

      if (response.RESULT == null) {
        this.Mas_Department_Lists = Array.isArray(response.Mas_Department_Lists)
          ? response.Mas_Department_Lists
          : [];

        this.Mas_Plan_Lists = Array.isArray(response.Mas_Plan_Lists)
          ? response.Mas_Plan_Lists
          : [];

        this.Mas_Expense_Lists = Array.isArray(response.Mas_Expense_Lists)
          ? response.Mas_Expense_Lists
          : [];
      } else {
        basicAlert('warning', 'ผิดพลาด', response.RESULT);
      }

    });
  }
  Onchange_type_Department() {
    this.ProjectPlanService.setProjectPlan({
      Department: this.model.selectedDepartment
    });
  }
  Onchange_type() {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type",
      Mas_Expense_List: {
        Expense_Id: this.model.projectType.Expense_Id
      }

    };
    this.ProjectPlanService.setProjectPlan({
      Expense: this.model.projectType
    });
    this.ebudgetService.GatewayGetData(model).subscribe((response: any) => {

      if (response.RESULT == null) {
        this.Mas_Budget_Types = Array.isArray(response.Mas_Budget_Types)
          ? response.Mas_Budget_Types
          : [];
        this.model.Fk_Expense_List = this.projectType;

        // this.model.Project_Plan = this.model.Project_Plan || {};
        // this.model.Project_Plan.Department_Id = this.projectType;
      } else {
        basicAlert('warning', 'ผิดพลาด', response.RESULT);
      }
    });
  }
  Onchange_type_Plan() {

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Product",
      Mas_Plan: {
        Plan_Id: this.model.selectedPlan.Plan_Id
      }
    };
    this.ProjectPlanService.setProjectPlan({
      Plan: this.model.selectedPlan
    });
    this.ebudgetService.GatewayGetData(model).subscribe((response: any) => {

      if (response.RESULT == null) {
        this.Mas_Product = Array.isArray(response.Mas_Product_Lists)
          ? response.Mas_Product_Lists
          : [];

      } else {
        basicAlert('warning', 'ผิดพลาด', response.RESULT);
      }
    });
  }
  Onchange_type_Product() {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Activity",
      Mas_Product: {
        Product_Id: this.model.selectedProduct.Product_Id
      }

    };
    this.ProjectPlanService.setProjectPlan({
      Product: this.model.selectedProduct
    });
    this.ebudgetService.GatewayGetData(model).subscribe((response: any) => {

      if (response.RESULT == null) {
        this.Mas_Activity = Array.isArray(response.Mas_Activity_Lists)
          ? response.Mas_Activity_Lists
          : [];

      } else {
        basicAlert('warning', 'ผิดพลาด', response.RESULT);
      }
    });
  }
  onActivityChange(activity: any) {
    this.ProjectPlanService.setProjectPlan({
      Activity: activity
    });
  }

  onBudgetChange(budget: any) {
    this.ProjectPlanService.setProjectPlan({
      Budget: budget
    });
  }
  onNatureChange(value: number) {
    this.model.projectNatureType = value;
  }
  onNatureChange_project(value: number) {
    this.model.projectNatureType = value;
  }



  onProjectNatureChange(value: number) {
    this.projectNature = value;


    this.model.projectNature = value;
  }
  onOperationChange(e: any, type: number) {

    if (type === 1) {
      this.model.Operation1 = e.target.checked ? 1 : 0;
    }

    if (type === 2) {
      this.model.Operation2 = e.target.checked ? 2 : 0;
    }

  }

  // ใช้ตอน render กลับ
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
