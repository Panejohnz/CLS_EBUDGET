import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-construction-form',
  templateUrl: './expenseConstructionForm.component.html',
  styles: ``
})
export class ExpenseConstructionFormComponent {

  @Input() expenseItem: any;
  @Input() model: any;

  items: any[] = [
    this.createItem()
  ];

  grandTotal = 0;

  isOld = false;
  isNew = false;

  bindingYear = 0;

  yearly: any[] = [];

  spec = '';

  files: any = {};

  fileConfig = [
    { key: 'plan', label: 'แบบแปลน', required: true },
    { key: 'ownership', label: 'เอกสารกรรมสิทธิ์', required: true },
    { key: 'installment', label: 'งวดงาน/งวดเงิน', required: true },
    { key: 'por4', label: 'ปร.4', required: true },
    { key: 'por5', label: 'ปร.5', required: true },
    { key: 'boq', label: 'BOQ', required: true },
    { key: 'other', label: 'อื่นๆ', required: false }
  ];

  ngOnInit() {

    this.bindData();

  }

  // =========================
  // CREATE ITEM
  // =========================

  createItem() {

    return {

      name: '',

      year: 0,

      price: 0,

      qty: 0,

      total: 0,

      newQty: 0,

      updateQty: 0

    };

  }

  // =========================
  // ITEM
  // =========================

  addItem() {

    this.items.push(
      this.createItem()
    );

    this.updateDetailItems();

  }
  async removeItem(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.items.splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculate(i: number) {

    const item = this.items[i];

    item.total =
      (item.price || 0) *
      (item.qty || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =
      this.items.reduce((sum: number, item: any) => {

        return sum + (item.total || 0);

      }, 0);

  }

  // =========================
  // YEAR
  // =========================

  onYearChange() {

    const oldData = [...this.yearly];

    this.yearly = Array.from(
      { length: Number(this.bindingYear) || 0 },
      (_, i) => ({

        amount:
          oldData[i]?.amount || 0,

        milestone:
          oldData[i]?.milestone || ''

      })
    );

    this.updateDetailItems();

  }

  // =========================
  // FILE
  // =========================

  uploadFile(event: any, key: string) {

    this.files[key] =
      event.target.files[0];

  }

  // =========================
  // SAVE MODEL
  // =========================

  updateDetailItems() {

    if (!this.model) {
      return;
    }

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    // ลบของเดิม
    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId
      );

    // =========================
    // FLAG
    // =========================

    this.model.Budget_Request_Detail_Item.push({

      Request_Item_Id: 0,

      Fk_Expense_Id:
        this.model.selectedExpenseTypeId,

      Expense_Detail:
        'CONSTRUCTION_FLAG',

      People_Type_A:
        this.isOld ? 1 : 0,

      People_Type_B:
        this.isNew ? 1 : 0,

      Quantity:
        Number(this.bindingYear) || 0,

      Reson:
        this.spec || '',

      Total: 0

    });

    // =========================
    // ITEM
    // =========================

    this.items.forEach((item: any, i: number) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id: 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name || '',

        Day:
          Number(item.year) || 0,

        Price:
          Number(item.price) || 0,

        Quantity:
          Number(item.qty) || 0,

        Total:
          Number(item.total) || 0,

        People:
          Number(item.newQty) || 0,

        Sum_People:
          Number(item.updateQty) || 0,

        Sequence:
          i + 1

      });

    });

    // =========================
    // YEARLY
    // =========================

    this.yearly.forEach((y: any, i: number) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id: 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          'YEAR_' + (i + 1),

        Price:
          Number(y.amount) || 0,

        Reson:
          y.milestone || '',

        Total:
          Number(y.amount) || 0,

        Sequence:
          i + 1

      });

    });
    this.model.Total = this.grandTotal;
  }

  // =========================
  // BIND
  // =========================

  bindData() {

    if (
      !this.model?.Budget_Request_Detail_Item
    ) {
      return;
    }

    const rows =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId
      );

    if (!rows.length) {
      return;
    }

    // =========================
    // FLAG
    // =========================

    const flagRow =
      rows.find(
        (x: any) =>

          x.Expense_Detail ==
          'CONSTRUCTION_FLAG'
      );

    if (flagRow) {

      this.isOld =
        flagRow.People_Type_A == 1;

      this.isNew =
        flagRow.People_Type_B == 1;

      this.bindingYear =
        Number(flagRow.Quantity || 0);

      this.spec =
        flagRow.Reson || '';

    }

    // =========================
    // ITEM
    // =========================

    const itemRows =
      rows.filter(
        (x: any) =>

          !x.Expense_Detail?.includes('YEAR_') &&
          x.Expense_Detail != 'CONSTRUCTION_FLAG'
      );

    if (itemRows.length) {

      this.items =
        itemRows.map((row: any) => ({

          name:
            row.Expense_Detail || '',

          year:
            Number(row.Day || 0),

          price:
            Number(row.Price || 0),

          qty:
            Number(row.Quantity || 0),

          total:
            Number(row.Total || 0),

          newQty:
            Number(row.People || 0),

          updateQty:
            Number(row.Sum_People || 0)

        }));

    }

    // =========================
    // YEARLY
    // =========================

    const yearlyRows =
      rows
        .filter(
          (x: any) =>

            x.Expense_Detail?.includes('YEAR_')
        )
        .sort((a: any, b: any) => {

          return a.Sequence - b.Sequence;

        });

    if (yearlyRows.length) {

      this.yearly =
        yearlyRows.map((x: any) => ({

          amount:
            Number(x.Price || 0),

          milestone:
            x.Reson || ''

        }));

    }
    this.model.Total = this.grandTotal;
    this.calculateAll();

  }

  // =========================
  // SAVE
  // =========================

  async save() {

    this.updateDetailItems();

    basicAlert(
      'success',
      'บันทึกข้อมูลแล้ว',
      ''
    );

  }

}