import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-office-rent',
  templateUrl: './expenseOfficeRent.component.html',
  styles: ``
})
export class ExpenseOfficeRentComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  rentList: any[] = [];

  // totalArea = '';
  totalRate = 0;
  totalMonth = 0;
  totalYear = 0;

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

      this.rentList = [
        this.newRow()
      ];

      this.calculateGrand();

      return;

    }

    this.rentList = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        asset:
          row.Expense_Detail || '',

        area:
          row.Other_Name || '',

        // pricePerSqm:
        //   row.Rate || 0,

        // monthlyRent:
        //   row.Per_Month || 0,

        // yearlyRent:
        //   row.Per_Year || 0,

 pricePerSqm:
  this.formatNumber(row.Rate),

monthlyRent:
  this.formatNumber(row.Per_Month),

yearlyRent:
  this.formatNumber(row.Per_Year),

        purpose:
          row.Purpose || '',

        file:
          null

      };

    });

    this.calculateGrand();

  }

  newRow() {

    return {

      requestItemId: 0,

      asset: '',

      area: '',

      pricePerSqm: '',

      monthlyRent: '',

      yearlyRent: '',

      purpose: '',

      file: null

    };

  }



  addRow() {

    this.rentList.push(
      this.newRow()
    );

  }
  async removeRow(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.rentList.splice(i, 1);

    this.calculateGrand();

    this.updateDetailItems();

  }

  // calculate(item: any) {

  //   item.monthlyRent =

  //     (Number(item.area) || 0) *

  //     (Number(item.pricePerSqm) || 0);

  //   this.calculateYear(item);

  // }

calculate(item: any) {

  const area = Number(
    item.area?.toString().replace(/,/g, '')
  );

  const rate = Number(
    item.pricePerSqm?.toString().replace(/,/g, '')
  );

  // ถ้ายังกรอกไม่ครบ
  if (!area || !rate) {

    item.monthlyRent = '';
    item.yearlyRent = '';

    this.calculateGrand();

    this.updateDetailItems();

    return;

  }

  const monthly = area * rate;

  item.monthlyRent = monthly.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  this.calculateYear(item);

}
  // calculateYear(item: any) {

  //   item.yearlyRent =

  //     (Number(item.monthlyRent) || 0) * 12;

  //   this.calculateGrand();

  //   this.updateDetailItems();

  // }

calculateYear(item: any) {

  const monthly = Number(
    item.monthlyRent?.toString().replace(/,/g, '')
  ) || 0;

  item.yearlyRent = (monthly * 12).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  this.calculateGrand();

  this.updateDetailItems();

}

  formatNumber(value: any): string {

  if (value === null || value === undefined || value === '') {
    return '';
  }

  return Number(value).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

}

onNumberChange(
  value: string,
  item: any,
  field: string,
  callback: Function,
  callbackItem: any
): void {

  const numericValue = value.replace(/,/g, '');

  item[field] = parseFloat(numericValue) || 0;

  callback.call(this, callbackItem);

}

onInputNumber(event: any, item: any, field: string): void {

  let value = event.target.value;

  // อนุญาตเฉพาะเลขและ .
  value = value.replace(/[^0-9.]/g, '');

  // กัน . ซ้ำ
  const parts = value.split('.');

  if (parts.length > 2) {

    value = parts[0] + '.' + parts[1];

  }

  item[field] = value;

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

  // ใส่ comma เฉพาะตอนมีค่า
  if (integerPart !== '') {

    integerPart = Number(integerPart).toLocaleString('en-US');

  }

  // รวมกลับ
  value = decimalPart !== undefined
    ? `${integerPart}.${decimalPart}`
    : integerPart;

  // set value
  item[field] = value;

  // update input
  event.target.value = value;

}



formatField(item: any, field: string): void {

  let value = item[field];

  if (!value) {

    item[field] = '0.00';
    return;

  }

  value = Number(value.toString().replace(/,/g, ''));

  item[field] = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

}

onYearlyChange(value: string, item: any): void {

  const numericValue = value.replace(/,/g, '');

  item.yearlyRent = parseFloat(numericValue) || 0;

  this.calculateGrand();

  this.updateDetailItems();

}

calculateGrand() {

  this.totalRate =

    this.rentList.reduce(

      (sum: number, i: any) =>

        sum + (

          Number(
            i.pricePerSqm?.toString().replace(/,/g, '')
          ) || 0

        ),

      0

    );

  this.totalMonth =

    this.rentList.reduce(

      (sum: number, i: any) =>

        sum + (

          Number(
            i.monthlyRent?.toString().replace(/,/g, '')
          ) || 0

        ),

      0

    );

  this.totalYear =

    this.rentList.reduce(

      (sum: number, i: any) =>

        sum + (

          Number(
            i.yearlyRent?.toString().replace(/,/g, '')
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
    this.rentList.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.asset,

        Other_Name:
          item.area,

        Rate:
          item.pricePerSqm,

        Per_Month:
          item.monthlyRent,

        Per_Year:
          item.yearlyRent,

        Purpose:
          item.purpose,

        Total:
          item.yearlyRent

      });

    });

  }

  onFileChange(event: any, item: any) {

    item.file =
      event.target.files[0];

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