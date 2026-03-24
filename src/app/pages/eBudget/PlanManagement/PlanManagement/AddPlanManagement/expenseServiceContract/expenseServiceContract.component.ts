import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-service-contract',
  templateUrl: './expenseServiceContract.component.html',
  styles: ``
})
export class ExpenseServiceContractComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  items: any[] = [
    {
      name: '',
      price: 0,
      qty: 0,
      unit: 'คน',
      month: 0,
      total: 0,
      file: null
    }
  ];

  grandTotal = 0;

  addItem() {

    this.items.push({
      name: '',
      price: 0,
      qty: 0,
      unit: 'คน',
      month: 0,
      total: 0,
      file: null
    });

  }

  removeItem(i: number) {

    this.items.splice(i, 1);
    this.calculateGrand();

  }

  calculate(i: number) {

    let item = this.items[i];

    item.total =
      (item.price || 0) *
      (item.qty || 0) *
      (item.month || 0);

    this.calculateGrand();

  }

  calculateGrand() {

    this.grandTotal = 0;

    this.items.forEach(x => {
      this.grandTotal += x.total || 0;
    });

  }

  uploadFile(event: any, index: number) {

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
