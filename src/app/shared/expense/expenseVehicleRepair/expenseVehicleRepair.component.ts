
import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

interface RepairItem {

  requestItemId?: number;

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

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

  }

  closeModal() {

    this.model.dismiss();

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

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        customName:
          row.Other_Name || '',

        quantity:
          row.Quantity || 0,

        price:
          row.Price || 0

      };

    });

  }

  newItem(): RepairItem {

    return {

      requestItemId: 0,

      name: '',

      customName: '',

      quantity: 1,

      price: 0

    };

  }

  onSelectChange(item: any) {

    // ไม่ใช่อื่นๆ → ล้าง
    if (item.name !== 'อื่นๆ') {

      item.customName = '';

    }

    this.updateDetailItems();

  }

  addItem() {

    this.items.push(
      this.newItem()
    );

  }

  removeItem(index: number) {

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
