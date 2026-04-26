import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-other-expense-project',
  templateUrl: './other-expense-project.component.html',
  styleUrl: './other-expense-project.component.scss'
})
export class OtherExpenseProjectComponent {
  @Input() modal: any
  @Input() project_planing: any
  @Input() activity: any;
  closeModal() {
    this.modal.dismiss();
  }
  ngOnChanges() {


    if (this.activity?.otherExpenses?.length) {
      this.meetingCosts = this.activity.otherExpenses.map((x: any) => ({
        id: x.Project_Item_Id || x.id || 0,

        name: x.Expense_Name,
        times: x.Times,
        people: x.People,
        rate: x.Rate,

        People_Type_A: x.People_Type_A || 0,
        People_Type_B: x.People_Type_B || 0,
        People_Type_C: x.People_Type_C || 0,

        Unit_Name: x.Unit_Name || ''
      }));
    } else {
      this.meetingCosts = [this.getDefaultItem()];
    }

  }
  getDefaultItem() {
    return {
      id: 0,
      name: '',
      times: 0,
      people: 0,
      rate: 0,

      People_Type_A: 0,
      People_Type_B: 0,
      People_Type_C: 0,

      Unit_Name: ''
    };
  }
  meetingCosts = [
    {
      id: 0,
      name: '',
      times: 1,
      people: 1,
      rate: 0,

      People_Type_A: 0,
      People_Type_B: 0,
      People_Type_C: 0,

      Unit_Name: ''
    }
  ];
  getTotal() {
    return this.meetingCosts.reduce((sum, item) => {
      const total = (item.times || 0) * (item.people || 0) * (item.rate || 0);
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
