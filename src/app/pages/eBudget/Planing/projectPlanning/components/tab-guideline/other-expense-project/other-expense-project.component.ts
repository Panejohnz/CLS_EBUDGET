import { Component } from '@angular/core';

@Component({
  selector: 'app-other-expense-project',
  templateUrl: './other-expense-project.component.html',
  styleUrl: './other-expense-project.component.scss'
})
export class OtherExpenseProjectComponent {
  meetingCosts: any[] = [
    {
      name: 'ค่าเบื้ยเลี้ยง',
      times: 1,
      people: 1,
      rate: 0
    }
  ]

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
}
