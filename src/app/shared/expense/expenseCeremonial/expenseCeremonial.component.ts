import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-ceremonial',
  templateUrl: './expenseCeremonial.component.html',
  styles: ``
})
export class ExpenseCeremonialComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  title = '';

  lunch = {
    meal: 0,
    person: 0,
    price: 0,
    total: 0
  };

  snack = {
    meal: 0,
    person: 0,
    price: 0,
    total: 0
  };

  totalMeal = 0;
  totalPerson = 0;
  grandTotal = 0;

  calculate() {
    this.lunch.total =
      (this.lunch.meal || 0) *
      (this.lunch.person || 0) *
      (this.lunch.price || 0);

    this.snack.total =
      (this.snack.meal || 0) *
      (this.snack.person || 0) *
      (this.snack.price || 0);

    this.totalMeal =
      (this.lunch.meal || 0) +
      (this.snack.meal || 0);

    this.totalPerson =
      (this.lunch.person || 0) +
      (this.snack.person || 0);

    this.grandTotal =
      this.lunch.total +
      this.snack.total;
  }

  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
