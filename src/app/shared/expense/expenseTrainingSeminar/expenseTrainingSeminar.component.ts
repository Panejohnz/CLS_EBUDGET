import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-training-seminar',
  templateUrl: './expenseTrainingSeminar.component.html',
  styles: ``
})
export class ExpenseTrainingSeminarComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  projectName: any;
  locationOffice: any;
  locationHotel: any;
  description: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  file: any;

  expenseList: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];

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

  private getRateForExpenseType(expenseType: any): number {
    const selectedText = this.normalizeText(expenseType);
    const byName = this.Mas_Expense_Detial_Rate_List.find((row: any) => {
      const rateText = this.getRateRowText(row);

      return rateText &&
        (
          selectedText.includes(rateText) ||
          rateText.includes(selectedText)
        );
    });

    return this.getRowRate(byName);
  }

  private applyRatesToExistingRows() {
    this.expenseList.forEach((item: any) => {
      if (Number(item.rate) > 0) {
        return;
      }

      const rate = this.getRateForExpenseType(item.expenseType);

      if (rate > 0) {
        item.rate = rate;
        this.calculate(item);
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

      this.expenseList = [
        this.newRow()
      ];

      return;

    }

    // header
    const firstRow = rows[0];

    this.projectName =
      firstRow.Purpose || '';

    this.description =
      firstRow.Reson || '';

    this.locationOffice =
      firstRow.Operation1 || false;

    this.locationHotel =
      firstRow.Operation2 || false;

    // detail
    this.expenseList = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        expenseType:
          row.Expense_Detail || '',

        times:
          row.Times || 0,

        typeA:
          row.People_Type_A || 0,

        typeB:
          row.People_Type_B || 0,

        external:
          row.People_Type_C || 0,

        person:
          row.People || 0,

        qty:
          row.Quantity || 0,

        unit:
          row.Unit_Name || 'บาท',

        rate:
          row.Rate || 0,

        unit2:
          row.Other_Name || 'บาท',

        total:
          row.Total || 0

      };

    });

  }

  newRow() {

    return {

      requestItemId: 0,

      expenseType: '',

      times: 0,

      typeA: 0,

      typeB: 0,

      external: 0,

      person: 0,

      qty: 0,

      unit: 'บาท',

      rate: 0,

      unit2: 'บาท',

      total: 0

    };

  }

  addRow() {

    this.expenseList.push(
      this.newRow()
    );

  }

  onExpenseTypeChange(item: any) {
    const rate = this.getRateForExpenseType(item.expenseType);

    if (rate > 0) {
      item.rate = rate;
    }

    this.calculate(item);
  }
  async removeRow(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.expenseList.splice(i, 1);

    this.updateDetailItems();

  }

  calculate(item: any) {

    const people =
      (Number(item.typeA) || 0) +
      (Number(item.typeB) || 0) +
      (Number(item.external) || 0);

    item.person = people;

    item.total =
      people *
      (Number(item.qty) || 0) *
      (Number(item.rate) || 0);

    this.updateDetailItems();

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
    this.expenseList.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.expenseType,

        Purpose:
          this.projectName,

        Reson:
          this.description,

        Operation1:
          this.locationOffice,

        Operation2:
          this.locationHotel,

        Times:
          item.times,

        People_Type_A:
          item.typeA,

        People_Type_B:
          item.typeB,

        People_Type_C:
          item.external,

        People:
          item.person,

        Quantity:
          item.qty,

        Unit_Name:
          item.unit,

        Rate:
          item.rate,

        Other_Name:
          item.unit2,

        Total:
          item.total

      });

    });

  }

  onFileChange(event: any) {

    this.file =
      event.target.files[0];

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
  get grandTotal(): number {

    return this.expenseList.reduce(

      (sum: number, item: any) =>

        sum + (Number(item.total) || 0),

      0

    );

  }
}
