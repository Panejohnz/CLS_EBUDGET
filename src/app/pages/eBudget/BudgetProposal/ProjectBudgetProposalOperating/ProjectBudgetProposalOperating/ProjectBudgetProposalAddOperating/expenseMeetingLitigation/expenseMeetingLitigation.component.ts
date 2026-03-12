import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-meeting-litigation',

  templateUrl: './expenseMeetingLitigation.component.html',
  styles: ``
})
export class ExpenseMeetingLitigationComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  year = 2570

  meetingList: any = [
    {
      name: 'ประธาน (คนนอก)',
      case: 0,
      price: 0,

      committee: 0,

      people: 1,
      rate: 3750,
      times: 5,

      meetingTotal: 0,
      caseCost: 0,
      total: 0
    },

    {
      name: 'ประธาน (คนใน)',
      case: 0,
      price: 0,

      committee: 0,

      people: 1,
      rate: 1875,
      times: 5,

      meetingTotal: 0,
      caseCost: 0,
      total: 0
    },

    {
      name: 'กรรมการ',
      case: 0,
      price: 0,

      committee: 0,

      people: 5,
      rate: 1500,
      times: 5,

      meetingTotal: 0,
      caseCost: 0,
      total: 0
    }
  ]


  calculate(row: any) {

    row.meetingTotal =
      row.people *
      row.rate *
      row.times

    row.caseCost = row.meetingTotal

    row.total =
      row.committee *
      row.caseCost

  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
