import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-system-maintenance-cost',
  templateUrl: './expenseSystemMaintenanceCost.component.html',
  styles: ``
})
export class ExpenseSystemMaintenanceCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  totalQty = 0;

  totalMonth = 0;

  grandTotal = 0;

  Mas_Unit_Lists: any[] = [];

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();
    this.loadUnits();

  }

  loadUnits() {
    const model = {
      FUNC_CODE: "FUNC-Get_List_Mas_Unit"
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

  bindData() {

    const rows =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId

      );

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.items = [

        {
          requestItemId: 0,
          name: '',
          price: 0,
          qty: 0,
          unit: 'คน',
          unitId: null,
          month: 0,
          total: 0,
          file: null,
          fileName: ''
        }

      ];

      return;

    }

    this.items = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        price:
          row.Price || 0,

        qty:
          row.Quantity || 0,

        unit:
          row.Unit_Name || 'คน',

        unitId:
          row.Fk_Unit_Id || null,

        month:
          row.Month || 0,

        total:
          row.Total || 0,

        file: null,

        fileName:
          row.Other_Name || ''

      };

    });

    this.calculateAll();

  }

  addItem() {

    this.items.push({

      requestItemId: 0,

      name: '',

      price: 0,

      qty: 0,

      unit: 'คน',

      unitId: null,

      month: 0,

      total: 0,

      file: null,

      fileName: ''

    });

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

      (Number(item.price) || 0) *

      (Number(item.qty) || 0) *

      (Number(item.month) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.totalQty =

      this.items.reduce(

        (sum, x) =>

          sum + (Number(x.qty) || 0),

        0

      );

    this.totalMonth =

      this.items.reduce(

        (sum, x) =>

          sum + (Number(x.month) || 0),

        0

      );

    this.grandTotal =

      this.items.reduce(

        (sum, x) =>

          sum + (Number(x.total) || 0),

        0

      );

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

  uploadFile(event: any, index: number) {

    const file = event.target.files[0];

    if (!file) return;

    this.items[index].file = file;

    this.items[index].fileName = file.name;

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

    // เพิ่มใหม่
    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name,

        Price:
          item.price,

        Quantity:
          item.qty,

        Unit_Name:
          item.unit,

        Fk_Unit_Id:
          item.unitId || null,

        Month:
          item.month,

        Total:
          item.total,

        Other_Name:
          item.fileName || ''

      });

    });

  }

}
