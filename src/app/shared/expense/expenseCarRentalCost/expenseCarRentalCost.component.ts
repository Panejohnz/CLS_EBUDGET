import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
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

        this.bindData();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.bindData();
      });
  }

  createItem() {

    return {

      requestItemId: 0,

      car: null,

      carName: '',

      qty: 1,

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

    const oldRows =

      rows.filter(

        (x: any) =>

          x.Expense_Name == 'old'

      );

    const newRows =

      rows.filter(

        (x: any) =>

          x.Expense_Name == 'new'

      );

    this.itemsOld =

      oldRows.map((row: any) => {

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

      qty:
        row.Quantity || 0,

      price:
        row.Price || 0,

      month:
        row.Month || 0,

      total:
        row.Total || 0,

      file: null,

      fileName:
        row.Other_Name || ''

    };

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

  getExpenseDetailRate(detail: any): number {
    return Number(
      detail?.Request_Rate ??
      detail?.Expense_Rate ??
      detail?.Rate ??
      detail?.Price ??
      detail?.Total ??
      0
    ) || 0;
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

    this.getCurrentItems().splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  onSelectCar(item: any, i: number) {
    const selected = this.getSelectedExpenseDetail(item);
    item.carName = selected?.Expense_Detial_Name || '';

    if (selected) {

      item.price =
        this.getExpenseDetailRate(selected) || item.price || 0;

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

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Name:
          'old',

        Expense_Detail:
          item.carName || '',

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

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Name:
          'new',

        Expense_Detail:
          item.carName || '',

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
