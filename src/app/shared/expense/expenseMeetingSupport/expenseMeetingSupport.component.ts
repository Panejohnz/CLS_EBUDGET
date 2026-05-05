import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-meeting-support',
  templateUrl: './expenseMeetingSupport.component.html',
  styles: ``
})
export class ExpenseMeetingSupportComponent {
  @Input() model: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.model.dismiss();
  }
  committeeList: any = [
    {
      committeeName: '',
      roles: [
        { name: 'ประธาน', qty: 0, day: 0, rate: 0, total: 0 },
        { name: 'คณะกรรมการ/คณะอนุกรรมการ', qty: 0, day: 0, rate: 0, total: 0 },
        { name: 'เลขานุการและผู้ช่วยเลขานุการ', qty: 0, day: 0, rate: 0, total: 0 }
      ],
      total: 0
    }
  ]

  grandTotal = 0


  addRow() {

    this.committeeList.push({
      committeeName: '',
      roles: [
        { name: 'ประธาน', qty: 0, day: 0, rate: 0, total: 0 },
        { name: 'คณะกรรมการ/คณะอนุกรรมการ', qty: 0, day: 0, rate: 0, total: 0 },
        { name: 'เลขานุการและผู้ช่วยเลขานุการ', qty: 0, day: 0, rate: 0, total: 0 }
      ],
      total: 0
    })

  }


  removeRow(i: number) {

    this.committeeList.splice(i, 1)

    this.calculateGrand()

  }


  calculate(index: number) {

    let item = this.committeeList[index]

    item.total = 0

    item.roles.forEach((r: any) => {

      r.total =
        (Number(r.qty) || 0) *
        (Number(r.day) || 0) *
        (Number(r.rate) || 0)

      item.total += r.total

    })

    this.calculateGrand()

  }


  calculateGrand() {

    this.grandTotal = this.committeeList.reduce((sum: any, row: any) => {

      return sum + (Number(row.total) || 0)

    }, 0)

  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.model.dismiss();

    }
  }
}
