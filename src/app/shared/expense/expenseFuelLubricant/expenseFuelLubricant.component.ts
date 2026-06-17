import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-fuel-lubricant',
  templateUrl: './expenseFuelLubricant.component.html',
  styles: ``
})
export class ExpenseFuelLubricantComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  list: any[] = [];

  vehicleTypes = [

    'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ 91)',

    'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ 95)',

    'รถยนต์นั่งธรรมดา (แก๊สโซฮอล์ E20)',

    'รถยนต์นั่งธรรมดา (ดีเซล)',

    'รถโดยสารขนาด 10-12 ที่นั่ง'

  ];

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

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

      this.list = [

        {
          requestItemId: 0,
          type: '',
          month: 0,
          year: 0
        }

      ];

      return;

    }

    this.list = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        type:
          row.Expense_Detail || '',

        month:
          row.Per_Month || 0,

        year:
          row.Per_Year || 0

      };

    });
    this.model.Total = this.getTotal;
  }

  add() {

    this.list.push({

      requestItemId: 0,

      type: '',

      month: 0,

      year: 0

    });

    this.updateDetailItems();

  }
  async remove(index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.list.splice(index, 1);

    this.updateDetailItems();

  }

  calculate(item: any) {

    item.year =

      (Number(item.month) || 0) * 12;

    this.updateDetailItems();

  }

  getTotal(field: string): number {

    return this.list.reduce(

      (sum, item) => {

        return sum + (Number(item[field]) || 0);

      },

      0

    );

  }

  updateDetailItems() {

    // ลบของเดิม
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // เพิ่มใหม่
    this.list.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.type,

        Per_Month:
          item.month,

        Per_Year:
          item.year,

        Total:
          item.year

      });

    });
    this.model.Total = this.getTotal;
  }

}