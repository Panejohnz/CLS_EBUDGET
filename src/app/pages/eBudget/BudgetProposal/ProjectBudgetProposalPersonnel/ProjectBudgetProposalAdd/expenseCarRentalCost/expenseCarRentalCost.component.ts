import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-car-rental-cost',
  templateUrl: './expenseCarRentalCost.component.html',
  styles: ``
})
export class ExpenseCarRentalCostComponent {
  tab: 'old' | 'new' = 'old';

  // 🔥 แยก array
  itemsOld = [this.createItem()];
  itemsNew = [this.createItem()];

  carOptions = [
    { id: 1, name: 'รถโดยสาร 12 ที่นั่ง', price: 30000 },
    { id: 2, name: 'รถบรรทุก', price: 40000 },

    // 👇 เพิ่มตาม requirement
    { id: 99, name: 'ค่าคนขับรถยนต์', price: 12000 }
  ];

  createItem() {
    return {
      car: null,
      qty: 1,
      price: 0,
      month: 0,
      total: 0,
      file: null,
      fileName: ''
    };
  }

  // 🔥 ใช้แทน items
  getCurrentItems() {
    return this.tab === 'old' ? this.itemsOld : this.itemsNew;
  }

  addItem() {
    this.getCurrentItems().push(this.createItem());
  }

  removeItem(i: number) {
    this.getCurrentItems().splice(i, 1);
    this.calculateAll();
  }

  onSelectCar(item: any, i: number) {
    if (item.car) {
      item.price = item.car.price || 0;
    }
    this.calculate(i);
  }

  calculate(i: number) {
    const item = this.getCurrentItems()[i];

    item.total =
      (item.qty || 0) *
      (item.price || 0) *
      (item.month || 0);

    this.calculateAll();
  }

  totalMonth = 0;
  grandTotal = 0;

  calculateAll() {
    const list = this.getCurrentItems();

    this.totalMonth = list.reduce((s, x) => s + (x.month || 0), 0);
    this.grandTotal = list.reduce((s, x) => s + (x.total || 0), 0);
  }

  uploadFile(event: any, i: number) {
    const file = event.target.files[0];
    if (!file) return;

    const list = this.getCurrentItems();
    list[i].file = file;
    list[i].fileName = file.name;
  }

  save() {
    console.log({
      old: this.itemsOld,
      new: this.itemsNew
    });
  }
}
