import { Component, Input } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
export interface ProjectPlan {
  projectType: string;
}
@Component({
  selector: 'app-tab-general',

  templateUrl: './tab-general.component.html',
  styleUrl: './tab-general.component.scss'
})
export class TabGeneralComponent {
  constructor(private ebudgetService: EbudgetService) {
  }
  @Input() project_planing: any
  @Input() model: any
  projectType: any = ''
  projectNature: string = '';
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
    this.model.Department_Id = this.selectedDepartment
  }
  Onchange_type() {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type",
      Mas_Expense_List: {
        Expense_Id: this.model.projectType
      }

    };
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
        Plan_Id: this.model.selectedPlan
      }

    };
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
        Product_Id: this.model.selectedProduct
      }

    };
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

}
