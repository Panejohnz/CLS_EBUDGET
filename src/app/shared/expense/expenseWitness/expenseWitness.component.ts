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
  list: any = [
    {
      name: 'ค่าตอบแทนและค่าใช้จ่ายแก่พยาน',
      level: 0,
      children: true
    },

    {
      name: 'ขนาดคดี S',
      level: 1,
      case: 0,
      person: 0,
      rate: 0
    },

    {
      name: 'ขนาดคดี M',
      level: 1,
      case: 0,
      person: 0,
      rate: 0
    },

    {
      name: 'ขนาดคดี L',
      level: 1,
      case: 0,
      person: 0,
      rate: 0
    }
  ];
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


  getCost(row: any): number {
    if (row.children) {
      return this.list
        .filter((x: any) => x.level === 1)
        .reduce((sum: any, r: any) => sum + (r.person * r.rate || 0), 0);
    }

    return (row.person || 0) * (row.rate || 0);
  }

  getTotal(row: any): number {
    if (row.children) {
      return this.list
        .filter((x: any) => x.level === 1)
        .reduce((sum: any, r: any) => sum + ((r.case || 0) * (r.person || 0) * (r.rate || 0)), 0);
    }

    return (row.case || 0) * (row.person || 0) * (row.rate || 0);
  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
