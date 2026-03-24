import { Component } from '@angular/core';

@Component({
  selector: 'app-expense-fuel-lubricant',
  templateUrl: './expenseFuelLubricant.component.html',
  styles: ``
})
export class ExpenseFuelLubricantComponent {
  list: any[] = [];

  vehicleTypes = [
    'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ 91)',
    'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ 95)',
    'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ E20)',
    'รถยนต์นั่งธรรมดา (ดีเซล)',
    'รถโดยสารขนาด 10-12 ที่นั่ง'
  ];

  constructor() {
    this.add();
  }

  add() {
    this.list.push({
      type: '',
      month: 0,
      year: 0
    });
  }

  remove(index: number) {
    this.list.splice(index, 1);
  }

  calculate(item: any) {
    item.year = (item.month || 0) * 12;
  }

  getTotal(field: string): number {
    return this.list.reduce((sum, item) => {
      return sum + (item[field] || 0);
    }, 0);
  }
}
