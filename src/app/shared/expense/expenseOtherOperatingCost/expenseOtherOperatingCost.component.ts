import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

interface CostItem {

  requestItemId?: number;

  name: string;

  quantity: number;

  price: number;

}

@Component({
  selector: 'app-expense-other-operating-cost',
  templateUrl: './expenseOtherOperatingCost.component.html',
  styles: ``
})
export class ExpenseOtherOperatingCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: CostItem[] = [];

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

      this.items = [

        {
          requestItemId: 0,
          name: '',
          quantity: 0,
          price: 0
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

        quantity:
          row.Quantity || 0,

        price:
          row.Price || 0

      };

    });

  }

  addItem() {

    this.items.push({

      requestItemId: 0,

      name: '',

      quantity: 0,

      price: 0

    });

    this.updateDetailItems();

  }
  async removeItem(index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const item =
      this.items[index];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

    this.items.splice(index, 1);

    this.updateDetailItems();

  }

  getTotal(item: CostItem): number {

    return (

      (Number(item.quantity) || 0) *

      (Number(item.price) || 0)

    );

  }

  getGrandTotal(): number {

    return this.items.reduce(

      (sum, item) =>

        sum + this.getTotal(item),

      0

    );

  }

  getTotalQty(): number {

    return this.items.reduce(

      (sum, item) =>

        sum + (Number(item.quantity) || 0),

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

        Quantity:
          item.quantity,

        Price:
          item.price,

        Total:
          this.getTotal(item)

      });

    });

  }

}
