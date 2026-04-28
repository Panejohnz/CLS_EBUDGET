import { Component } from '@angular/core';

@Component({
  selector: 'app-expense-witness-protection',
  templateUrl: './expenseWitnessProtection.component.html',
  styles: ``
})
export class ExpenseWitnessProtectionComponent {
  main = { case: 0, costPerCase: 0, total: 0 };

  s = this.createRow();
  m = this.createRow();
  l = this.createRow();

  createRow() {
    return {
      case: 0,
      person: 0,

      allowanceRate: 0,
      allowanceDay: 0,
      allowanceTotal: 0,

      hotelRate: 0,
      hotelDay: 0,
      hotelTotal: 0,

      other: 0,

      costPerCase: 0,
      total: 0
    };
  }

  calculateRow(x: any) {

    x.allowanceTotal =
      x.allowanceRate * x.allowanceDay * x.person;

    x.hotelTotal =
      x.hotelRate * x.hotelDay * x.person;

    x.costPerCase =
      x.allowanceTotal +
      x.hotelTotal +
      (x.other || 0);

    x.total =
      x.costPerCase * x.case;
  }

  calculateAll() {

    this.calculateRow(this.s);
    this.calculateRow(this.m);
    this.calculateRow(this.l);

    this.main.case =
      this.s.case + this.m.case + this.l.case;

    this.main.costPerCase =
      this.s.costPerCase +
      this.m.costPerCase +
      this.l.costPerCase;

    this.main.total =
      this.s.total +
      this.m.total +
      this.l.total;
  }
}
