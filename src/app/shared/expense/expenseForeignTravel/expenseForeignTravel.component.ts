import { Component, Input } from '@angular/core';
import { catchError, forkJoin, of } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-foreign-travel',
  templateUrl: './expenseForeignTravel.component.html',
  styles: ``
})
export class ExpenseForeignTravelComponent {

  constructor(
    public serviceebud: EbudgetService
  ) { }

  @Input() model: any;

  @Input() expenseItem: any;

  items: any[] = [];
  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;

  grandTotal = 0;

  countryOptions = [

    {
      code: 'JP',
      name: 'ญี่ปุ่น'
    },

    {
      code: 'KR',
      name: 'เกาหลีใต้'
    },

    {
      code: 'CN',
      name: 'จีน'
    },

    {
      code: 'SG',
      name: 'สิงคโปร์'
    },

    {
      code: 'US',
      name: 'สหรัฐอเมริกา'
    },

    {
      code: 'UK',
      name: 'สหราชอาณาจักร'
    },

    {
      code: 'FR',
      name: 'ฝรั่งเศส'
    },

    {
      code: 'DE',
      name: 'เยอรมนี'
    }

  ];

  meetingTypeOptions = [
    {
      value: 'ประชุม',
      label: 'ประชุม'
    },
    {
      value: 'ฝึกอบรม',
      label: 'ฝึกอบรม'
    },
    {
      value: 'เจรจา',
      label: 'เจรจาระหว่างประเทศ'
    }
  ];

  levelOptions = [
    {
      value: 'ระดับ 10 ขึ้นไป',
      label: 'ระดับ 10 ขึ้นไป'
    },
    {
      value: 'ระดับ 9 ขึ้นไป',
      label: 'ระดับ 9 ขึ้นไป'
    },
    {
      value: 'ระดับ 8 ลงมา',
      label: 'ระดับ 8 ลงมา'
    }
  ];

  main = {

    title: '',

    reason: '',

    target: '',

    benefit: ''

  };

  file: File | null = null;

  fileError = false;

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
        text &&
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

  private applyMasterRates() {
    this.items.forEach((item: any, index: number) => {
      const rate = this.getRateForExpenseDetail(item.name);

      if (rate > 0) {
        item.rate = rate;
        this.calculate(index);
      }
    });
  }

  createItem() {

    return {

      requestItemId: 0,

      name: '',

      times: 0,

      person: 0,

      days: 0,

      rate: 0,

      total: 0,

      meetingType: '',

      hasInvite: false,

      country: '',

      level: ''

    };

  }

  // =========================================
  // BIND DATA
  // =========================================

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

    // ============================
    // HEADER
    // ============================

    const headerRow =

      rows.find((x: any) =>
        x.Other_Name == 'HEADER'
      );

    if (headerRow) {

      this.main = {

        title:
          headerRow.Expense_Name || '',

        reason:
          headerRow.Reson || '',

        target:
          headerRow.Position_Name || '',

        benefit:
          headerRow.Position_Type_Name || ''

      };

    }

    // ============================
    // DETAIL
    // ============================

    const detailRows =

      rows.filter((x: any) =>
        x.Other_Name != 'HEADER'
      );

    this.items = detailRows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        name:
          row.Expense_Detail || '',

        times:
          Number(row.Times || 0),

        person:
          Number(row.People || 0),

        days:
          Number(row.Day || 0),

        rate:
          this.toNumber(row.Rate) ||
          this.toNumber(row.Expense_Rate) ||
          this.getRateForExpenseDetail(row.Expense_Detail),

        total:
          Number(row.Total || 0),

        meetingType:
          row.Month_Name || '',

        hasInvite:
          row.People_Type_A == 1,

        country:
          row.Other_Name || '',

        level:
          row.Level_Name || ''

      };

    });

    if (this.items.length == 0) {

      this.items = [

        this.createItem()

      ];

    }
    this.model.Total = this.grandTotal;
    this.calculateAll();

  }

  // =========================================
  // ADD REMOVE
  // =========================================

  addItem() {

    this.items.push(

      this.createItem()

    );

    this.updateDetailItems();

  }

  onNameChange(item: any, index: number) {
    const rate = this.getRateForExpenseDetail(item.name);

    if (rate > 0) {
      item.rate = rate;
      this.calculate(index);
      return;
    }

    this.updateDetailItems();
  }
  async removeItem(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.items.splice(i, 1);

    this.calculateAll();

    this.updateDetailItems();

  }

  // =========================================
  // CALCULATE
  // =========================================

  calculate(i: number) {

    const x =
      this.items[i];

    x.total =

      (Number(x.times) || 0) *

      (Number(x.person) || 0) *

      (Number(x.days) || 0) *

      (Number(x.rate) || 0);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =

      this.items.reduce(

        (s, x) =>

          s + (Number(x.total) || 0),

        0

      );

  }

  // =========================================
  // UPDATE MODEL
  // =========================================

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    // ============================
    // HEADER
    // ============================

    this.model.Budget_Request_Detail_Item.push({

      Request_Item_Id: 0,

      Fk_Expense_Id:
        this.model.selectedExpenseTypeId,

      Other_Name:
        'HEADER',

      Expense_Name:
        this.main.title || '',

      Reson:
        this.main.reason || '',

      Position_Name:
        this.main.target || '',

      Position_Type_Name:
        this.main.benefit || ''

    });

    // ============================
    // DETAIL
    // ============================

    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          item.name || '',

        Fk_Expense_Detail_Id:
          this.getExpenseDetailId(this.getExpenseDetailByName(item.name)) || 0,

        Times:
          Number(item.times) || 0,

        People:
          Number(item.person) || 0,

        Day:
          Number(item.days) || 0,

        Rate:
          Number(item.rate) || 0,

        Total:
          Number(item.total) || 0,

        Month_Name:
          item.meetingType || '',

        People_Type_A:
          item.hasInvite ? 1 : 0,

        Other_Name:
          item.country || '',

        Level_Name:
          item.level || ''

      });

    });
    this.model.Total = this.grandTotal;
  }

  // =========================================
  // FILE
  // =========================================

  uploadFile(event: any) {

    this.file = event.target.files[0];

  }

  // =========================================
  // SAVE
  // =========================================

  save() {

    this.updateDetailItems();

    if (!this.file) {

      this.fileError = true;

      return;

    }

    this.fileError = false;

  }

}
