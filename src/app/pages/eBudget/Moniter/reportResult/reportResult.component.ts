import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-report-result',
  templateUrl: './reportResult.component.html'
})


export class ReportResultComponent {
  constructor(private modalService: NgbModal) { }
  list = [
    {
      no: 1,
      plan: 'แผน A',
      output: 'ผลผลิต A',
      activity: 'กิจกรรม A',
      category: 'งบดำเนินงาน',
      name: 'รายจ่ายประจำ  ',
      planAmount: 100000,
      used: 2000,
      balance: 44000
    }
    , {
      no: 2,
      plan: 'แผน B',
      output: 'ผลผลิต B',
      activity: 'กิจกรรม B',
      category: 'งบดำเนินงาน',
      name: 'โครงการพัฒนาระบบบริหารงานคลัง งบประมาณและสินทรัพย์ สำนักงาน ป.ป.ท.',
      planAmount: 560000,
      used: 86000,
      balance: 10000
    }, {
      no: 3,
      plan: 'แผน C',
      output: 'ผลผลิต C',
      activity: 'กิจกรรม C',
      category: 'งบดำเนินงาน',
      name: 'ค่าครุภัณฑ์คอมพิวเตอร์',
      planAmount: 890000,
      used: 80500,
      balance: 20030
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
          { plan: 0, actual: 0, resbill: 0 },        // ต.ค.
          { plan: 0, actual: 0, resbill: 0 },        // พ.ย.
          { plan: 0, actual: 187750 }    // ธ.ค.
        ],
        // Q2
        [
          { plan: 0, actual: -10475 },   // ม.ค.
          { plan: 188000, actual: 0 },   // ก.พ.
          { plan: 0, actual: 0, resbill: 0 }         // มี.ค.
        ],
        // Q3
        [
          { plan: 0, actual: 0, resbill: 0 },        // เม.ย.
          { plan: 0, actual: 0, resbill: 0 },        // พ.ค.
          { plan: 0, actual: 0, resbill: 0 }         // มิ.ย.
        ],
        // Q4
        [
          { plan: 0, actual: 0, resbill: 0 },        // ก.ค.
          { plan: 0, actual: 0, resbill: 0 },        // ส.ค.
          { plan: 0, actual: 0, resbill: 0 }         // ก.ย.
        ]
      ]
    },

    {
      activity: 'ประชุมติดตามความก้าวหน้าการดำเนินงานตามแผนพัฒนาการกำกับดูแลผลิตภัณฑ์สุขภาพตามมาตรฐานสากล',
      quarters: [
        // Q1
        [
          { plan: 0, actual: 0, resbill: 0 },
          { plan: 0, actual: 0, resbill: 0 },
          { plan: 0, actual: 0, resbill: 0 }
        ],
        // Q2
        [
          { plan: 3800, actual: 0 },
          { plan: 3800, actual: 0 },
          { plan: 3800, actual: 0 }
        ],
        // Q3
        [
          { plan: 0, actual: 0, resbill: 0 },
          { plan: 0, actual: 0, resbill: 0 },
          { plan: 0, actual: 0, resbill: 0 }
        ],
        // Q4
        [
          { plan: 0, actual: 0, resbill: 0 },
          { plan: 0, actual: 0, resbill: 0 },
          { plan: 0, actual: 0, resbill: 0 }
        ]
      ]
    }
  ];
  steps = [
    { no: 1, name: 'ร่าง TOR' },
    { no: 2, name: 'ประกาศ' },
    { no: 3, name: '' },
    { no: 4, name: '' },
    { no: 5, name: '' },
    { no: 6, name: '' },
    { no: 7, name: '' },
    { no: 8, name: '' },
    { no: 9, name: '' }
  ];
  status = '';
  noteOk = '';
  noteNotOk = '';
  output = '';
  outcome = '';

  target = 100;

  isAchieve = false;
  isNotAchieve = false;

  progress = 0;

  problem = '';
  solution = '';
  summary = '';
  suggest = '';
  createQuarter() {
    return [
      { plan: 0, actual: 0, resbill: 0 },
      { plan: 0, actual: 0, resbill: 0 },
      { plan: 0, actual: 0, resbill: 0 }
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
  openMonthModal(modal: any, item: any, qIndex: number, mIndex: number) {
    this.selectedMonth = {
      item,
      quarterIndex: qIndex,
      monthIndex: mIndex
    };

    this.modalService.open(modal, {
      backdrop: 'static'
    });
  }
  closeMonthDetail() {
    this.selectedMonth = null;
  }
  selectedItem: any
  modalRef: any
  fullModal(modal: any, data: any) {
    this.selectedItem = data;

    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }
  fullModalreport(modal: any, data: any) {

    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-75'
    });
  }
  reportSteps = [
    { label: 'จัดทำคณะกรรมการร่าง TOR', checked: false },
    { label: 'TOR', checked: false },
    { label: 'ประกาศราคากลาง', checked: false },
    { label: 'จัดทำแผน', checked: false },
    { label: 'จัดทำรายงานขอซื้อขอจ้างและตั้งคณะกรรมการ', checked: false },
    { label: 'เผยแพร่ร่าง TOR', checked: false },
    { label: 'ขออนุมัติประกาศเชิญชวน', checked: false },
    { label: 'เผยแพร่ประกาศเชิญชวน', checked: false },
    { label: 'เสนอราคา', checked: false },
    { label: 'พิจารณาผล', checked: false },
    { label: 'แจ้งผลพิจารณา', checked: false },
    { label: 'อนุมัติสั่งซื้อสั่งจ้าง', checked: false },
    { label: 'เผยแพร่ประกาศผู้ชนะ', checked: false },
    { label: 'ผูกพันงบประมาณ(PO)', checked: false },
    { label: 'ใบสั่งซื้อสั่งจ้าง/สัญญา', checked: false },
    { label: 'ตรวจรับ', checked: false },
    { label: 'ทะเบียนคุมสินทรัพย์', checked: false },
    { label: 'จบโครงการ', checked: false }
  ];

  saveReport(modal: any) {
    const checkedList = this.reportSteps
      .filter(x => x.checked)
      .map(x => x.label);

    console.log('ที่เลือก:', checkedList);

    modal.close(); // 🔥 ปิด modal
  }

}
