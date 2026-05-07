import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-car-allowance',
  templateUrl: './expenseCarAllowance.component.html',
  styles: ``
})
export class ExpenseCarAllowanceComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  list: any[] = [];

  // =========================
  // init
  // =========================
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

  // =========================
  // bind data ตอน edit
  // =========================
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

          name: '',

          position: '',

          qty: 0,

          rate: 0,

          total: 0
        }

      ];

      return;

    }

    // edit
    this.list =

      rows.map((x: any) => ({

        requestItemId:
          x.Request_Item_Id || 0,

        name:
          x.Other_Name || '',

        position:
          x.Position_Name || '',

        qty:
          x.Quantity || 0,

        rate:
          x.Per_Month || 0,

        total:
          x.Total || 0

      }));

  }

  // =========================
  // add
  // =========================
  add() {

    this.list.push({

      requestItemId: 0,

      name: '',

      position: '',

      qty: 0,

      rate: 0,

      total: 0

    });

  }

  // =========================
  // remove
  // =========================
  remove(item: any) {

    this.list =
      this.list.filter(
        (i: any) => i !== item
      );

    this.updateDetailItems();

  }

  // =========================
  // calc
  // =========================
  calculate(item: any) {

    item.total =

      (Number(item.qty) || 0) *

      (Number(item.rate) || 0) *

      12;

    this.updateDetailItems();

  }

  // =========================
  // total qty
  // =========================
  get totalQty() {

    return this.list.reduce(

      (sum: number, i: any) =>

        sum + (Number(i.qty) || 0),

      0

    );

  }

  // =========================
  // total month
  // =========================
  get totalMonth() {

    return this.list.reduce(

      (sum: number, i: any) =>

        sum + (Number(i.rate) || 0),

      0

    );

  }

  // =========================
  // total year
  // =========================
  get totalYear() {

    return this.list.reduce(

      (sum: number, i: any) =>

        sum + (Number(i.total) || 0),

      0

    );

  }

  // =========================
  // sync model กลาง
  // =========================
  updateDetailItems() {

    // ลบของ expense type นี้ก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // push ใหม่
    this.list.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          'ค่าเช่ารถประจำตำแหน่ง',

        Other_Name:
          item.name,

        Position_Name:
          item.position,

        Quantity:
          item.qty,

        Per_Month:
          item.rate,

        Total:
          item.total

      });

    });

  }

}