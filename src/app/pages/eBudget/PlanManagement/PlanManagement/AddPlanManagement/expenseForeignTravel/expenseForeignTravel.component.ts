import { Component } from '@angular/core';

@Component({
  selector: 'app-expense-foreign-travel',
  templateUrl: './expenseForeignTravel.component.html',
  styles: ``
})
export class ExpenseForeignTravelComponent {
  items = [this.createItem()];
  grandTotal = 0;
  countryOptions = [
    { code: 'JP', name: 'ญี่ปุ่น' },
    { code: 'KR', name: 'เกาหลีใต้' },
    { code: 'CN', name: 'จีน' },
    { code: 'SG', name: 'สิงคโปร์' },
    { code: 'US', name: 'สหรัฐอเมริกา' },
    { code: 'UK', name: 'สหราชอาณาจักร' },
    { code: 'FR', name: 'ฝรั่งเศส' },
    { code: 'DE', name: 'เยอรมนี' }
  ];
  main = {
    title: '',
    reason: '',
    target: '',
    benefit: ''
  };

  file: File | null = null;
  fileError = false;

  createItem() {
    return {
      name: '',
      times: 0,
      person: 0,
      days: 0,
      rate: 0,
      total: 0,
      meetingType: '',
      hasInvite: false,
      country: '',
      level: ''
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
    const x = this.items[i];

    x.total =
      (x.times || 0) *
      (x.person || 0) *
      (x.days || 0) *
      (x.rate || 0);

    this.calculateAll();
  }

  calculateAll() {
    this.grandTotal = this.items.reduce((s, x) => s + (x.total || 0), 0);
  }

  uploadFile(event: any) {
    this.file = event.target.files[0];
  }

  save() {

    if (!this.file) {
      this.fileError = true;
      return;
    }

    this.fileError = false;

    console.log({
      main: this.main,
      items: this.items,
      file: this.file
    });
  }
}
