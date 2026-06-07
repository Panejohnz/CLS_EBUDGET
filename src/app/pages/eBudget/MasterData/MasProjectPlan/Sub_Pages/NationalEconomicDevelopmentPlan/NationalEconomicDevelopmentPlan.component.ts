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
  selector: 'NationalEconomicDevelopmentPlan',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './NationalEconomicDevelopmentPlan.component.html',
  styleUrls: ['./NationalEconomicDevelopmentPlan.component.scss']
})
export class NationalEconomicDevelopmentPlanComponent implements OnInit {
  currentTab = 1;
  currentYear: any;
  modalRef: any;

  Mas_Project_Plan_5: any = {};
  Mas_Project_Plan_Goals_5: any = {};
  Mas_Indicators_5: any = {};
  Mas_Project_Plan_Goals_Guidelines_5: any = {};

  isEditModePlan = false;
  isEditModeGoal = false;
  isEditModeIndicator = false;
  isEditModeGuideline = false;

  goalProjectPlanSelectKey = 0;
  indicatorGoalSelectKey = 0;
  guidelineGoalSelectKey = 0;

  List_Mas_Project_Plan_5: any[] = [];
  List_Mas_Project_Plan_Goals_5: any[] = [];
  List_Mas_Indicators_5: any[] = [];
  List_Mas_Project_Plan_Goals_Guidelines_5: any[] = [];

  listMasProjectPlan5All: any[] = [];
  listMasProjectPlanGoals5All: any[] = [];
  listMasIndicators5All: any[] = [];
  listMasProjectPlanGoalsGuidelines5All: any[] = [];

  listMasProjectPlan5Filtered: any[] = [];
  listMasProjectPlanGoals5Filtered: any[] = [];
  listMasIndicators5Filtered: any[] = [];
  listMasProjectPlanGoalsGuidelines5Filtered: any[] = [];

  readonly pageSize = 30;
  planPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  goalPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  indicatorPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  guidelinePagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

  searchGoalTerm = '';
  searchIndicatorTerm = '';
  searchGuidelineTerm = '';

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
      FUNC_CODE: 'FUNC-Get_Mas_NationalEconomicDevelopmentPlan',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasProjectPlan5All = this.normalizeListIds(
        this.extractList(response?.List_Mas_Project_Plan_5),
        ['Project_Plan_Id']
      );

      this.listMasProjectPlanGoals5All = this.normalizeListIds(
        this.extractList(
          response?.List_Mas_Project_Plan_Goals_5 ?? response?.List_Mas_Project_Plan_Goal_5
        ),
        ['Project_Plan_Goals_Id', 'Fk_Project_Plan_Id', 'FK_Project_Plan_Id']
      ).map((goal) => {
        const projectPlanId = goal.Fk_Project_Plan_Id ?? goal.FK_Project_Plan_Id ?? null;
        return {
          ...goal,
          Fk_Project_Plan_Id: projectPlanId,
          FK_Project_Plan_Id: projectPlanId
        };
      });

      this.listMasIndicators5All = this.normalizeListIds(
        this.extractList(response?.List_Mas_Indicators_5),
        ['Indicators_Id', 'FK_Plan_Goals_Id', 'Fk_Plan_Goals_Id']
      ).map((indicator) => {
        const goalId = indicator.FK_Plan_Goals_Id ?? indicator.Fk_Plan_Goals_Id ?? null;
        return {
          ...indicator,
          FK_Plan_Goals_Id: goalId,
          Fk_Plan_Goals_Id: goalId
        };
      });

      this.listMasProjectPlanGoalsGuidelines5All = this.normalizeListIds(
        this.extractList(response?.List_Mas_Project_Plan_Goals_Guidelines_5),
        ['Goals_Guidelines_Id', 'FK_Plan_Goals_Id', 'Fk_Plan_Goals_Id']
      ).map((guideline) => {
        const goalId = guideline.FK_Plan_Goals_Id ?? guideline.Fk_Plan_Goals_Id ?? null;
        return {
          ...guideline,
          FK_Plan_Goals_Id: goalId,
          Fk_Plan_Goals_Id: goalId
        };
      });

