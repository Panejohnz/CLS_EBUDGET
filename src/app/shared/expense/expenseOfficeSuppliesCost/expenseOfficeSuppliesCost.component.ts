import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-office-supplies-cost',
  templateUrl: './expenseOfficeSuppliesCost.component.html',
  styles: ``
})
export class ExpenseOfficeSuppliesCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  materialOptions = [

    { id: 1, name: 'ปากกาลูกลื่น' },

    { id: 2, name: 'กระดาษ A4' },

    { id: 3, name: 'แฟ้มเอกสาร' }

  ];
  isTextMode = false;

  grandTotal = 0;
  Mas_Expense_Detial_List: any[] = []
  Mas_Unit_Lists: any[] = [];
  private currentExpenseTypeId: any = null;

  ngOnInit() {
    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {
      this.model.Budget_Request_Detail_Item = [];
    }

    this.loadExpenseType();
    this.loadUnits();
  }

  loadUnits() {
    let model = {
      FUNC_CODE: "FUNC-Get_List_Mas_Unit",
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        this.Mas_Unit_Lists =
          Array.isArray(response.List_Mas_Unit)
            ? response.List_Mas_Unit
            : [];

        this.resolveUnitIds();
      }, () => {
        this.Mas_Unit_Lists = [];
      });
  }

  ngDoCheck() {
    if (!this.model) return;

    if (this.currentExpenseTypeId != this.model.selectedExpenseTypeId) {
      this.loadExpenseType();
    }
  }

  loadExpenseType() {
    this.currentExpenseTypeId = this.model.selectedExpenseTypeId;
    this.isTextMode = Number(this.currentExpenseTypeId) === 48;
    this.Mas_Expense_Detial_List = [];
    this.items = [this.newItem()];
    this.grandTotal = 0;

    if (this.isTextMode) {
      this.bindData();
      return;
    }

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

  newItem() {
    return {
      requestItemId: 0,
      material: null,
      materialName: '',
      qty: 0,
      unit: '',
      unitId: null,
      price: 0,
      total: 0,
      remark: ''
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

      this.items = [this.newItem()];

      return;

    }

    this.items = rows.map((row: any) => {
      return {

        requestItemId: row.Request_Item_Id || 0,

        // ถ้าเป็นประเภท 48 ใช้ข้อความที่กรอก
        material:
          this.isTextMode
            ? null
            : row.Fk_Expense_Detail_Id || null,

        materialName:
          row.Expense_Detail || '',

        qty:
          row.Quantity || 0,

        unit:
          row.Unit_Name || '',

        unitId:
          row.Fk_Unit_Id || null,

        price:
          row.Price || 0,

        total:
          row.Total || 0,

        remark:
          row.Reson || ''

      };

    });

    this.calculateAll();

  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  resolveUnitIds() {
    if (!this.Mas_Unit_Lists.length) {
      return;
    }

    this.items.forEach((item: any) => {
      if (item.unitId) {
        return;
      }

      const unit = this.Mas_Unit_Lists.find((x: any) =>
        this.normalizeText(x?.Unit_Name) === this.normalizeText(item.unit)
      );

      item.unitId = unit?.Unit_Id || null;
    });
  }

  onUnitChange(item: any) {
    const unit = this.Mas_Unit_Lists.find((x: any) =>
      Number(x.Unit_Id) === Number(item.unitId)
    );

    item.unit = unit?.Unit_Name || '';
    this.updateDetailItems();
  }
  onMaterialChange(item: any, selected: any, index: number) {

    const obj = typeof selected === 'object'
      ? selected
      : this.Mas_Expense_Detial_List.find(
        x => Number(x.Expense_Detial_Id) === Number(selected)
      );

    item.material = obj?.Expense_Detial_Id || null;
    item.materialName = obj?.Expense_Detial_Name || '';

    const requestRate =
      obj?.Request_Rate ??
      obj?.request_rate ??
      obj?.REQUEST_RATE ??
      0;

    item.price = Number(requestRate) || 0;

    this.calculate(index);
  }
  addItem() {

    this.items.push(this.newItem());
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

    const item = this.items[i];

    item.total =

      (Number(item.qty?.toString().replace(/,/g, '')) || 0) *

      (Number(item.price?.toString().replace(/,/g, '')) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =

      this.items.reduce(

        (sum, x) =>

          sum + (Number(x.total?.toString().replace(/,/g, '')) || 0),

        0

      );

  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          Number(x.Fk_Expense_Id) !==
          Number(this.model.selectedExpenseTypeId)
      );

    this.items.forEach((item: any) => {

      const detail = this.Mas_Expense_Detial_List.find(
        (x: any) =>
          Number(x.Expense_Detial_Id) ===
          Number(item.material)
      );

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id: item.requestItemId || 0,

        Fk_Request_Budget:
          this.model.Budget_Request?.Request_Id || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Name:
          this.expenseItem?.Expense_Name ||
          this.model.selectedExpenseName ||
          '',

        Fk_Request_Detail_Id:
          this.expenseItem?.Request_Detail_Id || 0,

        Fk_Expense_Detail_Id:
          this.isTextMode ? 0 : (item.material || 0),

        Expense_Detail:
          this.isTextMode
            ? (item.materialName || '')
            : (detail?.Expense_Detial_Name || ''),

        Quantity:
          Number(item.qty?.toString().replace(/,/g, '') || 0),

        Price:
          Number(item.price?.toString().replace(/,/g, '') || 0),

        Fk_Unit_Id:
          item.unitId || 0,

        Unit_Name:
          item.unit || '',

        Total:
          Number(item.total?.toString().replace(/,/g, '') || 0),

        Budget_Amount:
          Number(item.total?.toString().replace(/,/g, '') || 0),

        Reson:
          item.remark || '',

        Active:
          true,
      });

    });

  }

}
