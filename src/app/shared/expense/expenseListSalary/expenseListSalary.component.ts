import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-list-salary',
  templateUrl: './expenseListSalary.component.html',
  styles: ``
})
export class ExpenseListSalaryComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  totalQty: number = 0;

  totalAmount: number = 0;

  file: any = null;

  ngOnInit() {

    if (!this.model) return;

    this.bindData();

    this.calculateAll();

  }
  onAmountChange(value: any, field: string) {

    // ลบ comma
    const numberValue = String(value)
      .replace(/,/g, '');

    this.model[field] =
      Number(numberValue) || 0;

    if (field == 'oldYear') {

      this.calculateRowOld();

    }

    if (field == 'newYear') {

      this.calculateRowNew();

    }

  }
  closeModal() {

    this.model.dismiss();

  }
  oldRequestItemId: number = 0;

  newRequestItemId: number = 0;
  bindData() {

    if (!this.model.Budget_Request_Detail_Item) return;

    const oldData =
      this.model.Budget_Request_Detail_Item.find(
        (x: any) =>
          x.Fk_Expense_Id == this.model.selectedExpenseTypeId &&
          x.Expense_Detail == 'อัตราเดิม'
      );

    const newData =
      this.model.Budget_Request_Detail_Item.find(
        (x: any) =>
          x.Fk_Expense_Id == this.model.selectedExpenseTypeId &&
          x.Expense_Detail == 'อัตราใหม่'
      );

    this.oldRequestItemId =
      oldData?.Request_Item_Id || 0;

    this.newRequestItemId =
      newData?.Request_Item_Id || 0;

    this.model.oldQty =
      oldData?.Quantity || 0;

    this.model.oldMonth =
      oldData?.Per_Month || 0;

    this.model.oldYear =
      oldData?.Per_Year || 0;

    this.model.newQty =
      newData?.Quantity || 0;

    this.model.newMonth =
      newData?.Per_Month || 0;

    this.model.newYear =
      newData?.Per_Year || 0;

    this.model.Total = this.totalAmount

  }

  // คำนวณรวม footer
  updateSummary() {

    this.totalQty =
      (Number(this.model.oldQty) || 0) +
      (Number(this.model.newQty) || 0);

    this.totalAmount =
      (Number(this.model.oldYear) || 0) +
      (Number(this.model.newYear) || 0);
    this.model.Total = this.totalAmount;
  }

  // คำนวณอัตราเดิม
  calculateRowOld() {

    const qty =
      Number(this.model.oldQty) || 0;

    const month =
      Number(this.model.oldMonth) || 0;

    // expense type 5 = รายเดือน x 12
    if (this.model.selectedExpenseTypeId == 5) {

      this.model.oldYear =
        qty * month * 12;

    }

    this.updateSummary();

    this.updateDetailItems();

  }

  // คำนวณอัตราใหม่
  calculateRowNew() {

    const qty =
      Number(this.model.newQty) || 0;

    const month =
      Number(this.model.newMonth) || 0;

    // expense type 5 = รายเดือน x 12
    if (this.model.selectedExpenseTypeId == 5) {

      this.model.newYear =
        qty * month * 12;

    }

    this.updateSummary();

    this.updateDetailItems();

  }

  // ใช้ตอน init / edit
  calculateAll() {

    if (this.model.selectedExpenseTypeId == 5) {

      this.model.oldYear =
        (Number(this.model.oldQty) || 0) *
        (Number(this.model.oldMonth) || 0) *
        12;

      this.model.newYear =
        (Number(this.model.newQty) || 0) *
        (Number(this.model.newMonth) || 0) *
        12;

    }

    this.updateSummary();

    this.updateDetailItems();

  }

  // sync ลง array กลาง
  updateDetailItems() {

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    // ลบของ expense type นี้ก่อน
    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id != this.model.selectedExpenseTypeId
      );

    this.model.Budget_Request_Detail_Item.push(

      {
        Request_Item_Id:
          this.oldRequestItemId,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          'อัตราเดิม',

        Quantity:
          this.model.oldQty,

        Per_Month:
          this.model.oldMonth,

        Per_Year:
          this.model.oldYear,

        Total:
          this.model.oldYear
      },

      {
        Request_Item_Id:
          this.newRequestItemId,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          'อัตราใหม่',

        Quantity:
          this.model.newQty,

        Per_Month:
          this.model.newMonth,

        Per_Year:
          this.model.newYear,

        Total:
          this.model.newYear
      }

    );

  }

  onFileChange(event: any) {

    this.file = event.target.files[0];

    console.log(this.file);

  }

}