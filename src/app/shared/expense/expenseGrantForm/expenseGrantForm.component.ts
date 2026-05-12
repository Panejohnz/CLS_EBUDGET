import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-grant-form',
  templateUrl: './expenseGrantForm.component.html',
  styles: ``
})
export class ExpenseGrantFormComponent {

  @Input() modal: any;
  @Input() expenseItem: any;
  @Input() model: any;

  constructor() { }

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

  }

  closeModal() {
    this.modal.dismiss();
  }

  items: any[] = [];

  grandTotal = 0;

  // =========================
  // CREATE ITEM
  // =========================

  createItem() {

    return {

      requestItemId: 0,

      name: '',

      price: 0,

      qty: 0,

      unit: 'คน',

      month: 0,

      total: 0

    };

  }

  // =========================
  // BIND DATA
  // =========================

  bindData() {

    const rows =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId
      );

    if (rows.length == 0) {

      this.items = [
        this.createItem()
      ];

      return;

    }

    this.items = rows.map((x: any) => {

      return {

        requestItemId:
          x.Request_Item_Id || 0,

        name:
          x.Expense_Detail || '',

        price:
          Number(x.Rate || 0),

        qty:
          Number(x.Quantity || 0),

        unit:
          x.Unit_Name || 'คน',

        month:
          Number(x.Month || 0),

        total:
          Number(x.Total || 0)

      };

    });

    this.calculateAll();

  }

  // =========================
  // ADD / REMOVE
  // =========================

  addItem() {

    this.items.push(
      this.createItem()
    );

    this.updateDetailItems();

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

      (Number(item.price) || 0) *

      (Number(item.qty) || 0) *

      (Number(item.month) || 0);

    this.calculateAll();

  }

  calculateAll() {

    this.grandTotal =
      this.items.reduce((sum: number, item: any) => {

        return sum + (Number(item.total) || 0);

      }, 0);

    this.updateDetailItems();

  }

  // =========================
  // SUMMARY
  // =========================

  getTotalQty() {

    return this.items.reduce((sum: number, item: any) => {

      return sum + (Number(item.qty) || 0);

    }, 0);

  }

  getTotalMonth() {

    return this.items.reduce((sum: number, item: any) => {

      return sum + (Number(item.month) || 0);

    }, 0);

  }

  // =========================
  // UPDATE MODEL
  // =========================

  updateDetailItems() {

    if (!this.model) return;

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name || '',

        Quantity:
          item.qty || 0,

        Unit_Name:
          item.unit || '',

        Month:
          item.month || 0,

        Rate:
          item.price || 0,

        Total:
          item.total || 0

      });

    });

  }

  // =========================
  // SAVE
  // =========================

  async save() {

    this.updateDetailItems();

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