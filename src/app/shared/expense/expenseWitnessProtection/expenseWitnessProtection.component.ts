import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-witness-protection',
  templateUrl: './expenseWitnessProtection.component.html',
  styles: ``
})
export class ExpenseWitnessProtectionComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  main = {

    case: 0,

    costPerCase: 0,

    total: 0

  };

  s: any;

  m: any;

  l: any;

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.s = this.createRow();

    this.m = this.createRow();

    this.l = this.createRow();

    this.bindData();

  }

  createRow() {

    return {

      requestItemId: 0,

      size: '',

      case: 0,

      person: 0,

      allowanceRate: 0,

      allowanceDay: 0,

      allowanceTotal: 0,

      hotelRate: 0,

      hotelDay: 0,

      hotelTotal: 0,

      other: 0,

      costPerCase: 0,

      total: 0

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

      this.calculateAll();

      return;

    }

    rows.forEach((row: any) => {

      const data = {

        requestItemId:
          row.Request_Item_Id || 0,

        size:
          row.Expense_Detail || '',

        case:
          Number(row.Quantity || 0),

        person:
          Number(row.People || 0),

        allowanceRate:
          Number(row.Price || 0),

        allowanceDay:
          Number(row.Day || 0),

        allowanceTotal:
          Number(row.Per_Month || 0),

        hotelRate:
          Number(row.Rate || 0),

        hotelDay:
          Number(row.Month || 0),

        hotelTotal:
          Number(row.Per_Year || 0),

        other:
          Number(row.Salary_Amount || 0),

        costPerCase:
          Number(row.Hour || 0),

        total:
          Number(row.Total || 0)

      };

      if (row.Expense_Detail == 'S') {

        this.s = data;

      }

      if (row.Expense_Detail == 'M') {

        this.m = data;

      }

      if (row.Expense_Detail == 'L') {

        this.l = data;

      }

    });

    this.calculateAll();

  }

  calculateRow(x: any) {

    x.allowanceTotal =

      (Number(x.allowanceRate) || 0) *

      (Number(x.allowanceDay) || 0) *

      (Number(x.person) || 0);

    x.hotelTotal =

      (Number(x.hotelRate) || 0) *

      (Number(x.hotelDay) || 0) *

      (Number(x.person) || 0);

    x.costPerCase =

      (x.allowanceTotal || 0) +

      (x.hotelTotal || 0) +

      (Number(x.other) || 0);

    x.total =

      (Number(x.costPerCase) || 0) *

      (Number(x.case) || 0);

  }

  calculateAll() {

    this.calculateRow(this.s);

    this.calculateRow(this.m);

    this.calculateRow(this.l);

    this.main.case =

      (Number(this.s.case) || 0) +

      (Number(this.m.case) || 0) +

      (Number(this.l.case) || 0);

    this.main.costPerCase =

      (Number(this.s.costPerCase) || 0) +

      (Number(this.m.costPerCase) || 0) +

      (Number(this.l.costPerCase) || 0);

    this.main.total =

      (Number(this.s.total) || 0) +

      (Number(this.m.total) || 0) +

      (Number(this.l.total) || 0);

    this.updateDetailItems();

  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    const rows = [

      {
        size: 'S',
        data: this.s
      },

      {
        size: 'M',
        data: this.m
      },

      {
        size: 'L',
        data: this.l
      }

    ];

    rows.forEach((r: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          r.data.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          r.size,

        Quantity:
          r.data.case || 0,

        People:
          r.data.person || 0,

        Price:
          r.data.allowanceRate || 0,

        Day:
          r.data.allowanceDay || 0,

        Per_Month:
          r.data.allowanceTotal || 0,

        Rate:
          r.data.hotelRate || 0,

        Month:
          r.data.hotelDay || 0,

        Per_Year:
          r.data.hotelTotal || 0,

        Salary_Amount:
          r.data.other || 0,

        Hour:
          r.data.costPerCase || 0,

        Total:
          r.data.total || 0

      });

    });

  }

}