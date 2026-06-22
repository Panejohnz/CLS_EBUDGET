import { Component, Input } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-fuel-lubricant',
  templateUrl: './expenseFuelLubricant.component.html',
  styles: ``
})
export class ExpenseFuelLubricantComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    public serviceebud: EbudgetService
  ) { }

  list: any[] = [];
  Mas_Expense_Detial_List: any[] = [];
  private currentExpenseTypeId: any = null;

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.loadExpenseDetails();

  }

  ngDoCheck() {
    if (!this.model) return;

    if (this.currentExpenseTypeId != this.model.selectedExpenseTypeId) {
      this.loadExpenseDetails();
    }
  }

  loadExpenseDetails() {
    this.currentExpenseTypeId = this.model.selectedExpenseTypeId;

    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Detial",
      Fk_Expense_Id: this.model.selectedExpenseTypeId
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        const expenseDetailList =
          response.List_Mas_Expense_Detial ??
          response.List_Mas_Expense_Detail;

        this.Mas_Expense_Detial_List =
          Array.isArray(expenseDetailList)
            ? expenseDetailList
            : [];

        this.bindData();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.bindData();
      });
  }

  normalizeSelectId(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  private resolveExpenseDetailId(row: any): number | null {
    const detailId =
      row?.Fk_Expense_Detail_Id ??
      row?.Fk_Expense_Detial_Id ??
      row?.Expense_Detail_Id ??
      row?.Expense_Detial_Id;

    const normalizedId = this.normalizeSelectId(detailId);

    if (normalizedId != null) {
      return normalizedId;
    }

    const rowText = this.normalizeText(row?.Expense_Detail);
    const detail = this.Mas_Expense_Detial_List.find((item: any) =>
      this.normalizeText(item?.Expense_Detial_Name) === rowText
    );

    return this.normalizeSelectId(detail?.Expense_Detial_Id);
  }

  getSelectedExpenseDetail(item: any): any {
    const pairId = this.normalizeSelectId(item?.pairId);

    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.normalizeSelectId(detail?.Expense_Detial_Id) === pairId
    );
  }

  onTypeChange(item: any) {
    const selected = this.getSelectedExpenseDetail(item);
    item.type = selected?.Expense_Detial_Name || '';
    this.updateDetailItems();
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

      this.list = [

        {
          requestItemId: 0,
          pairId: null,
          type: '',
          month: 0,
          year: 0
        }

      ];

      return;

    }

    this.list = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        pairId:
          this.resolveExpenseDetailId(row),

        type:
          row.Expense_Detail || '',

        month:
          row.Per_Month || 0,

        year:
          row.Per_Year || 0

      };

    });
    this.model.Total = this.getTotal;
  }

  add() {

    this.list.push({

      requestItemId: 0,

      pairId: null,

      type: '',

      month: 0,

      year: 0

    });

    this.updateDetailItems();

  }
  async remove(index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const item =
      this.list[index];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

    this.list.splice(index, 1);

    this.updateDetailItems();

  }

  calculate(item: any) {

    item.year =

      (Number(item.month) || 0) * 12;

    this.updateDetailItems();

  }

  getTotal(field: string): number {

    return this.list.reduce(

      (sum, item) => {

        return sum + (Number(item[field]) || 0);

      },

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
    this.list.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.type,

        Fk_Expense_Detail_Id:
          item.pairId || 0,

        Per_Month:
          item.month,

        Per_Year:
          item.year,

        Total:
          item.year

      });

    });
    this.model.Total = this.getTotal;
  }

}
