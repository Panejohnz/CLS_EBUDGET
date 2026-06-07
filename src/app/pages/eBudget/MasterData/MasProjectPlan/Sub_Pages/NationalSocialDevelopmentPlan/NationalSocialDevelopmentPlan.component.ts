import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
  selector: 'NationalSocialDevelopmentPlan',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './NationalSocialDevelopmentPlan.component.html',
  styleUrls: ['./NationalSocialDevelopmentPlan.component.scss']
})
export class NationalSocialDevelopmentPlanComponent implements OnInit {
  currentTab = 1;
  currentYear: any;
  modalRef: any;

  Mas_Landmark: any = {};
  Mas_Landmark_Gloals: any = {};
  Mas_Landmark_Tacticts: any = {};
  Mas_Landmark_Guidelines: any = {};
  Mas_Landmark_Sub_Guidelines: any = {};

  isEditModeLandmark = false;
  isEditModeGoal = false;
  isEditModeTactic = false;
  isEditModeGuideline = false;
  isEditModeSubGuideline = false;

  goalLandmarkSelectKey = 0;
  tacticGoalSelectKey = 0;
  guidelineLandmarkSelectKey = 0;
  subGuidelineGuidelineSelectKey = 0;

  List_Mas_Landmark: any[] = [];
  List_Mas_Landmark_Gloals: any[] = [];
  List_Mas_Landmark_Tacticts: any[] = [];
  List_Mas_Landmark_Guidelines: any[] = [];
  List_Mas_Landmark_Sub_Guidelines: any[] = [];

  listMasLandmarkAll: any[] = [];
  listMasLandmarkGloalsAll: any[] = [];
  listMasLandmarkTactictsAll: any[] = [];
  listMasLandmarkGuidelinesAll: any[] = [];
  listMasLandmarkSubGuidelinesAll: any[] = [];

  listMasLandmarkFiltered: any[] = [];
  listMasLandmarkGloalsFiltered: any[] = [];
  listMasLandmarkTactictsFiltered: any[] = [];
  listMasLandmarkGuidelinesFiltered: any[] = [];
  listMasLandmarkSubGuidelinesFiltered: any[] = [];

  readonly pageSize = 30;
  landmarkPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  goalPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  tacticPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  guidelinePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  subGuidelinePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

  searchGoalTerm = '';
  searchTacticTerm = '';
  searchGuidelineTerm = '';
  searchSubGuidelineTerm = '';

