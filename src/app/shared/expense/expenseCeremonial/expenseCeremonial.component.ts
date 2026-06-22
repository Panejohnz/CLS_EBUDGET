import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-ceremonial',
  templateUrl: './expenseCeremonial.component.html',
  styles: ``
})
export class ExpenseCeremonialComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  groups: any[] = [];

  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;

  grandTotal = 0;

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

  closeModal() {

    this.model.dismiss();

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

        this.loadExpenseRates();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.loadExpenseRates();
      });
  }

  loadExpenseRates() {
    const expenseIds = [
      this.model.selectedExpenseTypeId,
      ...this.Mas_Expense_Detial_List.map((detail: any) =>
        this.getExpenseDetailId(detail)
      )
    ].filter((id: any, index: number, list: any[]) =>
      id !== null &&
      id !== undefined &&
      id !== '' &&
      list.findIndex((item: any) => this.isSameId(item, id)) === index
    );

    if (expenseIds.length == 0) {
      this.Mas_Expense_Detial_Rate_List = [];
      this.bindData();
      this.applyMasterRates();
      return;
    }

    const requests = expenseIds.map((expenseId: any) =>
      this.serviceebud.GatewayGetData({
        FUNC_CODE: "FUNC-Get_Mas_Expense_Rate",
        Fk_Expense_Id: expenseId
      }).pipe(
        catchError(() => of({ List_Mas_Expense_Rate: [] }))
      )
    );

    forkJoin(requests)
      .subscribe((responses: any[]) => {
        this.Mas_Expense_Detial_Rate_List =
          responses.reduce((list: any[], response: any) => {
            const expenseRateList =
              response?.List_Mas_Expense_Rate;

            return Array.isArray(expenseRateList)
              ? list.concat(expenseRateList)
              : list;
          }, []);

        this.bindData();
        this.applyMasterRates();
      }, () => {
        this.Mas_Expense_Detial_Rate_List = [];
        this.bindData();
        this.applyMasterRates();
      });
  }

  private toNumber(value: any): number {
    return Number(value?.toString().replace(/,/g, '')) || 0;
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  private isSameId(a: any, b: any): boolean {
    return a !== null &&
      a !== undefined &&
      b !== null &&
      b !== undefined &&
      Number(a) === Number(b);
  }

  private getExpenseDetailId(row: any): any {
    return row?.Expense_Detial_Id ??
      row?.Expense_Detail_Id ??
      row?.Fk_Expense_Detial_Id ??
      row?.Fk_Expense_Detail_Id;
  }

  private getRowRate(row: any): number {
    return this.toNumber(
      row?.Request_Rate ??
      row?.Expense_Rate ??
      row?.Rate ??
      row?.Price ??
      row?.Total
    );
  }

  private getRateRowText(row: any): string {
    return this.normalizeText([
      row?.Expense_Detail,
      row?.Expense_Name,
      row?.Expense_Short_Name,
      row?.Expense_Detial_Name,
      row?.Expense_Detial_Short_Name,
      row?.Rate_Name,
      row?.Type_Name,
      row?.Code
    ].filter(Boolean).join(' '));
  }

  private getExpenseDetailByName(name: any): any {
    const text = this.normalizeText(name);

    if (!text) {
      return null;
    }

    return this.Mas_Expense_Detial_List.find((detail: any) => {
      const detailText = this.normalizeText([
        detail?.Expense_Detial_Name,
        detail?.Expense_Detail,
        detail?.Expense_Name,
        detail?.Expense_Detial_Short_Name
      ].filter(Boolean).join(' '));

      return detailText &&
        (
          detailText === text ||
        detailText.includes(text) ||
          text.includes(detailText)
        );
    });
  }

  private getRateForExpenseDetail(name: any): number {
    const detail = this.getExpenseDetailByName(name);
    const detailId = this.getExpenseDetailId(detail);
    const detailRate = this.getRowRate(detail);

    if (detailRate > 0) {
      return detailRate;
    }

    const byId = this.Mas_Expense_Detial_Rate_List.find((row: any) =>
      this.isSameId(this.getExpenseDetailId(row), detailId)
    );

    if (byId) {
      return this.getRowRate(byId);
    }

    const text = this.normalizeText(name);
    const byName = this.Mas_Expense_Detial_Rate_List.find((row: any) => {
      const rateText = this.getRateRowText(row);

      return rateText &&
        (
          rateText.includes(text) ||
          text.includes(rateText)
        );
    });

    if (byName) {
      return this.getRowRate(byName);
    }

    const detailIndex = this.Mas_Expense_Detial_List.findIndex((item: any) =>
      this.isSameId(this.getExpenseDetailId(item), detailId)
    );

    return this.getRowRate(this.Mas_Expense_Detial_Rate_List[detailIndex]);
  }

  private getRowPrice(row: any): number {
    const price = this.toNumber(row?.Price);

    return price > 0
      ? price
      : this.toNumber(row?.Expense_Rate) ||
      this.getRateForExpenseDetail(row?.Expense_Detail);
  }

  private applyMasterRates() {
    this.groups.forEach((group: any) => {
      if (this.toNumber(group?.lunch?.price) <= 0) {
        group.lunch.price = this.getRateForExpenseDetail('ค่าอาหารกลางวัน');
      }

      if (this.toNumber(group?.snack?.price) <= 0) {
        group.snack.price = this.getRateForExpenseDetail('ค่าอาหารว่างและเครื่องดื่ม');
      }

      (group.otherItems || []).forEach((item: any) => {
        if (this.toNumber(item?.price) <= 0) {
          item.price = this.getRateForExpenseDetail(item?.name);
        }
      });

      this.calculate(group, false);
    });

    this.calculateGrand();
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

      this.calculateGrand();

      return;

    }
    const groupedMap: any = {};

    rows.forEach((row: any) => {

      const key =
        row.Purpose || 'default';

      if (!groupedMap[key]) {

        groupedMap[key] = {

          requestGroupId:
            row.Request_Item_Id || 0,

          title:
            row.Purpose || '',

          lunch: {
            requestItemId: 0,
            meal: 0,
            person: 0,
            price: 0,
            total: 0
          },

          snack: {
            requestItemId: 0,
            meal: 0,
            person: 0,
            price: 0,
            total: 0
          },

          otherItems: [],

          totalMeal: 0,

          totalPerson: 0,

          grandTotal: 0

        };

      }

      // lunch
      if (row.Expense_Detail == 'ค่าอาหารกลางวัน') {

        groupedMap[key].lunch = {

          requestItemId:
            row.Request_Item_Id || 0,

          meal:
            row.Times || 0,

          person:
            row.People || 0,

          price:
            this.getRowPrice(row),

          total:
            row.Total || 0

        };

      }

      // snack
      if (row.Expense_Detail == 'ค่าอาหารว่างและเครื่องดื่ม') {

        groupedMap[key].snack = {

          requestItemId:
            row.Request_Item_Id || 0,

          meal:
            row.Times || 0,

          person:
            row.People || 0,

          price:
            this.getRowPrice(row),

          total:
            row.Total || 0

        };

      }

      if (
        row.Expense_Detail != 'ค่าอาหารกลางวัน' &&
        row.Expense_Detail != 'ค่าอาหารว่างและเครื่องดื่ม'
      ) {

        groupedMap[key].otherItems.push({

          requestItemId:
            row.Request_Item_Id || 0,

          name:
            row.Expense_Detail || '',

          meal:
            row.Times || 0,

          person:
            row.People || 0,

          price:
            this.getRowPrice(row),

          total:
            row.Total || 0

        });

      }

    });
    this.model.Total = this.grandTotal;
    this.groups =
      Object.values(groupedMap);

    this.groups.forEach((g: any) => {

      this.calculate(g, false);

    });

    this.calculateGrand();

  }

  newGroup() {

    return {

      requestGroupId: 0,

      title: '',

      lunch: {

        requestItemId: 0,

        meal: 0,

        person: 0,

        price: 0,

        total: 0

      },

      snack: {

        requestItemId: 0,

        meal: 0,

        person: 0,

        price: 0,

        total: 0

      },

      otherItems: [],

      totalMeal: 0,

      totalPerson: 0,

      grandTotal: 0

    };

  }

  addGroup() {

    this.groups.push(
      this.newGroup()
    );

  }

  newOtherItem() {

    return {

      requestItemId: 0,

      name: '',

      meal: 0,

      person: 0,

      price: 0,

      total: 0

    };

  }

  addOtherItem(group: any) {

    if (!group.otherItems) {

      group.otherItems = [];

    }

    group.otherItems.push(
      this.newOtherItem()
    );

    this.calculate(group);

  }

  async removeOtherItem(group: any, index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    group.otherItems.splice(index, 1);

    this.calculate(group);

  }
  async removeGroup(index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.groups.splice(index, 1);

    this.calculateGrand();

    this.updateDetailItems();

  }

  calculate(group: any, update = true) {

    // lunch
    group.lunch.total =

      (Number(group.lunch.meal) || 0) *

      (Number(group.lunch.person) || 0) *

      (Number(group.lunch.price) || 0);

    // snack
    group.snack.total =

      (Number(group.snack.meal) || 0) *

      (Number(group.snack.person) || 0) *

      (Number(group.snack.price) || 0);

    // รวม
    (group.otherItems || []).forEach((item: any) => {

      item.total =

        (Number(item.meal) || 0) *

        (Number(item.person) || 0) *

        (Number(item.price) || 0);

    });

    const otherTotalMeal =

      (group.otherItems || []).reduce(

        (sum: number, item: any) =>

          sum + (Number(item.meal) || 0),

        0

      );

    const otherTotalPerson =

      (group.otherItems || []).reduce(

        (sum: number, item: any) =>

          sum + (Number(item.person) || 0),

        0

      );

    const otherGrandTotal =

      (group.otherItems || []).reduce(

        (sum: number, item: any) =>

          sum + (Number(item.total) || 0),

        0

      );

    group.totalMeal =

      (Number(group.lunch.meal) || 0) +

      (Number(group.snack.meal) || 0) +

      otherTotalMeal;

    group.totalPerson =

      (Number(group.lunch.person) || 0) +

      (Number(group.snack.person) || 0) +

      otherTotalPerson;

    group.grandTotal =

      (Number(group.lunch.total) || 0) +

      (Number(group.snack.total) || 0) +

      otherGrandTotal;

    this.calculateGrand();

    if (update) {

      this.updateDetailItems();

    }

  }

  calculateGrand() {

    this.grandTotal =

      this.groups.reduce(

        (sum: number, g: any) =>

          sum + (Number(g.grandTotal) || 0),

        0

      );

  }

  updateDetailItems() {

    // ลบของเดิมก่อน
    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // push ใหม่
    this.groups.forEach((group: any) => {

      // lunch
      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          group.lunch.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Purpose:
          group.title,

        Expense_Detail:
          'ค่าอาหารกลางวัน',

        Fk_Expense_Detail_Id:
          this.getExpenseDetailId(this.getExpenseDetailByName('ค่าอาหารกลางวัน')) || 0,

        Times:
          group.lunch.meal,

        People:
          group.lunch.person,

        Price:
          group.lunch.price,

        Total:
          group.lunch.total

      });

      // snack
      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          group.snack.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Purpose:
          group.title,

        Expense_Detail:
          'ค่าอาหารว่างและเครื่องดื่ม',

        Fk_Expense_Detail_Id:
          this.getExpenseDetailId(this.getExpenseDetailByName('ค่าอาหารว่างและเครื่องดื่ม')) || 0,

        Times:
          group.snack.meal,

        People:
          group.snack.person,

        Price:
          group.snack.price,

        Total:
          group.snack.total

      });

      (group.otherItems || []).forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId || 0,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Purpose:
            group.title,

          Expense_Detail:
            item.name,

          Fk_Expense_Detail_Id:
            this.getExpenseDetailId(this.getExpenseDetailByName(item.name)) || 0,

          Times:
            item.meal,

          People:
            item.person,

          Price:
            item.price,

          Total:
            item.total

        });

      });

    });
    this.model.Total = this.grandTotal;
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
