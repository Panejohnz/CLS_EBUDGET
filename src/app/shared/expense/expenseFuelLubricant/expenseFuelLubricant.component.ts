import { Component, Input } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-fuel-lubricant',
  templateUrl: './expenseFuelLubricant.component.html',
  styles: ``
})
export class ExpenseFuelLubricantComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    public serviceebud: EbudgetService
  ) { }

  list: any[] = [];
  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

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
      this.applyRatesToExistingRows();
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
        this.applyRatesToExistingRows();
      }, () => {
        this.Mas_Expense_Detial_Rate_List = [];
        this.bindData();
        this.applyRatesToExistingRows();
      });
  }

  normalizeSelectId(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  private toNumber(value: any): number {
    return Number(value?.toString().replace(/,/g, '')) || 0;
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

  private resolveExpenseDetailId(row: any): number | null {
    const detailId =
      row?.Fk_Expense_Detail_Id ??
      row?.Fk_Expense_Detial_Id ??
      row?.Expense_Detail_Id ??
      row?.Expense_Detial_Id;

    const normalizedId = this.normalizeSelectId(detailId);

    if (normalizedId != null) {
      return normalizedId;
    }

    const rowText = this.normalizeText(row?.Expense_Detail);
    const detail = this.Mas_Expense_Detial_List.find((item: any) =>
      this.normalizeText(item?.Expense_Detial_Name) === rowText
    );

    return this.normalizeSelectId(detail?.Expense_Detial_Id);
  }

  getSelectedExpenseDetail(item: any): any {
    const pairId = this.normalizeSelectId(item?.pairId);

    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.normalizeSelectId(detail?.Expense_Detial_Id) === pairId
    );
  }

  getExpenseDetailRate(detail: any): number {
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

    const detailText = this.normalizeText([
      detail?.Expense_Detial_Name,
      detail?.Expense_Detail,
      detail?.Expense_Name,
      detail?.Expense_Detial_Short_Name
    ].filter(Boolean).join(' '));

    const byName = this.Mas_Expense_Detial_Rate_List.find((row: any) => {
      const rateText = this.getRateRowText(row);

      return rateText &&
        detailText &&
        (
          rateText.includes(detailText) ||
          detailText.includes(rateText)
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

  private isOtherExpenseDetail(detail: any): boolean {
    const detailText = this.normalizeText([
      detail?.Expense_Detial_Name,
      detail?.Expense_Detail,
      detail?.Expense_Name,
      detail?.Expense_Detial_Short_Name
    ].filter(Boolean).join(' '));

    return detailText.includes(this.normalizeText('\u0e2d\u0e37\u0e48\u0e19')) ||
      detailText.includes('other');
  }

  isOtherType(item: any): boolean {
    return this.isOtherExpenseDetail(this.getSelectedExpenseDetail(item));
  }

  private isOtherExpenseDetailId(detailId: any): boolean {
    const normalizedId = this.normalizeSelectId(detailId);
    const detail = this.Mas_Expense_Detial_List.find((item: any) =>
      this.normalizeSelectId(item?.Expense_Detial_Id) === normalizedId
    );

    return this.isOtherExpenseDetail(detail);
  }

  onTypeChange(item: any) {
    const selected = this.getSelectedExpenseDetail(item);
    item.type = selected?.Expense_Detial_Name || '';

    if (this.isOtherExpenseDetail(selected)) {
      item.month = 0;
    } else {
      item.otherType = '';
      item.month = selected
        ? this.getExpenseDetailRate(selected) || 0
        : 0;
    }

    this.calculate(item);
  }

  private applyRatesToExistingRows() {
    this.list.forEach((item: any) => {
      if (!item?.pairId || this.isOtherType(item)) return;

      const rate = this.getExpenseDetailRate(this.getSelectedExpenseDetail(item));

      if (rate > 0) {
        item.month = rate;
        item.year = rate * 12;
      }
    });

    this.updateDetailItems();
  }

  onOtherTypeChange() {
    this.updateDetailItems();
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

      this.list = [

        {
          requestItemId: 0,
          pairId: null,
          type: '',
          otherType: '',
          month: 0,
          year: 0
        }

      ];

      return;

    }

    this.list = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        pairId:
          this.resolveExpenseDetailId(row),

        type:
          row.Expense_Detail || '',

        otherType:
          this.isOtherExpenseDetailId(this.resolveExpenseDetailId(row))
            ? row.Expense_Detail || ''
            : '',

        month:
          row.Per_Month || 0,

        year:
          row.Per_Year || 0

      };

    });
    this.model.Total = this.getTotal;
  }

  add() {

    this.list.push({

      requestItemId: 0,

      pairId: null,

      type: '',

      otherType: '',

      month: 0,

      year: 0

    });

    this.updateDetailItems();

  }
  async remove(index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const item =
      this.list[index];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

    this.list.splice(index, 1);

    this.updateDetailItems();

  }

  calculate(item: any) {

    item.year =

      (Number(item.month) || 0) * 12;

    this.updateDetailItems();

  }

  getTotal(field: string): number {

    return this.list.reduce(

      (sum, item) => {

        return sum + (Number(item[field]) || 0);

      },

      0

    );

  }

  updateDetailItems() {

    // ลบของเดิม
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // เพิ่มใหม่
    this.list.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          this.isOtherType(item)
            ? item.otherType || ''
            : item.type,

        Fk_Expense_Detail_Id:
          item.pairId || 0,

        Per_Month:
          item.month,

        Per_Year:
          item.year,

        Total:
          item.year

      });

    });
    this.model.Total = this.getTotal;
  }

}
