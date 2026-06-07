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
  Mas_Master_Plan_Goals_Tactic: any = {};
  Mas_Sub_Master_Plan: any = {};
  Mas_Sub_Master_Plan_Goals: any = {};
  Mas_Sub_Plan_Guidelines: any = {};
  Mas_Value_Chain: any = {};
  Mas_Value_Chain_Factor: any = {};

  isEditModePlan = false;
  isEditModeGoal = false;
  isEditModeTactic = false;
  isEditModeSubPlan = false;
  isEditModeSubGoal = false;
  isEditModeGuideline = false;
  isEditModeChainMain = false;
  isEditModeFactorMain = false;

  List_Mas_Master_Plan: any[] = [];
  List_Mas_Master_Plan_Goal: any[] = [];
  List_Mas_Master_Plan_Goals_Tactic: any[] = [];
  List_Mas_Sub_Master_Plan: any[] = [];
  List_Mas_Sub_Master_Plan_Goal: any[] = [];
  List_Mas_Sub_Plan_Guideline: any[] = [];
  List_Mas_Value_Chain_Main: any[] = [];
  List_Mas_Value_Chain_Factor_Main: any[] = [];

  listMasMasterPlanAll: any[] = [];
  listMasMasterPlanGoalAll: any[] = [];
  listMasMasterPlanTacticAll: any[] = [];
  listMasSubMasterPlanAll: any[] = [];
  listMasSubMasterPlanGoalAll: any[] = [];
  listMasSubPlanGuidelineAll: any[] = [];
  listMasValueChainAll: any[] = [];
  listMasValueChainMainAll: any[] = [];
  listMasValueChainFactorAll: any[] = [];
  listMasValueChainFactorMainAll: any[] = [];

  listMasMasterPlanFiltered: any[] = [];
  listMasMasterPlanGoalFiltered: any[] = [];
  listMasMasterPlanTacticFiltered: any[] = [];
  listMasSubMasterPlanFiltered: any[] = [];
  listMasSubMasterPlanGoalFiltered: any[] = [];
  listMasSubPlanGuidelineFiltered: any[] = [];
  listMasValueChainMainFiltered: any[] = [];
  listMasValueChainFactorMainFiltered: any[] = [];

  readonly pageSize = 30;
  planPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  goalPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  tacticPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  subPlanPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  subGoalPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  guidelinePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  chainMainPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  factorMainPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

  searchGoalTerm = '';
  searchTacticTerm = '';
  searchSubPlanTerm = '';
  searchSubGoalTerm = '';
  searchGuidelineTerm = '';
  searchChainMainTerm = '';
  searchFactorMainTerm = '';

  tacticModalMasterPlanId: any = null;
  tacticGoalOptions: any[] = [];
  tacticGoalSelectKey = 0;
  tacticMasterPlanSelectKey = 0;

  subGoalModalMasterPlanId: any = null;
  subGoalSubPlanOptions: any[] = [];
  subGoalSubPlanSelectKey = 0;
  subGoalMasterPlanSelectKey = 0;

  guidelineSubPlanSelectKey = 0;

  chainModalMasterPlan: any = null;
  chainModalSubPlan: any = null;
  chainSubPlanOptions: any[] = [];
  chainY1Options: any[] = [];
  chainSubPlanSelectKey = 0;
  chainY1SelectKey = 0;
  chainMasterPlanSelectKey = 0;

  factorMainChainSelectKey = 0;

  currentChainSaveType: 'MAIN' | 'SUPPORT' = 'MAIN';

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
      FUNC_CODE: 'FUNC-Get_Mas_ProjectPlanMasterPlanY',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasMasterPlanAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Master_Plan),
        ['Master_Plan_Id']
      );
      this.listMasMasterPlanGoalAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Master_Plan_Goal),
        ['Plan_Goals_Id', 'FK_Master_Plan_Id', 'FK_Master_Plan']
      ).map((goal) => {
        const masterPlanId =
          goal.FK_Master_Plan_Id ?? goal.FK_Master_Plan ?? goal.Master_Plan_Id ?? null;
        return {
          ...goal,
          FK_Master_Plan_Id: masterPlanId,
          FK_Master_Plan: masterPlanId
        };
      });
      this.listMasMasterPlanTacticAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Master_Plan_Goals_Tactics),
        ['Plan_Tactics_Id', 'FK_Plan_Goals_Id', 'FK_Master_Plan_Id']
      );
      this.listMasSubMasterPlanAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Sub_Master_Plan),
        ['Sub_Master_Plan_Id', 'FK_Master_Plan_Id', 'FK_Master_Plan']
      ).map((subPlan) => {
        const masterPlanId =
          subPlan.FK_Master_Plan_Id ?? subPlan.FK_Master_Plan ?? subPlan.Master_Plan_Id ?? null;
        return {
          ...subPlan,
          FK_Master_Plan_Id: masterPlanId,
          FK_Master_Plan: masterPlanId
        };
      });
      this.listMasSubMasterPlanGoalAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Sub_Master_Plan_Goal),
        ['Sub_Plan_Goals_Id', 'FK_Sub_Master_Plan', 'FK_Sub_Master_Plan_Id']
      ).map((goal) => {
        const subPlanId = goal.FK_Sub_Master_Plan ?? goal.FK_Sub_Master_Plan_Id ?? null;
        return {
          ...goal,
          FK_Sub_Master_Plan: subPlanId,
          FK_Sub_Master_Plan_Id: subPlanId
        };
      });
      this.listMasSubPlanGuidelineAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Sub_Plan_Guideline),
        ['Guidelines_Id', 'FK_Sub_Master_Plan', 'FK_Sub_Master_Plan_Id']
      ).map((guideline) => {
        const subPlanId = guideline.FK_Sub_Master_Plan ?? guideline.FK_Sub_Master_Plan_Id ?? null;
        return {
          ...guideline,
          FK_Sub_Master_Plan: subPlanId,
          FK_Sub_Master_Plan_Id: subPlanId
        };
      });
      this.listMasValueChainAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Value_Chain),
        ['Value_Chain_Id', 'Fk_SubPlan_Goals_Id', 'FK_Sub_Plan_Goals_Id', 'Target_Y1_Id', 'FK_Plan_Goals_Id', 'Target_Y2_Id']
      ).map((chain) => {
        const y1Id =
          chain.Fk_SubPlan_Goals_Id ?? chain.FK_Sub_Plan_Goals_Id ?? chain.Target_Y1_Id ?? null;
        return {
          ...chain,
          Fk_SubPlan_Goals_Id: y1Id
        };
      });
      this.listMasValueChainFactorAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Value_Chain_Factor),
        ['Factor_Id', 'FK_Value_Chain_Id', 'Fk_Value_Chain_Id']
      ).map((factor) => {
        const chainId = factor.FK_Value_Chain_Id ?? factor.Fk_Value_Chain_Id ?? null;
        return {
          ...factor,
          FK_Value_Chain_Id: chainId
        };
      });
      this.splitValueChainLists();

      this.filterSearch();
      this.filterGoalSearch();
      this.filterTacticSearch();
      this.filterSubPlanSearch();
      this.filterSubGoalSearch();
      this.filterGuidelineSearch();
      this.filterChainMainSearch();
      this.filterFactorMainSearch();
    });
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
    this.listMasValueChainMainAll = [...this.listMasValueChainAll];
    this.listMasValueChainFactorMainAll = [...this.listMasValueChainFactorAll];
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
    this.List_Mas_Master_Plan_Goals_Tactic = result.slice;
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

  onChainMainPageChange(page: number): void {
    this.chainMainPagination.page = page;
    this.refreshChainMainPage();
  }

  onFactorMainPageChange(page: number): void {
    this.factorMainPagination.page = page;
    this.refreshFactorMainPage();
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

  getGoalMasterPlanId(goal: any): any {
    if (!goal) {
      return null;
    }
    return this.normalizeSelectId(
      goal.FK_Master_Plan_Id ?? goal.FK_Master_Plan ?? goal.Master_Plan_Id ?? null
    );
  }

  filterGoalsByMasterPlanId(masterPlanId: any): any[] {
    const id = this.normalizeSelectId(masterPlanId);
    if (id == null || id === '') {
      return [...this.listMasMasterPlanGoalAll];
    }
    return this.listMasMasterPlanGoalAll.filter((g) => {
      const goalPlanId = this.getGoalMasterPlanId(g);
      return goalPlanId == id || String(goalPlanId) === String(id);
    });
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
    return this.normalizeSelectId(
      item.FK_Sub_Master_Plan ?? item.FK_Sub_Master_Plan_Id ?? null
    );
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
    return this.normalizeSelectId(
      row.Fk_SubPlan_Goals_Id ?? row.FK_Sub_Plan_Goals_Id ?? row.Target_Y1_Id ?? null
    );
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
    return this.getMasterPlanNameForValueChainSupportRow(row);
  }

  getY1NameForValueChainMainRow(row: any): string {
    return this.getY1NameForValueChainSupportRow(row);
  }

  getY2NameForValueChainMainRow(row: any): string {
    return this.getY1NameForValueChainMainRow(row);
  }

  getMasterPlanNameForValueChainRow(row: any): string {
    return this.isChainSupport(row)
      ? this.getMasterPlanNameForValueChainSupportRow(row)
      : this.getMasterPlanNameForValueChainMainRow(row);
  }

  getGoalNameForValueChainRow(row: any): string {
    return this.isChainSupport(row)
      ? this.getY1NameForValueChainSupportRow(row)
      : this.getY1NameForValueChainMainRow(row);
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
    return this.getSubMasterPlanNameById(this.getSubGoalFkSubPlanId(goal));
  }

  getY1NameForValueChainSupportRow(row: any): string {
    return this.getSubGoalNameById(this.getValueChainY1Id(row));
  }

  getFactorMainFkValueChainId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.FK_Value_Chain_Id ?? item.Fk_Value_Chain_Id ?? null);
  }

  getChainNameForFactorRow(row: any): string {
    return this.getValueChainNameById(this.getFactorMainFkValueChainId(row));
  }

  getY2NameForFactorMainRow(row: any): string {
    const chain = this.findValueChainById(this.getFactorMainFkValueChainId(row));
    return chain ? this.getY1NameForValueChainMainRow(chain) : '';
  }

  getGoalNameForFactorRow(row: any): string {
    const chain = this.findValueChainById(this.getFactorMainFkValueChainId(row));
    return chain ? this.getGoalNameForValueChainRow(chain) : '';
  }

  filterSubGoalsBySubPlanId(subPlanId: any): any[] {
    const id = this.normalizeSelectId(subPlanId);
    if (id == null || id === '') {
      return [...this.listMasSubMasterPlanGoalAll];
    }
    return this.listMasSubMasterPlanGoalAll.filter((g) => {
      const goalSubPlanId = this.getSubGoalFkSubPlanId(g);
      return goalSubPlanId == id || String(goalSubPlanId) === String(id);
    });
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

  clearChainY1Models(): void {
    if (this.Mas_Value_Chain) {
      this.Mas_Value_Chain.Fk_SubPlan_Goals_Id = null;
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

  onChainY1IdChange(y1Id: any): void {
    const normalized = this.normalizeSelectId(y1Id);
    if (!normalized) {
      this.clearChainY1Models();
      this.cdr.detectChanges();
      return;
    }

    this.Mas_Value_Chain.Fk_SubPlan_Goals_Id = normalized;
    this.cdr.detectChanges();
  }

  applyValueChainY1ToModel(): void {
    const y1Id = this.normalizeSelectId(
      this.Mas_Value_Chain.Fk_SubPlan_Goals_Id ??
        this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id ??
        this.Mas_Value_Chain.Target_Y1_Id
    );
    this.Mas_Value_Chain.Fk_SubPlan_Goals_Id = y1Id;
    delete this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id;
    delete this.Mas_Value_Chain.Target_Y1_Id;
    this.Mas_Value_Chain.FK_Plan_Goals_Id = null;
    this.Mas_Value_Chain.Target_Y2_Id = null;
  }

  onFactorMainChainIdChange(chainId: any): void {
    const normalized = this.normalizeSelectId(chainId);
    if (!normalized) {
      this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = normalized;
    this.cdr.detectChanges();
  }

  filterSubPlansByMasterPlanId(masterPlanId: any): any[] {
    const id = this.normalizeSelectId(masterPlanId);
    if (id == null || id === '') {
      return [...this.listMasSubMasterPlanAll];
    }
    return this.listMasSubMasterPlanAll.filter((p) => {
      const subPlanMasterId = this.getSubPlanMasterPlanId(p);
      return subPlanMasterId == id || String(subPlanMasterId) === String(id);
    });
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

  getSubPlanMasterPlanId(subPlan: any): any {
    if (!subPlan) {
      return null;
    }
    return this.normalizeSelectId(
      subPlan.FK_Master_Plan_Id ?? subPlan.FK_Master_Plan ?? subPlan.Master_Plan_Id ?? null
    );
  }

  private isSubPlanInOptions(subPlanId: any, options: any[]): boolean {
    const id = this.normalizeSelectId(subPlanId);
    if (id == null || id === '') {
      return false;
    }
    return options.some(
      (p) =>
        p.Sub_Master_Plan_Id == id || String(p.Sub_Master_Plan_Id) === String(id)
    );
  }

  clearSubGoalSubPlanModels(): void {
    if (this.Mas_Sub_Master_Plan_Goals) {
      this.Mas_Sub_Master_Plan_Goals.FK_Sub_Master_Plan = null;
    }
  }

  updateSubGoalSubPlanOptions(): void {
    const masterPlanId = this.subGoalModalMasterPlanId ?? null;
    let options = [...this.filterSubPlansByMasterPlanId(masterPlanId)];
    const selectedSubPlanId = this.normalizeSelectId(
      this.Mas_Sub_Master_Plan_Goals?.FK_Sub_Master_Plan
    );
    if (selectedSubPlanId && !this.isSubPlanInOptions(selectedSubPlanId, options)) {
      const selectedSubPlan = this.findSubMasterPlanById(selectedSubPlanId);
      if (selectedSubPlan) {
        options = [selectedSubPlan, ...options];
      }
    }
    this.subGoalSubPlanOptions = options;
  }

  private syncSubGoalMasterPlanFromSubPlan(subPlanId: any): void {
    const subPlan = this.findSubMasterPlanById(subPlanId);
    const fkMasterPlanId = this.getSubPlanMasterPlanId(subPlan);
    if (fkMasterPlanId) {
      this.subGoalModalMasterPlanId = fkMasterPlanId;
      this.updateSubGoalSubPlanOptions();
    }
  }

  onSubGoalMasterPlanIdChange(planId: any): void {
    const normalizedPlanId = this.normalizeSelectId(planId);

    if (normalizedPlanId == null || normalizedPlanId === '') {
      this.subGoalModalMasterPlanId = null;
      this.clearSubGoalSubPlanModels();
      this.subGoalSubPlanSelectKey++;
      this.subGoalSubPlanOptions = [...this.listMasSubMasterPlanAll];
      this.cdr.detectChanges();
      return;
    }

    this.subGoalModalMasterPlanId = normalizedPlanId;
    this.clearSubGoalSubPlanModels();
    this.updateSubGoalSubPlanOptions();
    this.subGoalSubPlanSelectKey++;

    if (this.subGoalSubPlanOptions.length === 0) {
      this.warnNoSubMasterPlans();
    }
    this.cdr.detectChanges();
  }

  onSubGoalSubPlanIdChange(subPlanId: any): void {
    const normalizedSubPlanId = this.normalizeSelectId(subPlanId);

    if (normalizedSubPlanId == null || normalizedSubPlanId === '') {
      this.clearSubGoalSubPlanModels();
      this.cdr.detectChanges();
      return;
    }

    this.Mas_Sub_Master_Plan_Goals.FK_Sub_Master_Plan = normalizedSubPlanId;
    this.syncSubGoalMasterPlanFromSubPlan(normalizedSubPlanId);
    this.cdr.detectChanges();
  }

  clearGuidelineSubPlanModels(): void {
    if (this.Mas_Sub_Plan_Guidelines) {
      this.Mas_Sub_Plan_Guidelines.FK_Sub_Master_Plan = null;
    }
  }

  onGuidelineSubPlanIdChange(subPlanId: any): void {
    const normalizedSubPlanId = this.normalizeSelectId(subPlanId);

    if (normalizedSubPlanId == null || normalizedSubPlanId === '') {
      this.clearGuidelineSubPlanModels();
      this.cdr.detectChanges();
      return;
    }

    this.Mas_Sub_Plan_Guidelines.FK_Sub_Master_Plan = normalizedSubPlanId;
    this.cdr.detectChanges();
  }

  clearTacticGoalModels(): void {
    if (this.Mas_Master_Plan_Goals_Tactic) {
      this.Mas_Master_Plan_Goals_Tactic.FK_Plan_Goals_Id = null;
    }
  }

  clearTacticMasterPlanModels(): void {
    this.tacticModalMasterPlanId = null;
  }

  private isGoalInOptions(goalId: any, options: any[]): boolean {
    const id = this.normalizeSelectId(goalId);
    if (id == null || id === '') {
      return false;
    }
    return options.some(
      (g) => g.Plan_Goals_Id == id || String(g.Plan_Goals_Id) === String(id)
    );
  }

  updateTacticGoalOptions(): void {
    const masterPlanId = this.tacticModalMasterPlanId ?? null;
    let options = [...this.filterGoalsByMasterPlanId(masterPlanId)];
    const selectedGoalId = this.normalizeSelectId(this.Mas_Master_Plan_Goals_Tactic?.FK_Plan_Goals_Id);
    if (selectedGoalId && !this.isGoalInOptions(selectedGoalId, options)) {
      const selectedGoal = this.findGoalById(selectedGoalId);
      if (selectedGoal) {
        options = [selectedGoal, ...options];
      }
    }
    this.tacticGoalOptions = options;
  }

  private syncTacticMasterPlanFromGoal(goalId: any): void {
    const goal = this.findGoalById(goalId);
    const fkMasterPlanId = this.getGoalMasterPlanId(goal);
    if (fkMasterPlanId) {
      this.tacticModalMasterPlanId = fkMasterPlanId;
      this.updateTacticGoalOptions();
    }
  }

  onTacticMasterPlanIdChange(planId: any): void {
    const normalizedPlanId = this.normalizeSelectId(planId);

    if (normalizedPlanId == null || normalizedPlanId === '') {
      this.tacticModalMasterPlanId = null;
      this.clearTacticGoalModels();
      this.tacticGoalSelectKey++;
      this.tacticGoalOptions = [...this.listMasMasterPlanGoalAll];
      this.cdr.detectChanges();
      return;
    }

    this.tacticModalMasterPlanId = normalizedPlanId;
    this.clearTacticGoalModels();
    this.updateTacticGoalOptions();
    this.tacticGoalSelectKey++;

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

  onTacticGoalIdChange(goalId: any): void {
    const normalizedGoalId = this.normalizeSelectId(goalId);

    if (normalizedGoalId == null || normalizedGoalId === '') {
      this.clearTacticGoalModels();
      this.cdr.detectChanges();
      return;
    }

    this.Mas_Master_Plan_Goals_Tactic.FK_Plan_Goals_Id = normalizedGoalId;
    this.syncTacticMasterPlanFromGoal(normalizedGoalId);
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
    this.tacticModalMasterPlanId = null;
    this.tacticGoalSelectKey = 0;
    this.tacticMasterPlanSelectKey = 0;
    this.Mas_Master_Plan_Goals_Tactic = {
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
    this.Mas_Master_Plan_Goals_Tactic = { ...item, FK_Plan_Goals_Id: goalId };
    this.tacticModalMasterPlanId = null;
    this.tacticGoalSelectKey = 0;
    this.tacticMasterPlanSelectKey = 0;

    const goal = this.findGoalById(goalId);
    if (goal) {
      this.tacticModalMasterPlanId = this.getGoalMasterPlanId(goal);
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
    this.subGoalModalMasterPlanId = null;
    this.subGoalSubPlanSelectKey = 0;
    this.subGoalMasterPlanSelectKey = 0;
    this.Mas_Sub_Master_Plan_Goals = {
      Sub_Plan_Goals_Id: 0,
      FK_Sub_Master_Plan: null,
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
    this.Mas_Sub_Master_Plan_Goals = { ...item, FK_Sub_Master_Plan: subPlanId };
    this.subGoalModalMasterPlanId = null;
    this.subGoalSubPlanSelectKey = 0;
    this.subGoalMasterPlanSelectKey = 0;

    const subPlan = this.findSubMasterPlanById(subPlanId);
    if (subPlan) {
      this.subGoalModalMasterPlanId = this.getSubPlanMasterPlanId(subPlan);
    }
    this.updateSubGoalSubPlanOptions();
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGuidelineModal(modal: any): void {
    this.isEditModeGuideline = false;
    this.guidelineSubPlanSelectKey = 0;
    this.Mas_Sub_Plan_Guidelines = {
      Guidelines_Id: 0,
      FK_Sub_Master_Plan: null,
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
    this.Mas_Sub_Plan_Guidelines = { ...item, FK_Sub_Master_Plan: subPlanId };
    this.guidelineSubPlanSelectKey = 0;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddChainMainModal(modal: any): void {
    this.isEditModeChainMain = false;
    this.currentChainSaveType = 'MAIN';
    this.chainY1SelectKey = 0;
    this.Mas_Value_Chain = {
      Value_Chain_Id: 0,
      FK_Plan_Goals_Id: null,
      Target_Y2_Id: null,
      Fk_SubPlan_Goals_Id: null,
      Value_Chain_Type: 'MAIN',
      BgYear_Start: '',
      BgYear_End: '',
      Value_Chain_Name: '',
      Value_Chain_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasValueChainMainAll)
    };
    if (this.listMasSubMasterPlanGoalAll.length === 0) {
      this.warnNoSubGoalsForChain();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditChainMainModal(modal: any, item: any): void {
    this.isEditModeChainMain = true;
    const isSupport = this.isChainSupport(item);
    this.currentChainSaveType = isSupport ? 'SUPPORT' : 'MAIN';

    const y1Id = this.getValueChainY1Id(item);
    this.Mas_Value_Chain = {
      ...item,
      Value_Chain_Type: isSupport ? 'SUPPORT' : 'MAIN',
      Fk_SubPlan_Goals_Id: y1Id,
      FK_Plan_Goals_Id: null,
      Target_Y2_Id: null
    };
    this.chainY1SelectKey = 0;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddFactorMainModal(modal: any): void {
    this.isEditModeFactorMain = false;
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
    const chainId = this.getFactorMainFkValueChainId(item);
    this.Mas_Value_Chain_Factor = { ...item, FK_Value_Chain_Id: chainId };
    this.factorMainChainSelectKey++;
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

  Delete_Mas_Master_Plan_Goals_Tactic(item: any): void {
    this.confirmDelete(item?.Plan_Tactics_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Master_Plan_Goals_Tactic',
        Mas_Master_Plan_Goals_Tactic: item
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

  Delete_Mas_Sub_Master_Plan_Goals(item: any): void {
    this.confirmDelete(item?.Sub_Plan_Goals_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Sub_Master_Plan_Goals',
        Mas_Sub_Master_Plan_Goals: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการเป้าหมายแผนแม่บทย่อย (Y1) เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Sub_Plan_Guidelines(item: any): void {
    this.confirmDelete(item?.Guidelines_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Sub_Plan_Guidelines',
        Mas_Sub_Plan_Guidelines: item
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
      (this.Mas_Master_Plan_Goal.FK_Master_Plan == null ||
        this.Mas_Master_Plan_Goal.FK_Master_Plan === '')
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
    const goalId = this.normalizeSelectId(this.Mas_Master_Plan_Goals_Tactic.FK_Plan_Goals_Id);
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
    this.Mas_Master_Plan_Goals_Tactic.FK_Plan_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Master_Plan_Goals_Tactic',
      Mas_Master_Plan_Goals_Tactic: this.Mas_Master_Plan_Goals_Tactic
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการตัวชี้วัดเป้าหมายระดับประเด็นเรียบร้อยแล้ว!')
    );
  }

  BtnSaveSubPlan(): void {
    if (
      !this.isEditModeSubPlan &&
      (this.Mas_Sub_Master_Plan.FK_Master_Plan == null ||
        this.Mas_Sub_Master_Plan.FK_Master_Plan === '')
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
    const subPlanId = this.normalizeSelectId(this.Mas_Sub_Master_Plan_Goals.FK_Sub_Master_Plan);
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
    this.Mas_Sub_Master_Plan_Goals.FK_Sub_Master_Plan = subPlanId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Sub_Master_Plan_Goals',
      Mas_Sub_Master_Plan_Goals: this.Mas_Sub_Master_Plan_Goals
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายแผนแม่บทย่อย (Y1) เรียบร้อยแล้ว!')
    );
  }

  BtnSaveGuideline(): void {
    const subPlanId = this.normalizeSelectId(this.Mas_Sub_Plan_Guidelines.FK_Sub_Master_Plan);
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
    this.Mas_Sub_Plan_Guidelines.FK_Sub_Master_Plan = subPlanId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Sub_Plan_Guidelines',
      Mas_Sub_Plan_Guidelines: this.Mas_Sub_Plan_Guidelines
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการแนวทางการพัฒนาภายใต้แผนย่อยเรียบร้อยแล้ว!')
    );
  }

  BtnSaveValueChain(): void {
    const y1Id = this.normalizeSelectId(
      this.Mas_Value_Chain.Fk_SubPlan_Goals_Id ??
        this.Mas_Value_Chain.FK_Sub_Plan_Goals_Id ??
        this.Mas_Value_Chain.Target_Y1_Id
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

    this.Mas_Value_Chain.Value_Chain_Type =
      this.currentChainSaveType === 'SUPPORT' ? 'SUPPORT' : 'MAIN';

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Value_Chain',
      Mas_Value_Chain: this.Mas_Value_Chain
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการหลักเรียบร้อยแล้ว!')
    );
  }

  BtnSaveValueChainFactor(): void {
    const chainId = this.getFactorMainFkValueChainId(this.Mas_Value_Chain_Factor);
    if (!chainId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกหลัก',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Value_Chain_Factor.FK_Value_Chain_Id = chainId;
    delete this.Mas_Value_Chain_Factor.Fk_Value_Chain_Id;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Value_Chain_Factor',
      Mas_Value_Chain_Factor: this.Mas_Value_Chain_Factor
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการปัจจัยหลักเรียบร้อยแล้ว!')
    );
  }
}
