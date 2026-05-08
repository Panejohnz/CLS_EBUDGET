import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-utility-and-telecom-cost',
  templateUrl: './expenseUtilityAndTelecomCost.component.html',
  styles: ``
})
export class ExpenseUtilityAndTelecomCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  totalMonthly = 0;

  grandTotal = 0;

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

      this.items = [

        {
          requestItemId: 0,
          name: '',
          monthly: 0,
          yearly: 0
        }

      ];

      return;

    }

    this.items = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        monthly:
          row.Per_Month || 0,

        yearly:
          row.Per_Year || 0

      };

    });

    this.calculateAll();

  }

  addItem() {

    this.items.push({

      requestItemId: 0,

      name: '',

      monthly: 0,

      yearly: 0

    });

    this.updateDetailItems();

  }

  removeItem(i: number) {

    this.items.splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculate(i: number) {

    const item = this.items[i];

    item.yearly =

      (Number(item.monthly) || 0) * 12;

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.totalMonthly =

      this.items.reduce(

        (sum, x) =>

          sum + (Number(x.monthly) || 0),

        0

      );

    this.grandTotal =

      this.items.reduce(

        (sum, x) =>

          sum + (Number(x.yearly) || 0),

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
    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name,

        Per_Month:
          item.monthly,

        Per_Year:
          item.yearly,

        Total:
          item.yearly

      });

    });

  }

  closeModal() {

    this.model.dismiss();

  }

}