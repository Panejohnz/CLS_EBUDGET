import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-witness',
  templateUrl: './expenseWitness.component.html',
  styles: ``
})
export class ExpenseWitnessComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;

  list: any[] = [

    {
      name: 'ค่าตอบแทนและค่าใช้จ่ายแก่พยาน',
      level: 0,
      children: true
    },

    {
      requestItemId: 0,

      name: 'ขนาดคดี S',

      level: 1,

      size: 'S',

      case: 0,

      person: 0,

      rate: 0
    },

    {
      requestItemId: 0,

      name: 'ขนาดคดี M',

      level: 1,

      size: 'M',

      case: 0,

      person: 0,

      rate: 0
    },

    {
      requestItemId: 0,

      name: 'ขนาดคดี L',

      level: 1,

      size: 'L',

      case: 0,

      person: 0,

      rate: 0
    }

  ];

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

  closeModal() {

    this.model.dismiss();

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
    const expenseDetailIds = this.Mas_Expense_Detial_List
      .map((detail: any) =>
        this.getExpenseDetailId(detail)
      )
      .filter((id: any, index: number, list: any[]) =>
        id !== null &&
        id !== undefined &&
        id !== '' &&
        list.findIndex((item: any) => this.isSameId(item, id)) === index
      );

    if (expenseDetailIds.length == 0) {
      this.Mas_Expense_Detial_Rate_List = [];
      this.bindData();
      this.applyMasterRates();
      return;
    }

    const requests = expenseDetailIds.map((expenseDetailId: any) =>
      this.serviceebud.GatewayGetData({
        FUNC_CODE: "FUNC-Get_Mas_Mas_Expense_Rate",
        Fk_Expense_Id: expenseDetailId
      }).pipe(
        catchError(() => of({ List_Mas_Expense_Rate: [] }))
      )
    );

    forkJoin(requests)
      .subscribe((responses: any[]) => {
        this.Mas_Expense_Detial_Rate_List =
          responses.reduce((list: any[], response: any) => {
            return list.concat(this.getExpenseRateList(response));
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

  private getExpenseRateList(response: any): any[] {
    if (Array.isArray(response?.List_Mas_Expense_Rate)) {
      return response.List_Mas_Expense_Rate;
    }

    if (response?.Mas_Expense_Rate) {
      return [response.Mas_Expense_Rate];
    }

    return [];
  }

  private getCaseSizeLetter(value: any): string {
    if (typeof value === 'object' && value?.size) {
      const size = value.size.toString().trim().toUpperCase();

      return ['S', 'M', 'L'].includes(size) ? size : '';
    }

    const text = [
      value?.Child_Detial_Name,
      value?.Child_Detail_Name,
      value?.Expense_Detail,
      value?.Expense_Detial_Name,
      value?.Expense_Name,
      value?.Expense_Detial_Short_Name,
      value?.Rate_Name,
      value?.Type_Name,
      value?.Code,
      typeof value === 'string' ? value : ''
    ].filter(Boolean).join(' ');

    const match = text.match(/(?:ขนาดคดี|ขนาด)?\s*\b([SML])\b/i);

    return match?.[1]?.toUpperCase() || '';
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

  private getExpenseDetailBySize(size: any): any {
    const sizeLetter = this.getCaseSizeLetter(size);

    if (!sizeLetter) {
      return null;
    }

    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.getCaseSizeLetter(detail) === sizeLetter
    );
  }

  private getRateForExpenseDetail(itemOrName: any): number {
    const name = typeof itemOrName === 'object'
      ? itemOrName?.name
      : itemOrName;
    const sizeLetter = this.getCaseSizeLetter(itemOrName);
    const detail =
      this.getExpenseDetailBySize(sizeLetter) ||
      this.getExpenseDetailByName(name);
    const detailId = this.getExpenseDetailId(detail);

    const byId = this.Mas_Expense_Detial_Rate_List.find((row: any) =>
      this.isSameId(this.getExpenseDetailId(row), detailId)
    );

    if (byId) {
      return this.getRowRate(byId);
    }

    const bySize = this.Mas_Expense_Detial_Rate_List.find((row: any) =>
      sizeLetter && this.getCaseSizeLetter(row) === sizeLetter
    );

    if (bySize) {
      return this.getRowRate(bySize);
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

    const byIndex = this.getRowRate(this.Mas_Expense_Detial_Rate_List[detailIndex]);

    if (byIndex > 0) {
      return byIndex;
    }

    return this.getRowRate(detail);
  }

  private applyMasterRates() {
    this.list.forEach((item: any) => {
      if (item.level != 1) return;

      const rate = this.getRateForExpenseDetail(item);

      if (rate > 0) {
        item.rate = rate;
      }
    });

    this.updateDetailItems();
  }

  bindData() {

    const rows =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId

      );

    if (rows.length == 0) {
      return;
    }

    this.list.forEach((item: any) => {

      if (item.level != 1) return;

      const detail = this.getExpenseDetailBySize(item.size) || this.getExpenseDetailByName(item.name);

      const found = rows.find((x: any) =>
        x.Expense_Detail == item.name ||
        this.getCaseSizeLetter(x) == item.size ||
        this.isSameId(x.Fk_Expense_Detail_Id, this.getExpenseDetailId(detail))
      );

      if (found) {

        item.requestItemId =
          found.Request_Item_Id || 0;

        item.case =
          found.Day || 0;

        item.person =
          found.People || 0;

        item.rate =
          this.toNumber(found.Rate) ||
          this.toNumber(found.Expense_Rate) ||
          this.getRateForExpenseDetail(item);

      }

    });

  }

  calculate() {

    this.updateDetailItems();

  }

  getCost(row: any): number {

    // parent
    if (row.children) {

      return this.list

        .filter((x: any) => x.level === 1)

        .reduce(

          (sum: number, r: any) =>

            sum +

            (
              (Number(r.person) || 0) *

              (Number(r.rate) || 0)
            ),

          0

        );

    }

    // child
    return (Number(row.person) || 0) *

      (Number(row.rate) || 0);

  }

  getTotal(row: any): number {

    // parent
    if (row.children) {

      return this.list

        .filter((x: any) => x.level === 1)

        .reduce(

          (sum: number, r: any) =>

            sum +

            (
              (Number(r.case) || 0) *

              (Number(r.person) || 0) *

              (Number(r.rate) || 0)
            ),

          0

        );

    }

    // child
    return (Number(row.case) || 0) *

      (Number(row.person) || 0) *

      (Number(row.rate) || 0);

  }

  updateDetailItems() {

    // ลบ expense เดิมก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // push ใหม่
    this.list.forEach((item: any) => {

      // skip parent
      if (item.level != 1) return;

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Purpose:
          'ค่าตอบแทนและค่าใช้จ่ายแก่พยาน',

        Expense_Detail:
          item.name,

        Fk_Expense_Detail_Id:
          this.getExpenseDetailId(this.getExpenseDetailBySize(item.size) || this.getExpenseDetailByName(item.name)) || 0,

        Day:
          item.case,

        People:
          item.person,

        Rate:
          item.rate,

        Price:
          this.getCost(item),

        Total:
          this.getTotal(item)

      });

    });

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
