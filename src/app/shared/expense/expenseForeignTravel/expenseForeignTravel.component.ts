import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-foreign-travel',
  templateUrl: './expenseForeignTravel.component.html',
  styles: ``
})
export class ExpenseForeignTravelComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  items: any[] = [];

  grandTotal = 0;

  countryOptions = [

    {
      code: 'JP',
      name: 'ญี่ปุ่น'
    },

    {
      code: 'KR',
      name: 'เกาหลีใต้'
    },

    {
      code: 'CN',
      name: 'จีน'
    },

    {
      code: 'SG',
      name: 'สิงคโปร์'
    },

    {
      code: 'US',
      name: 'สหรัฐอเมริกา'
    },

    {
      code: 'UK',
      name: 'สหราชอาณาจักร'
    },

    {
      code: 'FR',
      name: 'ฝรั่งเศส'
    },

    {
      code: 'DE',
      name: 'เยอรมนี'
    }

  ];

  main = {

    title: '',

    reason: '',

    target: '',

    benefit: ''

  };

  file: File | null = null;

  fileError = false;

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

  }

  createItem() {

    return {

      requestItemId: 0,

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

  // =========================================
  // BIND DATA
  // =========================================

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

    // ============================
    // HEADER
    // ============================

    const headerRow =

      rows.find((x: any) =>
        x.Other_Name == 'HEADER'
      );

    if (headerRow) {

      this.main = {

        title:
          headerRow.Expense_Name || '',

        reason:
          headerRow.Reson || '',

        target:
          headerRow.Position_Name || '',

        benefit:
          headerRow.Position_Type_Name || ''

      };

    }

    // ============================
    // DETAIL
    // ============================

    const detailRows =

      rows.filter((x: any) =>
        x.Other_Name != 'HEADER'
      );

    this.items = detailRows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        times:
          Number(row.Times || 0),

        person:
          Number(row.People || 0),

        days:
          Number(row.Day || 0),

        rate:
          Number(row.Rate || 0),

        total:
          Number(row.Total || 0),

        meetingType:
          row.Month_Name || '',

        hasInvite:
          row.People_Type_A == 1,

        country:
          row.Other_Name || '',

        level:
          row.Level_Name || ''

      };

    });

    if (this.items.length == 0) {

      this.items = [

        this.createItem()

      ];

    }
    this.model.Total = this.grandTotal;
    this.calculateAll();

  }

  // =========================================
  // ADD REMOVE
  // =========================================

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

  // =========================================
  // CALCULATE
  // =========================================

  calculate(i: number) {

    const x =
      this.items[i];

    x.total =

      (Number(x.times) || 0) *

      (Number(x.person) || 0) *

      (Number(x.days) || 0) *

      (Number(x.rate) || 0);

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

  // =========================================
  // UPDATE MODEL
  // =========================================

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // ============================
    // HEADER
    // ============================

    this.model.Budget_Request_Detail_Item.push({

      Request_Item_Id: 0,

      Fk_Expense_Id:
        this.model.selectedExpenseTypeId,

      Other_Name:
        'HEADER',

      Expense_Name:
        this.main.title || '',

      Reson:
        this.main.reason || '',

      Position_Name:
        this.main.target || '',

      Position_Type_Name:
        this.main.benefit || ''

    });

    // ============================
    // DETAIL
    // ============================

    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name || '',

        Times:
          Number(item.times) || 0,

        People:
          Number(item.person) || 0,

        Day:
          Number(item.days) || 0,

        Rate:
          Number(item.rate) || 0,

        Total:
          Number(item.total) || 0,

        Month_Name:
          item.meetingType || '',

        People_Type_A:
          item.hasInvite ? 1 : 0,

        Other_Name:
          item.country || '',

        Level_Name:
          item.level || ''

      });

    });
    this.model.Total = this.grandTotal;
  }

  // =========================================
  // FILE
  // =========================================

  uploadFile(event: any) {

    this.file = event.target.files[0];

  }

  // =========================================
  // SAVE
  // =========================================

  save() {

    this.updateDetailItems();

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