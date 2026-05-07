import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-meeting-support',
  templateUrl: './expenseMeetingSupport.component.html',
  styles: ``
})
export class ExpenseMeetingSupportComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  committeeList: any[] = [];

  grandTotal = 0;

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

    this.calculateGrand();

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

      this.addRow();

      return;

    }

    // group ตาม Fk_Request_Detail_Id
    const groupIds =
      [...new Set(
        rows.map(
          (x: any) =>
            x.Fk_Request_Detail_Id
        )
      )];

    this.committeeList = [];

    groupIds.forEach((groupId: any) => {

      const groupRows =
        rows.filter(
          (x: any) =>
            x.Fk_Request_Detail_Id == groupId
        );

      const chairman =
        groupRows.find(
          (x: any) =>
            x.Position_Name == 'ประธาน'
        );

      const committee =
        groupRows.find(
          (x: any) =>
            x.Position_Name ==
            'คณะกรรมการ/คณะอนุกรรมการ'
        );

      const secretary =
        groupRows.find(
          (x: any) =>
            x.Position_Name ==
            'เลขานุการและผู้ช่วยเลขานุการ'
        );

      const item = {

        pairId: groupId,

        committeeName:
          chairman?.Other_Name || '',

        total: 0,

        roles: [

          {
            requestItemId:
              chairman?.Request_Item_Id || 0,

            name: 'ประธาน',

            qty:
              chairman?.People || 0,

            day:
              chairman?.Day || 0,

            rate:
              chairman?.Rate || 0,

            total:
              chairman?.Total || 0
          },

          {
            requestItemId:
              committee?.Request_Item_Id || 0,

            name:
              'คณะกรรมการ/คณะอนุกรรมการ',

            qty:
              committee?.People || 0,

            day:
              committee?.Day || 0,

            rate:
              committee?.Rate || 0,

            total:
              committee?.Total || 0
          },

          {
            requestItemId:
              secretary?.Request_Item_Id || 0,

            name:
              'เลขานุการและผู้ช่วยเลขานุการ',

            qty:
              secretary?.People || 0,

            day:
              secretary?.Day || 0,

            rate:
              secretary?.Rate || 0,

            total:
              secretary?.Total || 0
          }

        ]

      };

      item.total =
        item.roles.reduce(
          (sum: number, r: any) =>
            sum + (Number(r.total) || 0),
          0
        );

      this.committeeList.push(item);

    });

  }

  // =========================
  // เพิ่มรายการ
  // =========================
  addRow() {

    const nextPairId =
      this.committeeList.length > 0
        ? Math.max(
          ...this.committeeList.map(
            x => x.pairId || 0
          )
        ) + 1
        : 1;

    this.committeeList.push({

      pairId: nextPairId,

      committeeName: '',

      roles: [

        {
          requestItemId: 0,
          name: 'ประธาน',
          qty: 0,
          day: 0,
          rate: 0,
          total: 0
        },

        {
          requestItemId: 0,
          name: 'คณะกรรมการ/คณะอนุกรรมการ',
          qty: 0,
          day: 0,
          rate: 0,
          total: 0
        },

        {
          requestItemId: 0,
          name: 'เลขานุการและผู้ช่วยเลขานุการ',
          qty: 0,
          day: 0,
          rate: 0,
          total: 0
        }

      ],

      total: 0

    });

  }

  // =========================
  // ลบ
  // =========================
  removeRow(i: number) {

    this.committeeList.splice(i, 1);

    this.updateDetailItems();

    this.calculateGrand();

  }

  // =========================
  // คำนวณ
  // =========================
  calculate(index: number) {

    const item =
      this.committeeList[index];

    item.total = 0;

    item.roles.forEach((r: any) => {

      r.total =

        (Number(r.qty) || 0) *

        (Number(r.day) || 0) *

        (Number(r.rate) || 0);

      item.total += r.total;

    });

    this.calculateGrand();

    this.updateDetailItems();

  }

  // =========================
  // grand total
  // =========================
  calculateGrand() {

    this.grandTotal =
      this.committeeList.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.total) || 0),
        0
      );

  }

  // =========================
  // sync ลง model กลาง
  // =========================
  updateDetailItems() {

    // ลบ expense นี้ก่อน
    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId
      );

    this.committeeList.forEach((item: any) => {

      item.roles.forEach((role: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            role.requestItemId,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Fk_Request_Detail_Id:
            item.pairId,

          Expense_Detail:
            'ค่าเบี้ยประชุม',

          Position_Name:
            role.name,

          People:
            role.qty,

          Day:
            role.day,

          Rate:
            role.rate,

          Total:
            role.total,

          Other_Name:
            item.committeeName

        });

      });

    });

  }

}