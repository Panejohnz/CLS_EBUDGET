import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-repair-construction',
  templateUrl: './expenseRepairConstruction.component.html',
  styles: ``
})
export class ExpenseRepairConstructionComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  grandTotal = 0;

  file: any = null;

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

      this.calculateAll();

      return;

    }

    // map
    this.items = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        qty:
          row.Quantity || 0,

        price:
          row.Price || 0,

        total:
          row.Total || 0

      };

    });

    this.calculateAll();

  }

  newItem() {

    return {

      requestItemId: 0,

      name: '',

      qty: 0,

      price: 0,

      total: 0

    };

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

    this.calculateAll();

    this.updateDetailItems();

  }

  calculate(i: number) {

    const item =
      this.items[i];

    item.total =

      (Number(item.qty) || 0) *

      (Number(item.price) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =

      this.items.reduce(

        (sum: number, item: any) =>

          sum + (Number(item.total) || 0),

        0

      );

  }

  getTotalQty() {

    return this.items.reduce(

      (sum: number, item: any) =>

        sum + (Number(item.qty) || 0),

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
    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name,

        Quantity:
          item.qty,

        Price:
          item.price,

        Total:
          item.total

      });

    });

  }

  uploadFile(event: any) {

    const file =
      event.target.files[0];

    if (file) {

      this.file = file;

    }

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
