import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

interface RentItem {

  requestItemId?: number;

  name: string;

  qty: number;

  price: number;

  months: number;

  total: number;

  file?: File | null;

}

@Component({
  selector: 'app-expense-other',
  templateUrl: './expenseOther.component.html'
})
export class ExpenseOtherComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  rentItems: RentItem[] = [];

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

      this.rentItems = [
        this.newItem()
      ];

      this.calculateGrandTotal();

      return;

    }

    // map ข้อมูล
    this.rentItems = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        qty:
          row.Quantity || 0,

        price:
          row.Price || 0,

        months:
          row.Month || 0,

        total:
          row.Total || 0,

        file:
          null

      };

    });

    this.calculateGrandTotal();

  }

  newItem(): RentItem {

    return {

      requestItemId: 0,

      name: '',

      qty: 0,

      price: 0,

      months: 0,

      total: 0,

      file: null

    };

  }

  addItem() {

    this.rentItems.push(
      this.newItem()
    );

  }

  removeItem(index: number) {

    this.rentItems.splice(index, 1);

    this.calculateGrandTotal();

    this.updateDetailItems();

  }

  calculate(item: RentItem) {

    item.total =

      (Number(item.qty) || 0) *

      (Number(item.price) || 0) *

      (Number(item.months) || 0);

    this.calculateGrandTotal();

    this.updateDetailItems();

  }

  calculateGrandTotal() {

    this.grandTotal =

      this.rentItems.reduce(

        (sum: number, item: RentItem) =>

          sum + (Number(item.total) || 0),

        0

      );

  }

  updateDetailItems() {

    // ลบของ expense type นี้ก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // เพิ่มใหม่
    this.rentItems.forEach((item: RentItem) => {

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

        Month:
          item.months,

        Total:
          item.total

      });

    });

  }

  onFileSelected(event: any, item: RentItem) {

    const file =
      event.target.files[0];

    if (file) {

      item.file = file;

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