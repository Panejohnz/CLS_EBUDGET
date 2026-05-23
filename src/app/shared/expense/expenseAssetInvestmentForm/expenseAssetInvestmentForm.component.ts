import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-asset-investment-form',
  templateUrl: './expenseAssetInvestmentForm.component.html',
  styles: ``
})
export class ExpenseAssetInvestmentFormComponent {

  @Input() model: any;

  @Input() type!: string;

  @Input() expenseItem: any;

  config: any;

  userDept = 'IT';

  items: any[] = [];

  files: any[] = [];

  fileError = false;

  spec = '';

  grandTotal = 0;

  ngOnInit() {

    this.config =
      this.getConfig(this.type);

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

  }

  getConfig(type: string) {

    const map: any = {

      computer: {

        label:
          'ครุภัณฑ์คอมพิวเตอร์',

        allowDept:
          'IT',

        options: [

          'คอมพิวเตอร์',

          'โน้ตบุ๊ก',

          'Printer'

        ]

      },

      vehicle: {

        label:
          'ครุภัณฑ์ยานพาหนะและขนส่ง',

        options: [

          'รถโดยสาร',

          'รถบรรทุก'

        ]

      },

      media: {

        label:
          'ครุภัณฑ์โฆษณาและเผยแพร่',

        options: [

          'ป้าย',

          'สื่อ'

        ]

      },

      household: {

        label:
          'ครุภัณฑ์งานบ้านงานครัว',

        options: [

          'เตา',

          'ตู้เย็น'

        ]

      },

      electric: {

        label:
          'ครุภัณฑ์ไฟฟ้าและวิทยุ',

        options: [

          'วิทยุ',

          'เครื่องเสียง'

        ]

      },

      office: {

        label:
          'ครุภัณฑ์สำนักงาน',

        options: [

          'โต๊ะ',

          'เก้าอี้'

        ]

      },

      innovation: {

        label:
          'ครุภัณฑ์นวัตกรรมไทย',

        options: []

      },

      other: {

        label:
          'ครุภัณฑ์อื่นๆ',

        options: []

      }

    };

    return map[type];

  }

  createItem() {

    return {

      requestItemId: 0,

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

  bindData() {

    const rows =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId

      );

    if (rows.length == 0) {

      this.items = [

        this.createItem()

      ];

      return;

    }

    this.items =

      rows.map((row: any) => {

        return {

          requestItemId:
            row.Request_Item_Id || 0,

          name:
            row.Expense_Detail || '',

          standardIn:
            row.People_Type_A == 1,

          standardOut:
            row.People_Type_B == 1,
          price:
            row.Price || 0,

          qty:
            row.Quantity || 0,

          total:
            row.Total || 0,

          newQty:
            row.People || 0,

          reasonNew:
            row.Purpose || '',

          replaceQty:
            row.Sum_People || 0,

          reasonReplace:
            row.Reson || ''

        };

      });

    // spec
    const specRow = rows.find(
      (x: any) => x.Other_Name
    );

    if (specRow) {

      this.spec =
        specRow.Other_Name || '';

    }

    this.calculateAll();
    this.model.Total = this.grandTotal;
  }

  addItem() {

    this.items.push(

      this.createItem()

    );

    this.updateDetailItems();

  }

  removeItem(i: number) {

    this.items.splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculate(i: number) {

    const item =
      this.items[i];

    item.total =

      (Number(item.price) || 0) *

      (Number(item.qty) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =

      this.items.reduce(

        (s, x) =>

          s + (Number(x.total) || 0),

        0

      );

  }

  uploadFiles(event: any) {

    this.files =
      Array.from(event.target.files);

  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name || '',

        Quantity:
          item.qty,

        Price:
          item.price,

        Total:
          item.total,

        People_Type_A:
          item.standardIn ? 1 : 0,

        People_Type_B:
          item.standardOut ? 1 : 0,

        People:
          item.newQty,

        Purpose:
          item.reasonNew || '',

        Sum_People:
          item.replaceQty,

        Reson:
          item.reasonReplace || '',

        Other_Name:
          this.spec || ''

      });

    });
    this.model.Total = this.grandTotal;
  }

  save() {

    // คอมเฉพาะ IT
    if (

      this.type === 'computer' &&

      this.userDept !== 'IT'

    ) {

      alert('เฉพาะหน่วยงานเทคโน');

      return;

    }

    // นอกมาตรฐานต้องมี 3 ไฟล์
    const hasNon =

      this.items.some(

        x => x.standardOut

      );

    if (

      hasNon &&

      this.files.length < 3

    ) {

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