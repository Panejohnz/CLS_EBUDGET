import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-advertising',
  templateUrl: './expenseAdvertising.component.html',
  styles: ``
})
export class ExpenseAdvertisingComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  groups = [
    {
      name: '',
      objective: '',
      result: '',
      total: 0,
      items: [
        { name: '', duration: 0, amount: 0, times: 0, rate: 0, total: 0 }
      ]
    }
  ];

  grandTotal = 0;

  addGroup() {
    this.groups.push({
      name: '',
      objective: '',
      result: '',
      total: 0,
      items: [
        { name: '', duration: 0, amount: 0, times: 0, rate: 0, total: 0 }
      ]
    });
  }

  removeGroup(i: number) {
    this.groups.splice(i, 1);
    this.calculateAll();
  }

  addItem(gi: number) {
    this.groups[gi].items.push({
      name: '',
      duration: 0,
      amount: 0,
      times: 0,
      rate: 0,
      total: 0
    });
  }

  removeItem(gi: number, i: number) {
    this.groups[gi].items.splice(i, 1);
    this.calculateAll();
  }

  calculate(gi: number, i: number) {
    const item = this.groups[gi].items[i];

    item.total =
      (item.duration || 0) *
      (item.amount || 0) *
      (item.times || 0) *
      (item.rate || 0);

    this.calculateAll();
  }

  calculateAll() {
    this.grandTotal = 0;

    this.groups.forEach(g => {
      g.total = g.items.reduce((sum, item) => sum + item.total, 0);
      this.grandTotal += g.total;
    });
  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }


}
