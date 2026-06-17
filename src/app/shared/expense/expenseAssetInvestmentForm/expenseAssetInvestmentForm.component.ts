import { Component, Input } from '@angular/core';
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
      min-height: 32px;
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
          Array.isArray(response.List_Mas_Expense_Detial)
            ? response.List_Mas_Expense_Detial
            : [];

        this.bindData();

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

    const requestRate =
      obj?.Request_Rate ??
      obj?.request_rate ??
      obj?.REQUEST_RATE ??
      0;

    item.price = Number(requestRate) || 0;

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
            row.Price || 0,

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
