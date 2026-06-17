
import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-copier-rent',
  templateUrl: './expenseCopierRent.component.html',
  styles: ``
})
export class ExpenseCopierRentComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];

  grandTotal: number = 0;

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.loadExpenseRates();

  }

  closeModal() {

    this.model.dismiss();

  }

  loadExpenseRates() {
    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Rate",
      Fk_Expense_Id: this.model.selectedExpenseTypeId
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        const expenseRateList =
          response.List_Mas_Expense_Rate;

        this.Mas_Expense_Detial_Rate_List =
          Array.isArray(expenseRateList)
            ? expenseRateList
            : [];

        this.bindData();
        this.applyRatesToExistingRows();
      }, () => {
        this.bindData();
      });
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  private getRateRowText(row: any): string {
    return this.normalizeText([
      row?.Expense_Detail,
      row?.Expense_Name,
      row?.Expense_Short_Name,
      row?.Expense_Detial_Name,
      row?.Expense_Detial_Short_Name,
      row?.Rate_Name,
      row?.Type_Name,
      row?.Code
    ].filter(Boolean).join(' '));
  }

  private getRowRate(row: any): number {
    return Number(
      row?.Expense_Rate ??
      row?.Rate ??
      row?.Price ??
      row?.Total ??
      0
    ) || 0;
  }

  private getRateForType(type: any): number {
    if (!type || type === 'other') {
      return 0;
    }

    const typeText = this.normalizeText(type);
    const byName = this.Mas_Expense_Detial_Rate_List.find((row: any) => {
      const rateText = this.getRateRowText(row);

      return rateText.includes(typeText);
    });

    const fallbackIndex = type === '5000' ? 0 : 1;
    return this.getRowRate(byName ?? this.Mas_Expense_Detial_Rate_List[fallbackIndex]);
  }

  private applyRatesToExistingRows() {
    this.items.forEach((item: any, index: number) => {
      if (item.type === 'other' || Number(item.price) > 0) {
        return;
      }

      const rate = this.getRateForType(item.type);

      if (rate > 0) {
        item.price = rate;
        this.calculate(index);
      }
    });
  }

  bindData() {

    const rows =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId

      );

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.items = [
        this.newItem()
      ];

      this.calculateGrandTotal();

      return;

    }

    this.items = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        type:
          row.Expense_Detail || '',

        otherDetail:
          row.Other_Name || '',

        price:
          row.Price || 0,

        qty:
          row.Quantity || 0,

        month:
          row.Month || 0,

        total:
          row.Total || 0,

        file:
          null

      };

    });
    this.model.Total = this.grandTotal;
    this.calculateGrandTotal();

  }

  newItem() {

    return {

      requestItemId: 0,

      type: '',

      otherDetail: '',

      price: 0,

      qty: 0,

      month: 0,

      total: 0,

      file: null

    };

  }

  addItem() {

    this.items.push(
      this.newItem()
    );

  }

  onTypeChange(item: any, index: number) {
    if (item.type === 'other') {
      item.price = 0;
      this.calculate(index);
      return;
    }

    const rate = this.getRateForType(item.type);

    if (rate > 0) {
      item.price = rate;
    }

    this.calculate(index);
  }
  async removeItem(index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.items.splice(index, 1);

    this.calculateGrandTotal();

    this.updateDetailItems();

  }

  calculate(i: number) {

    let item = this.items[i];

    item.total =

      (Number(item.price) || 0) *

      (Number(item.qty) || 0) *

      (Number(item.month) || 0);

    this.calculateGrandTotal();

    this.updateDetailItems();

  }

  calculateGrandTotal() {

    this.grandTotal =

      this.items.reduce(

        (sum: number, x: any) =>

          sum + (Number(x.total) || 0),

        0

      );

  }

  formatNumber(value: any): string {

    if (value === null || value === undefined || value === '') {
      return '';
    }

    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  }

  onPriceChange(value: string, item: any, i: number): void {

    const numericValue = value.replace(/,/g, '');

    item.price = parseFloat(numericValue) || 0;

    this.calculate(i);

  }

  updateDetailItems() {

    // ลบของ type นี้ก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // เพิ่มใหม่
    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.type,

        Other_Name:
          item.otherDetail,

        Price:
          item.price,

        Quantity:
          item.qty,

        Month:
          item.month,

        Total:
          item.total

      });
      this.model.Total = this.grandTotal;
    });

  }

  onFileSelected(event: any, index: number) {

    const file =
      event.target.files[0];

    if (file) {

      this.items[index].file = file;

    }

  }

  async save() {

    const userConfirmed =
      await confirmAlert(
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

      this.model.dismiss();

    }

  }

}
