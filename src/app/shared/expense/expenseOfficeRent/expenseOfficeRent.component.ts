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

  totalArea = 0;
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
          row.Quantity || 0,

        pricePerSqm:
          row.Rate || 0,

        monthlyRent:
          row.Per_Month || 0,

        yearlyRent:
          row.Per_Year || 0,

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

      area: 0,

      pricePerSqm: 0,

      monthlyRent: 0,

      yearlyRent: 0,

      purpose: '',

      file: null

    };

  }

  addRow() {

    this.rentList.push(
      this.newRow()
    );

  }

  removeRow(i: number) {

    this.rentList.splice(i, 1);

    this.calculateGrand();

    this.updateDetailItems();

  }

  calculate(item: any) {

    item.monthlyRent =

      (Number(item.area) || 0) *

      (Number(item.pricePerSqm) || 0);

    this.calculateYear(item);

  }

  calculateYear(item: any) {

    item.yearlyRent =

      (Number(item.monthlyRent) || 0) * 12;

    this.calculateGrand();

    this.updateDetailItems();

  }

  calculateGrand() {

    this.totalArea =

      this.rentList.reduce(

        (sum: number, i: any) =>

          sum + (Number(i.area) || 0),

        0

      );

    this.totalRate =

      this.rentList.reduce(

        (sum: number, i: any) =>

          sum + (Number(i.pricePerSqm) || 0),

        0

      );

    this.totalMonth =

      this.rentList.reduce(

        (sum: number, i: any) =>

          sum + (Number(i.monthlyRent) || 0),

        0

      );

    this.totalYear =

      this.rentList.reduce(

        (sum: number, i: any) =>

          sum + (Number(i.yearlyRent) || 0),

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

        Quantity:
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