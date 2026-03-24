import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-copier-rent',
  templateUrl: './expenseCopierRent.component.html',
  styles: ``
})
export class ExpenseCopierRentComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  items: any[] = [
    {
      type: '',
      otherDetail: '',
      price: 0,
      qty: 0,
      month: 0,
      total: 0,
      file: null
    }
  ];

  grandTotal: number = 0;


  addItem() {

    this.items.push({
      type: '',
      otherDetail: '',
      price: 0,
      qty: 0,
      month: 0,
      total: 0,
      file: null
    });

  }


  removeItem(index: number) {

    this.items.splice(index, 1);
    this.calculateGrandTotal();

  }


  calculate(i: number) {

    let item = this.items[i];

    item.total =
      (item.price || 0) *
      (item.qty || 0) *
      (item.month || 0);

    this.calculateGrandTotal();

  }


  calculateGrandTotal() {

    this.grandTotal = 0;

    this.items.forEach(x => {
      this.grandTotal += x.total || 0;
    });

  }


  onFileSelected(event: any, index: number) {

    const file = event.target.files[0];

    if (file) {
      this.items[index].file = file;
    }

  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
