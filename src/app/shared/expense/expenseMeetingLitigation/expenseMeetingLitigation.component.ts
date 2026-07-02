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
  Mas_Expense_Detial_Rate_List: any[] = [];

  // =========================
  // init
  // =========================
  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.loadExpenseRates();

  }

  closeModal() {

    this.model.dismiss();

  }

  loadExpenseRates() {
    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Rate",
      Fk_Expense_Id: this.model.selectedExpenseTypeId
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        const expenseRateList =
          response.List_Mas_Expense_Rate;

        this.Mas_Expense_Detial_Rate_List =
          Array.isArray(expenseRateList)
            ? expenseRateList
            : [];

        this.bindData();
        this.applyMasterRates();
      });
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

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  private getRowRate(row: any): number {
    return Number(
      row?.Expense_Rate ??
      row?.Rate ??
      row?.Price ??
      row?.Total ??
      0
    ) || 0;
  }

  private getRateRowText(row: any): string {
    return this.normalizeText([
      row?.Expense_Detail,
      row?.Expense_Name,
      row?.Expense_Short_Name,
      row?.Expense_Detial_Name,
      row?.Expense_Detial_Short_Name,
      row?.Rate_Name,
      row?.Type_Name,
      row?.Position_Name,
      row?.Code
    ].filter(Boolean).join(' '));
  }

  private findRateRowForMeeting(row: any, index: number): any {
    const rowName = this.normalizeText(row?.name);
    const byName = this.Mas_Expense_Detial_Rate_List.find((rateRow: any) => {
      const rateText = this.getRateRowText(rateRow);

      return rateText &&
        (
          rowName.includes(rateText) ||
          rateText.includes(rowName) ||
          (rowName.includes('ประธาน') && rowName.includes('คนนอก') && rateText.includes('ประธาน') && rateText.includes('คนนอก')) ||
          (rowName.includes('ประธาน') && rowName.includes('คนใน') && rateText.includes('ประธาน') && rateText.includes('คนใน')) ||
          (rowName.includes('กรรมการ') && rateText.includes('กรรมการ'))
        );
    });

    return byName ?? this.Mas_Expense_Detial_Rate_List[index];
  }

  private applyMasterRates() {
    this.meetingList.forEach((row: any, index: number) => {
      if (Number(row.rate) > 0 && Number(row.requestItemId) > 0) {
        return;
      }

      const rateRow = this.findRateRowForMeeting(row, index);

      if (rateRow) {
        row.rate = this.getRowRate(rateRow);
        this.calculate(row);
      }
    });
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

    // รวมเบี้ยประชุม
    row.meetingTotal =
      times  * rate;

    // ค่าใช้จ่ายต่อคดี
    row.caseCost =
      people * times * rate;

    // รวมทั้งสิ้น
    row.total =
      committee * row.caseCost;

    this.calculateGrandTotal();
    this.updateDetailItems();

  }
  calculateGrandTotal() {

    this.grandTotal =
      this.meetingList.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.total) || 0),
        0
      );

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
  onRateChange(value: any, row: any) {

    const numberValue =
      String(value).replace(/,/g, '');

    row.rate =
      Number(numberValue) || 0;

    this.calculate(row);

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
