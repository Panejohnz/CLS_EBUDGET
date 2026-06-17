import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

interface ExpenseItem {

  requestItemId?: number;

  pairId?: number;

  name: string;

  type: string;

  qty: number;

  times: number;

  rate: number;

  total: number;

}

interface Section {

  title: string;

  items: ExpenseItem[];

}

@Component({
  selector: 'app-expense-committee',
  templateUrl: './expenseCommittee.component.html',
  styles: ``
})
export class ExpenseCommitteeComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  // =========================
  // sections
  // =========================
  sections: Section[] = [

    {
      title:
        '1. ค่าตอบแทนบุคคลหรือคณะกรรมการกำหนดคุณลักษณะ',

      items: []
    },

    {
      title:
        '2. ค่าตอบแทนบุคคลหรือคณะกรรมการตรวจรับพัสดุ',

      items: []
    },

    {
      title:
        '3. ค่าตอบแทนบุคคลหรือคณะกรรมการพิจารณาผลการประกวดราคาอิเล็กทรอนิกส์',

      items: []
    },

    {
      title:
        '4. ค่าตอบแทนบุคคลหรือคณะกรรมการอื่นๆ',

      items: []
    }

  ];
  rateConfig: any = {

    1: 1500,

    2: 1200,

    3: 350

  };
  Mas_Expense_Detial_Rate_List: any[] = [];

  grandTotal = 0;

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

        this.applyRateConfig();
        this.bindData();
      });
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
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

  private getRowRate(row: any): number {
    return Number(
      row?.Expense_Rate ??
      row?.Rate ??
      row?.Price ??
      row?.Total ??
      0
    ) || 0;
  }

  private findRateRowByType(type: string, fallbackIndex: number): any {
    const byName = this.Mas_Expense_Detial_Rate_List.find((row: any) => {
      const text = this.getRateRowText(row);

      if (type === '1') {
        return text.includes('ประธาน') || text.includes('chairman');
      }

      if (type === '2') {
        return (text.includes('กรรมการ') && !text.includes('คณะกรรมการ')) ||
          text.includes('committee');
      }

      if (type === '3') {
        return text.includes('คณะกรรมการ') || text.includes('board');
      }

      return false;
    });

    return byName ?? this.Mas_Expense_Detial_Rate_List[fallbackIndex];
  }

  private applyRateConfig() {
    const chairmanRate = this.findRateRowByType('1', 0);
    const committeeRate = this.findRateRowByType('2', 1);
    const boardRate = this.findRateRowByType('3', 2);

    if (chairmanRate) {
      this.rateConfig[1] = this.getRowRate(chairmanRate);
    }

    if (committeeRate) {
      this.rateConfig[2] = this.getRowRate(committeeRate);
    }

    if (boardRate) {
      this.rateConfig[3] = this.getRowRate(boardRate);
    }
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
      return;
    }

    // clear ก่อน
    this.sections.forEach((s: any) => {

      s.items = [];

    });

    rows.forEach((row: any) => {

      const section =
        this.sections.find(
          (s: any) =>
            s.title == row.Expense_Detail
        );

      if (!section) return;

      section.items.push({

        requestItemId:
          row.Request_Item_Id || 0,

        pairId:
          row.Fk_Request_Detail_Id || 0,

        name:
          row.Other_Name || '',

        type:
          row.Position_Id || '',

        qty:
          row.People || 0,

        times:
          row.Times || 0,

        rate:
          row.Rate || 0,

        total:
          row.Total || 0

      });

    });

    this.sections.forEach((section: any) => {
      section.items.forEach((item: any) => {
        if ((!Number(item.rate)) && item.type) {
          item.rate = this.rateConfig[item.type] || 0;
          this.calculate(item);
        }
      });
    });
    this.model.Total = this.grandTotal;
    this.calculateGrand();

  }

  // =========================
  // add item
  // =========================
  addItem(section: any) {

    const nextPairId =
      Date.now();

    section.items.push({

      requestItemId: 0,

      pairId: nextPairId,

      name: '',

      type: '',

      qty: 0,

      times: 0,

      rate: 0,

      total: 0

    });
  }
  async removeItem(section: any, item: any) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    section.items =
      section.items.filter(
        (i: any) => i !== item
      );

    this.calculateGrand();

    this.updateDetailItems();

  }

  calculate(item: any) {

    item.total =

      (Number(item.qty) || 0) *

      (Number(item.times) || 0) *

      (Number(item.rate) || 0);

    this.calculateGrand();

    this.updateDetailItems();

  }
  updateRate(item: any) {

    item.rate =
      this.rateConfig[item.type] || 0;

    this.calculate(item);

  }
  getSectionTotal(section: any) {

    return section.items.reduce(

      (sum: number, item: any) =>

        sum + (Number(item.total) || 0),

      0

    );

  }
  calculateGrand() {

    this.grandTotal = 0;

    this.sections.forEach((section: any) => {

      this.grandTotal +=
        this.getSectionTotal(section);

    });

  }

  updateDetailItems() {

    // ลบ expense type นี้ก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // push ใหม่
    this.sections.forEach((section: any) => {

      section.items.forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Fk_Request_Detail_Id:
            0,

          Expense_Detail:
            section.title,

          // ชื่อรายการ
          Other_Name:
            item.name,

          // ประเภท
          Position_Id:
            item.type,

          // แสดงชื่อ type
          Position_Name:
            this.getTypeName(item.type),

          People:
            item.qty,

          Times:
            item.times,

          Rate:
            item.rate,

          Total:
            item.total

        });

      });

    });
    this.model.Total = this.grandTotal;
  }

  getTypeName(type: string): string {

    switch (type) {

      case '1':
        return 'ประธาน';

      case '2':
        return 'กรรมการ';

      case '3':
        return 'คณะกรรมการ';

      default:
        return '';

    }

  }

}
