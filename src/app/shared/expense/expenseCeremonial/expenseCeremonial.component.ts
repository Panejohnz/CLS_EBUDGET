import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-ceremonial',
  templateUrl: './expenseCeremonial.component.html',
  styles: ``
})
export class ExpenseCeremonialComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  groups: any[] = [];

  grandTotal = 0;

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

  bindData() {

    const rows =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId

      );

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.groups = [
        this.newGroup()
      ];

      this.calculateGrand();

      return;

    }
    const groupedMap: any = {};

    rows.forEach((row: any) => {

      const key =
        row.Purpose || 'default';

      if (!groupedMap[key]) {

        groupedMap[key] = {

          requestGroupId:
            row.Request_Item_Id || 0,

          title:
            row.Purpose || '',

          lunch: {
            requestItemId: 0,
            meal: 0,
            person: 0,
            price: 0,
            total: 0
          },

          snack: {
            requestItemId: 0,
            meal: 0,
            person: 0,
            price: 0,
            total: 0
          },

          totalMeal: 0,

          totalPerson: 0,

          grandTotal: 0

        };

      }

      // lunch
      if (row.Expense_Detail == 'ค่าอาหารกลางวัน') {

        groupedMap[key].lunch = {

          requestItemId:
            row.Request_Item_Id || 0,

          meal:
            row.Times || 0,

          person:
            row.People || 0,

          price:
            row.Price || 0,

          total:
            row.Total || 0

        };

      }

      // snack
      if (row.Expense_Detail == 'ค่าอาหารว่างและเครื่องดื่ม') {

        groupedMap[key].snack = {

          requestItemId:
            row.Request_Item_Id || 0,

          meal:
            row.Times || 0,

          person:
            row.People || 0,

          price:
            row.Price || 0,

          total:
            row.Total || 0

        };

      }

    });
    this.model.Total = this.grandTotal;
    this.groups =
      Object.values(groupedMap);

    this.groups.forEach((g: any) => {

      this.calculate(g, false);

    });

    this.calculateGrand();

  }

  newGroup() {

    return {

      requestGroupId: 0,

      title: '',

      lunch: {

        requestItemId: 0,

        meal: 0,

        person: 0,

        price: 0,

        total: 0

      },

      snack: {

        requestItemId: 0,

        meal: 0,

        person: 0,

        price: 0,

        total: 0

      },

      totalMeal: 0,

      totalPerson: 0,

      grandTotal: 0

    };

  }

  addGroup() {

    this.groups.push(
      this.newGroup()
    );

  }

  removeGroup(index: number) {

    this.groups.splice(index, 1);

    this.calculateGrand();

    this.updateDetailItems();

  }

  calculate(group: any, update = true) {

    // lunch
    group.lunch.total =

      (Number(group.lunch.meal) || 0) *

      (Number(group.lunch.person) || 0) *

      (Number(group.lunch.price) || 0);

    // snack
    group.snack.total =

      (Number(group.snack.meal) || 0) *

      (Number(group.snack.person) || 0) *

      (Number(group.snack.price) || 0);

    // รวม
    group.totalMeal =

      (Number(group.lunch.meal) || 0) +

      (Number(group.snack.meal) || 0);

    group.totalPerson =

      (Number(group.lunch.person) || 0) +

      (Number(group.snack.person) || 0);

    group.grandTotal =

      (Number(group.lunch.total) || 0) +

      (Number(group.snack.total) || 0);

    this.calculateGrand();

    if (update) {

      this.updateDetailItems();

    }

  }

  calculateGrand() {

    this.grandTotal =

      this.groups.reduce(

        (sum: number, g: any) =>

          sum + (Number(g.grandTotal) || 0),

        0

      );

  }

  updateDetailItems() {

    // ลบของเดิมก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // push ใหม่
    this.groups.forEach((group: any) => {

      // lunch
      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          group.lunch.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Purpose:
          group.title,

        Expense_Detail:
          'ค่าอาหารกลางวัน',

        Times:
          group.lunch.meal,

        People:
          group.lunch.person,

        Price:
          group.lunch.price,

        Total:
          group.lunch.total

      });

      // snack
      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          group.snack.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Purpose:
          group.title,

        Expense_Detail:
          'ค่าอาหารว่างและเครื่องดื่ม',

        Times:
          group.snack.meal,

        People:
          group.snack.person,

        Price:
          group.snack.price,

        Total:
          group.snack.total

      });

    });
    this.model.Total = this.grandTotal;
  }

  async save() {

    const userConfirmed =
      await confirmAlert(
        'info',
        'ต้องการบันทึกข้อมูล ?',
        ''
      );

    if (userConfirmed) {

      basicAlert(
        'success',
        'บันทึกข้อมูลแล้ว',
        ''
      );

      this.model.dismiss();

    }

  }

}