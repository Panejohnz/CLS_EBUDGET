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

  @Input() modal: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  caseSizeOptions: any[] = [];
  private currentExpenseTypeId: any = null;
  private detailItemsSignature = '';
  private masterLoaded = false;

  main = {
    costPerCase: 0,
    total: 0
  };

  caseList: any[] = [];

  ngOnInit() {

    if (!this.ensureModel()) return;

    this.loadExpenseDetails();

  }

  ngDoCheck() {
    if (!this.ensureModel()) return;

    if (this.currentExpenseTypeId != this.model.selectedExpenseTypeId) {
      this.loadExpenseDetails();
      return;
    }

    if (this.masterLoaded) {
      const signature = this.getCurrentDetailItemsSignature();

      if (signature && signature !== this.detailItemsSignature) {
        this.bindData();
        this.applyMasterRates(false);
      }
    }
  }

  closeModal() {

    this.model.dismiss();

  }

  private ensureModel(): boolean {
    if (!this.model && this.modal) {
      this.model = this.modal;
    }

    if (!this.model) {
      return false;
    }

    if (!this.model.selectedExpenseTypeId && this.expenseItem?.Expense_Id) {
      this.model.selectedExpenseTypeId = this.expenseItem.Expense_Id;
    }

    if (!this.model.selectedExpenseTypeId) {
      return false;
    }

    if (!this.model.Budget_Request_Detail_Item) {
      this.model.Budget_Request_Detail_Item = [];
    }

    return true;
  }

  loadExpenseDetails() {
    console.log(this.model);
    
    this.currentExpenseTypeId = this.model.selectedExpenseTypeId;
    this.masterLoaded = false;
    this.detailItemsSignature = '';

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
      this.masterLoaded = true;
      this.bindData();
      this.applyMasterRates(false);
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
        this.masterLoaded = true;
        this.bindData();
        this.applyMasterRates(false);
      }, () => {
        this.Mas_Expense_Detial_Rate_List = [];
        this.caseSizeOptions = this.getCaseSizeOptions();
        this.masterLoaded = true;
        this.bindData();
        this.applyMasterRates(false);
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

  private normalizeId(value: any): number | '' {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? '' : numberValue;
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
      detail?.Expense_Detial_Short_Name ??
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
      row?.Child_Detial_Name,
      row?.Child_Detail_Name
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

  private getCaseSizeLabel(sizeLetter: string): string {
    return `\u0e02\u0e19\u0e32\u0e14\u0e04\u0e14\u0e35 ${sizeLetter}`;
  }

  private getNormalizedCaseSizeFromRow(row: any): string {
    const explicitSize = [
      row?.Child_Detial_Name,
      row?.Child_Detail_Name,
      row?.Purpose
    ].find((value: any) => value !== null && value !== undefined && value !== '');

    const text = (explicitSize ?? [
      row?.Expense_Detial_Name,
      row?.Expense_Detail,
      row?.Expense_Name,
      row?.Expense_Detial_Short_Name,
      row?.Rate_Name,
      row?.Code
    ].filter(Boolean).join(' ')).toString();

    const sizeLetter = text.match(/[SML]/i)?.[0]?.toUpperCase();

    return sizeLetter
      ? this.getCaseSizeLabel(sizeLetter)
      : this.normalizeCaseSize(text);
  }

  getCaseSizeOptions(): any[] {
    const options = [
      ...this.Mas_Expense_Detial_List,
      ...this.Mas_Expense_Detial_Rate_List
    ].map((row: any) => this.getNormalizedCaseSizeFromRow(row))
      .filter((value: string) => !!value);

    const uniqueOptions = options.filter((value: string, index: number, list: string[]) =>
      list.indexOf(value) === index
    );

    if (uniqueOptions.length) {
      return uniqueOptions;
    }

    return [
      this.getCaseSizeLabel('S'),
      this.getCaseSizeLabel('M'),
      this.getCaseSizeLabel('L')
    ];

  }

  getExpenseOptions(group: any): any[] {
    const groupSize = this.getNormalizedCaseSizeFromRow({ Purpose: group?.name });

    if (!groupSize) {
      return [];
    }

    const filtered = this.Mas_Expense_Detial_List.filter((detail: any) => {
      const detailSize = this.getNormalizedCaseSizeFromRow(detail);

      return detailSize === groupSize;
    });

    return filtered.length
      ? filtered
      : this.Mas_Expense_Detial_List;
  }

  getExpenseDetailOptionId(option: any): number | '' {
    return this.normalizeId(this.getExpenseDetailId(option));
  }

  getGroupRate(group: any): number {
    return (group?.items || []).reduce((sum: number, item: any) => {
      return sum + (Number(item?.amount) || 0);
    }, 0);
  }

  isOtherExpenseDetail(item: any): boolean {
    const name = this.normalizeText(this.getExpenseDetailName(item?.expenseDetailId || item?.type));

    return name.includes(this.normalizeText('อื่น'));
  }

  private getRateForExpenseDetail(value: any): number {
    const detail = this.getExpenseDetailById(value) ?? this.getExpenseDetailByName(value);
    const detailId = this.normalizeId(this.getExpenseDetailId(detail) ?? value);

    const byId = this.Mas_Expense_Detial_Rate_List.find((rate: any) =>
      this.isSameId(rate?.Fk_Expense_Detail_Id, detailId) ||
      this.isSameId(this.getExpenseDetailId(rate), detailId)
    );

    if (byId) {
      return this.getRowRate(byId);
    }

    const detailRate = this.getRowRate(detail);

    if (detailRate > 0) {
      return detailRate;
    }

    return 0;
  }

  private getAmountFromRow(row: any): number {
    const price = this.toNumber(row?.Price);

    return price > 0
      ? price
      : this.toNumber(row?.Expense_Rate) ||
      this.getRateForExpenseDetail(row?.Fk_Expense_Detail_Id ?? row?.Month_Name ?? row?.Expense_Detail);
  }

  private applyMasterRates(update = true) {
    this.caseList.forEach((group: any) => {
      (group.items || []).forEach((item: any) => {
        if (this.isOtherExpenseDetail(item)) return;

        const rate = this.getRateForExpenseDetail(item.expenseDetailId || item.type);

        if (rate > 0) {
          item.amount = rate;
        }
      });

      this.calculate(group, false);
    });

    if (update) {
      this.updateDetailItems();
    }
  }

  createGroup(name: string) {

    return {

      name,

      case: 0,

      person: 0,

      day: 1,

      items: [
        this.newItem()
      ],

      costPerCase: 0,

      total: 0

    };

  }

  newItem() {
    return {

      requestItemId: 0,

      type: '',

      expenseDetailId: '',

      customName: '',

      amount: 0

    };
  }

  bindData() {

    const rows =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId

      );

    this.detailItemsSignature = this.getDetailItemsSignature(rows);

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.caseList = [
        this.createGroup('')
      ];

      return;

    }

    const groupedMap: any = {};

    rows.forEach((row: any) => {

      const expenseDetailId = this.normalizeId(
        row.Fk_Expense_Detail_Id ||
        row.Month_Name ||
        this.getExpenseDetailId(this.getExpenseDetailByName(row.Expense_Detail)) ||
        ''
      );

      const detail = this.getExpenseDetailById(expenseDetailId);
      const caseSize = this.getNormalizedCaseSizeFromRow({
        ...(detail || {}),
        Purpose: row.Purpose
      }) || '';

      const key = [
        caseSize || 'default',
        row.Fk_Expense_Detail_Id || row.Expense_Detail || row.Month_Name || row.Request_Item_Id || ''
      ].join('_');

      if (!groupedMap[key]) {

        groupedMap[key] = {

          name:
            caseSize,

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
          expenseDetailId,

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

  ensureSingleItem(group: any) {
    if (!group.items?.length) {
      group.items = [
        this.newItem()
      ];
    }

  }

  private getCurrentDetailItemsSignature(): string {
    const rows = (this.model?.Budget_Request_Detail_Item || []).filter(
      (x: any) =>
        x.Fk_Expense_Id ==
        this.model.selectedExpenseTypeId
    );

    return this.getDetailItemsSignature(rows);
  }

  private getDetailItemsSignature(rows: any[]): string {
    return (rows || []).map((row: any) => [
      row.Request_Item_Id,
      row.Fk_Expense_Id,
      row.Fk_Expense_Detail_Id,
      row.Purpose,
      row.Day,
      row.People,
      row.Month,
      row.Price,
      row.Rate,
      row.Total
    ].join(':')).join('|');
  }

  addGroup() {
    this.caseList.push(
      this.createGroup('')
    );

    this.calculate(this.caseList[this.caseList.length - 1]);
  }

  onTypeChange(item: any, group: any) {

    item.expenseDetailId = this.normalizeId(item.expenseDetailId);
    item.type = item.expenseDetailId;
    item.customName = this.getExpenseDetailName(item.expenseDetailId);

    if (this.isOtherExpenseDetail(item)) {
      item.amount = 0;
    } else {
      item.amount = this.getRateForExpenseDetail(item.expenseDetailId);
    }

    this.calculate(group);

  }

  onCaseSizeChange(group: any) {
    this.ensureSingleItem(group);

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
            item.expenseDetailId || this.getExpenseDetailId(this.getExpenseDetailByName(this.getTypeName(item.type))) || 0,

          Expense_Detail:

            this.isOtherExpenseDetail(item)
              ? item.customName || this.getExpenseDetailName(item.expenseDetailId || item.type)
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

    this.detailItemsSignature = this.getCurrentDetailItemsSignature();

  }

}
