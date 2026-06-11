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
  this.formatNumber(row.Price),

    qty:
  this.formatNumber(row.Quantity),



        unit:
          row.Unit_Name || 'คน',

 month:
  this.formatNumber(row.Month),

     total:
  this.formatNumber(row.Total),

        file:
          null

      };

    });

    this.calculateGrand();

  }

  formatNumber(value: any): string {

  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (Number(value) === 0) {
    return '';
  }

  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

}

formatInput(event: any, item: any, field: string): void {

  let value = event.target.value;

  // อนุญาตเฉพาะเลขและ .
  value = value.replace(/[^0-9.]/g, '');

  // กัน . ซ้ำ
  const parts = value.split('.');

  if (parts.length > 2) {

    value = parts[0] + '.' + parts[1];

  }

  let integerPart = parts[0];
  let decimalPart = parts[1];

  // ลบ 0 นำหน้า
  integerPart = integerPart.replace(/^0+(?!$)/, '');

  // ใส่ comma
  if (integerPart !== '') {

    integerPart = Number(integerPart).toLocaleString('en-US');

  }

  // รวมกลับ
  value = decimalPart !== undefined
    ? `${integerPart}.${decimalPart}`
    : integerPart;

  item[field] = value;

  event.target.value = value;

}

displayInputNumber(value: any): string {

  if (value === null || value === undefined || value === '') {
    return '';
  }

  const numericValue = Number(
    value?.toString().replace(/,/g, '')
  ) || 0;

  return numericValue === 0
    ? ''
    : value;

}

  newItem() {

    return {

      requestItemId: 0,

      name: '',

      price: '',

      qty: '',

      unit: 'คน',

      month: '',

      total: '',

      file: null

    };

  }

  addItem() {

    this.items.push(
      this.newItem()
    );

  }
  async removeItem(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.items.splice(i, 1);

    this.calculateGrand();

    this.updateDetailItems();

  }

calculate(i: number) {

  let item = this.items[i];

  const price = Number(
    item.price?.toString().replace(/,/g, '')
  ) || 0;

  const qty = Number(
    item.qty?.toString().replace(/,/g, '')
  ) || 0;

  const month = Number(
    item.month?.toString().replace(/,/g, '')
  ) || 0;

  const total = price * qty * month;

  item.total = total.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  this.calculateGrand();

  this.updateDetailItems();

}
  // calculate(i: number) {

  //   let item = this.items[i];

  //   item.total =

  //     (Number(item.price) || 0) *

  //     (Number(item.qty) || 0) *

  //     (Number(item.month) || 0);

  //   this.calculateGrand();

  //   this.updateDetailItems();

  // }

calculateGrand() {

  this.grandTotal =

    this.items.reduce(

      (sum: number, x: any) =>

        sum + (

          Number(
            x.total?.toString().replace(/,/g, '')
          ) || 0

        ),

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
