import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-section61',
  templateUrl: './expenseSection61.component.html',
  styles: ``
})
export class ExpenseSection61Component {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  main = {
    costPerCase: 0,
    total: 0
  };

  caseList: any[] = [];

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

  }

  closeModal() {

    this.model.dismiss();

  }

  createGroup(name: string) {

    return {

      name,

      case: 0,

      person: 0,

      day: 1,

      items: [],

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

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.caseList = [

        this.createGroup('ขนาดคดี S'),

        this.createGroup('ขนาดคดี M'),

        this.createGroup('ขนาดคดี L')

      ];

      return;

    }

    const groupedMap: any = {};

    rows.forEach((row: any) => {

      const key =
        row.Purpose || 'default';

      if (!groupedMap[key]) {

        groupedMap[key] = {

          name:
            row.Purpose || '',

          case:
            row.Day || 0,

          person:
            row.People || 0,

          day:
            row.Month || 0,

          items: [],

          costPerCase: 0,

          total: 0

        };

      }

      groupedMap[key].items.push({

        requestItemId:
          row.Request_Item_Id || 0,

        type:
          row.Month_Name || '',

        customName:
          row.Expense_Detail || '',

        amount:
          row.Price || 0

      });

    });

    this.caseList =
      Object.values(groupedMap);

    this.caseList.forEach((group: any) => {

      this.calculate(group, false);

    });

  }

  addItem(group: any) {

    group.items.push({

      requestItemId: 0,

      type: '',

      customName: '',

      amount: 0

    });

  }
  async removeItem(group: any, item: any) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    group.items =
      group.items.filter(
        (x: any) => x !== item
      );

    this.calculate(group);

  }

  onTypeChange(item: any, group: any) {

    switch (item.type) {

      case 'allowance':

        item.amount = 240;

        break;

      case 'hotel':

        item.amount = 800;

        break;

      case 'travel':

        item.amount = 400;

        break;

      case 'other':

        item.amount = 0;

        item.customName = '';

        break;

      default:

        item.amount = 0;

    }

    this.calculate(group);

  }

  calculate(group: any, update = true) {

    const itemTotal =

      group.items.reduce(

        (sum: number, i: any) => {

          return sum + (Number(i.amount) || 0);

        },

        0

      );

    const person =
      Number(group.person) || 0;

    const day =
      Number(group.day) || 0;

    const caseVal =
      Number(group.case) || 0;

    group.costPerCase =
      itemTotal * person * day;

    group.total =
      caseVal * group.costPerCase;

    this.main.costPerCase =

      this.caseList.reduce(

        (sum: number, g: any) =>

          sum + (Number(g.costPerCase) || 0),

        0

      );

    this.main.total =

      this.caseList.reduce(

        (sum: number, g: any) =>

          sum + (Number(g.total) || 0),

        0

      );

    if (update) {

      this.updateDetailItems();

    }

  }

  updateDetailItems() {

    // ลบ expense เดิมก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // push ใหม่
    this.caseList.forEach((group: any) => {

      group.items.forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId || 0,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          // group
          Purpose:
            group.name,

          Day:
            group.case,

          People:
            group.person,

          Month:
            group.day,

          // item
          Month_Name:
            item.type,

          Expense_Detail:

            item.type == 'other'
              ? item.customName
              : item.type,

          Price:
            item.amount,

          // summary
          Rate:
            group.costPerCase,

          Total:
            group.total

        });

      });

    });

  }

}