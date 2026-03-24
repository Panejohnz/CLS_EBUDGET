import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-system-maintenance-cost',
  templateUrl: './expenseSystemMaintenanceCost.component.html',
  styles: ``
})
export class ExpenseSystemMaintenanceCostComponent {
  items = [
    {
      name: '',
      price: 0,
      qty: 0,
      unit: 'คน',
      month: 0,
      total: 0,
      file: null,
      fileName: ''
    }
  ];

  totalQty = 0;
  totalMonth = 0;
  grandTotal = 0;

  addItem() {
    this.items.push({
      name: '',
      price: 0,
      qty: 0,
      unit: 'คน',
      month: 0,
      total: 0,
      file: null,
      fileName: ''
    });
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
    this.calculateAll();
  }

  calculate(i: number) {
    const item = this.items[i];
    item.total =
      (item.price || 0) *
      (item.qty || 0) *
      (item.month || 0);

    this.calculateAll();
  }

  calculateAll() {
    this.totalQty = this.items.reduce((sum, x) => sum + (x.qty || 0), 0);
    this.totalMonth = this.items.reduce((sum, x) => sum + (x.month || 0), 0);
    this.grandTotal = this.items.reduce((sum, x) => sum + (x.total || 0), 0);
  }
  uploadFile(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;

    this.items[index].file = file;
    this.items[index].fileName = file.name;
  }
}
