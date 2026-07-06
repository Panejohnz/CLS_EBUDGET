import { Component, Input } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-asset-investment-form',
  templateUrl: './expenseAssetInvestmentForm.component.html',
  styles: `
    .asset-investment-table {
      min-width: 1280px;
      table-layout: fixed;
    }

    .asset-investment-table .item-col {
      width: 34%;
      min-width: 360px;
    }

    .asset-investment-select {
      text-align: left;
    }

    .asset-investment-select ::ng-deep .ng-select-container {
      min-height: 35px;
      height: auto;
    }

    .asset-investment-select ::ng-deep .ng-value-container,
    .asset-investment-select ::ng-deep .ng-value {
      white-space: normal;
      line-height: 1.25;
    }

    .asset-investment-select ::ng-deep .ng-option {
      white-space: normal;
      line-height: 1.35;
    }

    .readonly-checkbox {
      pointer-events: none;
      opacity: 1;
      accent-color: #0d6efd;
    }
  `
})
export class ExpenseAssetInvestmentFormComponent {
  constructor(
    public serviceebud: EbudgetService
  ) { }

  @Input() model: any;

  @Input() type!: string;

  @Input() expenseItem: any;

  config: any;

  userDept = 'IT';

  items: any[] = [];

  files: any[] = [];

  fileError = false;

  spec = '';

  grandTotal = 0;
  Mas_Expense_Detial_List: any[] = []
  Mas_Expense_Detial_Rate_List: any[] = []
  private currentExpenseTypeId: any = null;
  isTextMode = false;

  get shouldDefaultStandardIn(): boolean {
    return Number(this.currentExpenseTypeId || this.model?.selectedExpenseTypeId) !== 63;
  }

  get shouldDefaultStandardOut(): boolean {
    return Number(this.currentExpenseTypeId || this.model?.selectedExpenseTypeId) === 63;
  }

  private getOtherDetailOption(): any {
    return this.Mas_Expense_Detial_List.find(
      (x: any) => x?.Expense_Detial_Name === 'อื่นๆ'
    );
  }

  isOtherDetail(item: any): boolean {
    const otherOption = this.getOtherDetailOption();
    return Number(item?.material) === Number(otherOption?.Expense_Detial_Id);
  }

  private applyDefaultFlags(item: any): void {
    if (item.standardIn == null) {
      item.standardIn = this.shouldDefaultStandardIn;
    }

    if (item.standardOut == null) {
      item.standardOut = this.shouldDefaultStandardOut;
    }
  }

  ngOnInit() {

    this.config =
      this.getConfig(this.type);

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.loadExpenseType();
  }

