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
  selectedDepartment : any = ''
  ngOnInit(): void {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
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
  Onchange_type() {
    this.model.projectType = this.projectType
  }
}
