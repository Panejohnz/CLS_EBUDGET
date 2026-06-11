import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-ot',
  templateUrl: './expenseOT.component.html',
  styles: ``
})
export class ExpenseOTComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  // =========================
  // table ui
  // =========================
  foodList: any[] = [];

  // =========================
  // rate
  // =========================
  workRate: number = 50;

  holidayRate: number = 60;

  // =========================
  // summary
  // =========================
  totalWork: number = 0;

  totalHoliday: number = 0;

  grandTotal: number = 0;

  // =========================
  // note
  // =========================
  note: string = '';

  // =========================
  // init
  // =========================
  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

    this.calculateTotal();

  }

  // =========================
  // bind edit data
  // =========================
  bindData() {

    const rows =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId
      );

    if (rows.length == 0) {

      this.addRow();

      return;

    }

    // group ตาม pair id
    const groupIds =
      [...new Set(
        rows.map(
          (x: any) =>
            x.Fk_Request_Detail_Id
        )
      )];

    this.foodList = [];

    groupIds.forEach((groupId: any) => {

      const workRow =
        rows.find(
          (x: any) =>
            x.Fk_Request_Detail_Id == groupId &&
            x.Expense_Detail == 'วันทำการ'
        );

      const holidayRow =
        rows.find(
          (x: any) =>
            x.Fk_Request_Detail_Id == groupId &&
            x.Expense_Detail == 'วันหยุด'
        );

      this.foodList.push({

        pairId: groupId,
        note: workRow.Reson,
        workRequestItemId:
          workRow?.Request_Item_Id || 0,

        holidayRequestItemId:
          holidayRow?.Request_Item_Id || 0,

        // วันทำการ
        workPerson:
          workRow?.People || 0,

        workDay:
          workRow?.Day || 0,

        workHour:
          workRow?.Hour || 0,

        workTotal:
          workRow?.Total || 0,

        // วันหยุด
        holidayPerson:
          holidayRow?.People || 0,

        holidayDay:
          holidayRow?.Day || 0,

        holidayHour:
          holidayRow?.Hour || 0,

        holidayTotal:
          holidayRow?.Total || 0

      });

      // rate ล่าสุด
      if (workRow?.Rate) {

        this.workRate =
          workRow.Rate;

      }

      if (holidayRow?.Rate) {

        this.holidayRate =
          holidayRow.Rate;

      }

    });

  }

  // =========================
  // add row
  // =========================
  addRow() {

    const nextPairId =
      this.foodList.length > 0
        ? Math.max(
          ...this.foodList.map(
            x => x.pairId || 0
          )
        ) + 1
        : 1;

    this.foodList.push({

      pairId: nextPairId,
      note: '',
      workRequestItemId: 0,

      holidayRequestItemId: 0,

      // วันทำการ
      workPerson: 0,
      workDay: 0,
      workHour: 0,
      workTotal: 0,

      // วันหยุด
      holidayPerson: 0,
      holidayDay: 0,
      holidayHour: 0,
      holidayTotal: 0

    });

  }

  // =========================
  // remove row
  // =========================
  async removeRow(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.foodList.splice(i, 1);

    this.updateDetailItems();

    this.calculateTotal();

  }

  // =========================
  // calculate row
  // =========================
  calculate(i: number) {

    const row =
      this.foodList[i];

    // วันทำการ
    row.workTotal =

      (Number(row.workPerson) || 0) *

      (Number(row.workDay) || 0) *

      (Number(row.workHour) || 0) *

      this.workRate;

    // วันหยุด
    row.holidayTotal =

      (Number(row.holidayPerson) || 0) *

      (Number(row.holidayDay) || 0) *

      (Number(row.holidayHour) || 0) *

      this.holidayRate;

    this.calculateTotal();

    this.updateDetailItems();

  }

  // =========================
  // summary
  // =========================
  calculateTotal() {

    this.totalWork =
      this.foodList.reduce(
        (sum: number, r: any) =>
          sum + (Number(r.workTotal) || 0),
        0
      );

    this.totalHoliday =
      this.foodList.reduce(
        (sum: number, r: any) =>
          sum + (Number(r.holidayTotal) || 0),
        0
      );

    this.grandTotal =
      this.totalWork +
      this.totalHoliday;

  }

  // =========================
  // sync เข้า model กลาง
  // =========================
  updateDetailItems() {

    // ลบ expense type นี้ก่อน
    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId
      );

    // push ใหม่
    this.foodList.forEach((row: any) => {

      // =====================
      // วันทำการ
      // =====================
      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          row.workRequestItemId,
        Reson:
          row.note,
        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Fk_Request_Detail_Id:
          row.pairId,

        Expense_Detail:
          'วันทำการ',

        People:
          row.workPerson,

        Day:
          row.workDay,

        Hour:
          row.workHour,

        Rate:
          this.workRate,

        Total:
          row.workTotal

      });

      // =====================
      // วันหยุด
      // =====================
      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          row.holidayRequestItemId,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Fk_Request_Detail_Id:
          row.pairId,

        Expense_Detail:
          'วันหยุด',

        People:
          row.holidayPerson,

        Day:
          row.holidayDay,

        Hour:
          row.holidayHour,

        Rate:
          this.holidayRate,

        Total:
          row.holidayTotal

      });

    });

  }

  // =========================
  // modal rate
  // =========================
  openRateModal(content: any) {

    this.modalService.open(content, {

      size: 'md',

      backdrop: 'static',

      centered: true

    });

  }

  closeModal() {

    this.model.dismiss();

  }
  limitNumber(
    item: any,
    field: string,
    min: number,
    max: number
  ) {

    item[field] =
      Math.min(
        Math.max(Number(item[field]) || 0, min),
        max
      );

  }
}