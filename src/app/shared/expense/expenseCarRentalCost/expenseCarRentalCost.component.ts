import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-car-rental-cost',
  templateUrl: './expenseCarRentalCost.component.html',
  styles: ``
})
export class ExpenseCarRentalCostComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  tab: 'old' | 'new' = 'old';

  itemsOld: any[] = [];

  itemsNew: any[] = [];

  carOptions = [

    {
      id: 1,
      name: 'รถโดยสาร 12 ที่นั่ง',
      price: 30000
    },

    {
      id: 2,
      name: 'รถบรรทุก',
      price: 40000
    },

    {
      id: 99,
      name: 'ค่าคนขับรถยนต์',
      price: 12000
    }

  ];

  totalMonth = 0;

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

      car: null,

      qty: 1,

      price: 0,

      month: 0,

      total: 0,

      file: null,

      fileName: ''

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

      this.itemsOld = [

        this.createItem()

      ];

      this.itemsNew = [

        this.createItem()

      ];

      return;

    }

    const oldRows =

      rows.filter(

        (x: any) =>

          x.Expense_Name == 'old'

      );

    const newRows =

      rows.filter(

        (x: any) =>

          x.Expense_Name == 'new'

      );

    this.itemsOld =

      oldRows.map((row: any) => {

        return this.mapRow(row);

      });

    this.itemsNew =

      newRows.map((row: any) => {

        return this.mapRow(row);

      });

    if (this.itemsOld.length == 0) {

      this.itemsOld = [

        this.createItem()

      ];

    }

    if (this.itemsNew.length == 0) {

      this.itemsNew = [

        this.createItem()

      ];

    }

    this.calculateAll();

  }

  mapRow(row: any) {

    const carObj =

      this.carOptions.find(

        (x: any) =>

          x.name ==
          row.Expense_Detail

      );

    return {

      requestItemId:
        row.Request_Item_Id || 0,

      car:
        carObj || null,

      qty:
        row.Quantity || 0,

      price:
        row.Price || 0,

      month:
        row.Month || 0,

      total:
        row.Total || 0,

      file: null,

      fileName:
        row.Other_Name || ''

    };

  }

  getCurrentItems() {

    return this.tab === 'old'
      ? this.itemsOld
      : this.itemsNew;

  }

  addItem() {

    this.getCurrentItems().push(

      this.createItem()

    );

    this.updateDetailItems();

  }

  removeItem(i: number) {

    this.getCurrentItems().splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  onSelectCar(item: any, i: number) {

    if (item.car) {

      item.price =
        item.car.price || 0;

    }

    this.calculate(i);

  }

  calculate(i: number) {

    const item =
      this.getCurrentItems()[i];

    item.total =

      (Number(item.qty) || 0) *

      (Number(item.price) || 0) *

      (Number(item.month) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    const list =
      this.getCurrentItems();

    this.totalMonth =

      list.reduce(

        (s, x) =>

          s + (Number(x.month) || 0),

        0

      );

    this.grandTotal =

      list.reduce(

        (s, x) =>

          s + (Number(x.total) || 0),

        0

      );

  }

  uploadFile(event: any, i: number) {

    const file =
      event.target.files[0];

    if (!file) return;

    const list =
      this.getCurrentItems();

    list[i].file = file;

    list[i].fileName =
      file.name;

    this.updateDetailItems();

  }

  updateDetailItems() {

    // ลบของเดิม
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // OLD
    this.itemsOld.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Name:
          'old',

        Expense_Detail:
          item.car?.name || '',

        Quantity:
          item.qty,

        Price:
          item.price,

        Month:
          item.month,

        Total:
          item.total,

        Other_Name:
          item.fileName || ''

      });

    });

    // NEW
    this.itemsNew.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Name:
          'new',

        Expense_Detail:
          item.car?.name || '',

        Quantity:
          item.qty,

        Price:
          item.price,

        Month:
          item.month,

        Total:
          item.total,

        Other_Name:
          item.fileName || ''

      });

    });

  }

  save() {

    console.log({

      old: this.itemsOld,

      new: this.itemsNew

    });

  }

}