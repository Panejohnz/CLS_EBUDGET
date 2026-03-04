import { Component } from '@angular/core';

@Component({
  selector: 'app-investment-budget',
  templateUrl: './investment-budget.component.html',
  styleUrl: './investment-budget.component.scss'
})
export class InvestmentBudgetComponent {
  totalBudget: any
  items: any[] = [
    {
      name: '',
      standard: false,
      nonStandard: false,
      price: 0,
      qty: 0
    }
  ]

  addItem() {

    this.items.push({
      name: '',
      standard: false,
      nonStandard: false,
      price: 0,
      qty: 0,
      requestQty: 0,
      reason: '',
      spec: '',
      files: []
    })

  }
  onFileChange(event: any, index: number) {

    const files = event.target.files

    this.items[index].files = files

  }
  removeItem(i: number) {

    this.items.splice(i, 1)

  }
}
