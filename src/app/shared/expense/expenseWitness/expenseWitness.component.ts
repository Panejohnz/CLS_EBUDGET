import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-witness',
  templateUrl: './expenseWitness.component.html',
  styles: ``
})
export class ExpenseWitnessComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  list: any[] = [

    {
      name: 'ค่าตอบแทนและค่าใช้จ่ายแก่พยาน',
      level: 0,
      children: true
    },

    {
      requestItemId: 0,

      name: 'ขนาดคดี S',

      level: 1,

      case: 0,

      person: 0,

      rate: 0
    },

    {
      requestItemId: 0,

      name: 'ขนาดคดี M',

      level: 1,

      case: 0,

      person: 0,

      rate: 0
    },

    {
      requestItemId: 0,

      name: 'ขนาดคดี L',

      level: 1,

      case: 0,

      person: 0,

      rate: 0
    }

  ];

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

    if (rows.length == 0) {

      return;

    }

    this.list.forEach((item: any) => {

      if (item.level != 1) return;

      const found = rows.find(

        (x: any) =>

          x.Expense_Detail ==
          item.name

      );

      if (found) {

        item.requestItemId =
          found.Request_Item_Id || 0;

        item.case =
          found.Day || 0;

        item.person =
          found.People || 0;

        item.rate =
          found.Rate || 0;

      }

    });

  }

  calculate() {

    this.updateDetailItems();

  }

  getCost(row: any): number {

    // parent
    if (row.children) {

      return this.list

        .filter((x: any) => x.level === 1)

        .reduce(

          (sum: number, r: any) =>

            sum +

            (
              (Number(r.person) || 0) *

              (Number(r.rate) || 0)
            ),

          0

        );

    }

    // child
    return (Number(row.person) || 0) *

      (Number(row.rate) || 0);

  }

  getTotal(row: any): number {

    // parent
    if (row.children) {

      return this.list

        .filter((x: any) => x.level === 1)

        .reduce(

          (sum: number, r: any) =>

            sum +

            (
              (Number(r.case) || 0) *

              (Number(r.person) || 0) *

              (Number(r.rate) || 0)
            ),

          0

        );

    }

    // child
    return (Number(row.case) || 0) *

      (Number(row.person) || 0) *

      (Number(row.rate) || 0);

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
    this.list.forEach((item: any) => {

      // skip parent
      if (item.level != 1) return;

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Purpose:
          'ค่าตอบแทนและค่าใช้จ่ายแก่พยาน',

        Expense_Detail:
          item.name,

        Day:
          item.case,

        People:
          item.person,

        Rate:
          item.rate,

        Price:
          this.getCost(item),

        Total:
          this.getTotal(item)

      });

    });

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