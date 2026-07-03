import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-car-rental-cost',
  templateUrl: './expenseCarRentalCost.component.html',
  styles: ``
})
export class ExpenseCarRentalCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  tab: 'old' | 'new' = 'old';

  itemsOld: any[] = [];

  itemsNew: any[] = [];
  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;

  totalMonth = 0;

  grandTotal = 0;

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

  createItem() {

    return {

      requestItemId: 0,

      car: null,

      carName: '',

      otherCarName: '',

      qty: 0,

      price: 0,

      month: 0,

      total: 0,

      file: null,

      fileName: ''

    };

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

      this.itemsOld = [

        this.createItem()

      ];

      this.itemsNew = [

        this.createItem()

      ];

      return;

    }

    const filledRows =

      rows.filter((row: any) => this.isPersistedRentalRow(row));

    const oldRows =

      filledRows.filter(

        (x: any) =>

          x.Expense_Name == 'old' ||
          x.Purpose == 'old'

      );

    const newRows =

      filledRows.filter(

        (x: any) =>

          x.Expense_Name == 'new' ||
          x.Purpose == 'new'

      );

    const fallbackRows =

      oldRows.length || newRows.length
        ? []
        : filledRows;

    this.itemsOld =

      (oldRows.length ? oldRows : fallbackRows).map((row: any) => {

        return this.mapRow(row);

      });

    this.itemsNew =

      newRows.map((row: any) => {

        return this.mapRow(row);

      });

    if (this.itemsOld.length == 0) {

      this.itemsOld = [

        this.createItem()

      ];

    }

    if (this.itemsNew.length == 0) {

      this.itemsNew = [

        this.createItem()

      ];

    }

    this.calculateAll();
    this.model.Total = this.grandTotal;
  }

  mapRow(row: any) {

    return {

      requestItemId:
        row.Request_Item_Id || 0,

      car:
        this.resolveExpenseDetailId(row),

      carName:
        row.Expense_Detail || '',

      otherCarName:
        this.isOtherExpenseDetailId(this.resolveExpenseDetailId(row))
          ? row.Expense_Detail || ''
          : '',

      qty:
        row.Quantity || 0,

      price:
        row.Price ||
        row.Expense_Rate ||
        this.getExpenseDetailRate(this.getSelectedExpenseDetail({
          car: this.resolveExpenseDetailId(row)
        })) ||
        0,

      month:
        row.Month || 0,

      total:
        row.Total || 0,

      file: null,

      fileName:
        row.Other_Name || ''

    };

  }

  private isPersistedRentalRow(row: any): boolean {
    return this.normalizeSelectId(
      row?.Fk_Expense_Detail_Id ??
      row?.Fk_Expense_Detial_Id ??
      row?.Expense_Detail_Id ??
      row?.Expense_Detial_Id
    ) != null ||
      this.toNumber(row?.Quantity) > 0 ||
      this.toNumber(row?.Price) > 0 ||
      this.toNumber(row?.Month) > 0 ||
      this.toNumber(row?.Total) > 0 ||
      !!(row?.Expense_Detail || '').toString().trim();
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
    const carId = this.normalizeSelectId(item?.car);

    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.normalizeSelectId(detail?.Expense_Detial_Id) === carId
    );
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

  isOtherCar(item: any): boolean {
    return this.isOtherExpenseDetail(this.getSelectedExpenseDetail(item));
  }

  private isOtherExpenseDetailId(detailId: any): boolean {
    const normalizedId = this.normalizeSelectId(detailId);
    const detail = this.Mas_Expense_Detial_List.find((item: any) =>
      this.normalizeSelectId(this.getExpenseDetailId(item)) === normalizedId
    );

    return this.isOtherExpenseDetail(detail);
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

  private applyRatesToExistingRows() {
    [...this.itemsOld, ...this.itemsNew].forEach((item: any) => {
      if (!item?.car) return;

      const rate = this.getExpenseDetailRate(this.getSelectedExpenseDetail(item));

      if (rate > 0) {
        item.price = rate;
        item.total =
          (Number(item.qty) || 0) *
          (Number(item.price) || 0) *
          (Number(item.month) || 0);
      }
    });

    this.calculateAll();
    this.updateDetailItems();
  }

  getCurrentItems() {

    return this.tab === 'old'
      ? this.itemsOld
      : this.itemsNew;

  }

  addItem() {

    this.getCurrentItems().push(

      this.createItem()

    );

    this.updateDetailItems();

  }
  async removeItem(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const item =
      this.getCurrentItems()[i];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

    this.getCurrentItems().splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  onSelectCar(item: any, i: number) {
    const selected = this.getSelectedExpenseDetail(item);
    item.carName = selected?.Expense_Detial_Name || '';

    if (this.isOtherExpenseDetail(selected)) {
      item.price = 0;
    } else {
      item.otherCarName = '';
      item.price =
        selected
          ? this.getExpenseDetailRate(selected) || 0
          : 0;
    }

    this.calculate(i);

  }

  calculate(i: number) {

    const item =
      this.getCurrentItems()[i];

    item.total =

      (Number(item.qty) || 0) *

      (Number(item.price) || 0) *

      (Number(item.month) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  onOtherCarNameChange() {
    this.updateDetailItems();
  }

  private isFilledItem(item: any): boolean {
    return this.normalizeSelectId(item?.car) != null ||
      this.toNumber(item?.qty) > 0 ||
      this.toNumber(item?.price) > 0 ||
      this.toNumber(item?.month) > 0 ||
      this.toNumber(item?.total) > 0 ||
      !!(item?.otherCarName || '').toString().trim() ||
      !!(item?.carName || '').toString().trim();
  }

  calculateAll() {

    const list =
      this.getCurrentItems();

    this.totalMonth =

      list.reduce(

        (s, x) =>

          s + (Number(x.month) || 0),

        0

      );

    this.grandTotal =

      list.reduce(

        (s, x) =>

          s + (Number(x.total) || 0),

        0

      );

  }

  uploadFile(event: any, i: number) {

    const file =
      event.target.files[0];

    if (!file) return;

    const list =
      this.getCurrentItems();

    list[i].file = file;

    list[i].fileName =
      file.name;

    this.updateDetailItems();

  }

  updateDetailItems() {

    // ลบของเดิม
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // OLD
    this.itemsOld.forEach((item: any) => {

      if (!this.isFilledItem(item)) {
        return;
      }

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Name:
          'old',

        Purpose:
          'old',

        Expense_Detail:
          this.isOtherCar(item)
            ? item.otherCarName || ''
            : item.carName || '',

        Fk_Expense_Detail_Id:
          item.car || 0,

        Quantity:
          item.qty,

        Price:
          item.price,

        Month:
          item.month,

        Total:
          item.total,

        Other_Name:
          item.fileName || ''

      });

    });

    // NEW
    this.itemsNew.forEach((item: any) => {

      if (!this.isFilledItem(item)) {
        return;
      }

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Name:
          'new',

        Purpose:
          'new',

        Expense_Detail:
          this.isOtherCar(item)
            ? item.otherCarName || ''
            : item.carName || '',

        Fk_Expense_Detail_Id:
          item.car || 0,

        Quantity:
          item.qty,

        Price:
          item.price,

        Month:
          item.month,

        Total:
          item.total,

        Other_Name:
          item.fileName || ''

      });

    });
    this.model.Total = this.grandTotal;
  }

  save() {

  }

}
