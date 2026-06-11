import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
@Component({
  selector: 'app-expense-rent-house',
  templateUrl: './expenseRentHouse.component.html',
  styles: ``
})
export class ExpenseRentHouseComponent {
  @Input() model: any;
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService
    , private budgetYearService: BudgetYearService
  ) { }
  closeModal() {
    this.model.dismiss();
  }
  rentList: any[] = [];
  department: any[] = []
  allData: any[] = [];
  totalQty: number = 0
  totalAmount: number = 0
  griddata: any[] = [];
  currentYear: any
  file: any = null
  ngOnInit() {
    this.budgetYearService.yearChanged$.subscribe(async year => {

      if (year) {

        if (year < 2500) {
          year = year + 543;
        }

        this.currentYear = year;

        this.get_data();

      }

    });
if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.rentList =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id == this.model.selectedExpenseTypeId
      );

    if (this.rentList.length == 0) {

      this.addRow();

    }
    this.calculateTotal();

  }
  get_data() {

    let model = {
      FUNC_CODE: "FUNC-Get_Budget_Request",
      BgYear: this.currentYear
    };

    var getData = this.serviceebud.GatewayGetData(model);

    getData.subscribe((response: any) => {


      this.department = Array.isArray(response.Mas_Department_Lists)
        ? response.Mas_Department_Lists
        : [];

    });

  }
  addRow() {

    this.model.Budget_Request_Detail_Item.push({
      Request_Item_Id: 0,
      Fk_Expense_Id: this.model.selectedExpenseTypeId,

      Department_Id: null,

      People: 0,

      Per_Year: 0,

      Total: 0

    });

  }
  async removeRow(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.model.Budget_Request_Detail_Item.splice(i, 1);

    this.calculateTotal();

  }
  onPerYearChange(value: any, item: any) {

    const numberValue = String(value)
      .replace(/,/g, '');

    item.Per_Year =
      Number(numberValue) || 0;

    this.calculateTotal();

  }
  calculateTotal() {

    this.model.Budget_Request_Detail_Item.forEach((row: any) => {

      row.Total = Number(row.Per_Year) || 0;

    });

    this.totalQty =
      this.model.Budget_Request_Detail_Item.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.People) || 0),
        0
      );

    this.totalAmount =
      this.model.Budget_Request_Detail_Item.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.Per_Year) || 0),
        0
      );

  }

  onFileChange(event: any) {

    this.file = event.target.files[0]

  }

  save() {

    // if (!this.file) {
    //   alert('กรุณาแนบไฟล์')
    //   return
    // }

  }
}
