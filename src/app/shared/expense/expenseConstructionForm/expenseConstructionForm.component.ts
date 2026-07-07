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
  yearlyTotal = 0;

  isOld = false;
  isNew = false;

  bindingYear = 0;

  yearly: any[] = [];

  spec = '';

  files: any = {};

  attachmentConfig = [
    { typeId: 1, label: 'แบบแปลน', required: true },
    { typeId: 2, label: 'เอกสารกรรมสิทธิ์', required: true },
    { typeId: 3, label: 'งวดงาน/งวดเงิน', required: true },
    { typeId: 4, label: 'ปร.4', required: true },
    { typeId: 5, label: 'ปร.5', required: true },
    { typeId: 6, label: 'BOQ', required: true },
    { typeId: 7, label: 'อื่นๆ', required: false }
  ];

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

  private toNumber(value: any): number {
    return Number(value?.toString().replace(/,/g, '')) || 0;
  }

  // =========================
  // CREATE ITEM
  // =========================

  createItem() {

    return {

      name: '',

      bindingType: '',

      year: '',

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
      this.toNumber(item.price) *
      this.toNumber(item.qty);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =
      this.items.reduce((sum: number, item: any) => {

        return sum + this.toNumber(item.total);

      }, 0);

    this.syncYearlyYears();
    this.yearlyTotal = this.getYearlyTotal();

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
          oldData[i]?.milestone || '',

        year:
          oldData[i]?.year || ''

      })
    );

    this.syncYearlyYears();
    this.updateDetailItems();

  }

  onBaseYearChange() {
    this.syncYearlyYears();
    this.updateDetailItems();
  }

  onBindingTypeChange(item: any, value: string) {
    item.bindingType = value;
    this.syncBindingFlags();
    this.updateDetailItems();
  }

  private syncBindingFlags() {
    this.isNew = this.items.some((item: any) => item.bindingType === 'new');
    this.isOld = this.items.some((item: any) => item.bindingType === 'old');
  }

  getBaseYear(): number {
    return this.items.reduce((year: number, item: any) => {
      return year || this.toNumber(item.year);
    }, 0);
  }

  syncYearlyYears() {
    const baseYear = this.getBaseYear();

    this.yearly.forEach((row: any, index: number) => {
      row.year = baseYear ? baseYear + index + 1 : '';
    });
  }

  onYearlyAmountChange(index: number) {
    this.yearlyTotal = this.getYearlyTotal();

    if (this.yearlyTotal > this.grandTotal) {
      const otherTotal = this.yearly.reduce((sum: number, row: any, i: number) => {
        return i === index ? sum : sum + this.toNumber(row.amount);
      }, 0);

      this.yearly[index].amount = Math.max(this.grandTotal - otherTotal, 0);
      this.yearlyTotal = this.getYearlyTotal();
      basicAlert('warning', 'ยอดกระจายเงินรวมต้องไม่เกินวงเงินรวม', '');
    }

    this.updateDetailItems();
  }

  getYearlyTotal(): number {
    return this.yearly.reduce((sum: number, row: any) => {
      return sum + this.toNumber(row.amount);
    }, 0);
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

    this.yearlyTotal = this.getYearlyTotal();

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

    this.syncBindingFlags();

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

        Month_Name:
          item.bindingType || '',

        Day:
          this.toNumber(item.year),

        Price:
          this.toNumber(item.price),

        Quantity:
          this.toNumber(item.qty),

        Total:
          this.toNumber(item.total),

        People:
          this.toNumber(item.newQty),

        Sum_People:
          this.toNumber(item.updateQty),

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
          this.toNumber(y.amount),

        Day:
          this.toNumber(y.year),

        Reson:
          y.milestone || '',

        Total:
          this.toNumber(y.amount),

        Sequence:
          i + 1

      });

    });
    this.yearlyTotal = this.getYearlyTotal();
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

          bindingType:
            row.Month_Name || (this.isNew ? 'new' : this.isOld ? 'old' : ''),

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
    this.syncBindingFlags();

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
            x.Reson || '',

          year:
            Number(x.Day || 0)

        }));

    }
    this.syncYearlyYears();
    this.yearlyTotal = this.getYearlyTotal();
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
