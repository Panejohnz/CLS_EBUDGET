import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-computer-material-cost',
  templateUrl: './expenseComputerMaterialCost.component.html',
  styles: ``
})
export class ExpenseComputerMaterialCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  computerOptions = [

    {
      id: 1,
      name: 'หมึกพิมพ์ HP Toner CF400',
      price: 2500,
      unit: 'กล่อง'
    },

    {
      id: 2,
      name: 'หมึก Xerox Docuprint',
      price: 4500,
      unit: 'กล่อง'
    },

    {
      id: 3,
      name: 'Printer OKI B412DN',
      price: 12000,
      unit: 'เครื่อง'
    }

  ];

  grandTotal = 0;

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

      product: null,

      qty: 0,

      unit: '',

      price: 0,

      total: 0,

      remark: ''

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

      this.items = [

        this.createItem()

      ];

      return;

    }

    this.items =

      rows.map((row: any) => {

        const productObj =

          this.computerOptions.find(

            (x: any) =>

              x.name ==
              row.Expense_Detail

          );

        return {

          requestItemId:
            row.Request_Item_Id || 0,

          product:
            productObj || null,

          qty:
            row.Quantity || 0,

          unit:
            row.Unit_Name || '',

          price:
            row.Price || 0,

          total:
            row.Total || 0,

          remark:
            row.Reson || ''

        };

      });
    this.model.Total = this.grandTotal;
    this.calculateAll();

  }

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

  onSelectProduct(item: any, i: number) {

    if (item.product) {

      item.price =
        item.product.price || 0;

      item.unit =
        item.product.unit || '';

    }

    this.calculate(i);

  }

  calculate(i: number) {

    const item = this.items[i];

    item.total =

      (Number(item.qty) || 0) *

      (Number(item.price) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =

      this.items.reduce(

        (sum, x) =>

          sum + (Number(x.total) || 0),

        0

      );

  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.product?.name || '',

        Quantity:
          item.qty,

        Unit_Name:
          item.unit,

        Price:
          item.price,

        Total:
          item.total,

        Reson:
          item.remark || ''

      });

    });
    this.model.Total = this.grandTotal;
  }

  save() {

  }

  closeModal() { }

}