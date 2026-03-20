import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-asset-investment-form',
  templateUrl: './expenseAssetInvestmentForm.component.html',
  styles: ``
})
export class ExpenseAssetInvestmentFormComponent {
  @Input() type!: string;
  @Input() expenseItem: any;

  config: any;

  userDept = 'IT'; // mock

  items = [this.createItem()];
  files: File[] = [];
  fileError = false;
  spec = '';

  ngOnInit() {
    this.config = this.getConfig(this.type);
  }

  getConfig(type: string) {

    const map: any = {

      computer: {
        label: 'ครุภัณฑ์คอมพิวเตอร์',
        allowDept: 'IT',
        options: ['คอมพิวเตอร์', 'โน้ตบุ๊ก', 'Printer']
      },

      vehicle: {
        label: 'ครุภัณฑ์ยานพาหนะและขนส่ง',
        options: ['รถโดยสาร', 'รถบรรทุก']
      },

      media: {
        label: 'ครุภัณฑ์โฆษณาและเผยแพร่',
        options: ['ป้าย', 'สื่อ']
      },

      household: {
        label: 'ครุภัณฑ์งานบ้านงานครัว',
        options: ['เตา', 'ตู้เย็น']
      },

      electric: {
        label: 'ครุภัณฑ์ไฟฟ้าและวิทยุ',
        options: ['วิทยุ', 'เครื่องเสียง']
      },

      office: {
        label: 'ครุภัณฑ์สำนักงาน',
        options: ['โต๊ะ', 'เก้าอี้']
      },

      innovation: {
        label: 'ครุภัณฑ์นวัตกรรมไทย',
        options: []
      },

      other: {
        label: 'ครุภัณฑ์อื่นๆ',
        options: []
      }

    };

    return map[type];
  }

  createItem() {
    return {
      name: '',
      standardIn: false,
      standardOut: false,
      price: 0,
      qty: 0,
      total: 0,
      newQty: 0,
      reasonNew: '',
      replaceQty: 0,
      reasonReplace: ''
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

  grandTotal = 0;

  calculateAll() {
    this.grandTotal = this.items.reduce((s, x) => s + (x.total || 0), 0);
  }

  uploadFiles(event: any) {
    this.files = Array.from(event.target.files);
  }

  save() {

    // 🔥 คอมใช้ได้เฉพาะ IT
    if (this.type === 'computer' && this.userDept !== 'IT') {
      alert('เฉพาะหน่วยงานเทคโน');
      return;
    }

    // 🔥 นอกมาตรฐานต้องมี 3 ไฟล์
    const hasNon = this.items.some(x => x.standardOut);

    if (hasNon && this.files.length < 3) {
      this.fileError = true;
      return;
    }

    this.fileError = false;

    console.log({
      type: this.type,
      items: this.items,
      files: this.files
    });
  }
}