import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-section61',
  templateUrl: './expenseSection61.component.html',
  styles: ``
})
export class ExpenseSection61Component {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  main = { case: 0, costPerCase: 0, total: 0 };

  s = {
    case: 0,
    person: 0,
    allowanceRate: 240,
    allowanceDay: 0,
    allowanceTotal: 0,
    hotelRate: 800,
    hotelDay: 0,
    hotelTotal: 0,
    travelRate: 400,
    travelTotal: 0,
    relation: 0,
    costPerCase: 0,
    total: 0
  };

  m = { ...this.s };
  l = { ...this.s };
  calculateRow(x: any) {
    const n = (v: any) => Number(v) || 0;

    x.allowanceTotal =
      n(x.allowanceRate) *
      n(x.allowanceDay) *
      n(x.person);

    x.hotelTotal =
      n(x.hotelRate) *
      n(x.hotelDay) *
      n(x.person);

    x.travelTotal =
      n(x.travelRate) *
      n(x.person);

    x.costPerCase =
      x.allowanceTotal +
      x.hotelTotal +
      x.travelTotal +
      n(x.relation);

    x.total =
      n(x.case) *
      x.costPerCase;
  }
  calculateAll() {
    this.calculateRow(this.s);
    this.calculateRow(this.m);
    this.calculateRow(this.l);

    const n = (v: any) => Number(v) || 0;

    this.main.costPerCase =
      n(this.s.costPerCase) +
      n(this.m.costPerCase) +
      n(this.l.costPerCase);

    this.main.total =
      n(this.s.total) +
      n(this.m.total) +
      n(this.l.total);
  }
  safe(n: any) {
    return Number(n) || 0;
  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }

}
