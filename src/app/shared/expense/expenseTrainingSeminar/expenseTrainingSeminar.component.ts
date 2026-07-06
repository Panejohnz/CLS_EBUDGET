import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-training-seminar',
  templateUrl: './expenseTrainingSeminar.component.html',
  styles: ``
})
export class ExpenseTrainingSeminarComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  projectName: any;
  locationOffice: any;
  locationHotel: any;
  description: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  file: any;
  Mas_Unit_Lists: any
  expenseList: any[] = [];
  Mas_Business_Level: any[] = [];
  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;
  allData: any
  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.loadExpenseType();
    this.get_data()
  }
  get_data() {
    let model = {
      FUNC_CODE: "FUNC-Get_List_Mas_Unit",
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      this.allData = Array.isArray(response.List_Mas_Unit)
        ? response.List_Mas_Unit
        : [];
      this.Mas_Unit_Lists = [...this.allData];

    })
  }
  closeModal() {

    this.model.dismiss();

  }

  loadExpenseType() {
    this.currentExpenseTypeId = this.model.selectedExpenseTypeId;
    this.Mas_Expense_Detial_List = [];

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

        this.loadBusinessLevels();
      }, () => {
        this.Mas_Expense_Detial_List = [];
        this.loadBusinessLevels();
      });
  }

  ngDoCheck() {
    if (!this.model) return;

    if (this.currentExpenseTypeId != this.model.selectedExpenseTypeId) {
      this.loadExpenseType();
    }
  }

  loadBusinessLevels() {
    let model = {
      FUNC_CODE: "FUNC-Get_Mas_BusinessLevel",
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        this.Mas_Business_Level =
          Array.isArray(response.List_Mas_Business_Level)
            ? response.List_Mas_Business_Level
            : [];

        this.bindData();
        this.normalizeItemLevels();
        this.refreshExpenseDetailOptions();
        this.applyRatesToExistingRows();
      }, () => {
        this.Mas_Business_Level = [];
        this.bindData();
        this.refreshExpenseDetailOptions();
        this.applyRatesToExistingRows();
      });
  }

  loadExpenseRates(item: any) {
    if (!item?.pairId || this.isOtherExpenseDetail(item)) {
      item.rate = '';
      item.isOtherRate = true;
      this.calculate(item);
      return;
    }

    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Rate",
      Fk_Expense_Id: item.pairId
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        const expenseRateList =
          response.List_Mas_Expense_Rate;

        this.Mas_Expense_Detial_Rate_List =
          Array.isArray(expenseRateList)
            ? expenseRateList
            : [];

        const rate = this.getExpenseRateFromRateList();
        item.rate = rate || item.rate || this.getExpenseDetailRate(item);
        this.calculate(item);
      }, () => {
        item.rate = item.rate || this.getExpenseDetailRate(item);
        this.calculate(item);
      });
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
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

  private getRowRate(row: any): number {
    return Number(
      row?.Expense_Rate ??
      row?.Rate ??
      row?.Price ??
      row?.Total ??
      0
    ) || 0;
  }

  normalizeSelectId(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }

  getExpenseDetailLevelId(item: any): number | null {
    return this.normalizeSelectId(
      item?.Buslness_Level ??
      item?.Business_Level ??
      item?.Fk_Business_Level ??
      item?.Fk_Business_Level_Id ??
      item?.Level_Id
    );
  }

  resolveBusinessLevelId(value: any): number | null {
    const normalizedValue = this.normalizeSelectId(value);

    if (normalizedValue != null) {
      const hasLevel = this.Mas_Business_Level.some((item: any) =>
        this.normalizeSelectId(item?.Level_Id) === normalizedValue
      );

      if (hasLevel) {
        return normalizedValue;
      }
    }

    const textValue = (value ?? '').toString().trim();

    if (!textValue) {
      return null;
    }

    const level = this.Mas_Business_Level.find((item: any) =>
      (item?.Level_Name ?? '').toString().trim() === textValue ||
      (item?.Level_Short_Name ?? '').toString().trim() === textValue ||
      (item?.Level_Code ?? '').toString().trim() === textValue
    );

    return this.normalizeSelectId(level?.Level_Id);
  }

  private normalizeItemLevels() {
    this.expenseList.forEach((item: any) => {
      item.level = this.resolveBusinessLevelId(item.level);

      if (item.level == null) {
        const selected = this.getSelectedExpenseDetail(item);
        item.level = this.getExpenseDetailLevelId(selected);
      }
    });
  }

  getExpenseDetailsByLevel(item: any): any[] {
    const levelId = this.normalizeSelectId(item?.level);

    if (levelId == null) {
      return [];
    }

    const filtered = this.Mas_Expense_Detial_List.filter((detail: any) => {
      const itemLevelId = this.getExpenseDetailLevelId(detail);

      if (itemLevelId == null) {
        return false;
      }

      return itemLevelId === levelId;
    });

    return filtered.length ? filtered : this.Mas_Expense_Detial_List;
  }

  getSelectedExpenseDetail(item: any): any {
    const pairId = this.normalizeSelectId(item?.pairId);

    return this.Mas_Expense_Detial_List.find((detail: any) =>
      this.normalizeSelectId(detail?.Expense_Detial_Id) === pairId
    );
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

  isOtherExpenseDetail(item: any): boolean {
    const selected = this.getSelectedExpenseDetail(item);
    const name = this.normalizeText(selected?.Expense_Detial_Name ?? item?.expenseType);

    return name.includes('อื่น') || name.includes('other');
  }

  getExpenseDetailNameForSave(item: any): string {
    return this.isOtherExpenseDetail(item)
      ? item.customExpenseType || ''
      : item.expenseType || '';
  }

  getExpenseDetailRate(item: any): number {
    const selected = this.getSelectedExpenseDetail(item);

    return Number(
      selected?.Request_Rate ??
      selected?.Expense_Rate ??
      selected?.Rate ??
      selected?.Price ??
      selected?.Total ??
      0
    ) || 0;
  }

  getExpenseRateFromRateList(): number {
    const rateRow = this.Mas_Expense_Detial_Rate_List.find((item: any) =>
      item?.Expense_Rate !== null &&
      item?.Expense_Rate !== undefined &&
      item?.Expense_Rate !== ''
    );

    return this.getRowRate(rateRow);
  }

  refreshExpenseDetailOptions() {
    this.expenseList.forEach((item: any) => {
      item.expenseDetails = this.getExpenseDetailsByLevel(item);
      item.isOtherRate = this.isOtherExpenseDetail(item);
    });
  }

  onLevelChange(item: any) {
    item.expenseDetails = this.getExpenseDetailsByLevel(item);

    const hasSelectedInLevel = item.expenseDetails.some((detail: any) =>
      this.normalizeSelectId(detail?.Expense_Detial_Id) === this.normalizeSelectId(item?.pairId)
    );

    if (!hasSelectedInLevel) {
      item.pairId = null;
      item.expenseType = '';
      item.customExpenseType = '';
      item.rate = 0;
      item.isOtherRate = false;
    }

    this.calculate(item);
  }

  private applyRatesToExistingRows() {
    this.expenseList.forEach((item: any) => {
      if (Number(item.rate) > 0) {
        return;
      }

      const rate = this.getExpenseDetailRate(item);

      if (rate > 0) {
        item.rate = rate;
        this.calculate(item);
        return;
      }

      if (item.pairId) {
        this.loadExpenseRates(item);
      }
    });
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

      this.expenseList = [
        this.newRow()
      ];

      return;

    }

    // header
    const firstRow = rows[0];

    this.projectName =
      firstRow.Purpose || '';

    this.description =
      firstRow.Reson || '';

    this.locationOffice =
      firstRow.Operation1 || false;

    this.locationHotel =
      firstRow.Operation2 || false;

    // detail
    this.expenseList = rows.map((row: any) => {

      return {

        requestItemId:
          row.Request_Item_Id || 0,

        pairId:
          this.resolveExpenseDetailId(row),

        level:
          row.Level_Name || null,

        expenseDetails:
          [],

        isOtherRate:
          false,

        expenseType:
          row.Expense_Detail || '',

        customExpenseType:
          row.Expense_Detail || '',

        times:
          row.Times || 0,

        typeA:
          row.People_Type_A || 0,

        typeB:
          row.People_Type_B || 0,

        external:
          row.People_Type_C || 0,

        person:
          row.People || 0,

        qty:
          row.Quantity || 0,

        unit:
          row.Unit_Name || 'บาท',

        rate:
          row.Rate || 0,

        unit2:
          row.Other_Name || 'บาท',

        total:
          row.Total || 0

      };

    });

  }

  newRow() {

    return {

      requestItemId: 0,

      pairId: null,

      level: null,

      expenseDetails: [],

      isOtherRate: false,

      expenseType: '',

      customExpenseType: '',

      times: 0,

      typeA: 0,

      typeB: 0,

      external: 0,

      person: 0,

      qty: 0,

      unit: 'บาท',

      rate: 0,

      unit2: 'บาท',

      total: 0

    };

  }

  addRow() {

    this.expenseList.push(
      this.newRow()
    );

  }

  onExpenseTypeChange(item: any) {
    const selected = this.getSelectedExpenseDetail(item);
    item.expenseType = selected?.Expense_Detial_Name || '';
    item.isOtherRate = this.isOtherExpenseDetail(item);

    if (item.isOtherRate) {
      item.customExpenseType = '';
      item.rate = '';
      this.calculate(item);
      return;
    }

    item.customExpenseType = '';
    item.rate = this.getExpenseDetailRate(item);
    this.loadExpenseRates(item);
  }
  async removeRow(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const item =
      this.expenseList[i];

    this.serviceebud.DeleteBudgetRequestDetailItem(item?.requestItemId).subscribe();

    this.expenseList.splice(i, 1);

    this.updateDetailItems();

  }

  calculate(item: any) {

    const people =
      (Number(item.typeA) || 0) +
      (Number(item.typeB) || 0) +
      (Number(item.external) || 0);

    item.person = people;

    item.total =
      people *
      (Number(item.qty) || 0) *
      (Number(item.rate) || 0);

    this.updateDetailItems();

  }

  updateDetailItems() {

    // ลบของ type นี้ก่อน
    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId
      );

    // เพิ่มใหม่
    this.expenseList.forEach((item: any) => {

      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          item.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Expense_Detail:
          this.getExpenseDetailNameForSave(item),

        Fk_Expense_Detail_Id:
          item.pairId || 0,

        Level_Name:
          item.level,

        Purpose:
          this.projectName,

        Reson:
          this.description,

        Operation1:
          this.locationOffice,

        Operation2:
          this.locationHotel,

        Times:
          item.times,

        People_Type_A:
          item.typeA,

        People_Type_B:
          item.typeB,

        People_Type_C:
          item.external,

        People:
          item.person,

        Quantity:
          item.qty,

        Unit_Name:
          item.unit,

        Rate:
          item.rate,

        Other_Name:
          item.unit2,

        Total:
          item.total

      });

    });

  }

  onFileChange(event: any) {

    this.file =
      event.target.files[0];

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
  get grandTotal(): number {

    return this.expenseList.reduce(

      (sum: number, item: any) =>

        sum + (Number(item.total) || 0),

      0

    );

  }
}
