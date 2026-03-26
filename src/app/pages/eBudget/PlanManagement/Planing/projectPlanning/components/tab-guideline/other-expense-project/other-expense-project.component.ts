import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-other-expense-project',
  templateUrl: './other-expense-project.component.html',
  styleUrl: './other-expense-project.component.scss'
})
export class OtherExpenseProjectComponent {
  @Input() modal: any;

  closeModal() {
    this.modal.dismiss();
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
    basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
    this.modal.dismiss();
  }
}
