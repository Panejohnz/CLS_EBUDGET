import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-witness',
  templateUrl: './expenseWitness.component.html',
  styles: ``
})
export class ExpenseWitnessComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  main = {
    case: 0,
    costPerCase: 0,
    total: 0
  };

  s = { case: 0, person: 0, rate: 0, cost: 0, total: 0 };
  m = { case: 0, person: 0, rate: 0, cost: 0, total: 0 };
  l = { case: 0, person: 0, rate: 0, cost: 0, total: 0 };

  calculate() {
    const calc = (x: any) => {
      x.cost = (x.person || 0) * (x.rate || 0);
      x.total = (x.case || 0) * x.cost;
    };

    calc(this.s);
    calc(this.m);
    calc(this.l);
  }

  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
