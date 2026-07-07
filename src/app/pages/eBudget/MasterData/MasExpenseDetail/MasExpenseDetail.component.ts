import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { GridJsService } from 'src/app/pages/tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { MasterService } from 'src/app/core/services/Master.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'MasExpenseDetail',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './MasExpenseDetail.component.html',
  styleUrls: ['./MasExpenseDetail.component.scss']
})
export class MasExpenseDetailComponent implements OnInit {
  currentYear: any;
  modalRef: any;
  detailModalRef: any;
  isEditModeDetail = false;

  Mas_Expense_Detial: any = {};
  selectedExpenseDetailRow: any = null;
  List_Mas_Expense_Rate: any[] = [];

  readonly tabTitle = 'ค่าเบี้ยเลี้ยง ค่าเช่าที่พัก และค่าพาหนะ';
  readonly rateTabTitle = 'จัดการอัตราค่าใช้จ่าย';
  readonly fkExpenseId = 21;
  activeTab: 'detail' | 'rate' = 'detail';

  List_Mas_Expense_Detial: any[] = [];
  listMasExpenseDetialAll: any[] = [];
  listMasExpenseDetialFiltered: any[] = [];
  List_Mas_Expense_Rate_Manage: any[] = [];
  listMasExpenseRateManageAll: any[] = [];
  listMasExpenseRateManageFiltered: any[] = [];
  List_Mas_Business_Level: any[] = [];
  List_Mas_Expense_Lists: any[] = [];

  readonly pageSize = 30;
  pagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  ratePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

  constructor(
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public serviceebud: EbudgetService,
    private budgetYearService: BudgetYearService,
    public masterService: MasterService
  ) { }

  ngOnInit(): void {
    this.currentYear = this.budgetYearService.getBgyear();
    this.get_data();

    this.budgetYearService.yearChanged$.subscribe((year) => {
      if (year) {
        if (year < 2500) {
          year = year + 543;
        }
        this.currentYear = year;
        this.get_data();
      }
    });
  }

