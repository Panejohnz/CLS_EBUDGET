import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-meeting-litigation',
  templateUrl: './expenseMeetingLitigation.component.html',
  styles: ``
})
export class ExpenseMeetingLitigationComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  year = 2570;

  grandTotal = 0;

  meetingList: any[] = [];

  // =========================
  // init
  // =========================
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

  // =========================
  // โหลดข้อมูลตอน edit
  // =========================
  bindData() {

    const rows =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId
      );

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.meetingList = [

        {
          requestItemId: 0,

          name: 'ประธาน (คนนอก)',

          committee: null,

          people: null,

          rate: null,

          times: null,

          meetingTotal: 0,

          caseCost: 0,

          total: 0
        },

        {
          requestItemId: 0,

          name: 'ประธาน (คนใน)',

          committee: null,

          people: null,

          rate: null,

          times: null,

          meetingTotal: 0,

          caseCost: 0,

          total: 0
        },

        {
          requestItemId: 0,

          name: 'กรรมการ',

          committee: null,

          people: null,

          rate: null,

          times: null,

          meetingTotal: 0,

          caseCost: 0,

          total: 0
        }

      ];

      this.meetingList.forEach(
        (row: any) =>
          this.calculate(row)
      );

      return;

    }

    // ตอน edit
    this.meetingList =
      rows.map((x: any) => ({

        requestItemId:
          x.Request_Item_Id || 0,

        name:
          x.Position_Name || '',

        committee:
          x.Quantity || 0,

        people:
          x.People || 0,

        times:
          x.Times || 0,

        rate:
          x.Rate || 0,

        meetingTotal:
          x.Budget_Amount || 0,

        caseCost:
          x.Price || 0,

        total:
          x.Total || 0

      }));

    this.calculateGrand();

  }

  // =========================
  // คำนวณ
  // =========================
  calculate(row: any) {

    const committee =
      Number(row.committee) || 0;

    const people =
      Number(row.people) || 0;

    const times =
      Number(row.times) || 0;

    const rate =
      Number(row.rate) || 0;

    // สูตรหลัก
    row.meetingTotal =

      committee *

      people *

      times *

      rate;

    // ค่าใช้จ่ายต่อคดี
    row.caseCost =
      row.meetingTotal;

    // รวมทั้งหมด
    row.total =
      row.caseCost;

    this.calculateGrand();

    this.updateDetailItems();

  }

  // =========================
  // grand total
  // =========================
  calculateGrand() {

    this.grandTotal =
      this.meetingList.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.total) || 0),
        0
      );

  }

  // =========================
  // sync ลง model กลาง
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
    this.meetingList.forEach((row: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          row.requestItemId,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          'ค่าเบี้ยประชุมดำเนินคดี',

        Position_Name:
          row.name,

        Quantity:
          row.committee,

        People:
          row.people,

        Times:
          row.times,

        Rate:
          row.rate,

        Budget_Amount:
          row.meetingTotal,

        Price:
          row.caseCost,

        Total:
          row.total

      });

    });

  }

}
