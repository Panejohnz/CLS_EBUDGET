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
  main = {
    costPerCase: 0,
    total: 0
  };

  // 🔥 ใช้ตัวเดียวพอ (สำคัญ)
  caseList = [
    this.createGroup('ขนาดคดี S'),
    this.createGroup('ขนาดคดี M'),
    this.createGroup('ขนาดคดี L')
  ];

  // 🔥 create group
  createGroup(name: string) {
    return {
      name,
      case: 0,
      person: 0,
      day: 1,

      items: [] as any[],

      costPerCase: 0,
      total: 0
    };
  }

  addItem(group: any) {
    group.items.push({
      type: '',
      customName: '',
      amount: 0
    });
  }

  removeItem(group: any, item: any) {
    group.items = group.items.filter((x: any) => x !== item);
  }

  onTypeChange(item: any, group: any) {

    switch (item.type) {
      case 'allowance':
        item.amount = 240;
        break;

      case 'hotel':
        item.amount = 800;
        break;

      case 'travel':
        item.amount = 400;
        break;

      case 'other':
        item.amount = 0;
        item.customName = '';
        break;

      default:
        item.amount = 0;
    }

    this.calculate(group);
  }
  calculate(group: any) {

    const itemTotal = group.items.reduce((sum: number, i: any) => {
      return sum + (i.amount || 0);
    }, 0);

    const person = Number(group.person) || 0;
    const day = Number(group.day) || 0;
    const caseVal = Number(group.case) || 0;

    group.costPerCase = itemTotal * person * day;
    group.total = caseVal * group.costPerCase;

    this.main.costPerCase = this.caseList.reduce((sum, g) => sum + (g.costPerCase || 0), 0);
    this.main.total = this.caseList.reduce((sum, g) => sum + (g.total || 0), 0);
  }


}
