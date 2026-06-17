import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-expense-fuel-and-lubricant-cost',
  templateUrl: './expenseFuelAndLubricantCost.component.html',
  styles: ``
})
export class ExpenseFuelAndLubricantCostComponent {
  items = [
    {
      vehicle: null,
      monthly: 0,
      yearly: 0
    }
  ];

  vehicleOptions = [
    { id: 1, name: 'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ 91)' },
    { id: 2, name: 'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ 95)' },
    { id: 3, name: 'รถยนต์นั่งธรรมดา (ดีเซล)' }
  ];

  totalMonthly = 0;
  grandTotal = 0;

  addItem() {
    this.items.push({
      vehicle: null,
      monthly: 0,
      yearly: 0
    });
  }
  async removeItem(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }
    this.items.splice(i, 1);
    this.calculateAll();
  }

  calculate(i: number) {
    const item = this.items[i];

    // คำนวณต่อปี
    item.yearly = (item.monthly || 0) * 12;

    this.calculateAll();
  }

  calculateAll() {
    this.totalMonthly = this.items.reduce((sum, x) => sum + (x.monthly || 0), 0);
    this.grandTotal = this.items.reduce((sum, x) => sum + (x.yearly || 0), 0);
  }

  save() {
  }

  closeModal() { }
}
