import { Component, Input } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-other-expense-project',
  templateUrl: './other-expense-project.component.html',
  styleUrl: './other-expense-project.component.scss'
})
export class OtherExpenseProjectComponent {
  @Input() modal: any
  @Input() project_planing: any
  @Input() activity: any;
  @Input() type: any;
  @Input() activityId: any;
  constructor(public serviceebud: EbudgetService) {

  }
  closeModal() {
    this.modal.dismiss();
  }
  ngOnChanges() {

    // 🔥 1. ถ้ามี id → ไป DB
    if (this.activityId) {
      this.loadData();
      return;
    }

    // 🔥 2. ไม่มี id → ใช้ local (activity)
    if (this.activity?.otherExpenses?.length) {
      this.meetingCosts = this.activity.otherExpenses.map((x: any) => ({
        id: x.Project_Item_Id || x.id || 0,

        name: x.Expense_Name,
        times: x.Times,
        people: x.People,
        rate: x.Rate,

        People_Type_A: x.People_Type_A,
        People_Type_B: x.People_Type_B,
        People_Type_C: x.People_Type_C,

        Unit_Name: x.Unit_Name
      }));
    } else {
      this.meetingCosts = [this.getDefaultItem()];
    }

    this.applyTypeDefault(); // 🔥 แยก logic ไปอีกฟังก์ชัน
  }
  applyTypeDefault() {
    if (!this.meetingCosts) return;

    this.meetingCosts.forEach((item: any) => {
      if (this.type === 'investment') {
        item.isStandard = true;
        item.isNonStandard = false;
      } else {
        item.isStandard = false;
        item.isNonStandard = true;
      }
    });
  }
  loadData() {
    const payload = {
      FUNC_CODE: 'FUNC-Get_OTHER_EXPENSE_BY_ID',
      Project_Item_Id: this.activityId,
    };

    this.serviceebud.GatewayGetData(payload).subscribe((res: any) => {

      this.meetingCosts = (res || []).map((x: any) => ({
        id: x.Project_Item_Id,

        name: x.Expense_Name,
        times: x.Times,
        people: x.People,
        rate: x.Rate,

        People_Type_A: x.People_Type_A,
        People_Type_B: x.People_Type_B,
        People_Type_C: x.People_Type_C,

        Unit_Name: x.Unit_Name
      }));

      if (this.meetingCosts.length === 0) {
        this.meetingCosts = [this.getDefaultItem()];
      }

      this.applyTypeDefault(); // 🔥 สำคัญ
    });
  }

  getDefaultItem() {
    return {
      id: 0,
      name: '',
      times: null,
      people: null,
      rate: null,

      People_Type_A: null,
      People_Type_B: null,
      People_Type_C: null,

      Unit_Name: '',

      // 🔥 เพิ่มตรงนี้
      isStandard: false,
      isNonStandard: false
    };
  }
  meetingCosts = [
    {
      id: 0,
      name: '',
      times: null,
      people: null,
      rate: null,

      People_Type_A: null,
      People_Type_B: null,
      People_Type_C: null,

      Unit_Name: '',
      isStandard: false,
      isNonStandard: false
    }
  ];
  calcItemTotal(item: any): number | null {
    const values = [
      item.times,
      item.people,
      item.rate,
      item.People_Type_A,
      item.People_Type_B,
      item.People_Type_C
    ].filter(v => v != null && v !== '');

    if (values.length === 0) return null;

    return values.reduce((acc, val) => acc * val, 1);
  }
  getTotal() {
    return this.meetingCosts.reduce((sum, item) => {
      const total = (item.times || 0) * (item.people || 0) * (item.rate || 0) * (item.People_Type_A || 0) * (item.People_Type_B || 0) * (item.People_Type_C || 0);
      return sum + total;
    }, 0);
  }
  addCost() {
    this.meetingCosts.push(this.getDefaultItem());
  }

  removeCost(i: number) {

    this.meetingCosts.splice(i, 1)

  }
  save() {

    if (!this.activity.otherExpenses) {
      this.activity.otherExpenses = [];
    }

    this.activity.otherExpenses = this.meetingCosts.map(x => ({
      Project_Item_Id: x.id || 0,

      Expense_Name: x.name,
      Times: x.times,
      People: x.people,
      Rate: x.rate,

      People_Type_A: x.People_Type_A,
      People_Type_B: x.People_Type_B,
      People_Type_C: x.People_Type_C,

      Unit_Name: x.Unit_Name
    }));
    const total = this.getTotal();
    this.activity.multiplierTotal = total;
    basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
    this.modal.dismiss();
  }
}
