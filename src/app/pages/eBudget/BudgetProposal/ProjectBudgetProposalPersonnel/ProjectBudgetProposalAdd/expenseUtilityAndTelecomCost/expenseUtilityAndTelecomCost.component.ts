import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-expense-utility-and-telecom-cost',
  templateUrl: './expenseUtilityAndTelecomCost.component.html',
  styles: ``
})
export class ExpenseUtilityAndTelecomCostComponent {
  items = [
    { name: '', monthly: 0, yearly: 0 }
  ];

  totalMonthly = 0;
  grandTotal = 0;

  addItem() {
    this.items.push({ name: '', monthly: 0, yearly: 0 });
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
    this.calculateAll();
  }

  calculate(i: number) {
    const item = this.items[i];
    item.yearly = (item.monthly || 0) * 12;
    this.calculateAll();
  }

  calculateAll() {
    this.totalMonthly = this.items.reduce((sum, x) => sum + (x.monthly || 0), 0);
    this.grandTotal = this.items.reduce((sum, x) => sum + (x.yearly || 0), 0);
  }

  save() {
    console.log(this.items);
  }

  closeModal() { }
}
