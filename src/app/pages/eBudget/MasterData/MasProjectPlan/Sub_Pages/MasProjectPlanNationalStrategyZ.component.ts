import { ChangeDetectorRef, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { GridJsService } from 'src/app/pages/tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { MasterService } from 'src/app/core/services/Master.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'MasProjectPlanNationalStrategyZ',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './MasProjectPlanNationalStrategyZ.component.html',
  styles: `
    :host ::ng-deep .ng-dropdown-panel {
      z-index: 1060 !important;
    }
  `
})
export class MasProjectPlanNationalStrategyZComponent {
  currentTab = 1;
  currentYear: any;
  modalRef: any;

  Mas_Strategic: any = {};
  Mas_Strategic_Issue: any = {};
  Mas_Strategic_Sub_Issue: any = {};
  isEditMode = false;
  isEditModeIssue = false;
  isEditModeSubIssue = false;
  subIssueModalStrategicId: any = null;
  subIssueModalStrategic: any = null;
  subIssueModalIssueId: any = null;
  subIssueModalIssue: any = null;
  subIssueIssueOptions: any[] = [];
  subIssueIssueSelectKey = 0;
  subIssueStrategicSelectKey = 0;

  compareSelectId = (a: any, b: any) => a == b;
  compareIssueItem = (a: any, b: any) => {
    if (!a || !b) {
      return a === b;
    }
    const idA = a.Issues_Id ?? a.Issue_Id;
    const idB = b.Issues_Id ?? b.Issue_Id;
    return idA == idB;
  };
  compareStrategicItem = (a: any, b: any) => {
    if (!a || !b) {
      return a === b;
    }
    return a.Strategic_Id == b.Strategic_Id;
  };

  constructor(private router: Router, private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService, private budgetYearService: BudgetYearService
    , public masterService: MasterService, private cdr: ChangeDetectorRef) {
  }
  List_Mas_Strategic: any[] = [];
  List_Mas_Strategic_Issue: any[] = [];
  List_Mas_Strategic_Sub_Issue: any[] = [];

  listMasStrategicAll: any[] = [];
  listMasStrategicIssueAll: any[] = [];
  private listMasStrategicSubIssueAll: any[] = [];

  listMasStrategicFiltered: any[] = [];
  listMasStrategicIssueFiltered: any[] = [];
  listMasStrategicSubIssueFiltered: any[] = [];

  readonly pageSize = 30;
  strategicPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  issuePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  subIssuePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

  searchIssueTerm = '';
  searchSubIssueTerm = '';
  ngOnInit(): void {
    this.currentYear = this.budgetYearService.getBgyear();
    this.get_data();

    this.budgetYearService.yearChanged$.subscribe(async year => {
      if (year) {
        if (year < 2500) {
          year = year + 543
        }
        this.currentYear = year

        this.get_data()
      }
    });

  }

  get_data() {
    const model = {
      FUNC_CODE: 'FUNC-Get_Mas_Strategic',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasStrategicAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Strategic),
        ['Strategic_Id']
      );
      this.List_Mas_Strategic = [...this.listMasStrategicAll];

      this.listMasStrategicIssueAll = this.normalizeListIds(
        this.mapIssueSelectIds(this.extractList(response?.List_Mas_Strategic_Issue)),
        ['Issues_Id', 'FK_Strategic_Id']
      );
      this.List_Mas_Strategic_Issue = [...this.listMasStrategicIssueAll];

      this.listMasStrategicSubIssueAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Strategic_Sub_Issue),
        ['Issues_Sub_Id', 'FK_Strategic_Issues_Id', 'FK_Strategic_Issue_Id']
      );
      this.List_Mas_Strategic_Sub_Issue = [...this.listMasStrategicSubIssueAll];

      this.filterSearch();
      this.filterIssueSearch();
      this.filterSubIssueSearch();
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

  /** ให้ทุกแถวมี Issues_Id สำหรับ bindValue ของ ng-select */
  private mapIssueSelectIds(list: any[]): any[] {
    return list.map((row) => ({
      ...row,
      Issues_Id: this.normalizeSelectId(
        row.Issues_Id ?? row.Issue_Id ?? row.Strategic_Issues_Id
      ),
    }));
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

  /** ลำดับถัดไป = Order_Seq สูงสุดใน list + 1 */
  private getNextOrderSeq(list: any[]): number {
    if (!list?.length) {
      return 1;
    }
    const maxOrder = Math.max(...list.map((item) => Number(item.Order_Seq) || 0));
    return maxOrder + 1;
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
    page: number;
  } {
    const total = fullList.length;
    if (!total) {
      return { slice: [], startIndex: 0, endIndex: 0, total: 0, page: 1 };
    }
    const safePage = this.clampPage(page, total);
    const startIndex = (safePage - 1) * this.pageSize + 1;
    const endIndex = Math.min(safePage * this.pageSize, total);
    return {
      slice: fullList.slice(startIndex - 1, endIndex),
      startIndex,
      endIndex,
      total,
      page: safePage,
    };
  }

  refreshStrategicPage(): void {
    const result = this.slicePage(this.listMasStrategicFiltered, this.strategicPagination.page);
    this.List_Mas_Strategic = result.slice;
    this.strategicPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshIssuePage(): void {
    const result = this.slicePage(this.listMasStrategicIssueFiltered, this.issuePagination.page);
    this.List_Mas_Strategic_Issue = result.slice;
    this.issuePagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshSubIssuePage(): void {
    const result = this.slicePage(this.listMasStrategicSubIssueFiltered, this.subIssuePagination.page);
    this.List_Mas_Strategic_Sub_Issue = result.slice;
    this.subIssuePagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  onStrategicPageChange(page: number): void {
    this.strategicPagination.page = page;
    this.refreshStrategicPage();
  }

  onIssuePageChange(page: number): void {
    this.issuePagination.page = page;
    this.refreshIssuePage();
  }

  onSubIssuePageChange(page: number): void {
    this.subIssuePagination.page = page;
    this.refreshSubIssuePage();
  }

  filterSearch() {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();
    this.listMasStrategicFiltered = this.filterListByKeyword(this.listMasStrategicAll, keyword);
    this.strategicPagination.page = 1;
    this.refreshStrategicPage();
  }

  filterIssueSearch() {
    const keyword = (this.searchIssueTerm || '').toLowerCase().trim();
    this.listMasStrategicIssueFiltered = this.filterListByKeyword(this.listMasStrategicIssueAll, keyword);
    this.issuePagination.page = 1;
    this.refreshIssuePage();
  }

  filterSubIssueSearch() {
    const keyword = (this.searchSubIssueTerm || '').toLowerCase().trim();
    this.listMasStrategicSubIssueFiltered = this.filterListByKeyword(this.listMasStrategicSubIssueAll, keyword);
    this.subIssuePagination.page = 1;
    this.refreshSubIssuePage();
  }

  toggleAll(event: any) {
    const checked = event.target.checked;
    this.List_Mas_Strategic.forEach((item: any) => {
      if (item.Status_Id != 2) {
        item.selected = checked;
      }
    });
  }

  Confirm() {
    // kept for compatibility with existing button bindings
  }

  CancelConfirm(projectId: number) {
    // TODO: wire cancel API for National Strategy tab
    console.log('Cancel confirm project:', projectId);
  }

  goTab(tab: number) {
    this.currentTab = tab;
  }

  /** อ่าน FK ประเด็นยุทธศาสตร์จาก record (รองรับชื่อ field หลายแบบจาก API) */
  getSubIssueFkIssueId(source: any): any {
    if (!source) {
      return null;
    }
    const explicit =
      source.FK_Strategic_Issues_Id ??
      source.FK_Strategic_Issue_Id ??
      source.Fk_Strategic_Issues_Id ??
      source.Fk_Strategic_Issue_Id;
    if (explicit != null && explicit !== '') {
      return this.normalizeSelectId(explicit);
    }
    for (const key of Object.keys(source)) {
      const normalizedKey = key.replace(/_/g, '').toLowerCase();
      if (normalizedKey.includes('fk') && normalizedKey.includes('strategic') && normalizedKey.includes('issue')) {
        const val = source[key];
        if (val != null && val !== '') {
          return this.normalizeSelectId(val);
        }
      }
    }
    return null;
  }

  private setSubIssueModalIssueFromId(issueId: any): void {
    this.subIssueModalIssueId = this.normalizeSelectId(issueId);
    this.subIssueModalIssue = issueId ? this.findIssueById(issueId) : null;
    if (this.subIssueModalIssueId && !this.subIssueModalIssue) {
      this.subIssueModalIssue = {
        Issues_Id: this.subIssueModalIssueId,
        Strategic_Issues_Name: `รหัสประเด็น: ${this.subIssueModalIssueId}`,
      };
    }
  }

  findIssueById(issueId: any): any {
    if (issueId == null || issueId === '') {
      return null;
    }
    const id = this.normalizeSelectId(issueId);
    return (
      this.listMasStrategicIssueAll.find(
        (i) =>
          i.Issues_Id == id ||
          i.Issue_Id == id ||
          String(i.Issues_Id) === String(id) ||
          String(i.Issue_Id) === String(id)
      ) ?? null
    );
  }

  /** หา FK_Strategic_Id จาก FK ประเด็นยุทธศาสตร์ */
  getStrategicIdByIssueId(issueId: any): any {
    const parentIssue = this.findIssueById(issueId);
    return this.normalizeSelectId(parentIssue?.FK_Strategic_Id ?? null);
  }

  /** where Strategic_Id = FK_Strategic_Id */
  findStrategicById(strategicId: any): any {
    if (strategicId == null || strategicId === '') {
      return null;
    }
    const id = this.normalizeSelectId(strategicId);
    return (
      this.listMasStrategicAll.find(
        (s) => s.Strategic_Id == id || String(s.Strategic_Id) === String(id)
      ) ?? null
    );
  }

  /** ตั้ง select ยุทธศาสตร์ชาติด้าน จาก FK_Strategic_Id → where Strategic_Id */
  private setSubIssueModalStrategicFromFk(fkStrategicId: any): void {
    const id = this.normalizeSelectId(fkStrategicId);
    if (!id) {
      this.clearSubIssueStrategicSelection();
      return;
    }
    const fromList = this.findStrategicById(id);
    if (!fromList) {
      this.clearSubIssueStrategicSelection();
      return;
    }
    this.subIssueModalStrategicId = id;
    this.subIssueModalStrategic = fromList;
  }

  applySubIssueFkToModel(): void {
    const issueId = this.normalizeSelectId(
      this.subIssueModalIssue?.Issues_Id ?? this.subIssueModalIssueId
    );
    this.subIssueModalIssueId = issueId;
    this.Mas_Strategic_Sub_Issue.FK_Strategic_Issues_Id = issueId;
  }

  /** ประเด็นยุทธศาสตร์ → เอา FK_Strategic_Id ไปหา List_Mas_Strategic where Strategic_Id */
  syncSubIssueStrategicFromIssue(): void {
    const issueId =
      this.subIssueModalIssueId ?? this.getSubIssueFkIssueId(this.Mas_Strategic_Sub_Issue);
    const parentIssue = this.findIssueById(issueId);
    const fkStrategicId = this.normalizeSelectId(parentIssue?.FK_Strategic_Id ?? null);

    this.setSubIssueModalStrategicFromFk(fkStrategicId);
  }

  /** กรองประเด็นยุทธศาสตร์ where FK_Strategic_Id = Strategic_Id */
  filterIssuesByStrategicId(strategicId: any): any[] {
    const id = this.normalizeSelectId(strategicId);
    if (id == null || id === '') {
      return [...this.listMasStrategicIssueAll];
    }
    return this.listMasStrategicIssueAll.filter(
      (item) =>
        item.FK_Strategic_Id == id || String(item.FK_Strategic_Id) === String(id)
    );
  }

  /** เคลียร์ model ประเด็นยุทธศาสตร์ทุกตัว */
  clearSubIssueIssueModels(): void {
    this.subIssueModalIssue = null;
    this.subIssueModalIssueId = null;
    if (this.Mas_Strategic_Sub_Issue) {
      this.Mas_Strategic_Sub_Issue.FK_Strategic_Issues_Id = null;
    }
  }

  /** เคลียร์ model ยุทธศาสตร์ชาติด้านทุกตัว */
  clearSubIssueStrategicModels(): void {
    this.subIssueModalStrategic = null;
    this.subIssueModalStrategicId = null;
  }

  clearSubIssueIssueSelection(): void {
    this.clearSubIssueIssueModels();
  }

  clearSubIssueStrategicSelection(): void {
    this.clearSubIssueStrategicModels();
  }

  resetSubIssueIssueSelect(): void {
    this.clearSubIssueIssueModels();
    this.subIssueIssueSelectKey++;
    this.cdr.detectChanges();
  }

  resetSubIssueStrategicSelect(): void {
    this.clearSubIssueStrategicModels();
    this.subIssueStrategicSelectKey++;
    this.cdr.detectChanges();
  }

  updateSubIssueIssueOptions(clearIssueIfMismatch = true): void {
    const strategicId = this.subIssueModalStrategicId;
    const options = this.filterIssuesByStrategicId(strategicId);

    if (clearIssueIfMismatch) {
      const selectedIssueId =
        this.subIssueModalIssueId ?? this.subIssueModalIssue?.Issues_Id ?? null;
      if (selectedIssueId != null && selectedIssueId !== '') {
        const inFiltered = options.some(
          (i) => i.Issues_Id == selectedIssueId || i.Issue_Id == selectedIssueId
        );
        if (!inFiltered) {
          this.clearSubIssueIssueSelection();
        }
      }
    }

    this.subIssueIssueOptions = [...options];
  }

  /** เลือกยุทธศาสตร์ชาติด้าน → เคลียร์ model ประเด็นทุกครั้ง แล้วกรองรายการประเด็น */
  onSubIssueStrategicObjectChange(strategic: any) {
    this.clearSubIssueIssueModels();
    this.subIssueIssueSelectKey++;

    if (!strategic) {
      this.clearSubIssueStrategicModels();
      this.subIssueIssueOptions = [...this.listMasStrategicIssueAll];
      this.cdr.detectChanges();
      return;
    }

    const strategicId = this.normalizeSelectId(strategic.Strategic_Id);
    const fromList = this.findStrategicById(strategicId);

    if (!fromList) {
      this.clearSubIssueStrategicModels();
      this.subIssueIssueOptions = [];
      this.cdr.detectChanges();
      return;
    }

    this.subIssueModalStrategic = fromList;
    this.subIssueModalStrategicId = strategicId;
    this.updateSubIssueIssueOptions(false);
    if (this.subIssueIssueOptions.length === 0) {
      this.warnNoStrategicIssuesForSubIssue();
    }
    this.cdr.detectChanges();
  }

  private warnNoStrategicIssuesForSubIssue(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'ไม่มีตัวเลือกประเด็นยุทธศาสตร์ กรุณาเพิ่มข้อมูล',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  /** เลือกประเด็นยุทธศาสตร์ → เคลียร์ model ด้านทุกครั้ง แล้วตั้งด้านจาก FK */
  onSubIssueIssueObjectChange(issue: any) {
    this.clearSubIssueStrategicModels();
    this.subIssueStrategicSelectKey++;

    if (!issue) {
      this.clearSubIssueIssueModels();
      this.subIssueIssueSelectKey++;
      this.updateSubIssueIssueOptions(false);
      this.cdr.detectChanges();
      return;
    }

    const issueId = this.normalizeSelectId(issue.Issues_Id ?? issue.Issue_Id);
    const fromList = this.findIssueById(issueId);
    this.subIssueModalIssue = fromList ?? issue;
    this.applySubIssueFkToModel();
    this.syncSubIssueStrategicFromIssue();
    this.updateSubIssueIssueOptions(false);

    if (this.subIssueModalStrategicId) {
      const strategicFromList = this.findStrategicById(this.subIssueModalStrategicId);
      if (strategicFromList) {
        this.subIssueModalStrategic = strategicFromList;
      }
    }
    this.cdr.detectChanges();
  }

  openAddModal(modal: any) {
    this.isEditMode = false;
    this.Mas_Strategic = {
      Strategic_Id: 0,
      BgYear_Start: '',
      BgYear_End: '',
      Strategic_Name: '',
      Strategic_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasStrategicAll)
    };
    this.modalRef = this.modalService.open(modal, {
      size: 'xl',
      backdrop: 'static'
    });
  }

  openEditModal(modal: any, item: any) {
    this.isEditMode = true;
    this.Mas_Strategic = { ...item };
    this.modalRef = this.modalService.open(modal, {
      size: 'xl',
      backdrop: 'static'
    });
  }

  openAddIssueModal(modal: any) {
    this.isEditModeIssue = false;
    this.Mas_Strategic_Issue = {
      Issues_Id: 0,
      FK_Strategic_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Strategic_Issues_Name: '',
      Strategic_Issues_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasStrategicIssueAll)
    };
    this.modalRef = this.modalService.open(modal, {
      size: 'xl',
      backdrop: 'static'
    });
  }

  openEditIssueModal(modal: any, item: any) {
    this.isEditModeIssue = true;
    this.Mas_Strategic_Issue = { ...item };
    this.modalRef = this.modalService.open(modal, {
      size: 'xl',
      backdrop: 'static'
    });
  }

  Delete_Mas_Strategic(item: any) {
    Swal.fire({
      title: 'ต้องการลบข้อมูล?',
      text: item?.Strategic_Name ? `ยืนยันการลบ "${item.Strategic_Name}"` : 'ยืนยันการลบรายการนี้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgb(243, 78, 78)',
      cancelButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const model = {
        FUNC_CODE: 'Func-Delete_Mas_Strategic',
        Mas_Strategic: item
      };

      this.serviceebud.GatewayGetData(model).subscribe({
        next: (response: any) => {
          if (response.RESULT == null) {
            Swal.fire({
              title: 'ลบสำเร็จ!',
              text: 'ลบรายการยุทธศาสตร์ชาติด้านเรียบร้อยแล้ว!',
              icon: 'success',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK',
            });
            this.get_data();
          } else {
            Swal.fire({
              title: 'เกิดข้อผิดพลาด!',
              text: response.RESULT,
              icon: 'warning',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK',
            });
          }
        },
      });
    });
  }

  Delete_Mas_Strategic_Issue(item: any) {
    Swal.fire({
      title: 'ต้องการลบข้อมูล?',
      text: item?.Strategic_Issues_Name ? `ยืนยันการลบ "${item.Strategic_Issues_Name}"` : 'ยืนยันการลบรายการนี้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgb(243, 78, 78)',
      cancelButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const model = {
        FUNC_CODE: 'Func-Delete_Mas_Strategic_Issue',
        Mas_Strategic_Issue: item
      };

      this.serviceebud.GatewayGetData(model).subscribe({
        next: (response: any) => {
          if (response.RESULT == null) {
            Swal.fire({
              title: 'ลบสำเร็จ!',
              text: 'ลบรายการประเด็นยุทธศาสตร์เรียบร้อยแล้ว!',
              icon: 'success',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK',
            });
            this.get_data();
          } else {
            Swal.fire({
              title: 'เกิดข้อผิดพลาด!',
              text: response.RESULT,
              icon: 'warning',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK',
            });
          }
        },
      });
    });
  }

  Delete_Mas_Strategic_Sub_Issue(item: any) {
    Swal.fire({
      title: 'ต้องการลบข้อมูล?',
      text: item?.Strategic_Sub_Issues_Name ? `ยืนยันการลบ "${item.Strategic_Sub_Issues_Name}"` : 'ยืนยันการลบรายการนี้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'rgb(243, 78, 78)',
      cancelButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      const model = {
        FUNC_CODE: 'Func-Delete_Mas_Strategic_Sub_Issue',
        Mas_Strategic_Sub_Issue: item
      };

      this.serviceebud.GatewayGetData(model).subscribe({
        next: (response: any) => {
          if (response.RESULT == null) {
            Swal.fire({
              title: 'ลบสำเร็จ!',
              text: 'ลบรายการประเด็นย่อยเรียบร้อยแล้ว!',
              icon: 'success',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK',
            });
            this.get_data();
          } else {
            Swal.fire({
              title: 'เกิดข้อผิดพลาด!',
              text: response.RESULT,
              icon: 'warning',
              confirmButtonColor: 'rgb(3, 142, 220)',
              confirmButtonText: 'OK',
            });
          }
        },
      });
    });
  }

  BtnSave() {


    const model = {
      FUNC_CODE: 'Func-Save_Mas_Strategic',
      Mas_Strategic: this.Mas_Strategic
    };

    this.serviceebud.GatewayGetData(model).subscribe({
      next: (response: any) => {


        if (response.RESULT == null) {
          // this.Mas_Strategic = response.Mas_Strategic;
          Swal.fire({
            title: "บันทึกสำเร็จ!",
            text: "บันทึกรายการยุทธศาสตร์ชาติด้านเรียบร้อยแล้ว!",
            icon: "success",
            //showCancelButton: true,
            confirmButtonColor: "rgb(3, 142, 220)",
            //cancelButtonColor: 'rgb(243, 78, 78)',
            confirmButtonText: "OK",
          });
          this.get_data();
          this.Mas_Strategic = {};
          this.modalService.dismissAll();
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: response.RESULT,
            icon: "warning",
            confirmButtonColor: "rgb(3, 142, 220)",
            confirmButtonText: "OK",
          });
        }
      },
    });

  }

  openAddSubIssueModal(modal: any) {
    this.isEditModeSubIssue = false;
    this.subIssueModalStrategicId = null;
    this.subIssueModalStrategic = null;
    this.subIssueModalIssueId = null;
    this.subIssueModalIssue = null;
    this.subIssueIssueSelectKey = 0;
    this.subIssueStrategicSelectKey = 0;
    this.Mas_Strategic_Sub_Issue = {
      Issues_Sub_Id: 0,
      FK_Strategic_Issues_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Strategic_Sub_Issues_Name: '',
      Strategic_Sub_Issues_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasStrategicSubIssueAll)
    };
    this.updateSubIssueIssueOptions();
    this.modalRef = this.modalService.open(modal, {
      size: 'xl',
      backdrop: 'static'
    });
  }

  openEditSubIssueModal(modal: any, item: any) {
    this.isEditModeSubIssue = true;
    const issueId = this.getSubIssueFkIssueId(item);

    this.Mas_Strategic_Sub_Issue = {
      ...item,
      FK_Strategic_Issues_Id: issueId
    };
    this.subIssueModalStrategicId = null;
    this.subIssueModalStrategic = null;
    this.subIssueIssueSelectKey = 0;
    this.subIssueStrategicSelectKey = 0;
    this.setSubIssueModalIssueFromId(issueId);
    this.syncSubIssueStrategicFromIssue();
    this.updateSubIssueIssueOptions(false);

    if (issueId) {
      const issueFromList = this.findIssueById(issueId);
      if (issueFromList) {
        this.subIssueModalIssue = issueFromList;
        this.applySubIssueFkToModel();
        this.subIssueIssueSelectKey++;
      }
    }
    if (this.subIssueModalStrategicId) {
      const strategicFromList = this.findStrategicById(this.subIssueModalStrategicId);
      if (strategicFromList) {
        this.subIssueModalStrategic = strategicFromList;
        this.subIssueStrategicSelectKey++;
      }
    }
    this.cdr.detectChanges();

    this.modalRef = this.modalService.open(modal, {
      size: 'xl',
      backdrop: 'static'
    });
  }

  BtnSaveIssue() {
    if (!this.isEditModeIssue && (this.Mas_Strategic_Issue.FK_Strategic_Id == null || this.Mas_Strategic_Issue.FK_Strategic_Id === '')) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกยุทธศาสตร์ชาติด้าน',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    const model = {
      FUNC_CODE: 'Func-Save_Mas_Strategic_Issue',
      Mas_Strategic_Issue: this.Mas_Strategic_Issue
    };

    this.serviceebud.GatewayGetData(model).subscribe({
      next: (response: any) => {
        if (response.RESULT == null) {
          Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'บันทึกรายการประเด็นยุทธศาสตร์เรียบร้อยแล้ว!',
            icon: 'success',
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'OK',
          });
          this.get_data();
          this.Mas_Strategic_Issue = {};
          this.modalService.dismissAll();
        } else {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: response.RESULT,
            icon: 'warning',
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'OK',
          });
        }
      },
    });
  }

  BtnSaveSubIssue() {
    this.applySubIssueFkToModel();

    if (!this.subIssueModalIssue && (this.subIssueModalIssueId == null || this.subIssueModalIssueId === '')) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกประเด็นยุทธศาสตร์',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.syncSubIssueStrategicFromIssue();
    if (this.subIssueModalStrategicId == null || this.subIssueModalStrategicId === '') {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'ไม่พบยุทธศาสตร์ชาติด้านของประเด็นยุทธศาสตร์ที่เลือก',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    const model = {
      FUNC_CODE: 'Func-Save_Mas_Strategic_Sub_Issue',
      Mas_Strategic_Sub_Issue: this.Mas_Strategic_Sub_Issue
    };

    this.serviceebud.GatewayGetData(model).subscribe({
      next: (response: any) => {
        if (response.RESULT == null) {
          Swal.fire({
            title: 'บันทึกสำเร็จ!',
            text: 'บันทึกรายการประเด็นย่อยเรียบร้อยแล้ว!',
            icon: 'success',
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'OK',
          });
          this.get_data();
          this.Mas_Strategic_Sub_Issue = {};
          this.subIssueModalStrategicId = null;
          this.subIssueModalStrategic = null;
          this.subIssueModalIssueId = null;
          this.subIssueModalIssue = null;
          this.modalService.dismissAll();
        } else {
          Swal.fire({
            title: 'เกิดข้อผิดพลาด!',
            text: response.RESULT,
            icon: 'warning',
            confirmButtonColor: 'rgb(3, 142, 220)',
            confirmButtonText: 'OK',
          });
        }
      },
    });
  }

  goBackToPlan() {
    this.router.navigateByUrl('/MasterData/MasProjectPlan');
  }
}
