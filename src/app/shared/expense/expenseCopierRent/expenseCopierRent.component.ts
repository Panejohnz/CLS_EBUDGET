
import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-copier-rent',
  templateUrl: './expenseCopierRent.component.html',
  styles: ``
})
export class ExpenseCopierRentComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  grandTotal: number = 0;

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

      this.calculateGrandTotal();

      return;

    }

    this.items = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        type:
          row.Expense_Detail || '',

        otherDetail:
          row.Other_Name || '',

        price:
          row.Price || 0,

        qty:
          row.Quantity || 0,

        month:
          row.Month || 0,

        total:
          row.Total || 0,

        file:
          null

      };

    });

    this.calculateGrandTotal();

  }

  newItem() {

    return {

      requestItemId: 0,

      type: '',

      otherDetail: '',

      price: 0,

      qty: 0,

      month: 0,

      total: 0,

      file: null

    };

  }

  addItem() {

    this.items.push(
      this.newItem()
    );

  }

  removeItem(index: number) {

    this.items.splice(index, 1);

    this.calculateGrandTotal();

    this.updateDetailItems();

  }

  calculate(i: number) {

    let item = this.items[i];

    item.total =

      (Number(item.price) || 0) *

      (Number(item.qty) || 0) *

      (Number(item.month) || 0);

    this.calculateGrandTotal();

    this.updateDetailItems();

  }

  calculateGrandTotal() {

    this.grandTotal =

      this.items.reduce(

        (sum: number, x: any) =>

          sum + (Number(x.total) || 0),

        0

      );

  }

  updateDetailItems() {

    // ลบของ type นี้ก่อน
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
          item.type,

        Other_Name:
          item.otherDetail,

        Price:
          item.price,

        Quantity:
          item.qty,

        Month:
          item.month,

        Total:
          item.total

      });

    });

  }

  onFileSelected(event: any, index: number) {

    const file =
      event.target.files[0];

    if (file) {

      this.items[index].file = file;

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
