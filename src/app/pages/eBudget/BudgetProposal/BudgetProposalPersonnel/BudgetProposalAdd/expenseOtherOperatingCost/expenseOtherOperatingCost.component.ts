import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
interface CostItem {
  name: string;
  quantity: number;
  price: number;
}
@Component({
  selector: 'app-expense-other-operating-cost',
  templateUrl: './expenseOtherOperatingCost.component.html',
  styles: ``
})
export class ExpenseOtherOperatingCostComponent {

  items: CostItem[] = [
    { name: '', quantity: 0, price: 0 }
  ];

  addItem() {
    this.items.push({ name: '', quantity: 0, price: 0 });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  getTotal(item: CostItem): number {
    return item.quantity * item.price;
  }

  getGrandTotal(): number {
    return this.items.reduce((sum, item) => sum + this.getTotal(item), 0);
  }

  getTotalQty(): number {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

}
