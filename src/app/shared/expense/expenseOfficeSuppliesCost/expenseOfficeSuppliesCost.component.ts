import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-office-supplies-cost',
  templateUrl: './expenseOfficeSuppliesCost.component.html',
  styles: ``
})
export class ExpenseOfficeSuppliesCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  items: any[] = [];

  materialOptions = [

    { id: 1, name: 'ปากกาลูกลื่น' },

    { id: 2, name: 'กระดาษ A4' },

    { id: 3, name: 'แฟ้มเอกสาร' }

  ];

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
          material: null,
          qty: 0,
          unit: '',
          price: 0,
          total: 0,
          remark: ''
        }

      ];

      return;

    }

    this.items = rows.map((row: any) => {

      // หา object จาก option
      const materialObj =

        this.materialOptions.find(

          (x: any) =>

            x.name ==
            row.Expense_Detail

        );

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        material:
          materialObj || null,

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

    this.calculateAll();

  }

  addItem() {

    this.items.push({

      requestItemId: 0,

      material: null,

      qty: 0,

      unit: '',

      price: 0,

      total: 0,

      remark: ''

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
          item.material?.name || '',

        Quantity:
          item.qty,

        Unit_Name:
          item.unit,

        Price:
          item.price,

        Total:
          item.total,

        Reson:
          item.remark

      });

    });

  }

}