      this.filterPlanSearch();
      this.filterGoalSearch();
      this.filterIndicatorSearch();
      this.filterGuidelineSearch();
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

  private refreshPlanPage(): void {
    const result = this.slicePage(this.listMasProjectPlan5Filtered, this.planPagination.page);
    this.List_Mas_Project_Plan_5 = result.slice;
    this.planPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshGoalPage(): void {
    const result = this.slicePage(this.listMasProjectPlanGoals5Filtered, this.goalPagination.page);
    this.List_Mas_Project_Plan_Goals_5 = result.slice;
    this.goalPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshIndicatorPage(): void {
    const result = this.slicePage(this.listMasIndicators5Filtered, this.indicatorPagination.page);
    this.List_Mas_Indicators_5 = result.slice;
    this.indicatorPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshGuidelinePage(): void {
    const result = this.slicePage(
      this.listMasProjectPlanGoalsGuidelines5Filtered,
      this.guidelinePagination.page
    );
    this.List_Mas_Project_Plan_Goals_Guidelines_5 = result.slice;
    this.guidelinePagination = {
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

  onIndicatorPageChange(page: number): void {
    this.indicatorPagination.page = page;
    this.refreshIndicatorPage();
  }

  onGuidelinePageChange(page: number): void {
    this.guidelinePagination.page = page;
    this.refreshGuidelinePage();
  }

  filterPlanSearch(): void {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();
    this.listMasProjectPlan5Filtered = this.filterListByKeyword(this.listMasProjectPlan5All, keyword);
    this.planPagination.page = 1;
    this.refreshPlanPage();
  }

  filterGoalSearch(): void {
    const keyword = (this.searchGoalTerm || '').toLowerCase().trim();
    this.listMasProjectPlanGoals5Filtered = this.filterListByKeyword(
      this.listMasProjectPlanGoals5All,
      keyword
    );
    this.goalPagination.page = 1;
    this.refreshGoalPage();
  }

  filterIndicatorSearch(): void {
    const keyword = (this.searchIndicatorTerm || '').toLowerCase().trim();
    this.listMasIndicators5Filtered = this.filterListByKeyword(this.listMasIndicators5All, keyword);
    this.indicatorPagination.page = 1;
    this.refreshIndicatorPage();
  }

  filterGuidelineSearch(): void {
    const keyword = (this.searchGuidelineTerm || '').toLowerCase().trim();
    this.listMasProjectPlanGoalsGuidelines5Filtered = this.filterListByKeyword(
      this.listMasProjectPlanGoalsGuidelines5All,
      keyword
    );
    this.guidelinePagination.page = 1;
    this.refreshGuidelinePage();
  }

  findProjectPlan5ById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasProjectPlan5All.find(
        (p) =>
          p.Project_Plan_Id == normalized || String(p.Project_Plan_Id) === String(normalized)
      ) ?? null
    );
  }

  findGoal5ById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasProjectPlanGoals5All.find(
        (g) =>
          g.Project_Plan_Goals_Id == normalized ||
          String(g.Project_Plan_Goals_Id) === String(normalized)
      ) ?? null
    );
  }

  getGoalFkProjectPlanId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.Fk_Project_Plan_Id ?? item.FK_Project_Plan_Id ?? null);
  }

  getIndicatorFkPlanGoalsId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.FK_Plan_Goals_Id ?? item.Fk_Plan_Goals_Id ?? null);
  }

  getGuidelineFkPlanGoalsId(item: any): any {
    return this.getIndicatorFkPlanGoalsId(item);
  }

  getProjectPlan5NameById(id: any): string {
    return this.findProjectPlan5ById(id)?.Project_Plan_Name ?? '';
  }

  getGoal5NameById(id: any): string {
    const goal = this.findGoal5ById(id);
    return goal?.Project_Plan_Name ?? goal?.Project_Plan_Goals_Name ?? '';
  }

  getGoal5NameForRow(row: any): string {
    if (!row) {
      return '';
    }
    return (
      row.Project_Plan_Name ||
      row.Project_Plan_Goals_Name ||
      this.getGoal5NameById(row.Project_Plan_Goals_Id)
    );
  }

  getProjectPlan5NameForGoalRow(row: any): string {
    return this.getProjectPlan5NameById(this.getGoalFkProjectPlanId(row));
  }

  getGoal5NameForChildRow(row: any): string {
    return this.getGoal5NameById(this.getIndicatorFkPlanGoalsId(row));
  }

  onGoalProjectPlanIdChange(projectPlanId: any): void {
    const normalized = this.normalizeSelectId(projectPlanId);
    if (!normalized) {
      this.Mas_Project_Plan_Goals_5.Fk_Project_Plan_Id = null;
      this.Mas_Project_Plan_Goals_5.FK_Project_Plan_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Project_Plan_Goals_5.Fk_Project_Plan_Id = normalized;
    this.Mas_Project_Plan_Goals_5.FK_Project_Plan_Id = normalized;
    this.cdr.detectChanges();
  }

  onIndicatorGoalIdChange(goalId: any): void {
    const normalized = this.normalizeSelectId(goalId);
    if (!normalized) {
      this.Mas_Indicators_5.FK_Plan_Goals_Id = null;
      this.Mas_Indicators_5.Fk_Plan_Goals_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Indicators_5.FK_Plan_Goals_Id = normalized;
    this.Mas_Indicators_5.Fk_Plan_Goals_Id = normalized;
    this.cdr.detectChanges();
  }

  onGuidelineGoalIdChange(goalId: any): void {
    const normalized = this.normalizeSelectId(goalId);
    if (!normalized) {
      this.Mas_Project_Plan_Goals_Guidelines_5.FK_Plan_Goals_Id = null;
      this.Mas_Project_Plan_Goals_Guidelines_5.Fk_Plan_Goals_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Project_Plan_Goals_Guidelines_5.FK_Plan_Goals_Id = normalized;
    this.Mas_Project_Plan_Goals_Guidelines_5.Fk_Plan_Goals_Id = normalized;
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

  openAddPlanModal(modal: any): void {
    this.isEditModePlan = false;
    this.Mas_Project_Plan_5 = {
      Project_Plan_Id: 0,
      BgYear_Start: '',
      BgYear_End: '',
      Project_Plan_Name: '',
      Project_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasProjectPlan5All)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditPlanModal(modal: any, item: any): void {
    this.isEditModePlan = true;
    this.Mas_Project_Plan_5 = { ...item };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGoalModal(modal: any): void {
    this.isEditModeGoal = false;
    this.goalProjectPlanSelectKey = 0;
    this.Mas_Project_Plan_Goals_5 = {
      Project_Plan_Goals_Id: 0,
      Fk_Project_Plan_Id: null,
      FK_Project_Plan_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Project_Plan_Name: '',
      Project_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasProjectPlanGoals5All)
    };
    if (this.listMasProjectPlan5All.length === 0) {
      this.warnNoProjectPlan5();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGoalModal(modal: any, item: any): void {
    this.isEditModeGoal = true;
    const projectPlanId = this.getGoalFkProjectPlanId(item);
    this.Mas_Project_Plan_Goals_5 = {
      ...item,
      Fk_Project_Plan_Id: projectPlanId,
      FK_Project_Plan_Id: projectPlanId
    };
    this.goalProjectPlanSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddIndicatorModal(modal: any): void {
    this.isEditModeIndicator = false;
    this.indicatorGoalSelectKey = 0;
    this.Mas_Indicators_5 = {
      Indicators_Id: 0,
      FK_Plan_Goals_Id: null,
      Fk_Plan_Goals_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Indicators_Name: '',
      Indicators_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasIndicators5All)
    };
    if (this.listMasProjectPlanGoals5All.length === 0) {
      this.warnNoGoals5();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditIndicatorModal(modal: any, item: any): void {
    this.isEditModeIndicator = true;
    const goalId = this.getIndicatorFkPlanGoalsId(item);
    this.Mas_Indicators_5 = {
      ...item,
      FK_Plan_Goals_Id: goalId,
      Fk_Plan_Goals_Id: goalId
    };
    this.indicatorGoalSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGuidelineModal(modal: any): void {
    this.isEditModeGuideline = false;
    this.guidelineGoalSelectKey = 0;
    this.Mas_Project_Plan_Goals_Guidelines_5 = {
      Goals_Guidelines_Id: 0,
      FK_Plan_Goals_Id: null,
      Fk_Plan_Goals_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Project_Plan_Name: '',
      Project_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasProjectPlanGoalsGuidelines5All)
    };
    if (this.listMasProjectPlanGoals5All.length === 0) {
      this.warnNoGoals5();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGuidelineModal(modal: any, item: any): void {
    this.isEditModeGuideline = true;
    const goalId = this.getGuidelineFkPlanGoalsId(item);
    this.Mas_Project_Plan_Goals_Guidelines_5 = {
      ...item,
      FK_Plan_Goals_Id: goalId,
      Fk_Plan_Goals_Id: goalId
    };
    this.guidelineGoalSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  private warnNoProjectPlan5(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : แผนงานที่',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  private warnNoGoals5(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : เป้าหมายที่',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  BtnSaveProjectPlan5(): void {
    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Project_Plan_5',
      Mas_Project_Plan_5: this.Mas_Project_Plan_5
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการแผนงานที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveProjectPlanGoals5(): void {
    const projectPlanId = this.getGoalFkProjectPlanId(this.Mas_Project_Plan_Goals_5);
    if (!projectPlanId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกแผนงานที่',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_Project_Plan_Goals_5.Fk_Project_Plan_Id = projectPlanId;
    this.Mas_Project_Plan_Goals_5.FK_Project_Plan_Id = projectPlanId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Project_Plan_Goals_5',
      Mas_Project_Plan_Goals_5: this.Mas_Project_Plan_Goals_5
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveIndicators5(): void {
    const goalId = this.getIndicatorFkPlanGoalsId(this.Mas_Indicators_5);
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
    this.Mas_Indicators_5.FK_Plan_Goals_Id = goalId;
    this.Mas_Indicators_5.Fk_Plan_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Indicators_5',
      Mas_Indicators_5: this.Mas_Indicators_5
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการตัวชี้วัดที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveGuidelines5(): void {
    const goalId = this.getGuidelineFkPlanGoalsId(this.Mas_Project_Plan_Goals_Guidelines_5);
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
    this.Mas_Project_Plan_Goals_Guidelines_5.FK_Plan_Goals_Id = goalId;
    this.Mas_Project_Plan_Goals_Guidelines_5.Fk_Plan_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Project_Plan_Goals_Guidelines_5',
      Mas_Project_Plan_Goals_Guidelines_5: this.Mas_Project_Plan_Goals_Guidelines_5
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการแนวทางการพัฒนาที่เรียบร้อยแล้ว!')
    );
  }

  Delete_Mas_Project_Plan_5(item: any): void {
    this.confirmDelete(item?.Project_Plan_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Project_Plan_5',
        Mas_Project_Plan_5: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการแผนงานที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Project_Plan_Goals_5(item: any): void {
    this.confirmDelete(this.getGoal5NameForRow(item), () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Project_Plan_Goals_5',
        Mas_Project_Plan_Goals_5: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการเป้าหมายที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Indicators_5(item: any): void {
    this.confirmDelete(item?.Indicators_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Indicators_5',
        Mas_Indicators_5: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการตัวชี้วัดที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Project_Plan_Goals_Guidelines_5(item: any): void {
    this.confirmDelete(item?.Project_Plan_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Project_Plan_Goals_Guidelines_5',
        Mas_Project_Plan_Goals_Guidelines_5: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการแนวทางการพัฒนาที่เรียบร้อยแล้ว!')
      );
    });
  }
}
