import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-expense-ot',
  templateUrl: './expenseOT.component.html',
  styles: ``
})
export class ExpenseOTComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  foodList: any = [
    {
      workPerson: 0,
      workDay: 0,
      workHour: 0,
      workTotal: 0,

      holidayPerson: 0,
      holidayDay: 0,
      holidayHour: 0,
      holidayTotal: 0
    }
  ]

  workRate = 50
  holidayRate = 60

  note = ''

  totalWork = 0
  totalHoliday = 0
  grandTotal = 0

  addRow() {

    this.foodList.push({
      workPerson: 0,
      workDay: 0,
      workHour: 0,
      workTotal: 0,

      holidayPerson: 0,
      holidayDay: 0,
      holidayHour: 0,
      holidayTotal: 0
    })

  }

  removeRow(i: number) {

    this.foodList.splice(i, 1)

    this.calculateTotal()

  }

  calculate(i: number) {

    let row = this.foodList[i]

    row.workTotal =
      (Number(row.workPerson) || 0) *
      (Number(row.workDay) || 0) *
      (Number(row.workHour) || 0) *
      this.workRate

    row.holidayTotal =
      (Number(row.holidayPerson) || 0) *
      (Number(row.holidayDay) || 0) *
      (Number(row.holidayHour) || 0) *
      this.holidayRate

    this.calculateTotal()

  }

  calculateTotal() {

    this.totalWork = this.foodList.reduce((sum: any, r: any) => {
      return sum + (Number(r.workTotal) || 0)
    }, 0)

    this.totalHoliday = this.foodList.reduce((sum: any, r: any) => {
      return sum + (Number(r.holidayTotal) || 0)
    }, 0)

    this.grandTotal = this.totalWork + this.totalHoliday

  }
  openRateModal(content: any) {

    this.modalService.open(content, {
      size: 'md',
      backdrop: 'static',
      centered: true
    });

  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
