import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-rent-house',
  templateUrl: './expenseRentHouse.component.html',
  styles: ``
})
export class ExpenseRentHouseComponent {
  @Input() modal: any;
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  rentList: any = [
    {
      department: '',
      qty: 0,
      amount: 0
    }
  ]

  departments = [
    { id: 1, name: 'กองคลัง' },
    { id: 2, name: 'กองแผนงาน' },
    { id: 3, name: 'กองเทคโนโลยีสารสนเทศ' }
  ]

  totalQty: number = 0
  totalAmount: number = 0

  file: any = null

  addRow() {

    this.rentList.push({
      department: '',
      qty: 0,
      amount: 0
    })

  }

  removeRow(i: number) {

    this.rentList.splice(i, 1)
    this.calculateTotal()

  }

  calculateTotal() {

    this.totalQty = this.rentList.reduce((sum: any, row: any) => {
      return sum + (Number(row.qty) || 0)
    }, 0)

    this.totalAmount = this.rentList.reduce((sum: any, row: any) => {
      return sum + (Number(row.amount) || 0)
    }, 0)

  }

  onFileChange(event: any) {

    this.file = event.target.files[0]

  }

  save() {

    if (!this.file) {
      alert('กรุณาแนบไฟล์')
      return
    }

    console.log(this.rentList)

  }
}
