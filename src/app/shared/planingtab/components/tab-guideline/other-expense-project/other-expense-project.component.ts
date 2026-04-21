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
  ngOnInit() {
    if (this.activity?.otherExpenses?.length) {
      this.meetingCosts = this.activity.otherExpenses.map((x: any) => ({ ...x }));
    }
  }
  meetingCosts: any[] = [
    {
      name: 'ค่าเบื้ยเลี้ยง',
      times: 1,
      people: 1,
      rate: 0
    }
  ]

  getTotal() {
    return this.meetingCosts.reduce((sum, item) => {
      const total = (item.times || 0) * (item.people || 0) * (item.rate || 0);
      return sum + total;
    }, 0);
  }
  addCost() {

    this.meetingCosts.push({
      name: '',
      times: 1,
      people: 1,
      rate: 0
    })

  }

  removeCost(i: number) {

    this.meetingCosts.splice(i, 1)

  }
  save() {
    this.activity.otherExpenses = this.meetingCosts.map(x => ({
      id: x.id || 0,
      name: x.name,
      times: x.times,
      people: x.people,
      rate: x.rate
    }));
    basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
    this.modal.dismiss();
  }
}
