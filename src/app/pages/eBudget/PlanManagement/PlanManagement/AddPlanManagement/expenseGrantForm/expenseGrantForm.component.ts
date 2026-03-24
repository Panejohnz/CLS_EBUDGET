import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-grant-form',
  templateUrl: './expenseGrantForm.component.html',
  styles: ``
})
export class ExpenseGrantFormComponent {
  // @Input() type: 'general' | 'specific' = 'general';

  items = [this.createItem()];
  grandTotal = 0;

  createItem() {
    return {
      name: '',
      price: 0,
      qty: 0,
      unit: 'คน',
      month: 0,
      total: 0
    };
  }

  addItem() {
    this.items.push(this.createItem());
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
    this.grandTotal = this.items.reduce((s, x) => s + (x.total || 0), 0);
  }

  getTotalQty() {
    return this.items.reduce((s, x) => s + (x.qty || 0), 0);
  }

  getTotalMonth() {
    return this.items.reduce((s, x) => s + (x.month || 0), 0);
  }

  save() {
    console.log({
      // type: this.type,
      items: this.items
    });
  }
}
