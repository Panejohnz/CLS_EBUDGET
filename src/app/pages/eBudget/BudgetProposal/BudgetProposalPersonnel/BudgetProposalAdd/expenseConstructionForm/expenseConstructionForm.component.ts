import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-construction-form',

  templateUrl: './expenseConstructionForm.component.html',
  styles: ``
})
export class ExpenseConstructionFormComponent {
  @Input() expenseItem: any;
  items = [this.createItem()];
  grandTotal = 0;

  isOld = false;
  isNew = false;

  bindingYear = 0;
  yearly: any[] = [];

  spec = '';

  files: any = {};

  fileConfig = [
    { key: 'plan', label: 'แบบแปลน', required: true },
    { key: 'ownership', label: 'เอกสารกรรมสิทธิ์', required: true },
    { key: 'installment', label: 'งวดงาน/งวดเงิน', required: true },
    { key: 'por4', label: 'ปร.4', required: true },
    { key: 'por5', label: 'ปร.5', required: true },
    { key: 'boq', label: 'BOQ', required: true },
    { key: 'other', label: 'อื่นๆ', required: false }
  ];

  createItem() {
    return {
      name: '',
      year: 0,
      price: 0,
      qty: 0,
      total: 0,
      newQty: 0,
      updateQty: 0
    };
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(i: number) {
    this.items.splice(i, 1);
    this.calculateAll();
  }

  calculate(i: number) {
    const item = this.items[i];
    item.total = (item.price || 0) * (item.qty || 0);
    this.calculateAll();
  }

  calculateAll() {
    this.grandTotal = this.items.reduce((s, x) => s + (x.total || 0), 0);
  }

  onYearChange() {
    this.yearly = Array.from({ length: this.bindingYear }, () => ({
      amount: 0,
      milestone: ''
    }));
  }

  uploadFile(event: any, key: string) {
    this.files[key] = event.target.files[0];
  }

  save() {

    //  validate file
    for (let f of this.fileConfig) {
      if (f.required && !this.files[f.key]) {
        alert('กรุณาแนบไฟล์: ' + f.label);
        return;
      }
    }

    console.log({
      items: this.items,
      files: this.files,
      yearly: this.yearly
    });

  }
}
