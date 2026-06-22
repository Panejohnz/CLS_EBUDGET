import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-expense-travel',
  templateUrl: './expenseTravel.component.html',
  styles: ``
})
export class ExpenseTravelComponent {

  @Input() model: any;

  @Input() expenseItem: any;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  sections: any[] = [];
  Mas_Business_Level: any[] = [];
  Mas_Expense_Detial_List: any[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  private currentExpenseTypeId: any = null;
  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.loadExpenseType();

  }

  closeModal() {

    this.model.dismiss();

  }
  allData: any[] = [];
  loadExpenseType() {
    this.currentExpenseTypeId = this.model.selectedExpenseTypeId;
    this.Mas_Expense_Detial_List = [];

    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Detial",
      Fk_Expense_Id: 21
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

      });

  }

  ngDoCheck() {
    if (!this.model) return;

    if (this.currentExpenseTypeId != this.model.selectedExpenseTypeId) {
      this.loadExpenseType();
    }
  }

  bindData() {
    let model = {
      FUNC_CODE: "FUNC-Get_Mas_BusinessLevel",
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      this.allData = Array.isArray(response.List_Mas_Business_Level)
        ? response.List_Mas_Business_Level
        : [];
      this.Mas_Business_Level = [...this.allData];
      this.normalizeDetailLevels();
      this.refreshExpenseDetailOptions();

    })
    const rows =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId
      );

    // ไม่มีข้อมูล
    if (rows.length == 0) {

      this.sections = [
        {
          sectionId: 1,

          description: '',

          details: [
            this.newDetail(1)
          ]
        }
      ];

      return;

    }

    const grouped: any = {};

    rows.forEach((row: any) => {

      const key =
        Number(row.Fk_Request_Detail_Id) || 1;

      // สร้าง section
      if (!grouped[key]) {

        grouped[key] = {

          sectionId: key,

          description:
            row.Expense_Detail || '',

          details: []

        };

      }

      // push detail
      grouped[key].details.push({

        requestItemId:
          row.Request_Item_Id || 0,

        sectionId:
          key,

        pairId:
          row.Fk_Expense_Detail_Id || null,

        level:
          row.Level_Name || null,

        times:
          row.Times || 0,

        peopleCount:
          this.firstNumber(row.People_Type_A, row.People_Type_B, row.People_Type_C, row.Quantity),

        dayCount:
          this.firstNumber(row.Day, row.Month, row.Hour, row.Month_Id),

        rate:
          this.firstNumber(row.Rate, row.Price, row.Per_Month, row.Total),

        total:
          this.firstNumber(row.Budget_Amount, row.Salary_Amount, row.Per_Year, row.Unit_Name, row.Rate_Amount),

        isOtherRate:
          false,

        expenseDetails:
          [],

        perdiemPerson:
          row.People_Type_A || 0,

        perdiemDay:
          row.Day || 0,

        perdiemRate:
          row.Rate || 0,

        perdiemTotal:
          row.Budget_Amount || 0,

        hotelPerson:
          row.People_Type_B || 0,

        hotelNight:
          row.Month || 0,

        hotelRate:
          row.Price || 0,

        hotelTotal:
          row.Salary_Amount || 0,

        planePerson:
          row.People_Type_C || 0,

        planeTrip:
          row.Hour || 0,

        planeRate:
          row.Per_Month || 0,

        planeTotal:
          row.Per_Year || 0,

        taxiPerson:
          row.Quantity || 0,

        taxiTrip:
          row.Month_Id || 0,

        taxiRate:
          row.Total || 0,

        taxiTotal:
          Number(row.Unit_Name) || 0,

        grandTotal:
          row.Rate_Amount || 0

      });

    });

    // sort section
    this.sections =

      Object.values(grouped)

        .sort(
          (a: any, b: any) =>
            a.sectionId - b.sectionId
        );

    this.refreshExpenseDetailOptions();
    this.refreshDetailRateModes();

  }

  addSection() {

    const maxId = this.sections.length > 0
      ? Math.max(
        ...this.sections.map(
          (x: any) => Number(x.sectionId) || 0
        )
      )
      : 0;

    const nextSectionId =
      maxId + 1;

    this.sections.push({

      sectionId: nextSectionId,

      description: '',

      details: [
        this.newDetail(nextSectionId)
      ]

    });

  }
  async remove(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const section =
      this.sections[i];

    (section?.details || []).forEach((detail: any) => {
      this.serviceebud.DeleteBudgetRequestDetailItem(detail?.requestItemId).subscribe();
    });

    this.sections.splice(i, 1);

    this.updateDetailItems();

  }

  addDetail(section: any) {

    section.details.push(
      this.newDetail(section.sectionId)
    );

  }
  async removeDetail(section: any, i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    const detail =
      section.details[i];

    this.serviceebud.DeleteBudgetRequestDetailItem(detail?.requestItemId).subscribe();

    section.details.splice(i, 1);

    this.updateDetailItems();

  }

  newDetail(sectionId: any = 0) {

    return {

      requestItemId: 0,

      sectionId: sectionId,

      pairId: null,

      level: null,

      times: 0,

      peopleCount: 0,
      dayCount: 0,
      rate: 0,
      total: 0,
      isOtherRate: false,
      expenseDetails: [],

      perdiemPerson: 0,
      perdiemDay: 0,
      perdiemRate: 0,
      perdiemTotal: 0,

      hotelPerson: 0,
      hotelNight: 0,
      hotelRate: 0,
      hotelTotal: 0,

      planePerson: 0,
      planeTrip: 0,
      planeRate: 0,
      planeTotal: 0,

      taxiPerson: 0,
      taxiTrip: 0,
      taxiRate: 0,
      taxiTotal: 0,

      grandTotal: 0

    };

  }

  calculate(d: any) {

    d.total =

      (Number(d.peopleCount) || 0) *

      (Number(d.dayCount) || 0) *

      (Number(d.rate) || 0);

    d.perdiemTotal =

      (Number(d.perdiemPerson) || 0) *

      (Number(d.perdiemDay) || 0) *

      (Number(d.perdiemRate) || 0);

    d.hotelTotal =

      (Number(d.hotelPerson) || 0) *

      (Number(d.hotelNight) || 0) *

      (Number(d.hotelRate) || 0);

    d.planeTotal =

      (Number(d.planePerson) || 0) *

      (Number(d.planeTrip) || 0) *

      (Number(d.planeRate) || 0);

    d.taxiTotal =

      (Number(d.taxiPerson) || 0) *

      (Number(d.taxiTrip) || 0) *

      (Number(d.taxiRate) || 0);

    d.grandTotal = Number(d.total) || (

      d.perdiemTotal +

      d.hotelTotal +

      d.planeTotal +

      d.taxiTotal
    );

    this.updateDetailItems();

  }

  normalizeSelectId(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? null : numberValue;
  }

  firstNumber(...values: any[]): number {
    const found = values.find(value => Number(value) > 0);
    return Number(found) || 0;
  }

  getExpenseDetailsByLevel(detail: any): any[] {
    const levelId = this.normalizeSelectId(detail?.level);

    if (levelId == null) {
      return [];
    }

    const filtered = this.Mas_Expense_Detial_List.filter((item: any) => {
      const itemLevelId = this.getExpenseDetailLevelId(item);

      if (itemLevelId == null) {
        return false;
      }

      return itemLevelId === levelId;
    });

    return filtered.length ? filtered : this.Mas_Expense_Detial_List;
  }

  getSelectedExpenseDetail(detail: any): any {
    const pairId = this.normalizeSelectId(detail?.pairId);

    return this.Mas_Expense_Detial_List.find((item: any) =>
      this.normalizeSelectId(item?.Expense_Detial_Id) === pairId
    );
  }

  isOtherExpenseDetail(detail: any): boolean {
    const pairId = this.normalizeSelectId(detail?.pairId);

    if ([67, 68, 69].includes(Number(pairId))) {
      return true;
    }

    const selected = this.getSelectedExpenseDetail(detail);
    const name = (selected?.Expense_Detial_Name || '').trim();

    return name === 'อื่นๆ' || name === 'อื่น ๆ';
  }

  getExpenseDetailRate(detail: any): number {
    const selected = this.getSelectedExpenseDetail(detail);

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

    return Number(rateRow?.Expense_Rate) || 0;
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

  normalizeDetailLevels() {
    this.sections.forEach((section: any) => {
      section.details.forEach((detail: any) => {
        detail.level = this.resolveBusinessLevelId(detail.level);
      });
    });
  }

  onLevelChange(detail: any) {
    detail.expenseDetails = this.getExpenseDetailsByLevel(detail);

    const hasSelectedInLevel = detail.expenseDetails.some((item: any) =>
      this.normalizeSelectId(item?.Expense_Detial_Id) === this.normalizeSelectId(detail?.pairId)
    );

    if (!hasSelectedInLevel) {
      detail.pairId = null;
      detail.rate = 0;
      detail.isOtherRate = false;
    }

    this.calculate(detail);
  }

  onExpenseDetailChange(detail: any) {
    detail.isOtherRate = this.isOtherExpenseDetail(detail);
    this.Mas_Expense_Detial_Rate_List = [];

    if (detail.isOtherRate) {
      detail.rate = '';
      this.calculate(detail);
      return;
    }

    detail.rate = this.getExpenseDetailRate(detail);

    let model = {
      FUNC_CODE: "FUNC-Get_Mas_Expense_Rate",
      Fk_Expense_Id: detail.pairId
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {

        const expenseDetailList =
          response.List_Mas_Expense_Rate

        this.Mas_Expense_Detial_Rate_List =
          Array.isArray(expenseDetailList)
            ? expenseDetailList
            : [];

        const rateFromApi = this.getExpenseRateFromRateList();
        detail.rate = rateFromApi || detail.rate || this.getExpenseDetailRate(detail);
        this.calculate(detail);

      });

    this.calculate(detail);
  }

  refreshDetailRateModes() {
    this.sections.forEach((section: any) => {
      section.details.forEach((detail: any) => {
        detail.isOtherRate = this.isOtherExpenseDetail(detail);
      });
    });
  }

  refreshExpenseDetailOptions() {
    this.sections.forEach((section: any) => {
      section.details.forEach((detail: any) => {
        detail.expenseDetails = this.getExpenseDetailsByLevel(detail);
      });
    });
  }

  updateDetailItems() {

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    this.sections.forEach((section: any) => {

      section.details.forEach((d: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            d.requestItemId,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Fk_Request_Detail_Id:
            d.sectionId,
          Fk_Expense_Detail_Id:
            d.pairId || 0,

          Expense_Detail:
            section.description,

          Level_Name:
            d.level,

          Times:
            d.times,

          People_Type_A:
            d.peopleCount,

          Day:
            d.dayCount,

          Rate:
            d.rate,

          Budget_Amount:
            d.total,

          People_Type_B:
            0,

          Month:
            0,

          Price:
            0,

          Salary_Amount:
            0,

          People_Type_C:
            0,

          Hour:
            0,

          Per_Month:
            0,

          Per_Year:
            0,

          Quantity:
            0,

          Month_Id:
            0,

          Total:
            0,

          Unit_Name:
            0,

          Rate_Amount:
            d.total

        });

      });

    });

  }

}
