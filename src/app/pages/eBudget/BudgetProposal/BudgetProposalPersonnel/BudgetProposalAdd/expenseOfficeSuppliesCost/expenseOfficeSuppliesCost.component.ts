import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-office-supplies-cost',
  templateUrl: './expenseOfficeSuppliesCost.component.html',
  styles: ``
})
export class ExpenseOfficeSuppliesCostComponent {
  items = [
    {
      material: null,
      qty: 0,
      unit: '',
      price: 0,
      total: 0,
      remark: ''
    }
  ];

  materialOptions = [
    { id: 1, name: 'ปากกาลูกลื่น' },
    { id: 2, name: 'กระดาษ A4' },
    { id: 3, name: 'แฟ้มเอกสาร' }
  ];

  grandTotal = 0;

  addItem() {
    this.items.push({
      material: null,
      qty: 0,
      unit: '',
      price: 0,
      total: 0,
      remark: ''
    });
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
    this.calculateAll();
  }

  calculate(i: number) {
    const item = this.items[i];
    item.total = (item.qty || 0) * (item.price || 0);
    this.calculateAll();
  }

  calculateAll() {
    this.grandTotal = this.items.reduce((sum, x) => sum + (x.total || 0), 0);
  }


}
