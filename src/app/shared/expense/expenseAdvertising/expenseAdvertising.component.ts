import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-advertising',
  templateUrl: './expenseAdvertising.component.html',
  styles: ``
})
export class ExpenseAdvertisingComponent {

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

      this.calculateAll();

      return;

    }

    // group ตาม Purpose
    const groupedMap: any = {};

    rows.forEach((row: any) => {

      const key =
        row.Purpose || 'default';

      if (!groupedMap[key]) {

        groupedMap[key] = {

          requestGroupId:
            row.Request_Item_Id || 0,

          name:
            row.Purpose || '',

          objective:
            row.Reson || '',

          result:
            row.Other_Name || '',

          total: 0,

          items: []

        };

      }

      groupedMap[key].items.push({

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        duration:
          row.Day || 0,

        amount:
          row.Price || 0,

        times:
          row.Times || 0,

        rate:
          row.Rate || 0,

        total:
          row.Total || 0

      });

    });

    this.groups =
      Object.values(groupedMap);

    this.calculateAll();

  }

  newItem() {

    return {

      requestItemId: 0,

      name: '',

      duration: 0,

      amount: 0,

      times: 0,

      rate: 0,

      total: 0

    };

  }

  newGroup() {

    return {

      requestGroupId: 0,

      name: '',

      objective: '',

      result: '',

      total: 0,

      items: [
        this.newItem()
      ]

    };

  }

  addGroup() {

    this.groups.push(
      this.newGroup()
    );

  }

  removeGroup(i: number) {

    this.groups.splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  addItem(gi: number) {

    this.groups[gi].items.push(
      this.newItem()
    );

  }

  removeItem(gi: number, i: number) {

    this.groups[gi].items.splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculate(gi: number, i: number) {

    const item =
      this.groups[gi].items[i];

    item.total =

      (Number(item.duration) || 0) *

      (Number(item.amount) || 0) *

      (Number(item.times) || 0) *

      (Number(item.rate) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal = 0;

    this.groups.forEach((g: any) => {

      g.total = g.items.reduce(

        (sum: number, item: any) =>

          sum + (Number(item.total) || 0),

        0

      );

      this.grandTotal +=
        g.total;

    });

  }

  updateDetailItems() {

    // ลบของ expense เดิมก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // เพิ่มใหม่
    this.groups.forEach((group: any) => {

      group.items.forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId || 0,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          // รายการหลัก
          Purpose:
            group.name,

          Reson:
            group.objective,

          Other_Name:
            group.result,

          // รายการย่อย
          Expense_Detail:
            item.name,

          Day:
            item.duration,

          Price:
            item.amount,

          Times:
            item.times,

          Rate:
            item.rate,

          Total:
            item.total

        });

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