  constructor(
    private router: Router,
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public serviceebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService,
    public masterService: MasterService,
    private cdr: ChangeDetectorRef
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
      FUNC_CODE: 'FUNC-Get_Mas_NationalSocialDevelopmentPlan',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasLandmarkAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Landmark),
        ['Landmark_Id']
      );

      this.listMasLandmarkGloalsAll = this.normalizeListIds(
        this.extractList(
          response?.List_Mas_Landmark_Gloals ??
          response?.List_Mas_Landmark_Goals ??
          response?.List_Mas_Landmark_Gloal
        ),
        ['Landmark_Gloals_Id', 'Landmark_Goals_Id', 'FK_Landmark_Id', 'Fk_Landmark_Id']
      ).map((goal) => {
        const landmarkId = goal.FK_Landmark_Id ?? goal.Fk_Landmark_Id ?? null;
        return {
          ...goal,
          Landmark_Gloals_Id: goal.Landmark_Gloals_Id ?? goal.Landmark_Goals_Id ?? null,
          FK_Landmark_Id: landmarkId,
          Fk_Landmark_Id: landmarkId
        };
      });

      this.listMasLandmarkTactictsAll = this.normalizeListIds(
        this.extractList(
          response?.List_Mas_Landmark_Tacticts ??
          response?.List_Mas_Landmark_Tactic ??
          response?.List_Mas_Landmark_Tactics
        ),
        [
          'Landmark_Tacticts_Id',
          'Landmark_Tactics_Id',
          'FK_Landmark_Goals_Id',
          'Fk_Landmark_Goals_Id',
          'FK_Landmark_Gloals_Id'
        ]
      ).map((tactic) => {
        const goalId =
          tactic.FK_Landmark_Goals_Id ??
          tactic.Fk_Landmark_Goals_Id ??
          tactic.FK_Landmark_Gloals_Id ??
          null;
        return {
          ...tactic,
          Landmark_Tacticts_Id: tactic.Landmark_Tacticts_Id ?? tactic.Landmark_Tactics_Id ?? null,
          FK_Landmark_Goals_Id: goalId,
          Fk_Landmark_Goals_Id: goalId
        };
      });

      this.listMasLandmarkGuidelinesAll = this.normalizeListIds(
        this.extractList(
          response?.List_Mas_Landmark_Guidelines ?? response?.List_Mas_Landmark_Guideline
        ),
        ['Landmark_Guidelines_Id', 'Guidelines_Id', 'FK_Landmark_Id', 'Fk_Landmark_Id']
      ).map((guideline) => {
        const landmarkId = guideline.FK_Landmark_Id ?? guideline.Fk_Landmark_Id ?? null;
        return {
          ...guideline,
          Landmark_Guidelines_Id:
            guideline.Landmark_Guidelines_Id ?? guideline.Guidelines_Id ?? null,
          FK_Landmark_Id: landmarkId,
          Fk_Landmark_Id: landmarkId
        };
      });

      this.listMasLandmarkSubGuidelinesAll = this.normalizeListIds(
        this.extractList(
          response?.List_Mas_Landmark_Sub_Guidelines ??
          response?.List_Mas_Landmark_Sub_Guideline
        ),
        ['Sub_Guidelines_Id', 'FK_Guidelines_Id', 'Fk_Guidelines_Id']
      ).map((sub) => {
        const guidelineId = sub.FK_Guidelines_Id ?? sub.Fk_Guidelines_Id ?? null;
        return {
          ...sub,
          FK_Guidelines_Id: guidelineId,
          Fk_Guidelines_Id: guidelineId
        };
      });

      this.filterLandmarkSearch();
      this.filterGoalSearch();
      this.filterTacticSearch();
      this.filterGuidelineSearch();
      this.filterSubGuidelineSearch();
    });
  }

  goTab(tab: number): void {
    this.currentTab = tab;
  }

  goBackToPlan(): void {
    this.router.navigateByUrl('/MasterData/MasProjectPlan');
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

  private refreshLandmarkPage(): void {
    const result = this.slicePage(this.listMasLandmarkFiltered, this.landmarkPagination.page);
    this.List_Mas_Landmark = result.slice;
    this.landmarkPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshGoalPage(): void {
    const result = this.slicePage(this.listMasLandmarkGloalsFiltered, this.goalPagination.page);
    this.List_Mas_Landmark_Gloals = result.slice;
    this.goalPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshTacticPage(): void {
    const result = this.slicePage(this.listMasLandmarkTactictsFiltered, this.tacticPagination.page);
    this.List_Mas_Landmark_Tacticts = result.slice;
    this.tacticPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshGuidelinePage(): void {
    const result = this.slicePage(this.listMasLandmarkGuidelinesFiltered, this.guidelinePagination.page);
    this.List_Mas_Landmark_Guidelines = result.slice;
    this.guidelinePagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshSubGuidelinePage(): void {
    const result = this.slicePage(
      this.listMasLandmarkSubGuidelinesFiltered,
      this.subGuidelinePagination.page
    );
    this.List_Mas_Landmark_Sub_Guidelines = result.slice;
    this.subGuidelinePagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  onLandmarkPageChange(page: number): void {
    this.landmarkPagination.page = page;
    this.refreshLandmarkPage();
  }

  onGoalPageChange(page: number): void {
    this.goalPagination.page = page;
    this.refreshGoalPage();
  }

  onTacticPageChange(page: number): void {
    this.tacticPagination.page = page;
    this.refreshTacticPage();
  }

  onGuidelinePageChange(page: number): void {
    this.guidelinePagination.page = page;
    this.refreshGuidelinePage();
  }

  onSubGuidelinePageChange(page: number): void {
    this.subGuidelinePagination.page = page;
    this.refreshSubGuidelinePage();
  }

  filterLandmarkSearch(): void {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();
    this.listMasLandmarkFiltered = this.filterListByKeyword(this.listMasLandmarkAll, keyword);
    this.landmarkPagination.page = 1;
    this.refreshLandmarkPage();
  }

  filterGoalSearch(): void {
    const keyword = (this.searchGoalTerm || '').toLowerCase().trim();
    this.listMasLandmarkGloalsFiltered = this.filterListByKeyword(
      this.listMasLandmarkGloalsAll,
      keyword
    );
    this.goalPagination.page = 1;
    this.refreshGoalPage();
  }

  filterTacticSearch(): void {
    const keyword = (this.searchTacticTerm || '').toLowerCase().trim();
    this.listMasLandmarkTactictsFiltered = this.filterListByKeyword(
      this.listMasLandmarkTactictsAll,
      keyword
    );
    this.tacticPagination.page = 1;
    this.refreshTacticPage();
  }

  filterGuidelineSearch(): void {
    const keyword = (this.searchGuidelineTerm || '').toLowerCase().trim();
    this.listMasLandmarkGuidelinesFiltered = this.filterListByKeyword(
      this.listMasLandmarkGuidelinesAll,
      keyword
    );
    this.guidelinePagination.page = 1;
    this.refreshGuidelinePage();
  }

  filterSubGuidelineSearch(): void {
    const keyword = (this.searchSubGuidelineTerm || '').toLowerCase().trim();
    this.listMasLandmarkSubGuidelinesFiltered = this.filterListByKeyword(
      this.listMasLandmarkSubGuidelinesAll,
      keyword
    );
    this.subGuidelinePagination.page = 1;
    this.refreshSubGuidelinePage();
  }

  findLandmarkById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasLandmarkAll.find(
        (l) => l.Landmark_Id == normalized || String(l.Landmark_Id) === String(normalized)
      ) ?? null
    );
  }

  findGoalById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasLandmarkGloalsAll.find(
        (g) =>
          g.Landmark_Gloals_Id == normalized ||
          g.Landmark_Goals_Id == normalized ||
          String(g.Landmark_Gloals_Id) === String(normalized) ||
          String(g.Landmark_Goals_Id) === String(normalized)
      ) ?? null
    );
  }

  findGuidelineById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasLandmarkGuidelinesAll.find(
        (g) =>
          g.Landmark_Guidelines_Id == normalized ||
          g.Guidelines_Id == normalized ||
          String(g.Landmark_Guidelines_Id) === String(normalized) ||
          String(g.Guidelines_Id) === String(normalized)
      ) ?? null
    );
  }

  getGoalFkLandmarkId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.FK_Landmark_Id ?? item.Fk_Landmark_Id ?? null);
  }

  getTacticFkGoalId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(
      item.FK_Landmark_Goals_Id ??
      item.Fk_Landmark_Goals_Id ??
      item.FK_Landmark_Gloals_Id ??
      null
    );
  }

  getGuidelineFkLandmarkId(item: any): any {
    return this.getGoalFkLandmarkId(item);
  }

  getSubGuidelineFkGuidelineId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.FK_Guidelines_Id ?? item.Fk_Guidelines_Id ?? null);
  }

  getGoalId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.Landmark_Gloals_Id ?? item.Landmark_Goals_Id ?? null);
  }

  getGuidelineId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.Landmark_Guidelines_Id ?? item.Guidelines_Id ?? null);
  }

  getLandmarkNameById(id: any): string {
    return this.findLandmarkById(id)?.Landmark_Name ?? '';
  }

  getGoalNameById(id: any): string {
    const goal = this.findGoalById(id);
    return goal?.Landmark_Gloals_Name ?? goal?.Landmark_Goals_Name ?? '';
  }

  getGuidelineNameById(id: any): string {
    const guideline = this.findGuidelineById(id);
    return guideline?.Landmark_Guidelines_Name ?? guideline?.Guidelines_Name ?? '';
  }

  getGoalNameForRow(row: any): string {
    if (!row) {
      return '';
    }
    return (
      row.Landmark_Gloals_Name ??
      row.Landmark_Goals_Name ??
      this.getGoalNameById(this.getGoalId(row))
    );
  }

  getLandmarkNameForGoalRow(row: any): string {
    return this.getLandmarkNameById(this.getGoalFkLandmarkId(row));
  }

  getGoalNameForTacticRow(row: any): string {
    return this.getGoalNameById(this.getTacticFkGoalId(row));
  }

  getLandmarkNameForGuidelineRow(row: any): string {
    return this.getLandmarkNameById(this.getGuidelineFkLandmarkId(row));
  }

  getGuidelineNameForSubRow(row: any): string {
    return this.getGuidelineNameById(this.getSubGuidelineFkGuidelineId(row));
  }

  onGoalLandmarkIdChange(landmarkId: any): void {
    const normalized = this.normalizeSelectId(landmarkId);
    if (!normalized) {
      this.Mas_Landmark_Gloals.FK_Landmark_Id = null;
      this.Mas_Landmark_Gloals.Fk_Landmark_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Landmark_Gloals.FK_Landmark_Id = normalized;
    this.Mas_Landmark_Gloals.Fk_Landmark_Id = normalized;
    this.cdr.detectChanges();
  }

  onTacticGoalIdChange(goalId: any): void {
    const normalized = this.normalizeSelectId(goalId);
    if (!normalized) {
      this.Mas_Landmark_Tacticts.FK_Landmark_Goals_Id = null;
      this.Mas_Landmark_Tacticts.Fk_Landmark_Goals_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Landmark_Tacticts.FK_Landmark_Goals_Id = normalized;
    this.Mas_Landmark_Tacticts.Fk_Landmark_Goals_Id = normalized;
    this.cdr.detectChanges();
  }

  onGuidelineLandmarkIdChange(landmarkId: any): void {
    const normalized = this.normalizeSelectId(landmarkId);
    if (!normalized) {
      this.Mas_Landmark_Guidelines.FK_Landmark_Id = null;
      this.Mas_Landmark_Guidelines.Fk_Landmark_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Landmark_Guidelines.FK_Landmark_Id = normalized;
    this.Mas_Landmark_Guidelines.Fk_Landmark_Id = normalized;
    this.cdr.detectChanges();
  }

  onSubGuidelineGuidelineIdChange(guidelineId: any): void {
    const normalized = this.normalizeSelectId(guidelineId);
    if (!normalized) {
      this.Mas_Landmark_Sub_Guidelines.FK_Guidelines_Id = null;
      this.Mas_Landmark_Sub_Guidelines.Fk_Guidelines_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Landmark_Sub_Guidelines.FK_Guidelines_Id = normalized;
    this.Mas_Landmark_Sub_Guidelines.Fk_Guidelines_Id = normalized;
    this.cdr.detectChanges();
  }

  private handleSaveResponse(response: any, successText: string): void {
    if (response.RESULT == null) {
      Swal.fire({
        title: 'บันทึกสำเร็จ!',
        text: successText,
        icon: 'success',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      this.modalRef?.close();
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

  private handleDeleteResponse(response: any, successText: string): void {
    if (response.RESULT == null) {
      Swal.fire({
        title: 'ลบสำเร็จ!',
        text: successText,
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
  }

  openAddLandmarkModal(modal: any): void {
    this.isEditModeLandmark = false;
    this.Mas_Landmark = {
      Landmark_Id: 0,
      BgYear_Start: '',
      BgYear_End: '',
      Landmark_Name: '',
      Landmark_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasLandmarkAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditLandmarkModal(modal: any, item: any): void {
    this.isEditModeLandmark = true;
    this.Mas_Landmark = { ...item };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGoalModal(modal: any): void {
    this.isEditModeGoal = false;
    this.goalLandmarkSelectKey = 0;
    this.Mas_Landmark_Gloals = {
      Landmark_Gloals_Id: 0,
      FK_Landmark_Id: null,
      Fk_Landmark_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Landmark_Gloals_Name: '',
      Landmark_Gloals_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasLandmarkGloalsAll)
    };
    if (this.listMasLandmarkAll.length === 0) {
      this.warnNoLandmark();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGoalModal(modal: any, item: any): void {
    this.isEditModeGoal = true;
    const landmarkId = this.getGoalFkLandmarkId(item);
    const goalId = this.getGoalId(item);
    this.Mas_Landmark_Gloals = {
      ...item,
      Landmark_Gloals_Id: goalId,
      FK_Landmark_Id: landmarkId,
      Fk_Landmark_Id: landmarkId
    };
    this.goalLandmarkSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddTacticModal(modal: any): void {
    this.isEditModeTactic = false;
    this.tacticGoalSelectKey = 0;
    this.Mas_Landmark_Tacticts = {
      Landmark_Tacticts_Id: 0,
      FK_Landmark_Goals_Id: null,
      Fk_Landmark_Goals_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Landmark_Tacticts_Name: '',
      Landmark_Tacticts_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasLandmarkTactictsAll)
    };
    if (this.listMasLandmarkGloalsAll.length === 0) {
      this.warnNoGoals();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditTacticModal(modal: any, item: any): void {
    this.isEditModeTactic = true;
    const goalId = this.getTacticFkGoalId(item);
    this.Mas_Landmark_Tacticts = {
      ...item,
      Landmark_Tacticts_Id: item.Landmark_Tacticts_Id ?? item.Landmark_Tactics_Id ?? null,
      FK_Landmark_Goals_Id: goalId,
      Fk_Landmark_Goals_Id: goalId
    };
    this.tacticGoalSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGuidelineModal(modal: any): void {
    this.isEditModeGuideline = false;
    this.guidelineLandmarkSelectKey = 0;
    this.Mas_Landmark_Guidelines = {
      Landmark_Guidelines_Id: 0,
      FK_Landmark_Id: null,
      Fk_Landmark_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Landmark_Guidelines_Name: '',
      Landmark_Guidelines_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasLandmarkGuidelinesAll)
    };
    if (this.listMasLandmarkAll.length === 0) {
      this.warnNoLandmark();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGuidelineModal(modal: any, item: any): void {
    this.isEditModeGuideline = true;
    const landmarkId = this.getGuidelineFkLandmarkId(item);
    const guidelineId = this.getGuidelineId(item);
    this.Mas_Landmark_Guidelines = {
      ...item,
      Landmark_Guidelines_Id: guidelineId,
      FK_Landmark_Id: landmarkId,
      Fk_Landmark_Id: landmarkId
    };
    this.guidelineLandmarkSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddSubGuidelineModal(modal: any): void {
    this.isEditModeSubGuideline = false;
    this.subGuidelineGuidelineSelectKey = 0;
    this.Mas_Landmark_Sub_Guidelines = {
      Sub_Guidelines_Id: 0,
      FK_Guidelines_Id: null,
      Fk_Guidelines_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Sub_Guidelines_Name: '',
      Sub_Guidelines_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasLandmarkSubGuidelinesAll)
    };
    if (this.listMasLandmarkGuidelinesAll.length === 0) {
      this.warnNoGuidelines();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditSubGuidelineModal(modal: any, item: any): void {
    this.isEditModeSubGuideline = true;
    const guidelineId = this.getSubGuidelineFkGuidelineId(item);
    this.Mas_Landmark_Sub_Guidelines = {
      ...item,
      FK_Guidelines_Id: guidelineId,
      Fk_Guidelines_Id: guidelineId
    };
    this.subGuidelineGuidelineSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  private warnNoLandmark(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : หมุดหมายที่',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  private warnNoGoals(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : เป้าหมายที่',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  private warnNoGuidelines(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : กลยุทธ์การพัฒนาที่',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  BtnSaveLandmark(): void {
    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Landmark',
      Mas_Landmark: this.Mas_Landmark
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการหมุดหมายที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveLandmarkGloals(): void {
    const landmarkId = this.getGoalFkLandmarkId(this.Mas_Landmark_Gloals);
    if (!landmarkId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกหมุดหมายที่',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Landmark_Gloals.FK_Landmark_Id = landmarkId;
    this.Mas_Landmark_Gloals.Fk_Landmark_Id = landmarkId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Landmark_Gloals',
      Mas_Landmark_Gloals: this.Mas_Landmark_Gloals
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveLandmarkTacticts(): void {
    const goalId = this.getTacticFkGoalId(this.Mas_Landmark_Tacticts);
    if (!goalId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกเป้าหมายที่',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Landmark_Tacticts.FK_Landmark_Goals_Id = goalId;
    this.Mas_Landmark_Tacticts.Fk_Landmark_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Landmark_Tacticts',
      Mas_Landmark_Tacticts: this.Mas_Landmark_Tacticts
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการตัวชี้วัดที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveLandmarkGuidelines(): void {
    const landmarkId = this.getGuidelineFkLandmarkId(this.Mas_Landmark_Guidelines);
    if (!landmarkId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกหมุดหมายที่',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Landmark_Guidelines.FK_Landmark_Id = landmarkId;
    this.Mas_Landmark_Guidelines.Fk_Landmark_Id = landmarkId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Landmark_Guidelines',
      Mas_Landmark_Guidelines: this.Mas_Landmark_Guidelines
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการกลยุทธ์การพัฒนาที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveLandmarkSubGuidelines(): void {
    const guidelineId = this.getSubGuidelineFkGuidelineId(this.Mas_Landmark_Sub_Guidelines);
    if (!guidelineId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกกลยุทธ์การพัฒนาที่',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Landmark_Sub_Guidelines.FK_Guidelines_Id = guidelineId;
    this.Mas_Landmark_Sub_Guidelines.Fk_Guidelines_Id = guidelineId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Landmark_Sub_Guidelines',
      Mas_Landmark_Sub_Guidelines: this.Mas_Landmark_Sub_Guidelines
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการกลยุทธ์ย่อยที่เรียบร้อยแล้ว!')
    );
  }

  Delete_Mas_Landmark(item: any): void {
    this.confirmDelete(item?.Landmark_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Landmark',
        Mas_Landmark: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการหมุดหมายที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Landmark_Gloals(item: any): void {
    this.confirmDelete(this.getGoalNameForRow(item), () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Landmark_Gloals',
        Mas_Landmark_Gloals: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการเป้าหมายที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Landmark_Tacticts(item: any): void {
    this.confirmDelete(item?.Landmark_Tacticts_Name ?? item?.Landmark_Tactics_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Landmark_Tacticts',
        Mas_Landmark_Tacticts: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการตัวชี้วัดที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Landmark_Guidelines(item: any): void {
    this.confirmDelete(item?.Landmark_Guidelines_Name ?? item?.Guidelines_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Landmark_Guidelines',
        Mas_Landmark_Guidelines: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการกลยุทธ์การพัฒนาที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Landmark_Sub_Guidelines(item: any): void {
    this.confirmDelete(item?.Sub_Guidelines_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Landmark_Sub_Guidelines',
        Mas_Landmark_Sub_Guidelines: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการกลยุทธ์ย่อยที่เรียบร้อยแล้ว!')
      );
    });
  }
}
