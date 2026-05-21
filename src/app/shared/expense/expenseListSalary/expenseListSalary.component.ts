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

  totalOldAmount: number = 0;

  totalNewAmount: number = 0;

  totalBalance: number = 0;

  percentOld: number = 0;

  percentNew: number = 0;

  file: any = null;

  oldRequestItemId: number = 0;

  newRequestItemId: number = 0;

  ngOnInit() {

    if (!this.model) return;

    this.bindData();

    this.calculateAll();

  }

  /* =========================
      CLOSE
  ========================= */

  closeModal() {

    this.model.dismiss();

  }

  /* =========================
      BIND DATA
  ========================= */

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

  }

  /* =========================
      SUMMARY
  ========================= */

  updateSummary() {

    this.totalQty =
      (Number(this.model.oldQty) || 0) +
      (Number(this.model.newQty) || 0);

    this.totalOldAmount =
      (Number(this.model.oldYear) || 0);

    this.totalNewAmount =
      (Number(this.model.newYear) || 0);

    this.totalAmount =
      this.totalOldAmount +
      this.totalNewAmount;

    this.model.Total =
      this.totalAmount;

    // ส่วนต่าง
    this.totalBalance =
      this.totalNewAmount -
      this.totalOldAmount;

    // %
    this.percentOld =
      this.calculatePercent(
        this.totalOldAmount,
        this.totalAmount
      );

    this.percentNew =
      this.calculatePercent(
        this.totalNewAmount,
        this.totalAmount
      );

  }

  /* =========================
      CALCULATE %
  ========================= */

  calculatePercent(
    value: number,
    total: number
  ): number {

    if (total <= 0) {

      return 0;

    }

    return (value / total) * 100;

  }

  /* =========================
      CALCULATE OLD
  ========================= */

  calculateRowOld() {

    const qty =
      Number(this.model.oldQty) || 0;

    const month =
      Number(this.model.oldMonth) || 0;

    // รายเดือน
    if (this.model.selectedExpenseTypeId == 5) {

      this.model.oldYear =
        qty * month * 12;

    }
    else {

      this.model.oldYear =
        qty * month;

    }

    this.validateNegative();

    this.updateSummary();

    this.updateDetailItems();

  }

  /* =========================
      CALCULATE NEW
  ========================= */

  calculateRowNew() {

    const qty =
      Number(this.model.newQty) || 0;

    const month =
      Number(this.model.newMonth) || 0;

    // รายเดือน
    if (this.model.selectedExpenseTypeId == 5) {

      this.model.newYear =
        qty * month * 12;

    }
    else {

      this.model.newYear =
        qty * month;

    }

    this.validateNegative();

    this.updateSummary();

    this.updateDetailItems();

  }

  /* =========================
      CALCULATE ALL
  ========================= */

  calculateAll() {

    const oldQty =
      Number(this.model.oldQty) || 0;

    const oldMonth =
      Number(this.model.oldMonth) || 0;

    const newQty =
      Number(this.model.newQty) || 0;

    const newMonth =
      Number(this.model.newMonth) || 0;

    if (this.model.selectedExpenseTypeId == 5) {

      this.model.oldYear =
        oldQty * oldMonth * 12;

      this.model.newYear =
        newQty * newMonth * 12;

    }
    else {

      this.model.oldYear =
        oldQty * oldMonth;

      this.model.newYear =
        newQty * newMonth;

    }

    this.validateNegative();

    this.updateSummary();

    this.updateDetailItems();

  }

  /* =========================
      VALIDATE
  ========================= */

  validateNegative() {

    if (this.model.oldQty < 0) {

      this.model.oldQty = 0;

    }

    if (this.model.newQty < 0) {

      this.model.newQty = 0;

    }

    if (this.model.oldMonth < 0) {

      this.model.oldMonth = 0;

    }

    if (this.model.newMonth < 0) {

      this.model.newMonth = 0;

    }

  }

  /* =========================
      AUTO FILL
  ========================= */

  copyOldToNew() {

    this.model.newQty =
      this.model.oldQty;

    this.model.newMonth =
      this.model.oldMonth;

    this.calculateRowNew();

  }

  /* =========================
      RESET
  ========================= */

  resetForm() {

    this.model.oldQty = 0;
    this.model.oldMonth = 0;
    this.model.oldYear = 0;

    this.model.newQty = 0;
    this.model.newMonth = 0;
    this.model.newYear = 0;

    this.updateSummary();

    this.updateDetailItems();

  }

  /* =========================
      SAVE ARRAY
  ========================= */

  updateDetailItems() {

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    // ลบของ expense type เดิม
    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id != this.model.selectedExpenseTypeId
      );

    // push อัตราเดิม
    this.model.Budget_Request_Detail_Item.push({

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

    });

    // push อัตราใหม่
    this.model.Budget_Request_Detail_Item.push({

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

    });

  }

  /* =========================
      FILE
  ========================= */

  onFileChange(event: any) {

    this.file =
      event.target.files[0];

    console.log(this.file);

  }

  /* =========================
      SAVE
  ========================= */

  saveData() {

    if (this.totalAmount <= 0) {

      alert('กรุณากรอกข้อมูล');

      return;

    }

    console.log(this.model);

    alert('บันทึกสำเร็จ');

  }

}