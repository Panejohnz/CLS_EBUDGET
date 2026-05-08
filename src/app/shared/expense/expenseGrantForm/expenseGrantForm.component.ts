import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-grant-form',
  templateUrl: './expenseGrantForm.component.html',
  styles: ``
})
export class ExpenseGrantFormComponent {

  @Input() modal: any;
  @Input() expenseItem: any;

  constructor() { }

  closeModal() {
    this.modal.dismiss();
  }

  items: any[] = [
    this.createItem()
  ];

  grandTotal = 0;

  // =========================
  // CREATE ITEM
  // =========================

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

  // =========================
  // ADD / REMOVE
  // =========================

  addItem() {

    this.items.push(
      this.createItem()
    );

  }

  removeItem(index: number) {

    this.items.splice(index, 1);

    this.calculateAll();

  }

  // =========================
  // CALCULATE
  // =========================

  calculate(index: number) {

    const item = this.items[index];

    item.total =
      (item.price || 0) *
      (item.qty || 0) *
      (item.month || 0);

    this.calculateAll();

  }

  calculateAll() {

    this.grandTotal =
      this.items.reduce((sum: number, item: any) => {

        return sum + (item.total || 0);

      }, 0);

  }

  // =========================
  // SUMMARY
  // =========================

  getTotalQty() {

    return this.items.reduce((sum: number, item: any) => {

      return sum + (item.qty || 0);

    }, 0);

  }

  getTotalMonth() {

    return this.items.reduce((sum: number, item: any) => {

      return sum + (item.month || 0);

    }, 0);

  }

  // =========================
  // SAVE
  // =========================

  async save() {

    const userConfirmed = await confirmAlert(
      'info',
      'ต้องการบันทึกข้อมูล ?',
      ''
    );

    if (userConfirmed) {

      basicAlert(
        'success',
        'บันทึกข้อมูลแล้ว',
        ''
      );

      this.modal.dismiss();

    }

  }

}