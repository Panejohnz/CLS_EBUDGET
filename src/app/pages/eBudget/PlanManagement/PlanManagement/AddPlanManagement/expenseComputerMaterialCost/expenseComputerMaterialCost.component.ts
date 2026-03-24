import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-expense-computer-material-cost',
  templateUrl: './expenseComputerMaterialCost.component.html',
  styles: ``
})
export class ExpenseComputerMaterialCostComponent {
  items = [
    {
      product: null,
      qty: 0,
      unit: '',
      price: 0,
      total: 0,
      remark: ''
    }
  ];

  computerOptions = [
    { id: 1, name: 'หมึกพิมพ์ HP Toner CF400', price: 2500, unit: 'กล่อง' },
    { id: 2, name: 'หมึก Xerox Docuprint', price: 4500, unit: 'กล่อง' },
    { id: 3, name: 'Printer OKI B412DN', price: 12000, unit: 'เครื่อง' }
  ];

  grandTotal = 0;

  addItem() {
    this.items.push({
      product: null,
      qty: 0,
      unit: '',
      price: 0,
      total: 0,
      remark: ''
    });
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
    this.calculateAll();
  }

  onSelectProduct(item: any, i: number) {
    if (item.product) {
      item.price = item.product.price || 0;
      item.unit = item.product.unit || '';
    }
    this.calculate(i);
  }

  calculate(i: number) {
    const item = this.items[i];
    item.total = (item.qty || 0) * (item.price || 0);
    this.calculateAll();
  }

  calculateAll() {
    this.grandTotal = this.items.reduce((sum, x) => sum + (x.total || 0), 0);
  }

  save() {
    console.log(this.items);
  }

  closeModal() { }
}
