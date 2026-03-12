import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-committee',
  templateUrl: './expenseCommittee.component.html',
  styles: ``
})
export class ExpenseCommitteeComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
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
      name: '1.2 ค่าตอบแทนที่ปรึกษา (ทนาย/วิชาชีพ)',
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

  ]

  rateConfig: any = {

    president: 1500,
    committee: 1200,
    subcommittee: 350

  }


  updateRate(item: any) {

    item.rate = this.rateConfig[item.type] || 0

    this.calculate(item)

  }


  calculate(item: any) {

    item.total =
      (Number(item.qty) || 0) *
      (Number(item.times) || 0) *
      (Number(item.rate) || 0)

  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
