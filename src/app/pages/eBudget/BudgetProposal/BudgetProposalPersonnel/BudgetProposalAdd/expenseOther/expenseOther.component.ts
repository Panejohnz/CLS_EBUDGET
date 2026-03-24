import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
interface RentItem {
  name: string;
  qty: number;
  price: number;
  months: number;
  total: number;
  file?: File;
}

@Component({
  selector: 'app-expense-other',
  templateUrl: './expenseOther.component.html'
})
export class ExpenseOtherComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  rentItems: RentItem[] = [
    {
      name: '',
      qty: 0,
      price: 0,
      months: 0,
      total: 0
    }
  ];

  grandTotal: number = 0;

  addItem() {
    this.rentItems.push({
      name: '',
      qty: 0,
      price: 0,
      months: 0,
      total: 0
    });
  }

  removeItem(index: number) {
    this.rentItems.splice(index, 1);
    this.calculateGrandTotal();
  }

  calculate(item: RentItem) {
    item.total = (item.qty || 0) * (item.price || 0) * (item.months || 0);
    this.calculateGrandTotal();
  }

  calculateGrandTotal() {
    this.grandTotal = this.rentItems.reduce((sum, item) => sum + item.total, 0);
  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