  ngDoCheck() {
    if (!this.model) return;

    if (this.currentExpenseTypeId != this.model.selectedExpenseTypeId) {
      this.loadExpenseType();
    }
  }
  loadExpenseType() {
    this.currentExpenseTypeId = this.model.selectedExpenseTypeId;
    this.isTextMode = Number(this.currentExpenseTypeId) === 63;
    this.Mas_Expense_Detial_List = [];
    this.grandTotal = 0;


    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Detial",
      Fk_Expense_Id: this.currentExpenseTypeId
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {

        this.Mas_Expense_Detial_List =
          Array.isArray(response.List_Mas_Expense_Detial ?? response.List_Mas_Expense_Detail)
            ? (response.List_Mas_Expense_Detial ?? response.List_Mas_Expense_Detail)
            : [];

        this.loadExpenseRates();

      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.loadExpenseRates();
      });

  }

  loadExpenseRates() {
    const expenseIds = [
      this.currentExpenseTypeId,
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
      row?.request_rate ??
      row?.REQUEST_RATE ??
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

  private getSelectedExpenseDetail(item: any): any {
    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.isSameId(this.getExpenseDetailId(detail), item?.material)
    );
  }

  private getExpenseDetailRate(detail: any): number {
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
    if (this.isTextMode) {
      return;
    }

    this.items.forEach((item: any, index: number) => {
      if (!item?.material || this.isOtherDetail(item)) return;

      const rate = this.getExpenseDetailRate(this.getSelectedExpenseDetail(item));

      if (rate > 0) {
        item.price = rate;
        this.calculate(index);
      }
    });
  }
  onMaterialChange(item: any, selected: any, index: number) {

    const obj = typeof selected === 'object'
      ? selected
      : this.Mas_Expense_Detial_List.find(
        x => Number(x.Expense_Detial_Id) === Number(selected)
      );

    item.material = obj?.Expense_Detial_Id || null;
    item.materialName = obj?.Expense_Detial_Name || '';
    item.name = item.materialName;

    if (this.isOtherDetail(item)) {
      item.standardIn = false;
      item.standardOut = true;
    } else {
      item.standardIn = this.shouldDefaultStandardIn;
      item.standardOut = this.shouldDefaultStandardOut;
    }

    item.price = this.getExpenseDetailRate(obj);

    if (!this.isOtherDetail(item)) {
      item.customMaterialName = '';
    }

    this.calculate(index);
  }
  getConfig(type: string) {

    const map: any = {

      computer: {

        label:
          'ครุภัณฑ์คอมพิวเตอร์',

        allowDept:
          'IT',

        options: [

          'คอมพิวเตอร์',

          'โน้ตบุ๊ก',

          'Printer'

        ]

      },

      vehicle: {

        label:
          'ครุภัณฑ์ยานพาหนะและขนส่ง',

        options: [

          'รถโดยสาร',

          'รถบรรทุก'

        ]

      },

      media: {

        label:
          'ครุภัณฑ์โฆษณาและเผยแพร่',

        options: [

          'ป้าย',

          'สื่อ'

        ]

      },

      household: {

        label:
          'ครุภัณฑ์งานบ้านงานครัว',

        options: [

          'เตา',

          'ตู้เย็น'

        ]

      },

      electric: {

        label:
          'ครุภัณฑ์ไฟฟ้าและวิทยุ',

        options: [

          'วิทยุ',

          'เครื่องเสียง'

        ]

      },

      office: {

        label:
          'ครุภัณฑ์สำนักงาน',

        options: [

          'โต๊ะ',

          'เก้าอี้'

        ]

      },

      innovation: {

        label:
          'ครุภัณฑ์นวัตกรรมไทย',

        options: []

      },

      other: {

        label:
          'ครุภัณฑ์อื่นๆ',

        options: []

      }

    };

    return map[type];

  }

  createItem() {
    return {

      requestItemId: 0,

      name: '',
      material: null,
      materialName: '',
      customMaterialName: '',

      standardIn: this.shouldDefaultStandardIn,

      standardOut: this.shouldDefaultStandardOut,

      price: 0,

      qty: 0,

      total: 0,

      newQty: 0,

      reasonNew: '',

      replaceQty: 0,

      reasonReplace: ''

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

      this.items = [

        this.createItem()

      ];

      return;

    }

    this.items =

      rows.map((row: any) => {
        const otherOption = this.getOtherDetailOption();
        const isOtherRow = Number(row.Fk_Expense_Detail_Id) === Number(otherOption?.Expense_Detial_Id);
        const hasPeopleTypeA = row.People_Type_A === 1 || row.People_Type_A === 0;
        const hasPeopleTypeB = row.People_Type_B === 1 || row.People_Type_B === 0;

        const item = {

          requestItemId:
            row.Request_Item_Id || 0,

          name:
            row.Expense_Detail || '',

          material:
            this.isTextMode
              ? null
              : row.Fk_Expense_Detail_Id || null,

          materialName:
            row.Expense_Detail || '',

          customMaterialName:
            isOtherRow ? (row.Expense_Detail || '') : '',

          standardIn:
            isOtherRow
              ? false
              : (hasPeopleTypeA ? row.People_Type_A == 1 : this.shouldDefaultStandardIn),

          standardOut:
            hasPeopleTypeB
              ? (this.shouldDefaultStandardOut || row.People_Type_B == 1 || isOtherRow)
              : (this.shouldDefaultStandardOut || isOtherRow),
          price:
            this.toNumber(row.Price) ||
            this.toNumber(row.Expense_Rate) ||
            this.getExpenseDetailRate(this.Mas_Expense_Detial_List.find((detail: any) =>
              this.isSameId(this.getExpenseDetailId(detail), row.Fk_Expense_Detail_Id)
            )) ||
            0,

          qty:
            row.Quantity || 0,

          total:
            row.Total || 0,

          newQty:
            row.People || 0,

          reasonNew:
            row.Purpose || '',

          replaceQty:
            row.Sum_People || 0,

          reasonReplace:
            row.Reson || ''

        };

        this.applyDefaultFlags(item);

        return item;

      });

    // spec
    const specRow = rows.find(
      (x: any) => x.Other_Name
    );

    if (specRow) {

      this.spec =
        specRow.Other_Name || '';

    }

    this.calculateAll();
    this.model.Total = this.grandTotal;
  }

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

    const item =
      this.items[i];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

    this.items.splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculate(i: number) {

    const item =
      this.items[i];

    item.total =

      (Number(item.price?.toString().replace(/,/g, '')) || 0) *

      (Number(item.qty?.toString().replace(/,/g, '')) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =

      this.items.reduce(

        (s, x) =>

          s + (Number(x.total) || 0),

        0

      );

  }

  uploadFiles(event: any) {

    this.files =
      Array.from(event.target.files);

  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    this.items.forEach((item: any) => {

      const detail = this.Mas_Expense_Detial_List.find(
        (x: any) =>
          Number(x.Expense_Detial_Id) ===
          Number(item.material)
      );
      const isOtherDetail = this.isOtherDetail(item);
      const expenseDetailName = this.isTextMode
        ? (item.materialName || '')
        : (isOtherDetail
          ? (item.customMaterialName || '')
          : (detail?.Expense_Detial_Name || item.materialName || item.name || ''));

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Fk_Expense_Detail_Id:
          this.isTextMode ? 0 : (item.material || 0),

        Expense_Detail:
          expenseDetailName,

        Quantity:
          Number(item.qty?.toString().replace(/,/g, '') || 0),

        Price:
          Number(item.price?.toString().replace(/,/g, '') || 0),

        Total:
          Number(item.total?.toString().replace(/,/g, '') || 0),

        People_Type_A:
          item.standardIn ? 1 : 0,

        People_Type_B:
          item.standardOut ? 1 : 0,

        People:
          item.newQty,

        Purpose:
          item.reasonNew || '',

        Sum_People:
          item.replaceQty,

        Reson:
          item.reasonReplace || '',

        Other_Name:
          this.spec || ''

      });

    });
    this.model.Total = this.grandTotal;
  }

  save() {

    // คอมเฉพาะ IT
    if (

      this.type === 'computer' &&

      this.userDept !== 'IT'

    ) {

      alert('เฉพาะหน่วยงานเทคโน');

      return;

    }

    // นอกมาตรฐานต้องมี 3 ไฟล์
    const hasNon =

      this.items.some(

        x => x.standardOut

      );

    if (

      hasNon &&

      this.files.length < 3

    ) {

      this.fileError = true;

      return;

    }

    this.fileError = false;

  }

}
