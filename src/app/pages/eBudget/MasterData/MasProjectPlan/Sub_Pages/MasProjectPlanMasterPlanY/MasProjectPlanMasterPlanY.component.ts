import { ChangeDetectorRef, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { GridJsService } from 'src/app/pages/tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { MasterService } from 'src/app/core/services/Master.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'MasProjectPlanMasterPlanY',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './MasProjectPlanMasterPlanY.component.html',
  styleUrls: ['./MasProjectPlanMasterPlanY.component.scss']
})
export class MasProjectPlanMasterPlanYComponent {
  currentTab = 1;
  currentYear: any;
  modalRef: any;

  Mas_Master_Plan: any = {};
  Mas_Master_Plan_Goal: any = {};
  Mas_Master_Plan_Goal_Tactic: any = {};
  Mas_Sub_Master_Plan: any = {};
  Mas_Sub_Master_Plan_Goal: any = {};
  Mas_Sub_Plan_Guideline: any = {};
  Mas_Value_Chain: any = {};
  Mas_Value_Chain_Factor: any = {};

  isEditModePlan = false;
  isEditModeGoal = false;
  isEditModeTactic = false;
  isEditModeSubPlan = false;
  isEditModeSubGoal = false;
  isEditModeGuideline = false;
  isEditModeChainMain = false;
  isEditModeChainSupport = false;
  isEditModeFactorMain = false;
  isEditModeFactorSupport = false;

  List_Mas_Master_Plan: any[] = [];
  List_Mas_Master_Plan_Goal: any[] = [];
  List_Mas_Master_Plan_Goal_Tactic: any[] = [];
  List_Mas_Sub_Master_Plan: any[] = [];
  List_Mas_Sub_Master_Plan_Goal: any[] = [];
  List_Mas_Sub_Plan_Guideline: any[] = [];
  List_Mas_Value_Chain_Main: any[] = [];
  List_Mas_Value_Chain_Factor_Main: any[] = [];
  List_Mas_Value_Chain_Support: any[] = [];
  List_Mas_Value_Chain_Factor_Support: any[] = [];

  listMasMasterPlanAll: any[] = [];
  listMasMasterPlanGoalAll: any[] = [];
  listMasMasterPlanTacticAll: any[] = [];
  listMasSubMasterPlanAll: any[] = [];
  listMasSubMasterPlanGoalAll: any[] = [];
  listMasSubPlanGuidelineAll: any[] = [];
  listMasValueChainAll: any[] = [];
  listMasValueChainMainAll: any[] = [];
  listMasValueChainSupportAll: any[] = [];
  listMasValueChainFactorAll: any[] = [];
  listMasValueChainFactorMainAll: any[] = [];
  listMasValueChainFactorSupportAll: any[] = [];

  listMasMasterPlanFiltered: any[] = [];
  listMasMasterPlanGoalFiltered: any[] = [];
  listMasMasterPlanTacticFiltered: any[] = [];
  listMasSubMasterPlanFiltered: any[] = [];
  listMasSubMasterPlanGoalFiltered: any[] = [];
  listMasSubPlanGuidelineFiltered: any[] = [];
  listMasValueChainMainFiltered: any[] = [];
  listMasValueChainFactorMainFiltered: any[] = [];
  listMasValueChainSupportFiltered: any[] = [];
  listMasValueChainFactorSupportFiltered: any[] = [];

  readonly pageSize = 30;
  planPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  goalPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  tacticPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  subPlanPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  subGoalPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  guidelinePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  chainMainPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  factorMainPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  chainSupportPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  factorSupportPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

  searchGoalTerm = '';
  searchTacticTerm = '';
  searchSubPlanTerm = '';
  searchSubGoalTerm = '';
  searchGuidelineTerm = '';
  searchChainMainTerm = '';
  searchFactorMainTerm = '';
  searchChainSupportTerm = '';
  searchFactorSupportTerm = '';

  tacticModalMasterPlan: any = null;
  tacticModalGoal: any = null;
  tacticGoalOptions: any[] = [];
  tacticGoalSelectKey = 0;
  tacticMasterPlanSelectKey = 0;

  subGoalModalMasterPlan: any = null;
  subGoalModalSubPlan: any = null;
  subGoalSubPlanOptions: any[] = [];
  subGoalSubPlanSelectKey = 0;
  subGoalMasterPlanSelectKey = 0;

  guidelineModalSubPlan: any = null;
  guidelineSubPlanSelectKey = 0;

  chainModalMasterPlan: any = null;
  chainModalSubPlan: any = null;
  chainModalY1: any = null;
  chainModalY2: any = null;
  chainSubPlanOptions: any[] = [];
  chainY1Options: any[] = [];
  chainSubPlanSelectKey = 0;
  chainY1SelectKey = 0;
  chainY2SelectKey = 0;
  chainMasterPlanSelectKey = 0;

  factorMainModalChain: any = null;
  factorMainChainSelectKey = 0;

  factorSupportModalChain: any = null;
  factorSupportChainSelectKey = 0;

  currentChainSaveType: 'MAIN' | 'SUPPORT' = 'MAIN';
  currentFactorSaveType: 'MAIN' | 'SUPPORT' = 'MAIN';

