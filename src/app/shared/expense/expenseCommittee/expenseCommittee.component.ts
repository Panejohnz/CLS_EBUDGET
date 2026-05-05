import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

interface ExpenseItem {
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
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.model.dismiss();
  }
  sections: Section[] = [
    {
      title: '1. ค่าตอบแทนบุคคลหรือคณะกรรมการกำหนดคุณลักษณะ',
      items: []
    },
    {
      title: '2. ค่าตอบแทนบุคคลหรือคณะกรรมการตรวจรับพัสดุ',
      items: []
    },
    {
      title: '3. ค่าตอบแทนบุคคลหรือคณะกรรมการพิจารณาผลการประกวดราคาอิเล็กทรอนิกส์',
      items: []
    },
    {
      title: '4. ค่าตอบแทนบุคคลหรือคณะกรรมการอื่นๆ',
      items: []
    }
  ];
  expenseList: any = [

    {
      name: '1.1 ค่าตอบแทนที่ปรึกษา (หัวหน้า/ผู้จัดการ)',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    },

    {
      name: '1.2 ค่าตอบแทนที่ปรึกษา (ทปษ/ผชช)',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    },
    {
      name: '1.3 ค่าตอบแทนที่ปรึกษา (นักวิจัย นักวิเคราะห์)',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    },
    {
      name: '2.1 ค่าตอบแทนบุคลากรสนับสนุน',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    }
    ,
    {
      name: '2.2 เลขานุการโครงการ',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    },
    {
      name: '2.3 พนักงานพิมพ์ดีด/เจ้าหน้าที่บันทึกข้อมูล',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    }
  ]

  rateConfig: any = {

    president: 1500,
    committee: 1200,
    subcommittee: 350

  }

  addItem(section: any) {
    section.items.push({
      name: '',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    })
  }

  removeItem(section: any, item: any) {
    section.items = section.items.filter((i: any) => i !== item)
  }

  calculate(item: any) {
    item.total = (item.qty || 0) * (item.times || 0) * (item.rate || 0)
  }
  updateRate(item: any) {

    item.rate = this.rateConfig[item.type] || 0

    this.calculate(item)

  }


  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.model.dismiss();

    }
  }
}
