
import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

interface RepairItem {

  requestItemId?: number;

  pairId: number | null;

  name: string;

  customName: string;

  quantity: number;

  price: number;

}

@Component({
  selector: 'app-expense-vehicle-repair',
  templateUrl: './expenseVehicleRepair.component.html',
  styles: ``
})
export class ExpenseVehicleRepairComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: RepairItem[] = [];
  Mas_Expense_Detial_List: any[] = [];
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

        this.bindData();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.bindData();
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

  getSelectedExpenseDetail(item: RepairItem): any {
    const pairId = this.normalizeSelectId(item?.pairId);

    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.normalizeSelectId(detail?.Expense_Detial_Id) === pairId
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

  isOtherItem(item: RepairItem): boolean {
    const selected = this.getSelectedExpenseDetail(item);
    const name = this.normalizeText(selected?.Expense_Detial_Name ?? item?.name);

    return name.includes('อื่น') || name.includes('other');
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
        this.newItem()
      ];

      return;

    }

    // map
    this.items = rows.map((row: any) => {

      const pairId = this.resolveExpenseDetailId(row);
      const selected = this.getSelectedExpenseDetail({ pairId } as RepairItem);

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        pairId:
          pairId,

        name:
          row.Expense_Detail || '',

        customName:
          row.Other_Name || '',

        quantity:
          row.Quantity || 0,

        price:
          row.Price ||
          row.Expense_Rate ||
          this.getExpenseDetailRate(selected) ||
          0

      };

    });

  }

  newItem(): RepairItem {

    return {

      requestItemId: 0,

      pairId: null,

      name: '',

      customName: '',

      quantity: 1,

      price: 0

    };

  }

  onSelectChange(item: any) {
    const selected = this.getSelectedExpenseDetail(item);
    item.name = selected?.Expense_Detial_Name || '';

    if (selected) {
      item.price = this.getExpenseDetailRate(selected);
    }

    // ไม่ใช่อื่นๆ → ล้าง
    if (!this.isOtherItem(item)) {

      item.customName = '';

    }

    this.updateDetailItems();

  }

  addItem() {

    this.items.push(
      this.newItem()
    );

  }
  async removeItem(index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const item =
      this.items[index];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

    this.items.splice(index, 1);

    this.updateDetailItems();

  }

  calculate() {

    this.updateDetailItems();

  }

  getTotal(item: RepairItem): number {

    return (Number(item.quantity) || 0) *

      (Number(item.price) || 0);

  }

  getGrandTotal(): number {

    return this.items.reduce(

      (sum, item) =>

        sum + this.getTotal(item),

      0

    );

  }

  updateDetailItems() {

    // ลบ type เดิมก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // เพิ่มใหม่
    this.items.forEach((item: RepairItem) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name,

        Fk_Expense_Detail_Id:
          item.pairId || 0,

        Other_Name:
          item.customName,

        Quantity:
          item.quantity,

        Price:
          item.price,

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