  get_data(): void {
    const model = {
      FUNC_CODE: 'FUNC-Get_Mas_ExpenseDetail',
      BgYear: this.currentYear,
      Fk_Expense_Id: this.fkExpenseId
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.List_Mas_Business_Level = this.normalizeListIds(
        this.extractList(response?.List_Mas_Business_Level),
        ['Level_Id']
      );
      this.listMasExpenseDetialAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Expense_Detial ?? response?.List_Mas_Expense_Detail),
        ['Expense_Detial_Id']
      );
      this.filterSearch();
    });
  }

  setActiveTab(tab: 'detail' | 'rate'): void {
    this.activeTab = tab;
    this.service.searchTerm = '';

    if (tab === 'rate') {
      this.getRateManageData();
      return;
    }

    this.filterSearch();
  }

  getRateManageData(): void {
    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'FUNC-Get_Mas_Expense_Detail_For_Rate_Manage'
    }).subscribe((response: any) => {
      this.List_Mas_Business_Level = this.normalizeListIds(
        this.extractList(response?.List_Mas_Business_Level),
        ['Level_Id']
      );
      this.List_Mas_Expense_Lists = this.normalizeListIds(
        this.extractList(response?.Mas_Expense_Lists),
        ['Expense_Id']
      );
      this.listMasExpenseRateManageAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Expense_Detial ?? response?.List_Mas_Expense_Detail),
        ['Expense_Detial_Id', 'Fk_Expense_Id', 'Buslness_Level']
      );
      this.filterSearch();
    });
  }

  private extractList(source: any): any[] {
    if (!source) {
      return [];
    }
    if (Array.isArray(source)) {
      return source;
    }
    if (Array.isArray(source?.Data)) {
      return source.Data;
    }
    return [];
  }

  private normalizeSelectId(value: any): any {
    if (value == null || value === '') {
      return null;
    }
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  }

  private normalizeListIds(list: any[], fields: string[]): any[] {
    return list.map((row) => {
      const copy = { ...row };
      fields.forEach((field) => {
        if (copy[field] != null && copy[field] !== '') {
          copy[field] = this.normalizeSelectId(copy[field]);
        }
      });
      return copy;
    });
  }

  private toBit(value: any): number {
    return value === true || value === 1 || value === '1' ? 1 : 0;
  }

  private filterListByKeyword(source: any[], keyword: string): any[] {
    if (!keyword) {
      return [...source];
    }
    return source.filter((row: any) =>
      Object.values(row).join(' ').toLowerCase().includes(keyword)
    );
  }

  private clampPage(page: number, total: number): number {
    const maxPage = Math.max(1, Math.ceil(total / this.pageSize) || 1);
    return Math.min(Math.max(1, page), maxPage);
  }

  private slicePage(fullList: any[], page: number): {
    slice: any[];
    startIndex: number;
    endIndex: number;
    total: number;
  } {
    const total = fullList.length;
    const safePage = this.clampPage(page, total);
    const startIndex = total === 0 ? 0 : (safePage - 1) * this.pageSize + 1;
    const endIndex = Math.min(safePage * this.pageSize, total);
    const slice = fullList.slice((safePage - 1) * this.pageSize, safePage * this.pageSize);
    return { slice, startIndex, endIndex, total };
  }

  private refreshPage(): void {
    const { slice, startIndex, endIndex, total } = this.slicePage(
      this.listMasExpenseDetialFiltered,
      this.pagination.page
    );
    this.List_Mas_Expense_Detial = slice;
    this.pagination = { ...this.pagination, startIndex, endIndex, total };
  }

  private refreshRatePage(): void {
    const { slice, startIndex, endIndex, total } = this.slicePage(
      this.listMasExpenseRateManageFiltered,
      this.ratePagination.page
    );
    this.List_Mas_Expense_Rate_Manage = slice;
    this.ratePagination = { ...this.ratePagination, startIndex, endIndex, total };
  }

  filterSearch(): void {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();
    if (this.activeTab === 'rate') {
      this.listMasExpenseRateManageFiltered = this.filterListByKeyword(
        this.listMasExpenseRateManageAll,
        keyword
      );
      this.ratePagination.page = 1;
      this.refreshRatePage();
      return;
    }

    this.listMasExpenseDetialFiltered = this.filterListByKeyword(
      this.listMasExpenseDetialAll,
      keyword
    );
    this.pagination.page = 1;
    this.refreshPage();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.refreshPage();
  }

  onRatePageChange(page: number): void {
    this.ratePagination.page = page;
    this.refreshRatePage();
  }

  private getBusinessLevelName(levelId: any): string {
    const normalizedId = this.normalizeSelectId(levelId);
    const level = this.List_Mas_Business_Level.find(
      (item) => this.normalizeSelectId(item.Level_Id) === normalizedId
    );
    return level?.Level_Name ?? '';
  }

  private getExpenseListName(expenseId: any): string {
    const normalizedId = this.normalizeSelectId(expenseId);
    const expense = this.List_Mas_Expense_Lists.find(
      (item) => this.normalizeSelectId(item.Expense_Id) === normalizedId
    );
    return expense?.Expense_Name ?? '';
  }

  private getNextOrderSeq(list: any[]): number {
    if (!list?.length) {
      return 1;
    }
    const maxOrder = Math.max(...list.map((item) => Number(item.Order_Seq) || 0));
    return maxOrder + 1;
  }

  openAddDetailModal(modal: any): void {
    this.isEditModeDetail = false;
    this.Mas_Expense_Detial = {
      Expense_Detial_Id: 0,
      Fk_Expense_Id: this.fkExpenseId,
      Expense_Name: this.tabTitle,
      Buslness_Level: null,
      Expense_Detial_Name: '',
      Expense_Detial_Short_Name: '',
      Expense_Detial_Code: '',
      Order_Seq: this.getNextOrderSeq(this.listMasExpenseDetialAll)
    };
    this.detailModalRef = this.modalService.open(modal, { size: 'lg', backdrop: 'static' });
  }

  openEditDetailModal(modal: any, item: any): void {
    this.isEditModeDetail = true;
    this.Mas_Expense_Detial = {
      ...item,
      Fk_Expense_Id: item.Fk_Expense_Id ?? this.fkExpenseId,
      Buslness_Level: this.normalizeSelectId(item.Buslness_Level)
    };
    this.detailModalRef = this.modalService.open(modal, { size: 'lg', backdrop: 'static' });
  }

  openAddRateManageDetailModal(modal: any): void {
    this.isEditModeDetail = false;
    this.selectedExpenseDetailRow = null;
    this.Mas_Expense_Detial = {
      Expense_Detial_Id: 0,
      Fk_Expense_Id: null,
      Expense_Name: '',
      Buslness_Level: null,
      Child_Detial_Name: '',
      Expense_Detial_Name: '',
      Expense_Detial_Short_Name: '',
      Expense_Detial_Code: '',
      Order_Seq: this.getNextOrderSeq(this.listMasExpenseRateManageAll)
    };
    this.List_Mas_Expense_Rate = [this.createEmptyRateRow()];
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditRateManageDetailModal(modal: any, item: any): void {
    const detailId = this.getExpenseDetialId(item);
    if (!detailId) {
      Swal.fire({
        title: 'ไม่พบข้อมูล',
        text: 'ไม่พบรหัสรายการค่าใช้จ่าย',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'FUNC-Get_Mas_Mas_Expense_Rate',
      Fk_Expense_Id: detailId
    }).subscribe((response: any) => {
      if (response.RESULT != null) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: response.RESULT,
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        return;
      }

      this.isEditModeDetail = true;
      this.selectedExpenseDetailRow = item;
      this.Mas_Expense_Detial = {
        ...item,
        Fk_Expense_Id: this.normalizeSelectId(item.Fk_Expense_Id),
        Buslness_Level: this.normalizeSelectId(item.Buslness_Level)
      };
      this.List_Mas_Expense_Rate = this.normalizeExpenseRateList(response);
      if (!this.List_Mas_Expense_Rate.length) {
        this.List_Mas_Expense_Rate = [this.createEmptyRateRow()];
      }
      this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
    });
  }

  BtnSaveExpenseDetial(): void {
    const businessLevel = this.normalizeSelectId(this.Mas_Expense_Detial.Buslness_Level);
    if (businessLevel == null || businessLevel === 0) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณาเลือกชื่อระดับ',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!this.Mas_Expense_Detial.Expense_Detial_Name?.trim()) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกค่าใช้จ่าย',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.Mas_Expense_Detial.Fk_Expense_Id = this.fkExpenseId;
    this.Mas_Expense_Detial.Buslness_Level = businessLevel;
    this.Mas_Expense_Detial.Child_Detial_Name = this.getBusinessLevelName(businessLevel);
    this.Mas_Expense_Detial.Expense_Name = this.tabTitle;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Expense_Detial',
      Mas_Expense_Detial: this.Mas_Expense_Detial
    }).subscribe((response: any) => {
      if (response.RESULT == null) {
        Swal.fire({
          title: 'บันทึกสำเร็จ!',
          text: 'บันทึกข้อมูลค่าใช้จ่ายเรียบร้อยแล้ว!',
          icon: 'success',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        this.detailModalRef?.close();
        this.get_data();
        return;
      }
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: response.RESULT,
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
    });
  }

  Delete_Mas_Expense_Detial(item: any): void {
    this.confirmDelete(item?.Expense_Detial_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Expense_Detial',
        Mas_Expense_Detial: item
      }).subscribe((response: any) => {
        if (response.RESULT == null) {
          Swal.fire({
            title: 'ลบสำเร็จ!',
            text: 'ลบข้อมูลค่าใช้จ่ายเรียบร้อยแล้ว!',
            icon: 'success',
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'OK',
          });
          this.get_data();
          return;
        }
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: response.RESULT,
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
      });
    });
  }

  private prepareRateManageForSave(row: any): any {
    return {
      Expense_Rate_Id: this.normalizeSelectId(row.Expense_Rate_Id) ?? 0,
      Start_Year: row.Start_Year ?? '',
      End_Year: row.End_Year ?? '',
      Fk_Expense_Detail_Id: this.normalizeSelectId(this.Mas_Expense_Detial.Expense_Detial_Id) ?? 0,
      Expense_Name: this.Mas_Expense_Detial.Expense_Detial_Name ?? '',
      Expense_Short_Name: this.Mas_Expense_Detial.Expense_Detial_Short_Name ?? '',
      Expense_Rate: this.toBit(row.Is_Rate_Null) === 1 ? 0 : (Number(row.Expense_Rate) || 0),
      Is_Rate_Null: this.toBit(row.Is_Rate_Null)
    };
  }

  BtnSaveRateManageDetail(): void {
    const expenseId = this.normalizeSelectId(this.Mas_Expense_Detial.Fk_Expense_Id);
    const businessLevelName = (this.Mas_Expense_Detial.Child_Detial_Name || '').trim();

    if (expenseId == null || expenseId === 0) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณาเลือกหมวดค่าใช้จ่าย',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!businessLevelName) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกชื่อระดับ',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    if (!this.Mas_Expense_Detial.Expense_Detial_Name?.trim()) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกค่าใช้จ่าย',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    const listToSave = this.List_Mas_Expense_Rate.map((row) =>
      this.prepareRateManageForSave(row)
    );
    const hasActiveRate = listToSave.some((row) =>
      this.toBit(row.Is_Rate_Null) === 0 && Number(row.Expense_Rate) !== 0
    );

    if (!hasActiveRate) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากำหนดอัตราอย่างน้อย 1 รายการ',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.Mas_Expense_Detial.Fk_Expense_Id = expenseId;
    this.Mas_Expense_Detial.Child_Detial_Name = businessLevelName;
    this.Mas_Expense_Detial.Expense_Name = this.getExpenseListName(expenseId);

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Expense_Detial_With_Rate',
      Mas_Expense_Detial: this.Mas_Expense_Detial,
      List_Mas_Expense_Rate: listToSave
    }).subscribe((response: any) => {
      if (response.RESULT == null) {
        Swal.fire({
          title: 'บันทึกสำเร็จ!',
          text: 'บันทึกข้อมูลค่าใช้จ่ายและอัตราเรียบร้อยแล้ว!',
          icon: 'success',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        this.modalRef?.close();
        this.getRateManageData();
        return;
      }

      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: response.RESULT,
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
    });
  }

  Delete_Mas_Expense_Detial_For_Rate_Manage(item: any): void {
    this.confirmDelete(item?.Expense_Detial_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Expense_Detial',
        Mas_Expense_Detial: item
      }).subscribe((response: any) => {
        if (response.RESULT == null) {
          Swal.fire({
            title: 'ลบสำเร็จ!',
            text: 'ลบข้อมูลค่าใช้จ่ายและอัตราเรียบร้อยแล้ว!',
            icon: 'success',
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'OK',
          });
          this.getRateManageData();
          return;
        }

        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: response.RESULT,
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
      });
    });
  }

  private normalizeExpenseRateRow(rate: any): any {
    const normalized = this.normalizeListIds([rate], [
      'Expense_Rate_Id',
      'Fk_Expense_Detail_Id',
      'FK_Expense_Detail_Id',
      'Fk_Expense_Detial_Id'
    ])[0];
    const detailId =
      normalized.Fk_Expense_Detail_Id ??
      normalized.FK_Expense_Detail_Id ??
      normalized.Fk_Expense_Detial_Id ??
      null;
    const copy = { ...normalized };
    delete copy.FK_Expense_Detail_Id;
    delete copy.Fk_Expense_Detial_Id;
    return {
      ...copy,
      Fk_Expense_Detail_Id: detailId,
      Is_Rate_Null: this.toBit(normalized.Is_Rate_Null),
      Expense_Rate: this.toBit(normalized.Is_Rate_Null) === 1 ? 0 : (normalized.Expense_Rate ?? 0)
    };
  }

  private normalizeExpenseRateList(response: any): any[] {
    const list = this.extractList(response?.List_Mas_Expense_Rate);
    if (!list.length && response?.Mas_Expense_Rate) {
      return [this.normalizeExpenseRateRow(response.Mas_Expense_Rate)];
    }
    return list.map((rate) => this.normalizeExpenseRateRow(rate));
  }

  private createEmptyRateRow(): any {
    const detailId = this.getExpenseDetialId(this.selectedExpenseDetailRow);
    return {
      Expense_Rate_Id: 0,
      Fk_Expense_Detail_Id: detailId,
      Expense_Name: this.selectedExpenseDetailRow?.Expense_Detial_Name ?? '',
      Expense_Short_Name: this.selectedExpenseDetailRow?.Expense_Detial_Short_Name ?? '',
      Start_Year: '',
      End_Year: '',
      Is_Rate_Null: 0,
      Expense_Rate: 0
    };
  }

  Get_Detail_By_Detail_Id(modal: any, detailRow: any): void {
    const detailId = this.getExpenseDetialId(detailRow);
    if (!detailId) {
      Swal.fire({
        title: 'ไม่พบข้อมูล',
        text: 'ไม่พบรหัสรายการค่าใช้จ่าย',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    const model = {
      FUNC_CODE: 'FUNC-Get_Mas_Mas_Expense_Rate',
      Fk_Expense_Id: detailId
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      if (response.RESULT != null) {
        Swal.fire({
          title: 'เกิดข้อผิดพลาด!',
          text: response.RESULT,
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        return;
      }

      this.selectedExpenseDetailRow = detailRow;
      this.List_Mas_Expense_Rate = this.normalizeExpenseRateList(response);
      if (!this.List_Mas_Expense_Rate.length) {
        this.List_Mas_Expense_Rate = [this.createEmptyRateRow()];
      }
      this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
    });
  }

  getExpenseDetialId(row: any): any {
    return row?.Expense_Detial_Id ?? row?.Expense_Detail_Id ?? null;
  }

  isRateRowNullChecked(row: any): boolean {
    return this.toBit(row?.Is_Rate_Null) === 1;
  }

  onRateIsNullChange(row: any, checked: boolean): void {
    row.Is_Rate_Null = checked ? 1 : 0;
    if (checked) {
      row.Expense_Rate = 0;
    }
  }

  addRateRow(): void {
    this.List_Mas_Expense_Rate = [...this.List_Mas_Expense_Rate, this.createEmptyRateRow()];
  }

  removeRateRow(index: number): void {
    this.List_Mas_Expense_Rate = this.List_Mas_Expense_Rate.filter((_, i) => i !== index);
  }

  openEditRateModal(modal: any, detailRow: any): void {
    this.Get_Detail_By_Detail_Id(modal, detailRow);
  }

  private prepareRateForSave(row: any, detailId: any): any {
    const rate = {
      Expense_Rate_Id: this.normalizeSelectId(row.Expense_Rate_Id) ?? 0,
      Start_Year: row.Start_Year ?? '',
      End_Year: row.End_Year ?? '',
      Fk_Expense_Detail_Id: detailId,
      Expense_Name: this.selectedExpenseDetailRow?.Expense_Detial_Name ?? '',
      Expense_Short_Name: this.selectedExpenseDetailRow?.Expense_Detial_Short_Name ?? '',
      Expense_Rate: this.toBit(row.Is_Rate_Null) === 1 ? 0 : (Number(row.Expense_Rate) || 0),
      Is_Rate_Null: this.toBit(row.Is_Rate_Null)
    };
    return rate;
  }

  BtnSaveExpenseRate(): void {
    const detailId = this.normalizeSelectId(
      this.getExpenseDetialId(this.selectedExpenseDetailRow)
    );
    if (detailId == null || detailId === 0) {
      Swal.fire({
        title: 'ไม่พบข้อมูล',
        text: 'ไม่พบรหัสรายการค่าใช้จ่าย',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    const listToSave = this.List_Mas_Expense_Rate.map((row) =>
      this.prepareRateForSave(row, detailId)
    );

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Expense_Rate',
      List_Mas_Expense_Rate: listToSave,
      Fk_Expense_Detail_Id: detailId
    }).subscribe((response: any) => {
      if (response.RESULT == null) {
        Swal.fire({
          title: 'บันทึกสำเร็จ!',
          text: 'บันทึกอัตราค่าใช้จ่ายเรียบร้อยแล้ว!',
          icon: 'success',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        this.modalRef?.close();
        if (this.activeTab === 'rate') {
          this.getRateManageData();
        } else {
          this.get_data();
        }
        return;
      }
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: response.RESULT,
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
    });
  }

  private confirmDelete(itemName: string, onConfirm: () => void): void {
    Swal.fire({
      title: 'ต้องการลบข้อมูล?',
      text: itemName ? `ยืนยันการลบ "${itemName}"` : 'ยืนยันการลบรายการนี้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgb(243, 78, 78)',
      cancelButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        onConfirm();
      }
    });
  }
}
