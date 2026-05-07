import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-service-contract',
  templateUrl: './expenseServiceContract.component.html',
  styles: ``
})
export class ExpenseServiceContractComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  grandTotal = 0;

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

      this.calculateGrand();

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

        month:
          row.Month || 0,

        total:
          row.Total || 0,

        file:
          null

      };

    });

    this.calculateGrand();

  }

  newItem() {

    return {

      requestItemId: 0,

      name: '',

      price: 0,

      qty: 0,

      unit: 'คน',

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

  removeItem(i: number) {

    this.items.splice(i, 1);

    this.calculateGrand();

    this.updateDetailItems();

  }

  calculate(i: number) {

    let item = this.items[i];

    item.total =

      (Number(item.price) || 0) *

      (Number(item.qty) || 0) *

      (Number(item.month) || 0);

    this.calculateGrand();

    this.updateDetailItems();

  }

  calculateGrand() {

    this.grandTotal =

      this.items.reduce(

        (sum: number, x: any) =>

          sum + (Number(x.total) || 0),

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

        Price:
          item.price,

        Quantity:
          item.qty,

        Unit_Name:
          item.unit,

        Month:
          item.month,

        Total:
          item.total

      });

    });

  }

  uploadFile(event: any, index: number) {

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