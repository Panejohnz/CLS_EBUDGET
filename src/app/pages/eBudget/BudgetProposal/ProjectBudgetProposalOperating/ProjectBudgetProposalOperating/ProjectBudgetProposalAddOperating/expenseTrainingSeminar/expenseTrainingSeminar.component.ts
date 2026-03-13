import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-expense-training-seminar',

  templateUrl: './expenseTrainingSeminar.component.html',
  styles: ``
})
export class ExpenseTrainingSeminarComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  projectName: any
  locationOffice: any
  locationHotel: any
  description: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  expenseList: any = [
    {
      expenseType: '',
      times: 0,
      typeA: 0,
      typeB: 0,
      external: 0,
      person: 0,
      qty: 0,
      unit: 'บาท',
      rate: 0,
      unit2: 'บาท',
      total: 0
    }
  ]


  addRow() {

    this.expenseList.push({
      expenseType: '',
      times: 0,
      typeA: 0,
      typeB: 0,
      external: 0,
      person: 0,
      qty: 0,
      rate: 0,
      unit: 'บาท',
      unit2: 'บาท',
      total: 0
    })

  }


  removeRow(i: number) {

    this.expenseList.splice(i, 1)

  }


  calculate(item: any) {

    const people =
      (item.typeA || 0) +
      (item.typeB || 0) +
      (item.external || 0)

    item.total =
      (people || 0) *
      (item.qty || 0) *
      (item.rate || 0)

  }
  file: any
  onFileChange(event: any) {

    this.file = event.target.files[0]

  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