  constructor(
    private router: Router,
    private modalService: NgbModal,
    public service: GridJsService,
    public serviceebud: EbudgetService,
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
      FUNC_CODE: 'FUNC-Get_Mas_Master_Plan',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasMasterPlanAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Master_Plan),
        ['Master_Plan_Id']
      );
      this.listMasMasterPlanGoalAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Master_Plan_Goal),
        ['Plan_Goals_Id', 'FK_Master_Plan_Id']
      );
      this.listMasMasterPlanTacticAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Master_Plan_Goal_Tactic),
        ['Plan_Tactics_Id', 'FK_Plan_Goals_Id', 'FK_Master_Plan_Id']
      );
      this.listMasSubMasterPlanAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Sub_Master_Plan),
        ['Sub_Master_Plan_Id', 'FK_Master_Plan_Id']
      );
      this.listMasSubMasterPlanGoalAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Sub_Master_Plan_Goal),
        ['Sub_Plan_Goals_Id', 'FK_Sub_Master_Plan_Id']
      );
      this.listMasSubPlanGuidelineAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Sub_Plan_Guideline),
        ['Guidelines_Id', 'FK_Sub_Master_Plan_Id']
      );
      this.listMasValueChainAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Value_Chain),
        ['Value_Chain_Id', 'FK_Sub_Plan_Goals_Id', 'Target_Y1_Id', 'FK_Plan_Goals_Id', 'Target_Y2_Id']
      );
      this.listMasValueChainFactorAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Value_Chain_Factor),
        ['Factor_Id', 'FK_Value_Chain_Id']
      );
      this.splitValueChainLists();

      this.filterSearch();
      this.filterGoalSearch();
      this.filterTacticSearch();
      this.filterSubPlanSearch();
      this.filterSubGoalSearch();
      this.filterGuidelineSearch();
      this.filterChainMainSearch();
      this.filterFactorMainSearch();
      this.filterChainSupportSearch();
      this.filterFactorSupportSearch();
    });
  }

  private isChainMain(row: any): boolean {
    if (!row) {
      return false;
    }
    const type = String(row.Value_Chain_Type ?? row.Chain_Type ?? '').toUpperCase();
    if (type === 'SUPPORT' || type === '2') {
      return false;
    }
    if (type === 'MAIN' || type === '1') {
      return true;
    }
    if (row.Is_Support === 1 || row.Is_Support === true) {
      return false;
    }
    if (row.Is_Main === 1 || row.Is_Main === true) {
      return true;
    }
    return true;
  }

  private isChainSupport(row: any): boolean {
    if (!row) {
      return false;
    }
    const type = String(row.Value_Chain_Type ?? row.Chain_Type ?? '').toUpperCase();
    if (type === 'SUPPORT' || type === '2') {
      return true;
    }
    if (row.Is_Support === 1 || row.Is_Support === true) {
      return true;
    }
    return false;
  }

  private splitValueChainLists(): void {
    this.listMasValueChainMainAll = this.listMasValueChainAll.filter((c) => this.isChainMain(c));
    this.listMasValueChainSupportAll = this.listMasValueChainAll.filter((c) => this.isChainSupport(c));
    this.listMasValueChainFactorMainAll = this.listMasValueChainFactorAll.filter((f) => {
      const chain = this.findValueChainById(f.FK_Value_Chain_Id);
      return chain && this.isChainMain(chain);
    });
    this.listMasValueChainFactorSupportAll = this.listMasValueChainFactorAll.filter((f) => {
      const chain = this.findValueChainById(f.FK_Value_Chain_Id);
      return chain && this.isChainSupport(chain);
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

  refreshPlanPage(): void {
    const result = this.slicePage(this.listMasMasterPlanFiltered, this.planPagination.page);
    this.List_Mas_Master_Plan = result.slice;
    this.planPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshGoalPage(): void {
    const result = this.slicePage(this.listMasMasterPlanGoalFiltered, this.goalPagination.page);
    this.List_Mas_Master_Plan_Goal = result.slice;
    this.goalPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshTacticPage(): void {
    const result = this.slicePage(this.listMasMasterPlanTacticFiltered, this.tacticPagination.page);
    this.List_Mas_Master_Plan_Goal_Tactic = result.slice;
    this.tacticPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  onPlanPageChange(page: number): void {
    this.planPagination.page = page;
    this.refreshPlanPage();
  }

  onGoalPageChange(page: number): void {
    this.goalPagination.page = page;
    this.refreshGoalPage();
  }

  onTacticPageChange(page: number): void {
    this.tacticPagination.page = page;
    this.refreshTacticPage();
  }

  filterSearch(): void {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();
    this.listMasMasterPlanFiltered = this.filterListByKeyword(this.listMasMasterPlanAll, keyword);
    this.planPagination.page = 1;
    this.refreshPlanPage();
  }

  filterGoalSearch(): void {
    const keyword = (this.searchGoalTerm || '').toLowerCase().trim();
    this.listMasMasterPlanGoalFiltered = this.filterListByKeyword(this.listMasMasterPlanGoalAll, keyword);
    this.goalPagination.page = 1;
    this.refreshGoalPage();
  }

  filterTacticSearch(): void {
    const keyword = (this.searchTacticTerm || '').toLowerCase().trim();
    this.listMasMasterPlanTacticFiltered = this.filterListByKeyword(this.listMasMasterPlanTacticAll, keyword);
    this.tacticPagination.page = 1;
    this.refreshTacticPage();
  }

  refreshSubPlanPage(): void {
    const result = this.slicePage(this.listMasSubMasterPlanFiltered, this.subPlanPagination.page);
    this.List_Mas_Sub_Master_Plan = result.slice;
    this.subPlanPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshSubGoalPage(): void {
    const result = this.slicePage(this.listMasSubMasterPlanGoalFiltered, this.subGoalPagination.page);
    this.List_Mas_Sub_Master_Plan_Goal = result.slice;
    this.subGoalPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshGuidelinePage(): void {
    const result = this.slicePage(this.listMasSubPlanGuidelineFiltered, this.guidelinePagination.page);
    this.List_Mas_Sub_Plan_Guideline = result.slice;
    this.guidelinePagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  onSubPlanPageChange(page: number): void {
    this.subPlanPagination.page = page;
    this.refreshSubPlanPage();
  }

  onSubGoalPageChange(page: number): void {
    this.subGoalPagination.page = page;
    this.refreshSubGoalPage();
  }

  onGuidelinePageChange(page: number): void {
    this.guidelinePagination.page = page;
    this.refreshGuidelinePage();
  }

  filterSubPlanSearch(): void {
    const keyword = (this.searchSubPlanTerm || '').toLowerCase().trim();
    this.listMasSubMasterPlanFiltered = this.filterListByKeyword(this.listMasSubMasterPlanAll, keyword);
    this.subPlanPagination.page = 1;
    this.refreshSubPlanPage();
  }

  filterSubGoalSearch(): void {
    const keyword = (this.searchSubGoalTerm || '').toLowerCase().trim();
    this.listMasSubMasterPlanGoalFiltered = this.filterListByKeyword(this.listMasSubMasterPlanGoalAll, keyword);
    this.subGoalPagination.page = 1;
    this.refreshSubGoalPage();
  }

  filterGuidelineSearch(): void {
    const keyword = (this.searchGuidelineTerm || '').toLowerCase().trim();
    this.listMasSubPlanGuidelineFiltered = this.filterListByKeyword(this.listMasSubPlanGuidelineAll, keyword);
    this.guidelinePagination.page = 1;
    this.refreshGuidelinePage();
  }

  refreshChainMainPage(): void {
    const result = this.slicePage(this.listMasValueChainMainFiltered, this.chainMainPagination.page);
    this.List_Mas_Value_Chain_Main = result.slice;
    this.chainMainPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshFactorMainPage(): void {
    const result = this.slicePage(this.listMasValueChainFactorMainFiltered, this.factorMainPagination.page);
    this.List_Mas_Value_Chain_Factor_Main = result.slice;
    this.factorMainPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshChainSupportPage(): void {
    const result = this.slicePage(this.listMasValueChainSupportFiltered, this.chainSupportPagination.page);
    this.List_Mas_Value_Chain_Support = result.slice;
    this.chainSupportPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  refreshFactorSupportPage(): void {
    const result = this.slicePage(
      this.listMasValueChainFactorSupportFiltered,
      this.factorSupportPagination.page
    );
    this.List_Mas_Value_Chain_Factor_Support = result.slice;
    this.factorSupportPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  onChainMainPageChange(page: number): void {
    this.chainMainPagination.page = page;
    this.refreshChainMainPage();
  }

  onFactorMainPageChange(page: number): void {
    this.factorMainPagination.page = page;
    this.refreshFactorMainPage();
  }

  onChainSupportPageChange(page: number): void {
    this.chainSupportPagination.page = page;
    this.refreshChainSupportPage();
  }

  onFactorSupportPageChange(page: number): void {
    this.factorSupportPagination.page = page;
    this.refreshFactorSupportPage();
  }

  filterChainMainSearch(): void {
    const keyword = (this.searchChainMainTerm || '').toLowerCase().trim();
    this.listMasValueChainMainFiltered = this.filterListByKeyword(this.listMasValueChainMainAll, keyword);
    this.chainMainPagination.page = 1;
    this.refreshChainMainPage();
  }

  filterFactorMainSearch(): void {
    const keyword = (this.searchFactorMainTerm || '').toLowerCase().trim();
    this.listMasValueChainFactorMainFiltered = this.filterListByKeyword(
      this.listMasValueChainFactorMainAll,
      keyword
    );
    this.factorMainPagination.page = 1;
    this.refreshFactorMainPage();
  }

  filterChainSupportSearch(): void {
    const keyword = (this.searchChainSupportTerm || '').toLowerCase().trim();
    this.listMasValueChainSupportFiltered = this.filterListByKeyword(
      this.listMasValueChainSupportAll,
      keyword
    );
    this.chainSupportPagination.page = 1;
    this.refreshChainSupportPage();
  }

  filterFactorSupportSearch(): void {
    const keyword = (this.searchFactorSupportTerm || '').toLowerCase().trim();
    this.listMasValueChainFactorSupportFiltered = this.filterListByKeyword(
      this.listMasValueChainFactorSupportAll,
      keyword
    );
    this.factorSupportPagination.page = 1;
    this.refreshFactorSupportPage();
  }

  findMasterPlanById(id: any): any {
    if (id == null || id === '') {
      return null;
    }
    const normalized = this.normalizeSelectId(id);
    return (
      this.listMasMasterPlanAll.find(
        (p) =>
          p.Master_Plan_Id == normalized || String(p.Master_Plan_Id) === String(normalized)
      ) ?? null
    );
  }

  findGoalById(id: any): any {
    if (id == null || id === '') {
      return null;
    }
    const normalized = this.normalizeSelectId(id);
    return (
      this.listMasMasterPlanGoalAll.find(
        (g) =>
          g.Plan_Goals_Id == normalized || String(g.Plan_Goals_Id) === String(normalized)
      ) ?? null
    );
  }

  getMasterPlanNameById(id: any): string {
    return this.findMasterPlanById(id)?.Master_Plan_Name ?? '';
  }

  getGoalNameById(id: any): string {
    return this.findGoalById(id)?.Plan_Goals_Name ?? '';
  }

  getTacticFkGoalId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.FK_Plan_Goals_Id ?? item.Plan_Goals_Id ?? null);
  }

  getMasterPlanNameForGoalRow(row: any): string {
    return this.getMasterPlanNameById(row?.FK_Master_Plan_Id);
  }

  getMasterPlanNameForTacticRow(row: any): string {
    const goal = this.findGoalById(this.getTacticFkGoalId(row));
    return this.getMasterPlanNameById(goal?.FK_Master_Plan_Id);
  }

  getGoalNameForTacticRow(row: any): string {
    return this.getGoalNameById(this.getTacticFkGoalId(row));
  }

  filterGoalsByMasterPlanId(masterPlanId: any): any[] {
    const id = this.normalizeSelectId(masterPlanId);
    if (id == null || id === '') {
      return [...this.listMasMasterPlanGoalAll];
    }
    return this.listMasMasterPlanGoalAll.filter(
      (g) =>
        g.FK_Master_Plan_Id == id || String(g.FK_Master_Plan_Id) === String(id)
    );
  }

  findSubMasterPlanById(id: any): any {
    if (id == null || id === '') {
      return null;
    }
    const normalized = this.normalizeSelectId(id);
    return (
      this.listMasSubMasterPlanAll.find(
        (p) =>
          p.Sub_Master_Plan_Id == normalized ||
          String(p.Sub_Master_Plan_Id) === String(normalized)
      ) ?? null
    );
  }

  getSubMasterPlanNameById(id: any): string {
    return this.findSubMasterPlanById(id)?.Sub_Master_Plan_Name ?? '';
  }

  getSubGoalFkSubPlanId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.FK_Sub_Master_Plan_Id ?? item.Sub_Master_Plan_Id ?? null);
  }

  getGuidelineFkSubPlanId(item: any): any {
    return this.getSubGoalFkSubPlanId(item);
  }

  getMasterPlanNameForSubPlanRow(row: any): string {
    return this.getMasterPlanNameById(row?.FK_Master_Plan_Id);
  }

  getMasterPlanNameForSubGoalRow(row: any): string {
    const subPlan = this.findSubMasterPlanById(this.getSubGoalFkSubPlanId(row));
    return this.getMasterPlanNameById(subPlan?.FK_Master_Plan_Id);
  }

  getSubPlanNameForSubGoalRow(row: any): string {
    return this.getSubMasterPlanNameById(this.getSubGoalFkSubPlanId(row));
  }

  getMasterPlanNameForGuidelineRow(row: any): string {
    const subPlan = this.findSubMasterPlanById(this.getGuidelineFkSubPlanId(row));
    return this.getMasterPlanNameById(subPlan?.FK_Master_Plan_Id);
  }

  getSubPlanNameForGuidelineRow(row: any): string {
    return this.getSubMasterPlanNameById(this.getGuidelineFkSubPlanId(row));
  }

  getValueChainY1Id(row: any): any {
    if (!row) {
      return null;
    }
    return this.normalizeSelectId(row.FK_Sub_Plan_Goals_Id ?? row.Target_Y1_Id ?? null);
  }

  getValueChainMainY2Id(row: any): any {
    if (!row) {
      return null;
    }
    return this.normalizeSelectId(row.FK_Plan_Goals_Id ?? row.Target_Y2_Id ?? null);
  }

  findValueChainById(id: any): any {
    if (id == null || id === '') {
      return null;
    }
    const normalized = this.normalizeSelectId(id);
    return (
      this.listMasValueChainAll.find(
        (c) =>
          c.Value_Chain_Id == normalized || String(c.Value_Chain_Id) === String(normalized)
      ) ?? null
    );
  }

  getValueChainNameById(id: any): string {
    return this.findValueChainById(id)?.Value_Chain_Name ?? '';
  }

  getSubGoalNameById(id: any): string {
    const goal = this.listMasSubMasterPlanGoalAll.find(
      (g) =>
        g.Sub_Plan_Goals_Id == id || String(g.Sub_Plan_Goals_Id) === String(id)
    );
    return goal?.Sub_Plan_Goals_Name ?? '';
  }

  getMasterPlanNameForValueChainMainRow(row: any): string {
    const goal = this.findGoalById(this.getValueChainMainY2Id(row));
    return this.getMasterPlanNameById(goal?.FK_Master_Plan_Id);
  }

  getY2NameForValueChainMainRow(row: any): string {
    return this.getGoalNameById(this.getValueChainMainY2Id(row));
  }

  getMasterPlanNameForValueChainSupportRow(row: any): string {
    const y1Id = this.getValueChainY1Id(row);
    const goal = this.listMasSubMasterPlanGoalAll.find(
      (g) => g.Sub_Plan_Goals_Id == y1Id || String(g.Sub_Plan_Goals_Id) === String(y1Id)
    );
    return this.getMasterPlanNameById(goal?.FK_Master_Plan_Id);
  }

  getSubPlanNameForValueChainSupportRow(row: any): string {
    const y1Id = this.getValueChainY1Id(row);
    const goal = this.listMasSubMasterPlanGoalAll.find(
      (g) => g.Sub_Plan_Goals_Id == y1Id || String(g.Sub_Plan_Goals_Id) === String(y1Id)
    );
    return this.getSubMasterPlanNameById(goal?.FK_Sub_Master_Plan_Id);
  }

  getY1NameForValueChainSupportRow(row: any): string {
    return this.getSubGoalNameById(this.getValueChainY1Id(row));
  }

  getChainNameForFactorRow(row: any): string {
    return this.getValueChainNameById(row?.FK_Value_Chain_Id);
  }

  getY2NameForFactorMainRow(row: any): string {
    const chain = this.findValueChainById(row?.FK_Value_Chain_Id);
    return chain ? this.getY2NameForValueChainMainRow(chain) : '';
  }

  getY1NameForFactorSupportRow(row: any): string {
    const chain = this.findValueChainById(row?.FK_Value_Chain_Id);
    return chain ? this.getY1NameForValueChainSupportRow(chain) : '';
  }

  filterSubGoalsBySubPlanId(subPlanId: any): any[] {
    const id = this.normalizeSelectId(subPlanId);
    if (id == null || id === '') {
      return [...this.listMasSubMasterPlanGoalAll];
    }
    return this.listMasSubMasterPlanGoalAll.filter(
      (g) =>
        g.FK_Sub_Master_Plan_Id == id || String(g.FK_Sub_Master_Plan_Id) === String(id)
    );
  }

  private warnNoSubGoalsForChain(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : เป้าหมายแผนแม่บทย่อย (Y1)',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  private warnNoMasterPlanGoalsForChainMain(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : เป้าหมายระดับประเด็น (Y2)',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  clearChainY2Models(): void {
    this.chainModalY2 = null;
    if (this.Mas_Value_Chain) {
      this.Mas_Value_Chain.FK_Plan_Goals_Id = null;
      this.Mas_Value_Chain.Target_Y2_Id = null;
    }
  }

  onChainY2Change(goal: any): void {
    if (!goal) {
      this.clearChainY2Models();
      this.cdr.detectChanges();
      return;
    }

    const goalId = this.normalizeSelectId(goal.Plan_Goals_Id);
    const fromList = this.findGoalById(goalId);
    this.chainModalY2 = fromList ?? goal;
    this.Mas_Value_Chain.FK_Plan_Goals_Id = goalId;
    this.Mas_Value_Chain.Target_Y2_Id = goalId;
    this.cdr.detectChanges();
  }

  applyValueChainY2ToModel(): void {
    const goalId = this.normalizeSelectId(
      this.Mas_Value_Chain.FK_Plan_Goals_Id ?? this.Mas_Value_Chain.Target_Y2_Id
    );
    this.Mas_Value_Chain.FK_Plan_Goals_Id = goalId;
    this.Mas_Value_Chain.Target_Y2_Id = goalId;
    this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id = null;
    this.Mas_Value_Chain.Target_Y1_Id = null;
  }

  setupChainMainModalFromY2(y2Id: any): void {
    this.chainModalY2 = null;
    const goal = this.findGoalById(y2Id);
    if (goal) {
      this.chainModalY2 = goal;
    }
  }

  clearChainY1Models(): void {
    this.chainModalY1 = null;
    if (this.Mas_Value_Chain) {
      this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id = null;
      this.Mas_Value_Chain.Target_Y1_Id = null;
    }
  }

  clearChainMasterPlanModels(): void {
    this.chainModalMasterPlan = null;
  }

  clearChainSubPlanModels(): void {
    this.chainModalSubPlan = null;
  }

  updateChainY1Options(): void {
    const subPlanId = this.chainModalSubPlan?.Sub_Master_Plan_Id ?? null;
    this.chainY1Options = [...this.filterSubGoalsBySubPlanId(subPlanId)];
  }

  onChainMasterPlanChange(plan: any): void {
    this.clearChainSubPlanModels();
    this.clearChainY1Models();
    this.chainSubPlanSelectKey++;
    this.chainY1SelectKey++;

    if (!plan) {
      this.clearChainMasterPlanModels();
      this.chainSubPlanOptions = [...this.listMasSubMasterPlanAll];
      this.chainY1Options = [...this.listMasSubMasterPlanGoalAll];
      this.cdr.detectChanges();
      return;
    }

    const planId = this.normalizeSelectId(plan.Master_Plan_Id);
    const fromList = this.findMasterPlanById(planId);
    if (!fromList) {
      this.clearChainMasterPlanModels();
      this.chainSubPlanOptions = [];
      this.chainY1Options = [];
      this.cdr.detectChanges();
      return;
    }

    this.chainModalMasterPlan = fromList;
    this.chainSubPlanOptions = [...this.filterSubPlansByMasterPlanId(planId)];
    this.chainY1Options = [];
    this.cdr.detectChanges();
  }

  onChainSubPlanChange(subPlan: any): void {
    this.clearChainY1Models();
    this.chainY1SelectKey++;

    if (!subPlan) {
      this.clearChainSubPlanModels();
      this.chainY1Options = [...this.listMasSubMasterPlanGoalAll];
      this.cdr.detectChanges();
      return;
    }

    const subPlanId = this.normalizeSelectId(subPlan.Sub_Master_Plan_Id);
    const fromList = this.findSubMasterPlanById(subPlanId);
    this.chainModalSubPlan = fromList ?? subPlan;
    this.updateChainY1Options();
    if (this.chainY1Options.length === 0) {
      this.warnNoSubGoalsForChain();
    }

    const fkMasterPlanId = this.normalizeSelectId(
      fromList?.FK_Master_Plan_Id ?? subPlan.FK_Master_Plan_Id
    );
    if (fkMasterPlanId) {
      const planFromList = this.findMasterPlanById(fkMasterPlanId);
      if (planFromList) {
        this.chainModalMasterPlan = planFromList;
      }
    }
    this.cdr.detectChanges();
  }

  onChainY1Change(y1: any): void {
    if (!y1) {
      this.clearChainY1Models();
      this.cdr.detectChanges();
      return;
    }

    const y1Id = this.normalizeSelectId(y1.Sub_Plan_Goals_Id);
    const fromList = this.listMasSubMasterPlanGoalAll.find(
      (g) => g.Sub_Plan_Goals_Id == y1Id || String(g.Sub_Plan_Goals_Id) === String(y1Id)
    );
    this.chainModalY1 = fromList ?? y1;
    this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id = y1Id;
    this.Mas_Value_Chain.Target_Y1_Id = y1Id;
    this.cdr.detectChanges();
  }

  applyValueChainY1ToModel(): void {
    const y1Id = this.normalizeSelectId(
      this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id ?? this.Mas_Value_Chain.Target_Y1_Id
    );
    this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id = y1Id;
    this.Mas_Value_Chain.Target_Y1_Id = y1Id;
  }

  setupChainSupportModalFromY1(y1Id: any): void {
    this.chainModalY1 = null;
    const goal = this.listMasSubMasterPlanGoalAll.find(
      (g) =>
        g.Sub_Plan_Goals_Id == y1Id || String(g.Sub_Plan_Goals_Id) === String(y1Id)
    );
    if (goal) {
      this.chainModalY1 = goal;
    }
  }

  private warnNoSupportChainsForFactor(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : ส่วนสนับสนุน',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  onFactorMainChainChange(chain: any): void {
    if (!chain) {
      this.factorMainModalChain = null;
      this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = null;
      this.cdr.detectChanges();
      return;
    }
    const chainId = this.normalizeSelectId(chain.Value_Chain_Id);
    const fromList = this.findValueChainById(chainId);
    this.factorMainModalChain = fromList ?? chain;
    this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = chainId;
    this.cdr.detectChanges();
  }

  onFactorSupportChainChange(chain: any): void {
    if (!chain) {
      this.factorSupportModalChain = null;
      this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = null;
      this.cdr.detectChanges();
      return;
    }
    const chainId = this.normalizeSelectId(chain.Value_Chain_Id);
    const fromList = this.findValueChainById(chainId);
    this.factorSupportModalChain = fromList ?? chain;
    this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = chainId;
    this.cdr.detectChanges();
  }

  filterSubPlansByMasterPlanId(masterPlanId: any): any[] {
    const id = this.normalizeSelectId(masterPlanId);
    if (id == null || id === '') {
      return [...this.listMasSubMasterPlanAll];
    }
    return this.listMasSubMasterPlanAll.filter(
      (p) =>
        p.FK_Master_Plan_Id == id || String(p.FK_Master_Plan_Id) === String(id)
    );
  }

  private warnNoSubMasterPlans(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : แผนย่อยของแผนแม่บทฯ',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  clearSubGoalSubPlanModels(): void {
    this.subGoalModalSubPlan = null;
    if (this.Mas_Sub_Master_Plan_Goal) {
      this.Mas_Sub_Master_Plan_Goal.FK_Sub_Master_Plan_Id = null;
    }
  }

  clearSubGoalMasterPlanModels(): void {
    this.subGoalModalMasterPlan = null;
  }

  updateSubGoalSubPlanOptions(): void {
    const masterPlanId = this.subGoalModalMasterPlan?.Master_Plan_Id ?? null;
    this.subGoalSubPlanOptions = [...this.filterSubPlansByMasterPlanId(masterPlanId)];
  }

  onSubGoalMasterPlanChange(plan: any): void {
    this.clearSubGoalSubPlanModels();
    this.subGoalSubPlanSelectKey++;

    if (!plan) {
      this.clearSubGoalMasterPlanModels();
      this.subGoalSubPlanOptions = [...this.listMasSubMasterPlanAll];
      this.cdr.detectChanges();
      return;
    }

    const planId = this.normalizeSelectId(plan.Master_Plan_Id);
    const fromList = this.findMasterPlanById(planId);
    if (!fromList) {
      this.clearSubGoalMasterPlanModels();
      this.subGoalSubPlanOptions = [];
      this.cdr.detectChanges();
      return;
    }

    this.subGoalModalMasterPlan = fromList;
    this.updateSubGoalSubPlanOptions();
    if (this.subGoalSubPlanOptions.length === 0) {
      this.warnNoSubMasterPlans();
    }
    this.cdr.detectChanges();
  }

  onSubGoalSubPlanChange(subPlan: any): void {
    if (!subPlan) {
      this.clearSubGoalSubPlanModels();
      this.cdr.detectChanges();
      return;
    }

    const subPlanId = this.normalizeSelectId(subPlan.Sub_Master_Plan_Id);
    const fromList = this.findSubMasterPlanById(subPlanId);
    this.subGoalModalSubPlan = fromList ?? subPlan;
    this.Mas_Sub_Master_Plan_Goal.FK_Sub_Master_Plan_Id = subPlanId;

    const fkMasterPlanId = this.normalizeSelectId(
      fromList?.FK_Master_Plan_Id ?? subPlan.FK_Master_Plan_Id
    );
    if (fkMasterPlanId) {
      const planFromList = this.findMasterPlanById(fkMasterPlanId);
      if (planFromList) {
        this.subGoalModalMasterPlan = planFromList;
      }
    }
    this.cdr.detectChanges();
  }

  clearGuidelineSubPlanModels(): void {
    this.guidelineModalSubPlan = null;
    if (this.Mas_Sub_Plan_Guideline) {
      this.Mas_Sub_Plan_Guideline.FK_Sub_Master_Plan_Id = null;
    }
  }

  onGuidelineSubPlanChange(subPlan: any): void {
    if (!subPlan) {
      this.clearGuidelineSubPlanModels();
      this.cdr.detectChanges();
      return;
    }

    const subPlanId = this.normalizeSelectId(subPlan.Sub_Master_Plan_Id);
    const fromList = this.findSubMasterPlanById(subPlanId);
    this.guidelineModalSubPlan = fromList ?? subPlan;
    this.Mas_Sub_Plan_Guideline.FK_Sub_Master_Plan_Id = subPlanId;
    this.cdr.detectChanges();
  }

  clearTacticGoalModels(): void {
    this.tacticModalGoal = null;
    if (this.Mas_Master_Plan_Goal_Tactic) {
      this.Mas_Master_Plan_Goal_Tactic.FK_Plan_Goals_Id = null;
    }
  }

  clearTacticMasterPlanModels(): void {
    this.tacticModalMasterPlan = null;
  }

  updateTacticGoalOptions(): void {
    const masterPlanId = this.tacticModalMasterPlan?.Master_Plan_Id ?? null;
    this.tacticGoalOptions = [...this.filterGoalsByMasterPlanId(masterPlanId)];
  }

  onTacticMasterPlanChange(plan: any): void {
    this.clearTacticGoalModels();
    this.tacticGoalSelectKey++;

    if (!plan) {
      this.clearTacticMasterPlanModels();
      this.tacticGoalOptions = [...this.listMasMasterPlanGoalAll];
      this.cdr.detectChanges();
      return;
    }

    const planId = this.normalizeSelectId(plan.Master_Plan_Id);
    const fromList = this.findMasterPlanById(planId);
    if (!fromList) {
      this.clearTacticMasterPlanModels();
      this.tacticGoalOptions = [];
      this.cdr.detectChanges();
      return;
    }

    this.tacticModalMasterPlan = fromList;
    this.updateTacticGoalOptions();
    if (this.tacticGoalOptions.length === 0) {
      Swal.fire({
        title: 'กรุณาเพิ่มข้อมูล',
        text: 'กรุณาเพิ่ม : เป้าหมายระดับประเด็น (Y2)',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
    }
    this.cdr.detectChanges();
  }

  onTacticGoalChange(goal: any): void {
    if (!goal) {
      this.clearTacticGoalModels();
      this.cdr.detectChanges();
      return;
    }

    const goalId = this.normalizeSelectId(goal.Plan_Goals_Id);
    const fromList = this.findGoalById(goalId);
    this.tacticModalGoal = fromList ?? goal;
    this.Mas_Master_Plan_Goal_Tactic.FK_Plan_Goals_Id = goalId;

    const fkMasterPlanId = this.normalizeSelectId(fromList?.FK_Master_Plan_Id ?? goal.FK_Master_Plan_Id);
    if (fkMasterPlanId) {
      const planFromList = this.findMasterPlanById(fkMasterPlanId);
      if (planFromList) {
        this.tacticModalMasterPlan = planFromList;
      }
    }
    this.cdr.detectChanges();
  }

  openAddPlanModal(modal: any): void {
    this.isEditModePlan = false;
    this.Mas_Master_Plan = {
      Master_Plan_Id: 0,
      BgYear_Start: '',
      BgYear_End: '',
      Master_Plan_Name: '',
      Master_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasMasterPlanAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditPlanModal(modal: any, item: any): void {
    this.isEditModePlan = true;
    this.Mas_Master_Plan = { ...item };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGoalModal(modal: any): void {
    this.isEditModeGoal = false;
    this.Mas_Master_Plan_Goal = {
      Plan_Goals_Id: 0,
      FK_Master_Plan_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Plan_Goals_Name: '',
      Plan_Goals_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasMasterPlanGoalAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGoalModal(modal: any, item: any): void {
    this.isEditModeGoal = true;
    this.Mas_Master_Plan_Goal = { ...item };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddTacticModal(modal: any): void {
    this.isEditModeTactic = false;
    this.tacticModalMasterPlan = null;
    this.tacticModalGoal = null;
    this.tacticGoalSelectKey = 0;
    this.tacticMasterPlanSelectKey = 0;
    this.Mas_Master_Plan_Goal_Tactic = {
      Plan_Tactics_Id: 0,
      FK_Plan_Goals_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Plan_Tactics_Name: '',
      Plan_Tactics_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasMasterPlanTacticAll)
    };
    this.updateTacticGoalOptions();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditTacticModal(modal: any, item: any): void {
    this.isEditModeTactic = true;
    const goalId = this.getTacticFkGoalId(item);
    this.Mas_Master_Plan_Goal_Tactic = { ...item, FK_Plan_Goals_Id: goalId };
    this.tacticModalMasterPlan = null;
    this.tacticModalGoal = null;
    this.tacticGoalSelectKey = 0;
    this.tacticMasterPlanSelectKey = 0;

    const goal = this.findGoalById(goalId);
    if (goal) {
      this.tacticModalGoal = goal;
      const plan = this.findMasterPlanById(goal.FK_Master_Plan_Id);
      if (plan) {
        this.tacticModalMasterPlan = plan;
      }
    }
    this.updateTacticGoalOptions();
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddSubPlanModal(modal: any): void {
    this.isEditModeSubPlan = false;
    this.Mas_Sub_Master_Plan = {
      Sub_Master_Plan_Id: 0,
      FK_Master_Plan_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Sub_Master_Plan_Name: '',
      Sub_Master_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasSubMasterPlanAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditSubPlanModal(modal: any, item: any): void {
    this.isEditModeSubPlan = true;
    this.Mas_Sub_Master_Plan = { ...item };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddSubGoalModal(modal: any): void {
    this.isEditModeSubGoal = false;
    this.subGoalModalMasterPlan = null;
    this.subGoalModalSubPlan = null;
    this.subGoalSubPlanSelectKey = 0;
    this.subGoalMasterPlanSelectKey = 0;
    this.Mas_Sub_Master_Plan_Goal = {
      Sub_Plan_Goals_Id: 0,
      FK_Sub_Master_Plan_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Sub_Plan_Goals_Name: '',
      Sub_Plan_Goals_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasSubMasterPlanGoalAll)
    };
    this.updateSubGoalSubPlanOptions();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditSubGoalModal(modal: any, item: any): void {
    this.isEditModeSubGoal = true;
    const subPlanId = this.getSubGoalFkSubPlanId(item);
    this.Mas_Sub_Master_Plan_Goal = { ...item, FK_Sub_Master_Plan_Id: subPlanId };
    this.subGoalModalMasterPlan = null;
    this.subGoalModalSubPlan = null;
    this.subGoalSubPlanSelectKey = 0;
    this.subGoalMasterPlanSelectKey = 0;

    const subPlan = this.findSubMasterPlanById(subPlanId);
    if (subPlan) {
      this.subGoalModalSubPlan = subPlan;
      const plan = this.findMasterPlanById(subPlan.FK_Master_Plan_Id);
      if (plan) {
        this.subGoalModalMasterPlan = plan;
      }
    }
    this.updateSubGoalSubPlanOptions();
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGuidelineModal(modal: any): void {
    this.isEditModeGuideline = false;
    this.guidelineModalSubPlan = null;
    this.guidelineSubPlanSelectKey = 0;
    this.Mas_Sub_Plan_Guideline = {
      Guidelines_Id: 0,
      FK_Sub_Master_Plan_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Guidelines_Name: '',
      Guidelines_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasSubPlanGuidelineAll)
    };
    if (this.listMasSubMasterPlanAll.length === 0) {
      this.warnNoSubMasterPlans();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGuidelineModal(modal: any, item: any): void {
    this.isEditModeGuideline = true;
    const subPlanId = this.getGuidelineFkSubPlanId(item);
    this.Mas_Sub_Plan_Guideline = { ...item, FK_Sub_Master_Plan_Id: subPlanId };
    this.guidelineModalSubPlan = null;
    this.guidelineSubPlanSelectKey = 0;

    const subPlan = this.findSubMasterPlanById(subPlanId);
    if (subPlan) {
      this.guidelineModalSubPlan = subPlan;
    }
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddChainMainModal(modal: any): void {
    this.isEditModeChainMain = false;
    this.currentChainSaveType = 'MAIN';
    this.chainModalY2 = null;
    this.chainY2SelectKey = 0;
    this.Mas_Value_Chain = {
      Value_Chain_Id: 0,
      FK_Plan_Goals_Id: null,
      Target_Y2_Id: null,
      FK_Sub_Plan_Goals_Id: null,
      Target_Y1_Id: null,
      Value_Chain_Type: 'MAIN',
      BgYear_Start: '',
      BgYear_End: '',
      Value_Chain_Name: '',
      Value_Chain_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasValueChainMainAll)
    };
    if (this.listMasMasterPlanGoalAll.length === 0) {
      this.warnNoMasterPlanGoalsForChainMain();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditChainMainModal(modal: any, item: any): void {
    this.isEditModeChainMain = true;
    this.currentChainSaveType = 'MAIN';
    const y2Id = this.getValueChainMainY2Id(item);
    this.Mas_Value_Chain = {
      ...item,
      Value_Chain_Type: 'MAIN',
      FK_Plan_Goals_Id: y2Id,
      Target_Y2_Id: y2Id,
      FK_Sub_Plan_Goals_Id: null,
      Target_Y1_Id: null
    };
    this.chainY2SelectKey = 0;
    this.setupChainMainModalFromY2(y2Id);
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddChainSupportModal(modal: any): void {
    this.isEditModeChainSupport = false;
    this.currentChainSaveType = 'SUPPORT';
    this.chainModalY1 = null;
    this.chainY1SelectKey = 0;
    this.Mas_Value_Chain = {
      Value_Chain_Id: 0,
      FK_Sub_Plan_Goals_Id: null,
      Target_Y1_Id: null,
      FK_Plan_Goals_Id: null,
      Target_Y2_Id: null,
      Value_Chain_Type: 'SUPPORT',
      BgYear_Start: '',
      BgYear_End: '',
      Value_Chain_Name: '',
      Value_Chain_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasValueChainSupportAll)
    };
    if (this.listMasSubMasterPlanGoalAll.length === 0) {
      this.warnNoSubGoalsForChain();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditChainSupportModal(modal: any, item: any): void {
    this.isEditModeChainSupport = true;
    this.currentChainSaveType = 'SUPPORT';
    const y1Id = this.getValueChainY1Id(item);
    this.Mas_Value_Chain = {
      ...item,
      Value_Chain_Type: 'SUPPORT',
      FK_Sub_Plan_Goals_Id: y1Id,
      Target_Y1_Id: y1Id,
      FK_Plan_Goals_Id: null,
      Target_Y2_Id: null
    };
    this.chainY1SelectKey = 0;
    this.setupChainSupportModalFromY1(y1Id);
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddFactorMainModal(modal: any): void {
    this.isEditModeFactorMain = false;
    this.currentFactorSaveType = 'MAIN';
    this.factorMainModalChain = null;
    this.factorMainChainSelectKey = 0;
    this.Mas_Value_Chain_Factor = {
      Factor_Id: 0,
      FK_Value_Chain_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Factor_Name: '',
      Factor_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasValueChainFactorMainAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditFactorMainModal(modal: any, item: any): void {
    this.isEditModeFactorMain = true;
    this.currentFactorSaveType = 'MAIN';
    const chainId = this.normalizeSelectId(item.FK_Value_Chain_Id);
    this.Mas_Value_Chain_Factor = { ...item, FK_Value_Chain_Id: chainId };
    this.factorMainModalChain = this.findValueChainById(chainId);
    this.factorMainChainSelectKey = 0;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddFactorSupportModal(modal: any): void {
    this.isEditModeFactorSupport = false;
    this.currentFactorSaveType = 'SUPPORT';
    this.factorSupportModalChain = null;
    this.factorSupportChainSelectKey = 0;
    this.Mas_Value_Chain_Factor = {
      Factor_Id: 0,
      FK_Value_Chain_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Factor_Name: '',
      Factor_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasValueChainFactorSupportAll)
    };
    if (this.listMasValueChainSupportAll.length === 0) {
      this.warnNoSupportChainsForFactor();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditFactorSupportModal(modal: any, item: any): void {
    this.isEditModeFactorSupport = true;
    this.currentFactorSaveType = 'SUPPORT';
    const chainId = this.normalizeSelectId(item.FK_Value_Chain_Id);
    this.Mas_Value_Chain_Factor = { ...item, FK_Value_Chain_Id: chainId };
    this.factorSupportModalChain = this.findValueChainById(chainId);
    this.factorSupportChainSelectKey = 0;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
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

  Delete_Mas_Master_Plan(item: any): void {
    this.confirmDelete(item?.Master_Plan_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Master_Plan',
        Mas_Master_Plan: item
      }).subscribe((response: any) => this.handleDeleteResponse(response, 'ลบรายการประเด็นเรียบร้อยแล้ว!'));
    });
  }

  Delete_Mas_Master_Plan_Goal(item: any): void {
    this.confirmDelete(item?.Plan_Goals_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Master_Plan_Goal',
        Mas_Master_Plan_Goal: item
      }).subscribe((response: any) => this.handleDeleteResponse(response, 'ลบรายการเป้าหมายระดับประเด็น (Y2) เรียบร้อยแล้ว!'));
    });
  }

  Delete_Mas_Master_Plan_Goal_Tactic(item: any): void {
    this.confirmDelete(item?.Plan_Tactics_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Master_Plan_Goal_Tactic',
        Mas_Master_Plan_Goal_Tactic: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการตัวชี้วัดเป้าหมายระดับประเด็นเรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Sub_Master_Plan(item: any): void {
    this.confirmDelete(item?.Sub_Master_Plan_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Sub_Master_Plan',
        Mas_Sub_Master_Plan: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการแผนย่อยของแผนแม่บทฯ เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Sub_Master_Plan_Goal(item: any): void {
    this.confirmDelete(item?.Sub_Plan_Goals_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Sub_Master_Plan_Goal',
        Mas_Sub_Master_Plan_Goal: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการเป้าหมายแผนแม่บทย่อย (Y1) เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Sub_Plan_Guideline(item: any): void {
    this.confirmDelete(item?.Guidelines_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Sub_Plan_Guideline',
        Mas_Sub_Plan_Guideline: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการแนวทางการพัฒนาภายใต้แผนย่อยเรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Value_Chain_Main(item: any): void {
    this.confirmDelete(item?.Value_Chain_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Value_Chain',
        Mas_Value_Chain: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการหลักเรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Value_Chain_Support(item: any): void {
    this.confirmDelete(item?.Value_Chain_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Value_Chain',
        Mas_Value_Chain: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการส่วนสนับสนุนเรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Value_Chain_Factor_Main(item: any): void {
    this.confirmDelete(item?.Factor_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Value_Chain_Factor',
        Mas_Value_Chain_Factor: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการปัจจัยหลักเรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Value_Chain_Factor_Support(item: any): void {
    this.confirmDelete(item?.Factor_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Value_Chain_Factor',
        Mas_Value_Chain_Factor: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการปัจจัยสนับสนุนเรียบร้อยแล้ว!')
      );
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
    } else {
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: response.RESULT,
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
    }
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
      this.get_data();
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
  }

  BtnSavePlan(): void {
    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Master_Plan',
      Mas_Master_Plan: this.Mas_Master_Plan
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการประเด็นเรียบร้อยแล้ว!')
    );
  }

  BtnSaveGoal(): void {
    if (
      !this.isEditModeGoal &&
      (this.Mas_Master_Plan_Goal.FK_Master_Plan_Id == null ||
        this.Mas_Master_Plan_Goal.FK_Master_Plan_Id === '')
    ) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกประเด็น',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Master_Plan_Goal',
      Mas_Master_Plan_Goal: this.Mas_Master_Plan_Goal
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายระดับประเด็น (Y2) เรียบร้อยแล้ว!')
    );
  }

  BtnSaveTactic(): void {
    const goalId = this.normalizeSelectId(this.Mas_Master_Plan_Goal_Tactic.FK_Plan_Goals_Id);
    if (!goalId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกเป้าหมายระดับประเด็น (Y2)',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Master_Plan_Goal_Tactic.FK_Plan_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Master_Plan_Goal_Tactic',
      Mas_Master_Plan_Goal_Tactic: this.Mas_Master_Plan_Goal_Tactic
    }    ).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการตัวชี้วัดเป้าหมายระดับประเด็นเรียบร้อยแล้ว!')
    );
  }

  BtnSaveSubPlan(): void {
    if (
      !this.isEditModeSubPlan &&
      (this.Mas_Sub_Master_Plan.FK_Master_Plan_Id == null ||
        this.Mas_Sub_Master_Plan.FK_Master_Plan_Id === '')
    ) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกประเด็น',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Sub_Master_Plan',
      Mas_Sub_Master_Plan: this.Mas_Sub_Master_Plan
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการแผนย่อยของแผนแม่บทฯ เรียบร้อยแล้ว!')
    );
  }

  BtnSaveSubGoal(): void {
    const subPlanId = this.normalizeSelectId(this.Mas_Sub_Master_Plan_Goal.FK_Sub_Master_Plan_Id);
    if (!subPlanId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกแผนย่อยของแผนแม่บทฯ',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Sub_Master_Plan_Goal.FK_Sub_Master_Plan_Id = subPlanId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Sub_Master_Plan_Goal',
      Mas_Sub_Master_Plan_Goal: this.Mas_Sub_Master_Plan_Goal
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายแผนแม่บทย่อย (Y1) เรียบร้อยแล้ว!')
    );
  }

  BtnSaveGuideline(): void {
    const subPlanId = this.normalizeSelectId(this.Mas_Sub_Plan_Guideline.FK_Sub_Master_Plan_Id);
    if (!subPlanId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกแผนย่อยของแผนแม่บทฯ',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Sub_Plan_Guideline.FK_Sub_Master_Plan_Id = subPlanId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Sub_Plan_Guideline',
      Mas_Sub_Plan_Guideline: this.Mas_Sub_Plan_Guideline
    }    ).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการแนวทางการพัฒนาภายใต้แผนย่อยเรียบร้อยแล้ว!')
    );
  }

  BtnSaveValueChain(): void {
    if (this.currentChainSaveType === 'MAIN') {
      const y2Id = this.normalizeSelectId(
        this.Mas_Value_Chain.FK_Plan_Goals_Id ?? this.Mas_Value_Chain.Target_Y2_Id
      );
      if (!y2Id) {
        Swal.fire({
          title: 'กรุณาเลือกข้อมูล',
          text: 'กรุณาเลือกเป้าหมายระดับประเด็น (Y2)',
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        return;
      }
      this.applyValueChainY2ToModel();
    } else {
      const y1Id = this.normalizeSelectId(
        this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id ?? this.Mas_Value_Chain.Target_Y1_Id
      );
      if (!y1Id) {
        Swal.fire({
          title: 'กรุณาเลือกข้อมูล',
          text: 'กรุณาเลือกเป้าหมายแผนแม่บทย่อย (Y1)',
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        return;
      }
      this.applyValueChainY1ToModel();
      this.Mas_Value_Chain.FK_Plan_Goals_Id = null;
      this.Mas_Value_Chain.Target_Y2_Id = null;
    }

    this.Mas_Value_Chain.Value_Chain_Type =
      this.currentChainSaveType === 'SUPPORT' ? 'SUPPORT' : 'MAIN';

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Value_Chain',
      Mas_Value_Chain: this.Mas_Value_Chain
    }).subscribe((response: any) => {
      const msg =
        this.currentChainSaveType === 'SUPPORT'
          ? 'บันทึกรายการส่วนสนับสนุนเรียบร้อยแล้ว!'
          : 'บันทึกรายการหลักเรียบร้อยแล้ว!';
      this.handleSaveResponse(response, msg);
    });
  }

  BtnSaveValueChainFactor(): void {
    const chainId = this.normalizeSelectId(this.Mas_Value_Chain_Factor.FK_Value_Chain_Id);
    if (!chainId) {
      const msg =
        this.currentFactorSaveType === 'SUPPORT'
          ? 'กรุณาเลือกส่วนสนับสนุน'
          : 'กรุณาเลือกหลัก';
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: msg,
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = chainId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Value_Chain_Factor',
      Mas_Value_Chain_Factor: this.Mas_Value_Chain_Factor
    }).subscribe((response: any) => {
      const msg =
        this.currentFactorSaveType === 'SUPPORT'
          ? 'บันทึกรายการปัจจัยสนับสนุนเรียบร้อยแล้ว!'
          : 'บันทึกรายการปัจจัยหลักเรียบร้อยแล้ว!';
      this.handleSaveResponse(response, msg);
    });
  }
}
