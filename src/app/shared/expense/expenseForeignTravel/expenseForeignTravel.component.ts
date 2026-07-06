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
  Mas_Country_List: any[] = [];
  levelOptions: any[] = [];
  meetingTypeOptions: any[] = [
    { label: 'ประชุม', value: 'ประชุม' },
    { label: 'ฝึกอบรม', value: 'ฝึกอบรม' },
    { label: 'เจรจาระหว่างประเทศ', value: 'เจรจาระหว่างประเทศ' },
  ];
  obligationOptions: any[] = [
    { label: 'มี', value: true },
    { label: 'ไม่มี', value: false }
  ];
  private currentExpenseTypeId: any = null;

  grandTotal = 0;

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
        this.levelOptions = this.buildLevelOptions();

        this.loadExpenseRates();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.levelOptions = [];
        this.loadExpenseRates();
      });
    let model2 = {
      FUNC_CODE: "FUNC-Get_Mas_Country",
    };

    this.serviceebud.GatewayGetData(model2)
      .subscribe((response: any) => {
        const CountryList =
          response.List_Mas_Country

        this.Mas_Country_List =
          Array.isArray(CountryList)
            ? CountryList.map((country: any) => this.normalizeCountry(country))
            : [];

      }, () => {
        this.Mas_Country_List = [];
      });
  }

  private normalizeCountry(country: any): any {
    const countryId =
      country?.Country_Id ??
      country?.Country_ID ??
      country?.CountryId ??
      country?.Id ??
      country?.ID ??
      '';

    const countryName =
      country?.Country_Name ??
      country?.Country_Name_Th ??
      country?.Country_TH ??
      country?.Country_Thai ??
      country?.Name_Th ??
      country?.Name ??
      country?.Country ??
      '';

    const countryGroup =
      country?.Country_Group_Name ??
      country?.Country_Group ??
      country?.CountryGroup ??
      country?.Group_Country ??
      country?.Group_Country_Name ??
      country?.Country_Type ??
      country?.Country_Type_Name ??
      country?.Group_Name ??
      country?.Zone_Name ??
      country?.Region_Name ??
      '';

    return {
      ...country,
      Country_Id: (countryId ?? '').toString(),
      Country_Name: countryName,
      Country_Group: countryGroup
    };
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

  private buildLevelOptions(): any[] {
    const levels = this.Mas_Expense_Detial_List
      .map((detail: any) => detail?.Child_Detial_Name)
      .filter((level: any) => level !== null && level !== undefined && level !== '');

    return Array.from(new Set(levels)).map((level: any) => ({
      value: level,
      label: level
    }));
  }

  getExpenseDetailsByLevel(item: any): any[] {
    if (!item?.level) {
      return [];
    }

    return this.Mas_Expense_Detial_List.filter((detail: any) =>
      detail?.Child_Detial_Name === item.level
    );
  }

  private refreshExpenseDetails(item: any) {
    item.expenseDetails = this.getExpenseDetailsByLevel(item);
  }

  private getExpenseDetailById(id: any): any {
    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.isSameId(this.getExpenseDetailId(detail), id)
    );
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

  isOtherExpenseDetail(item: any): boolean {
    const detail = this.getExpenseDetailById(item?.detailId) ?? this.getExpenseDetailByName(item?.name);
    const text = this.normalizeText(
      detail?.Expense_Detial_Name ??
      detail?.Expense_Detail ??
      item?.name
    );

    return text.includes('อื่น') || text.includes('other');
  }

  getExpenseDetailNameForSave(item: any): string {
    return this.isOtherExpenseDetail(item)
      ? item.customName || ''
      : item.name || '';
  }

  getCountryGroupLabel(item: any): string {
    const countryId = (item?.Other_Name ?? '').toString();
    const country = this.Mas_Country_List.find((row: any) =>
      (row?.Country_Id ?? '').toString() === countryId
    );

    return country?.Country_Group_Name ?? country?.Country_Group ?? '';
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
      if (this.isOtherExpenseDetail(item)) return;

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

      requestDetailId: 0,

      detailId: null,

      name: '',

      expenseDetails: [],

      times: 0,

      person: 0,

      days: 0,

      rate: 0,

      total: 0,

      customName: '',

      meetingType: null,

      hasInvite: false,

      Other_Name: null,

      level: null

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
      ) ?? rows.find((x: any) =>
        x.Other_Name != 'HEADER'
      );

    if (headerRow) {

      this.main = {

        title:
          headerRow.Purpose || '',

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
      const detailId =
        row.Fk_Expense_Detail_Id ??
        this.getExpenseDetailId(this.getExpenseDetailByName(row.Expense_Detail));
      const detail = this.getExpenseDetailById(detailId);
      const level =
        row.Level_Name ||
        detail?.Child_Detial_Name ||
        null;

      const item = {

        requestItemId:
          row.Request_Item_Id || 0,

        requestDetailId:
          row.Fk_Request_Detail_Id || 0,

        detailId:
          detailId || null,

        name:
          row.Expense_Detail || '',

        customName:
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
          row.Month_Name || null,

        hasInvite:
          row.People_Type_A == 1,

        Other_Name:
          row.Other_Name ? row.Other_Name.toString() : null,

        level:
          level,

        expenseDetails: []

      };

      this.refreshExpenseDetails(item);

      return item;

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

  onLevelChange(item: any, index: number) {
    this.refreshExpenseDetails(item);

    item.detailId = null;
    item.name = '';
    item.rate = 0;
    item.total = 0;

    this.calculate(index);
  }

  onExpenseDetailChange(item: any, index: number) {
    const detail = this.getExpenseDetailById(item.detailId);

    item.name = detail?.Expense_Detial_Name || '';
    item.customName = '';

    if (this.isOtherExpenseDetail(item)) {
      item.rate = '';
      this.calculate(index);
      return;
    }

    item.rate = detail ? this.getRateForExpenseDetail(item.name) : 0;

    this.calculate(index);
  }
  async removeItem(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const item =
      this.items[i];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

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

      this.toNumber(x.times) *

      this.toNumber(x.person) *

      this.toNumber(x.days) *

      this.toNumber(x.rate);

    this.calculateAll();

    this.updateDetailItems();

  }

  calculateAll() {

    this.grandTotal =

      this.items.reduce(

        (s, x) =>

          s + this.toNumber(x.total),

        0

      );

  }

  private getRequestBudgetId(): number {
    return this.toInt(
      this.model?.Budget_Request?.Request_Id ??
      this.model?.Request_Id ??
      this.model?.Fk_Request_Budget ??
      0
    );
  }

  private getRequestDetailId(item?: any): number {
    return this.toInt(
      item?.requestDetailId ??
      this.expenseItem?.Request_Detail_Id ??
      this.expenseItem?.Fk_Request_Detail_Id ??
      0
    );
  }

  private toInt(value: any): number {
    return Math.trunc(this.toNumber(value));
  }

  private toDecimal(value: any): number {
    return this.toNumber(value);
  }

  private toMoney(value: any): number {
    return this.toNumber(value);
  }

  private toText(value: any): string {
    return (value ?? '').toString();
  }

  private getDepartmentId(): number {
    return this.toInt(
      this.model?.Department_Id ??
      this.model?.selectedDepartment?.Department_Id ??
      this.model?.Project_Plan?.Department_Id ??
      0
    );
  }

  private getDepartmentName(): string {
    return this.model?.Department_Name ??
      this.model?.selectedDepartment?.Department_Name ??
      this.model?.Project_Plan?.Department_Name ??
      '';
  }

  private getExpenseName(): string {
    return this.expenseItem?.Expense_Name ??
      this.model?.selectedExpenseTypeName ??
      this.model?.Expense_Name ??
      '';
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
    // DETAIL
    // ============================

    this.items.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          this.toInt(item.requestItemId),

        Fk_Request_Budget:
          this.getRequestBudgetId(),

        Fk_Expense_Id:
          this.toInt(this.model.selectedExpenseTypeId),

        Expense_Name:
          this.toText(this.getExpenseName()),

        Fk_Request_Detail_Id:
          this.getRequestDetailId(item),

        Fk_Expense_Detail_Id:
          this.toInt(
            item.detailId ||
            this.getExpenseDetailId(this.getExpenseDetailByName(item.name))
          ),

        Expense_Detail:
          this.toText(this.getExpenseDetailNameForSave(item)),

        Budget_Amount:
          this.toMoney(item.total),

        Department_Id:
          this.getDepartmentId(),

        Department_Name:
          this.toText(this.getDepartmentName()),

        Position_Id:
          0,

        Position_Name:
          this.toText(this.main.target),

        Position_Type_Id:
          0,

        Position_Type_Name:
          this.toText(this.main.benefit),

        Level_Id:
          0,

        Level_Name:
          this.toText(item.level),

        Purpose:
          this.toText(this.main.title),

        Reson:
          this.toText(this.main.reason),

        Month_Id:
          0,

        Month_Name:
          this.toText(item.meetingType),

        Importance_Id:
          0,

        Importance_Name:
          '',

        Salary_Amount:
          0,

        Per_Month:
          0,

        Per_Year:
          0,

        Hour:
          0,

        Day:
          this.toDecimal(item.days),

        Month:
          0,

        Other_Name:
          this.toText(item.Other_Name),

        Times:
          this.toDecimal(item.times),

        People:
          this.toDecimal(item.person),

        People_Type_A:
          item.hasInvite ? 1 : 0,

        People_Type_B:
          0,

        People_Type_C:
          0,

        Sum_People:
          0,

        Quantity:
          0,

        Price:
          0,

        Fk_Unit_Id:
          0,

        Unit_Name:
          '',

        Rate:
          this.toDecimal(item.rate),

        Total:
          this.toMoney(item.total),

        Active:
          true,

        Create_User:
          this.toText(this.model?.Create_User),

        Update_User:
          this.toText(this.model?.Update_User)

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
