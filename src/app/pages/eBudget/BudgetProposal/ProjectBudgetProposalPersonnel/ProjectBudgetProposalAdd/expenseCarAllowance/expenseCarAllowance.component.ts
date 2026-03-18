import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-car-allowance',

  templateUrl: './expenseCarAllowance.component.html',
  styles: ``
})
export class ExpenseCarAllowanceComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  list: any = [
    {
      name: '',
      position: '',
      qty: 0,
      rate: 0,
      total: 0
    }
  ]

  add() {
    this.list.push({
      name: '',
      position: '',
      qty: 0,
      rate: 0,
      total: 0
    })
  }

  remove(item: any) {
    this.list = this.list.filter((i: any) => i !== item)
  }

  calculate(item: any) {
    item.total = (item.qty || 0) * (item.rate || 0) * 12
  }

  get totalQty() {
    return this.list.reduce((sum: any, i: any) => sum + (i.qty || 0), 0)
  }

  get totalMonth() {
    return this.list.reduce((sum: any, i: any) => sum + (i.rate || 0), 0)
  }

  get totalYear() {
    return this.list.reduce((sum: any, i: any) => sum + (i.total || 0), 0)
  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
