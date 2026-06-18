import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

declare const confirmAlert: any;

interface ExpenseItem {
  requestItemId?: number;
  pairId?: number;
  optionId?: number;
  name: string;
  type: string;
  qty: number;
  times: number;
  rate: number;
  total: number;
}

interface Section {
  title: string;
  options: any[];
  items: ExpenseItem[];
}

@Component({
  selector: 'app-expense-committee',
  templateUrl: './expenseCommittee.component.html',
  styles: ``
})
export class ExpenseCommitteeComponent {

  @Input() model: any;
  @Input() expenseItem: any;

  sections: Section[] = [];
  Mas_Expense_Detial_Rate_List: any[] = [];
  Mas_Expense_Rate_List: any[] = [];
  grandTotal = 0;

  constructor(
    private modalService: NgbModal,
    public serviceebud: EbudgetService
  ) { }

  ngOnInit() {
    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {
      this.model.Budget_Request_Detail_Item = [];
    }

    this.loadExpenseDetails();
  }

  closeModal() {
    this.model.dismiss();
  }

  loadExpenseDetails() {
    const model = {
      FUNC_CODE: 'FUNC-Get_Mas_Expense_Detial',
      Fk_Expense_Id: this.model.selectedExpenseTypeId
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      const list =
        response.List_Mas_Expense_Detial ||
        response.Mas_Expense_Detial ||
        response.Mas_Expense_Detial_Rate_List ||
        [];
      const rateList =
        response.List_Mas_Expense_Rate ||
        response.Mas_Expense_Rate ||
        response.Mas_Expense_Rate_List ||
        [];

      this.Mas_Expense_Detial_Rate_List = Array.isArray(list) ? list : [];
      this.Mas_Expense_Rate_List = Array.isArray(rateList) ? rateList : [];
      this.buildSectionsFromMaster();
      this.bindData();
      this.calculateGrand();
      this.updateDetailItems();
    });
  }

  private buildSectionsFromMaster() {
    const sectionMap = new Map<string, Section>();

    this.Mas_Expense_Detial_Rate_List
      .filter((row: any) => Number(row?.Active ?? 1) === 1)
      .sort((a: any, b: any) => Number(a?.Order_Seq || 0) - Number(b?.Order_Seq || 0))
      .forEach((row: any) => {
        const title =
          row.Child_Detial_Name ||
          row.Expense_Detail ||
          row.Expense_Name ||
          'รายการ';

        if (!sectionMap.has(title)) {
          sectionMap.set(title, {
            title,
            options: [],
            items: []
          });
        }

        sectionMap.get(title)?.options.push(row);
      });

    this.sections = Array.from(sectionMap.values());
  }

  private normalizeText(value: any): string {
    return (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '');
  }

  private getRowRate(row: any): number {
    const detailId = Number(row?.Expense_Detial_Id || row?.Expense_Detail_Id || row?.Fk_Expense_Detail_Id || 0);
    const rateRow = this.Mas_Expense_Rate_List.find((rate: any) =>
      Number(rate?.Fk_Expense_Detail_Id || 0) === detailId &&
      Number(rate?.Active ?? 1) === 1
    );

    return Number(
      rateRow?.Expense_Rate ??
      row?.Plan_Rate ??
      row?.Request_Rate ??
      row?.Expense_Rate ??
      row?.Rate ??
      0
    ) || 0;
  }

  private getOptionLabel(option: any): string {
    return option?.Expense_Detial_Name ||
      option?.Expense_Detial_Short_Name ||
      option?.Position_Name ||
      option?.Expense_Name ||
      '';
  }

  getOptionText(option: any): string {
    return this.getOptionLabel(option);
  }

  bindData() {
    const rows = this.model.Budget_Request_Detail_Item.filter(
      (x: any) => x.Fk_Expense_Id == this.model.selectedExpenseTypeId
    );

    if (rows.length === 0) {
      return;
    }

    this.sections.forEach((section: Section) => {
      section.items = [];
    });

    rows.forEach((row: any) => {
      const section = this.findSectionForRow(row);
      if (!section) return;

      const option = this.findOptionForRow(section, row);
      const optionId = Number(
        row.Position_Id ||
        row.Fk_Request_Detail_Id ||
        row.Expense_Detial_Id ||
        option?.Expense_Detial_Id ||
        0
      );

      const rate = Number(row.Rate || 0) || this.getRowRate(option);
      const qty = Number(row.People || 0);
      const times = Number(row.Times || 0);

      section.items.push({
        requestItemId: row.Request_Item_Id || 0,
        pairId: optionId,
        optionId,
        name: row.Other_Name || row.Position_Name || this.getOptionLabel(option),
        type: optionId ? String(optionId) : '',
        qty,
        times,
        rate,
        total: Number(row.Total || 0) || qty * times * rate
      });
    });
  }

  private findSectionForRow(row: any): Section | undefined {
    return this.sections.find((section: Section) =>
      section.title === row.Expense_Detail ||
      section.title === row.Child_Detial_Name ||
      section.options.some((option: any) =>
        Number(option.Expense_Detial_Id || 0) ===
        Number(row.Position_Id || row.Fk_Request_Detail_Id || row.Expense_Detial_Id || 0)
      )
    );
  }

  private findOptionForRow(section: Section, row: any): any {
    const optionId = Number(
      row.Position_Id ||
      row.Fk_Request_Detail_Id ||
      row.Expense_Detial_Id ||
      0
    );

    return section.options.find((option: any) =>
      Number(option.Expense_Detial_Id || 0) === optionId
    ) ||
      section.options.find((option: any) =>
        this.normalizeText(this.getOptionLabel(option)) ===
        this.normalizeText(row.Position_Name || row.Other_Name)
      );
  }

  addItem(section: Section) {
    section.items.push({
      requestItemId: 0,
      pairId: Date.now(),
      optionId: 0,
      name: '',
      type: '',
      qty: 0,
      times: 0,
      rate: 0,
      total: 0
    });

    this.updateDetailItems();
  }

  async removeItem(section: Section, item: ExpenseItem) {
    const userConfirmed = await confirmAlert('info', 'ต้องการลบข้อมูล ?', '');

    if (!userConfirmed) {
      return;
    }

    section.items = section.items.filter((i: ExpenseItem) => i !== item);
    this.calculateGrand();
    this.updateDetailItems();
  }

  updateRate(item: ExpenseItem) {
    const section = this.sections.find((s: Section) => s.items.includes(item));
    const selectedOption = section?.options.find((option: any) =>
      Number(option.Expense_Detial_Id || 0) === Number(item.type || 0)
    );

    item.optionId = Number(selectedOption?.Expense_Detial_Id || item.type || 0);
    item.pairId = item.optionId || item.pairId;
    item.name = this.getOptionLabel(selectedOption);
    item.rate = this.getRowRate(selectedOption);

    this.calculate(item);
  }

  calculate(item: ExpenseItem) {
    item.total =
      (Number(item.qty) || 0) *
      (Number(item.times) || 0) *
      (Number(item.rate) || 0);

    this.calculateGrand();
    this.updateDetailItems();
  }

  getSectionTotal(section: Section) {
    return section.items.reduce(
      (sum: number, item: ExpenseItem) => sum + (Number(item.total) || 0),
      0
    );
  }

  calculateGrand() {
    this.grandTotal = this.sections.reduce(
      (sum: number, section: Section) => sum + this.getSectionTotal(section),
      0
    );
    this.model.Total = this.grandTotal;
  }

  updateDetailItems() {
    this.model.Budget_Request_Detail_Item =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) => x.Fk_Expense_Id != this.model.selectedExpenseTypeId
      );

    this.sections.forEach((section: Section) => {
      section.items.forEach((item: ExpenseItem) => {
        if (!item.type && !item.qty && !item.times && !item.rate) {
          return;
        }

        this.model.Budget_Request_Detail_Item.push({
          Request_Item_Id: item.requestItemId || 0,
          Fk_Expense_Id: this.model.selectedExpenseTypeId,
          Fk_Request_Detail_Id: item.optionId || 0,
          Expense_Detail: section.title,
          Other_Name: item.name,
          Position_Id: item.optionId || 0,
          Position_Name: this.getTypeName(item.type),
          People: item.qty,
          Times: item.times,
          Rate: item.rate,
          Total: item.total
        });
      });
    });

    this.model.Total = this.grandTotal;
  }

  getTypeName(type: string): string {
    const optionId = Number(type || 0);

    for (const section of this.sections) {
      const option = section.options.find((row: any) =>
        Number(row.Expense_Detial_Id || 0) === optionId
      );

      if (option) {
        return this.getOptionLabel(option);
      }
    }

    return '';
  }

}
