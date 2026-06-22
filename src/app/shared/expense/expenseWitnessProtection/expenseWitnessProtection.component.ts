import { Component, Input } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-witness-protection',
  templateUrl: './expenseWitnessProtection.component.html',
  styles: ``
})
export class ExpenseWitnessProtectionComponent {

  constructor(
    public serviceebud: EbudgetService
  ) { }

  @Input() model: any;

  @Input() expenseItem: any;

  main = {

    case: 0,

    costPerCase: 0,

    total: 0

  };

  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;

  s: any;

  m: any;

  l: any;

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.s = this.createRow();

    this.m = this.createRow();

    this.l = this.createRow();

    this.loadExpenseDetails();

  }

  ngDoCheck() {
    if (!this.model) return;

    if (this.currentExpenseTypeId != this.model.selectedExpenseTypeId) {
      this.loadExpenseDetails();
    }
  }

  loadExpenseDetails() {
    this.currentExpenseTypeId = this.model.selectedExpenseTypeId;

    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Detial",
      Fk_Expense_Id: this.model.selectedExpenseTypeId
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        const expenseDetailList =
          response.List_Mas_Expense_Detial ??
          response.List_Mas_Expense_Detail;

        this.Mas_Expense_Detial_List =
          Array.isArray(expenseDetailList)
            ? expenseDetailList
            : [];

        this.loadExpenseRates();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.loadExpenseRates();
      });
  }

  loadExpenseRates() {
    const expenseIds = [
      this.model.selectedExpenseTypeId,
      ...this.Mas_Expense_Detial_List.map((detail: any) =>
        this.getExpenseDetailId(detail)
      )
    ].filter((id: any, index: number, list: any[]) =>
      id !== null &&
      id !== undefined &&
      id !== '' &&
      list.findIndex((item: any) => this.isSameId(item, id)) === index
    );

    if (expenseIds.length == 0) {
      this.Mas_Expense_Detial_Rate_List = [];
      this.bindData();
      this.applyMasterRates();
      return;
    }

    const requests = expenseIds.map((expenseId: any) =>
      this.serviceebud.GatewayGetData({
        FUNC_CODE: "FUNC-Get_Mas_Expense_Rate",
        Fk_Expense_Id: expenseId
      }).pipe(
        catchError(() => of({ List_Mas_Expense_Rate: [] }))
      )
    );

    forkJoin(requests)
      .subscribe((responses: any[]) => {
        this.Mas_Expense_Detial_Rate_List =
          responses.reduce((list: any[], response: any) => {
            const expenseRateList =
              response?.List_Mas_Expense_Rate;

            return Array.isArray(expenseRateList)
              ? list.concat(expenseRateList)
              : list;
          }, []);

        this.bindData();
        this.applyMasterRates();
      }, () => {
        this.Mas_Expense_Detial_Rate_List = [];
        this.bindData();
        this.applyMasterRates();
      });
  }

  private toNumber(value: any): number {
    return Number(value?.toString().replace(/,/g, '')) || 0;
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  private isSameId(a: any, b: any): boolean {
    return a !== null &&
      a !== undefined &&
      b !== null &&
      b !== undefined &&
      Number(a) === Number(b);
  }

  private getExpenseDetailId(row: any): any {
    return row?.Expense_Detial_Id ??
      row?.Expense_Detail_Id ??
      row?.Fk_Expense_Detial_Id ??
      row?.Fk_Expense_Detail_Id;
  }

  private getRowRate(row: any): number {
    return this.toNumber(
      row?.Request_Rate ??
      row?.Expense_Rate ??
      row?.Rate ??
      row?.Price ??
      row?.Total
    );
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

  private getExpenseDetailByName(name: any): any {
    const text = this.normalizeText(name);

    if (!text) {
      return null;
    }

    return this.Mas_Expense_Detial_List.find((detail: any) => {
      const detailText = this.normalizeText([
        detail?.Expense_Detial_Name,
        detail?.Expense_Detail,
        detail?.Expense_Name,
        detail?.Expense_Detial_Short_Name
      ].filter(Boolean).join(' '));

      return detailText &&
        (
          detailText === text ||
          detailText.includes(text) ||
          text.includes(detailText)
        );
    });
  }

  private getRateForExpenseDetail(name: any): number {
    const detail = this.getExpenseDetailByName(name);
    const detailId = this.getExpenseDetailId(detail);
    const detailRate = this.getRowRate(detail);

    if (detailRate > 0) {
      return detailRate;
    }

    const byId = this.Mas_Expense_Detial_Rate_List.find((row: any) =>
      this.isSameId(this.getExpenseDetailId(row), detailId)
    );

    if (byId) {
      return this.getRowRate(byId);
    }

    const text = this.normalizeText(name);
    const byName = this.Mas_Expense_Detial_Rate_List.find((row: any) => {
      const rateText = this.getRateRowText(row);

      return rateText &&
        text &&
        (
          rateText.includes(text) ||
          text.includes(rateText)
        );
    });

    if (byName) {
      return this.getRowRate(byName);
    }

    const detailIndex = this.Mas_Expense_Detial_List.findIndex((item: any) =>
      this.isSameId(this.getExpenseDetailId(item), detailId)
    );

    return this.getRowRate(this.Mas_Expense_Detial_Rate_List[detailIndex]);
  }

  private getAllowanceRate(): number {
    return this.getRateForExpenseDetail('ค่าเบี้ยเลี้ยง');
  }

  private getHotelRate(): number {
    return this.getRateForExpenseDetail('ค่าที่พัก') ||
      this.getRateForExpenseDetail('ที่พัก');
  }

  private applyMasterRates() {
    const allowanceRate = this.getAllowanceRate();
    const hotelRate = this.getHotelRate();

    [this.s, this.m, this.l].forEach((row: any) => {
      if (!row) return;

      if (allowanceRate > 0) {
        row.allowanceRate = allowanceRate;
      }

      if (hotelRate > 0) {
        row.hotelRate = hotelRate;
      }
    });

    this.calculateAll();
  }

  createRow() {

    return {

      requestItemId: 0,

      size: '',

      case: 0,

      person: 0,

      allowanceRate: 0,

      allowanceDay: 0,

      allowanceTotal: 0,

      hotelRate: 0,

      hotelDay: 0,

      hotelTotal: 0,

      other: 0,

      costPerCase: 0,

      total: 0

    };

  }

  bindData() {

    const rows =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId

      );

    if (rows.length == 0) {

      this.calculateAll();

      return;

    }

    rows.forEach((row: any) => {

      const data = {

        requestItemId:
          row.Request_Item_Id || 0,

        size:
          row.Expense_Detail || '',

        case:
          Number(row.Quantity || 0),

        person:
          Number(row.People || 0),

        allowanceRate:
          this.toNumber(row.Price) ||
          this.toNumber(row.Expense_Rate) ||
          this.getAllowanceRate(),

        allowanceDay:
          Number(row.Day || 0),

        allowanceTotal:
          Number(row.Per_Month || 0),

        hotelRate:
          this.toNumber(row.Rate) ||
          this.getHotelRate(),

        hotelDay:
          Number(row.Month || 0),

        hotelTotal:
          Number(row.Per_Year || 0),

        other:
          Number(row.Salary_Amount || 0),

        costPerCase:
          Number(row.Hour || 0),

        total:
          Number(row.Total || 0)

      };

      if (row.Expense_Detail == 'S') {

        this.s = data;

      }

      if (row.Expense_Detail == 'M') {

        this.m = data;

      }

      if (row.Expense_Detail == 'L') {

        this.l = data;

      }

    });

    this.calculateAll();

  }

  calculateRow(x: any) {

    x.allowanceTotal =

      (Number(x.allowanceRate) || 0) *

      (Number(x.allowanceDay) || 0) *

      (Number(x.person) || 0);

    x.hotelTotal =

      (Number(x.hotelRate) || 0) *

      (Number(x.hotelDay) || 0) *

      (Number(x.person) || 0);

    x.costPerCase =

      (x.allowanceTotal || 0) +

      (x.hotelTotal || 0) +

      (Number(x.other) || 0);

    x.total =

      (Number(x.costPerCase) || 0) *

      (Number(x.case) || 0);

  }

  calculateAll() {

    this.calculateRow(this.s);

    this.calculateRow(this.m);

    this.calculateRow(this.l);

    this.main.case =

      (Number(this.s.case) || 0) +

      (Number(this.m.case) || 0) +

      (Number(this.l.case) || 0);

    this.main.costPerCase =

      (Number(this.s.costPerCase) || 0) +

      (Number(this.m.costPerCase) || 0) +

      (Number(this.l.costPerCase) || 0);

    this.main.total =

      (Number(this.s.total) || 0) +

      (Number(this.m.total) || 0) +

      (Number(this.l.total) || 0);

    this.updateDetailItems();

  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    const rows = [

      {
        size: 'S',
        data: this.s
      },

      {
        size: 'M',
        data: this.m
      },

      {
        size: 'L',
        data: this.l
      }

    ];

    rows.forEach((r: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          r.data.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          r.size,

        Quantity:
          r.data.case || 0,

        People:
          r.data.person || 0,

        Price:
          r.data.allowanceRate || 0,

        Day:
          r.data.allowanceDay || 0,

        Per_Month:
          r.data.allowanceTotal || 0,

        Rate:
          r.data.hotelRate || 0,

        Month:
          r.data.hotelDay || 0,

        Per_Year:
          r.data.hotelTotal || 0,

        Salary_Amount:
          r.data.other || 0,

        Hour:
          r.data.costPerCase || 0,

        Total:
          r.data.total || 0

      });

    });

  }

}
