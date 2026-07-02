import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-section61',
  templateUrl: './expenseSection61.component.html',
  styles: ``
})
export class ExpenseSection61Component {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  caseSizeOptions: any[] = [];
  private currentExpenseTypeId: any = null;

  main = {
    costPerCase: 0,
    total: 0
  };

  caseList: any[] = [];

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

        this.caseSizeOptions = this.getCaseSizeOptions();
        this.loadExpenseRates();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.caseSizeOptions = this.getCaseSizeOptions();
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
      this.caseSizeOptions = this.getCaseSizeOptions();
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

        this.caseSizeOptions = this.getCaseSizeOptions();
        this.bindData();
        this.applyMasterRates();
      }, () => {
        this.Mas_Expense_Detial_Rate_List = [];
        this.caseSizeOptions = this.getCaseSizeOptions();
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

  private getTypeName(type: any): string {
    if (type && !['allowance', 'hotel', 'travel', 'other'].includes(type)) {
      return this.getExpenseDetailName(type);
    }

    const nameMap: any = {
      allowance: 'ค่าเบี้ยเลี้ยง',
      hotel: 'ค่าที่พัก',
      travel: 'ค่าพาหนะ'
    };

    return nameMap[type] ?? type ?? '';
  }

  private getExpenseDetailName(value: any): string {
    const detail = this.getExpenseDetailById(value);

    return detail?.Expense_Detial_Name ??
      detail?.Expense_Detail ??
      detail?.Expense_Name ??
      value ??
      '';
  }

  private getExpenseDetailById(value: any): any {
    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.isSameId(this.getExpenseDetailId(detail), value)
    );
  }

  private resolveItemType(row: any): string {
    const type = row?.Month_Name || row?.Expense_Detail || '';
    const text = this.normalizeText(type);

    if (['allowance', 'hotel', 'travel', 'other'].includes(type)) {
      return type;
    }

    if (text.includes(this.normalizeText('ค่าเบี้ยเลี้ยง'))) {
      return 'allowance';
    }

    if (text.includes(this.normalizeText('ค่าที่พัก')) || text.includes(this.normalizeText('ที่พัก'))) {
      return 'hotel';
    }

    if (text.includes(this.normalizeText('ค่าพาหนะ')) || text.includes(this.normalizeText('พาหนะ'))) {
      return 'travel';
    }

    return type ? 'other' : '';
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

  private getDetailSizeText(row: any): string {
    const explicitSize = [
      row?.Case_Size,
      row?.Case_Size_Name,
      row?.Size,
      row?.Size_Name,
      row?.Expense_Size,
      row?.Expense_Size_Name,
      row?.Level_Name,
      row?.Group_Name,
      row?.Type_Name
    ].find((value: any) => value !== null && value !== undefined && value !== '');

    if (explicitSize) {
      return explicitSize.toString().trim();
    }

    const text = [
      row?.Expense_Detial_Name,
      row?.Expense_Detail,
      row?.Expense_Name,
      row?.Expense_Detial_Short_Name,
      row?.Rate_Name,
      row?.Code
    ].filter(Boolean).join(' ');

    const match = text.match(/ขนาดคดี\s*[SML]|ขนาด\s*[SML]|\b[SML]\b/i);

    return match ? match[0].replace(/\s+/g, ' ').trim() : '';
  }

  private normalizeCaseSize(value: any): string {
    const text = (value ?? '').toString().trim();

    if (!text) {
      return '';
    }

    const sizeLetter = text.match(/[SML]/i)?.[0]?.toUpperCase();

    return sizeLetter
      ? `ขนาดคดี ${sizeLetter}`
      : text;
  }

  getCaseSizeOptions(): any[] {
    const options = [
      ...this.Mas_Expense_Detial_List,
      ...this.Mas_Expense_Detial_Rate_List
    ].map((row: any) => this.normalizeCaseSize(this.getDetailSizeText(row)))
      .filter((value: string) => !!value);

    const uniqueOptions = options.filter((value: string, index: number, list: string[]) =>
      list.indexOf(value) === index
    );

    return uniqueOptions.length
      ? uniqueOptions
      : ['ขนาดคดี S', 'ขนาดคดี M', 'ขนาดคดี L'];
  }

  getExpenseOptions(group: any): any[] {
    const groupSize = this.normalizeCaseSize(group?.name);

    if (!groupSize) {
      return [];
    }

    const filtered = this.Mas_Expense_Detial_List.filter((detail: any) => {
      const detailSize = this.normalizeCaseSize(this.getDetailSizeText(detail));

      return !detailSize || detailSize === groupSize;
    });

    return filtered.length
      ? filtered
      : [];
  }

  getGroupRate(group: any): number {
    return (group?.items || []).reduce((sum: number, item: any) => {
      return sum + (Number(item?.amount) || 0);
    }, 0);
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

  private getAmountFromRow(row: any): number {
    const price = this.toNumber(row?.Price);

    return price > 0
      ? price
      : this.toNumber(row?.Expense_Rate) ||
      this.getRateForExpenseDetail(this.getTypeName(row?.Month_Name ?? row?.Expense_Detail));
  }

  private applyMasterRates() {
    this.caseList.forEach((group: any) => {
      (group.items || []).forEach((item: any) => {
        if (item.expenseDetailId == 'other' || item.type == 'other') return;

        const rate = this.getRateForExpenseDetail(this.getTypeName(item.expenseDetailId || item.type));

        if (rate > 0) {
          item.amount = rate;
        }
      });

      this.calculate(group, false);
    });

    this.updateDetailItems();
  }

  createGroup(name: string) {

    return {

      name,

      case: 0,

      person: 0,

      day: 1,

      items: [],

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

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.caseList = [
        this.createGroup('')
      ];

      return;

    }

    const groupedMap: any = {};

    rows.forEach((row: any) => {

      const key =
        row.Purpose || 'default';

      if (!groupedMap[key]) {

        groupedMap[key] = {

          name:
            row.Purpose || '',

          case:
            row.Day || 0,

          person:
            row.People || 0,

          day:
            row.Month || 0,

          items: [],

          costPerCase: 0,

          total: 0

        };

      }

      groupedMap[key].items.push({

        requestItemId:
          row.Request_Item_Id || 0,

        type:
          this.resolveItemType(row),

        expenseDetailId:
          row.Fk_Expense_Detail_Id ||
          this.getExpenseDetailId(this.getExpenseDetailByName(row.Expense_Detail || row.Month_Name)) ||
          '',

        customName:
          row.Expense_Detail || '',

        amount:
          this.getAmountFromRow(row)

      });

    });

    this.caseList =
      Object.values(groupedMap);

    this.caseList.forEach((group: any) => {

      this.calculate(group, false);

    });

  }

  addItem(group: any) {

    group.items.push({

      requestItemId: 0,

      type: '',

      expenseDetailId: '',

      customName: '',

      amount: 0

    });

  }

  addGroup() {
    this.caseList.push(
      this.createGroup('')
    );

    this.calculate(this.caseList[this.caseList.length - 1]);
  }

  async removeItem(group: any, item: any) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    group.items =
      group.items.filter(
        (x: any) => x !== item
      );

    this.calculate(group);

  }

  onTypeChange(item: any, group: any) {

    if (item.expenseDetailId == 'other') {
      item.type = 'other';
      item.amount = 0;
      item.customName = '';
    } else {
      item.type = item.expenseDetailId;
      item.customName = this.getExpenseDetailName(item.expenseDetailId);
      item.amount = this.getRateForExpenseDetail(this.getTypeName(item.expenseDetailId));
    }

    this.calculate(group);

  }

  onCaseSizeChange(group: any) {
    group.items.forEach((item: any) => {
      const hasSelectedOption = this.getExpenseOptions(group).some((detail: any) =>
        this.isSameId(this.getExpenseDetailId(detail), item.expenseDetailId)
      );

      if (item.expenseDetailId && !hasSelectedOption) {
        item.type = '';
        item.expenseDetailId = '';
        item.customName = '';
        item.amount = 0;
      }
    });

    this.calculate(group);
  }

  calculate(group: any, update = true) {

    const itemTotal =

      group.items.reduce(

        (sum: number, i: any) => {

          return sum + (Number(i.amount) || 0);

        },

        0

      );

    const person =
      Number(group.person) || 0;

    const day =
      Number(group.day) || 0;

    const caseVal =
      Number(group.case) || 0;

    group.costPerCase =
      itemTotal * person * day;

    group.total =
      caseVal * group.costPerCase;

    this.main.costPerCase =

      this.caseList.reduce(

        (sum: number, g: any) =>

          sum + (Number(g.costPerCase) || 0),

        0

      );

    this.main.total =

      this.caseList.reduce(

        (sum: number, g: any) =>

          sum + (Number(g.total) || 0),

        0

      );

    if (update) {

      this.updateDetailItems();

    }

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
    this.caseList.forEach((group: any) => {

      group.items.forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId || 0,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          // group
          Purpose:
            group.name,

          Day:
            group.case,

          People:
            group.person,

          Month:
            group.day,

          // item
          Month_Name:
            item.expenseDetailId || item.type,

          Fk_Expense_Detail_Id:
            item.expenseDetailId == 'other'
              ? 0
              : item.expenseDetailId || this.getExpenseDetailId(this.getExpenseDetailByName(this.getTypeName(item.type))) || 0,

          Expense_Detail:

            item.expenseDetailId == 'other'
              ? item.customName
              : this.getExpenseDetailName(item.expenseDetailId || item.type),

          Price:
            item.amount,

          // summary
          Rate:
            group.costPerCase,

          Total:
            group.total

        });

      });

    });

  }

}
