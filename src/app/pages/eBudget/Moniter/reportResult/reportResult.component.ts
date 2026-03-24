import { Component } from '@angular/core';

@Component({
  selector: 'app-report-result',
  templateUrl: './reportResult.component.html'
})
export class ReportResultComponent {
  list = [
    {
      no: 1,
      plan: 'แผน A',
      output: 'ผลผลิต A',
      activity: 'กิจกรรม A',
      category: 'งบดำเนินงาน',
      name: 'รายการ A',
      planAmount: 100000,
      used: 80000,
      balance: 20000
    }
  ];

  selected: any;
  div = false
  selectItem(item: any) {
    this.selected = item;
    this.div = true
  }
  months = ['ต.ค.', 'พ.ย.', 'ธ.ค.'];

  list2 = [
    {
      activity: 'ประชุมเชิงปฏิบัติการพัฒนามาตรการกำกับดูแลผลิตภัณฑ์สุขภาพและการติดตามหลังออกสู่ตลาดตามแนวทาง WHO GBT',
      quarters: [
        // Q1
        [
          { plan: 0, actual: 0 },        // ต.ค.
          { plan: 0, actual: 0 },        // พ.ย.
          { plan: 0, actual: 187750 }    // ธ.ค.
        ],
        // Q2
        [
          { plan: 0, actual: -10475 },   // ม.ค.
          { plan: 188000, actual: 0 },   // ก.พ.
          { plan: 0, actual: 0 }         // มี.ค.
        ],
        // Q3
        [
          { plan: 0, actual: 0 },        // เม.ย.
          { plan: 0, actual: 0 },        // พ.ค.
          { plan: 0, actual: 0 }         // มิ.ย.
        ],
        // Q4
        [
          { plan: 0, actual: 0 },        // ก.ค.
          { plan: 0, actual: 0 },        // ส.ค.
          { plan: 0, actual: 0 }         // ก.ย.
        ]
      ]
    },

    {
      activity: 'ประชุมติดตามความก้าวหน้าการดำเนินงานตามแผนพัฒนาการกำกับดูแลผลิตภัณฑ์สุขภาพตามมาตรฐานสากล',
      quarters: [
        // Q1
        [
          { plan: 0, actual: 0 },
          { plan: 0, actual: 0 },
          { plan: 0, actual: 0 }
        ],
        // Q2
        [
          { plan: 3800, actual: 0 },
          { plan: 3800, actual: 0 },
          { plan: 3800, actual: 0 }
        ],
        // Q3
        [
          { plan: 0, actual: 0 },
          { plan: 0, actual: 0 },
          { plan: 0, actual: 0 }
        ],
        // Q4
        [
          { plan: 0, actual: 0 },
          { plan: 0, actual: 0 },
          { plan: 0, actual: 0 }
        ]
      ]
    }
  ];

  status = '';
  noteOk = '';
  noteNotOk = '';

  createQuarter() {
    return [
      { plan: 0, actual: 0 },
      { plan: 0, actual: 0 },
      { plan: 0, actual: 0 }
    ];
  }

  getTotalPlan(item: any) {
    return item.quarters.flat().reduce((s: any, x: any) => s + (+x.plan || 0), 0);
  }

  getTotalActual(item: any) {
    return item.quarters.flat().reduce((s: any, x: any) => s + (+x.actual || 0), 0);
  }

  getGrandPlan() {
    return this.list2.reduce((s: any, i: any) => s + this.getTotalPlan(i), 0);
  }

  getGrandActual() {
    return this.list2.reduce((s: any, i: any) => s + this.getTotalActual(i), 0);
  }

  onStatusChange() {
    this.noteOk = '';
    this.noteNotOk = '';
  }
    selectedMonth: any = null;
  openMonthDetail(item: any, rowIndex: number, monthIndex: number) {
    this.selectedMonth = {
      item,
      rowIndex,
      monthIndex
    };
  }
  closeMonthDetail() {
    this.selectedMonth = null;
  }
}
