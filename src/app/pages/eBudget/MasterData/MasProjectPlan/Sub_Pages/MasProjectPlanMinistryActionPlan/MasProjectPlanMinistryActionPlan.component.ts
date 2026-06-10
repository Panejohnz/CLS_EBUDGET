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
  selector: 'MasProjectPlanMinistryActionPlan',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './MasProjectPlanMinistryActionPlan.component.html',
  styleUrls: ['./MasProjectPlanMinistryActionPlan.component.scss']
})
export class MasProjectPlanMinistryActionPlanComponent implements OnInit {
  currentTab = 1;
  currentYear: any;
  modalRef: any;

  Mas_Project_Plan: any = {};
  Mas_Project_Plan_Goals: any = {};
  Mas_Indicators: any = {};
  Mas_Project_Plan_Goals_Guidelines: any = {};

  isEditModePlan = false;
  isEditModeGoal = false;
  isEditModeIndicator = false;
  isEditModeGuideline = false;

  goalProjectPlanSelectKey = 0;
  indicatorGoalSelectKey = 0;
  guidelineGoalSelectKey = 0;

  List_Mas_Project_Plan: any[] = [];
  List_Mas_Project_Plan_Goals: any[] = [];
  List_Mas_Indicator: any[] = [];
  List_Mas_Project_Plan_Goals_Guidelines: any[] = [];

  listMasProjectPlanAll: any[] = [];
  listMasProjectPlanGoalsAll: any[] = [];
  listMasIndicatorsAll: any[] = [];
  listMasProjectPlanGoalsGuidelinesAll: any[] = [];

  listMasProjectPlanFiltered: any[] = [];
  listMasProjectPlanGoalsFiltered: any[] = [];
  listMasIndicatorsFiltered: any[] = [];
  listMasProjectPlanGoalsGuidelinesFiltered: any[] = [];

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
      FUNC_CODE: 'FUNC-Get_Mas_MinistryActionPlan',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasProjectPlanAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Project_Plan),
        ['Project_Plan_Id']
      );

      this.listMasProjectPlanGoalsAll = this.normalizeListIds(
        this.extractList(
          response?.List_Mas_Project_Plan_Goals ?? response?.List_Mas_Project_Plan_Goal
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

      this.listMasIndicatorsAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Indicator),
        ['Indicators_Id', 'FK_Plan_Goals_Id', 'Fk_Plan_Goals_Id']
      ).map((indicator) => {
        const goalId = indicator.FK_Plan_Goals_Id ?? indicator.Fk_Plan_Goals_Id ?? null;
        return {
          ...indicator,
          FK_Plan_Goals_Id: goalId,
          Fk_Plan_Goals_Id: goalId
        };
      });

      this.listMasProjectPlanGoalsGuidelinesAll = this.normalizeListIds(
        this.extractList(
          response?.List_Mas_Project_Plan_Goals_Guidelines ??
          response?.List_Mas_Project_Plan_Goals_Guideline
        ),
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
    const result = this.slicePage(this.listMasProjectPlanFiltered, this.planPagination.page);
    this.List_Mas_Project_Plan = result.slice;
    this.planPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshGoalPage(): void {
    const result = this.slicePage(this.listMasProjectPlanGoalsFiltered, this.goalPagination.page);
    this.List_Mas_Project_Plan_Goals = result.slice;
    this.goalPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshIndicatorPage(): void {
    const result = this.slicePage(this.listMasIndicatorsFiltered, this.indicatorPagination.page);
    this.List_Mas_Indicator = result.slice;
    this.indicatorPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshGuidelinePage(): void {
    const result = this.slicePage(
      this.listMasProjectPlanGoalsGuidelinesFiltered,
      this.guidelinePagination.page
    );
    this.List_Mas_Project_Plan_Goals_Guidelines = result.slice;
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
    this.listMasProjectPlanFiltered = this.filterListByKeyword(this.listMasProjectPlanAll, keyword);
    this.planPagination.page = 1;
    this.refreshPlanPage();
  }

  filterGoalSearch(): void {
    const keyword = (this.searchGoalTerm || '').toLowerCase().trim();
    this.listMasProjectPlanGoalsFiltered = this.filterListByKeyword(
      this.listMasProjectPlanGoalsAll,
      keyword
    );
    this.goalPagination.page = 1;
    this.refreshGoalPage();
  }

  filterIndicatorSearch(): void {
    const keyword = (this.searchIndicatorTerm || '').toLowerCase().trim();
    this.listMasIndicatorsFiltered = this.filterListByKeyword(this.listMasIndicatorsAll, keyword);
    this.indicatorPagination.page = 1;
    this.refreshIndicatorPage();
  }

  filterGuidelineSearch(): void {
    const keyword = (this.searchGuidelineTerm || '').toLowerCase().trim();
    this.listMasProjectPlanGoalsGuidelinesFiltered = this.filterListByKeyword(
      this.listMasProjectPlanGoalsGuidelinesAll,
      keyword
    );
    this.guidelinePagination.page = 1;
    this.refreshGuidelinePage();
  }

  findProjectPlanById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasProjectPlanAll.find(
        (p) =>
          p.Project_Plan_Id == normalized || String(p.Project_Plan_Id) === String(normalized)
      ) ?? null
    );
  }

  findGoalById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasProjectPlanGoalsAll.find(
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

  getProjectPlanNameById(id: any): string {
    return this.findProjectPlanById(id)?.Project_Plan_Name ?? '';
  }

  getGoalNameById(id: any): string {
    const goal = this.findGoalById(id);
    return goal?.Project_Plan_Name ?? goal?.Project_Plan_Goals_Name ?? '';
  }

  getGoalNameForRow(row: any): string {
    if (!row) {
      return '';
    }
    return (
      row.Project_Plan_Name ||
      row.Project_Plan_Goals_Name ||
      this.getGoalNameById(row.Project_Plan_Goals_Id)
    );
  }

  getProjectPlanNameForGoalRow(row: any): string {
    return this.getProjectPlanNameById(this.getGoalFkProjectPlanId(row));
  }

  getGoalNameForChildRow(row: any): string {
    return this.getGoalNameById(this.getIndicatorFkPlanGoalsId(row));
  }

  onGoalProjectPlanIdChange(projectPlanId: any): void {
    const normalized = this.normalizeSelectId(projectPlanId);
    if (!normalized) {
      this.Mas_Project_Plan_Goals.Fk_Project_Plan_Id = null;
      this.Mas_Project_Plan_Goals.FK_Project_Plan_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Project_Plan_Goals.Fk_Project_Plan_Id = normalized;
    this.Mas_Project_Plan_Goals.FK_Project_Plan_Id = normalized;
    this.cdr.detectChanges();
  }

  onIndicatorGoalIdChange(goalId: any): void {
    const normalized = this.normalizeSelectId(goalId);
    if (!normalized) {
      this.Mas_Indicators.FK_Plan_Goals_Id = null;
      this.Mas_Indicators.Fk_Plan_Goals_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Indicators.FK_Plan_Goals_Id = normalized;
    this.Mas_Indicators.Fk_Plan_Goals_Id = normalized;
    this.cdr.detectChanges();
  }

  onGuidelineGoalIdChange(goalId: any): void {
    const normalized = this.normalizeSelectId(goalId);
    if (!normalized) {
      this.Mas_Project_Plan_Goals_Guidelines.FK_Plan_Goals_Id = null;
      this.Mas_Project_Plan_Goals_Guidelines.Fk_Plan_Goals_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_Project_Plan_Goals_Guidelines.FK_Plan_Goals_Id = normalized;
    this.Mas_Project_Plan_Goals_Guidelines.Fk_Plan_Goals_Id = normalized;
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
    this.Mas_Project_Plan = {
      Project_Plan_Id: 0,
      BgYear: this.currentYear,
      Project_Plan_Name: '',
      Project_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasProjectPlanAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditPlanModal(modal: any, item: any): void {
    this.isEditModePlan = true;
    this.Mas_Project_Plan = { ...item };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddGoalModal(modal: any): void {
    this.isEditModeGoal = false;
    this.goalProjectPlanSelectKey = 0;
    this.Mas_Project_Plan_Goals = {
      Project_Plan_Goals_Id: 0,
      Fk_Project_Plan_Id: null,
      FK_Project_Plan_Id: null,
      BgYear: this.currentYear,
      Project_Plan_Name: '',
      Project_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasProjectPlanGoalsAll)
    };
    if (this.listMasProjectPlanAll.length === 0) {
      this.warnNoProjectPlan();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGoalModal(modal: any, item: any): void {
    this.isEditModeGoal = true;
    const projectPlanId = this.getGoalFkProjectPlanId(item);
    this.Mas_Project_Plan_Goals = {
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
    this.Mas_Indicators = {
      Indicators_Id: 0,
      FK_Plan_Goals_Id: null,
      Fk_Plan_Goals_Id: null,
      BgYear: this.currentYear,
      Indicators_Name: '',
      Indicators_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasIndicatorsAll)
    };
    if (this.listMasProjectPlanGoalsAll.length === 0) {
      this.warnNoGoals();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditIndicatorModal(modal: any, item: any): void {
    this.isEditModeIndicator = true;
    const goalId = this.getIndicatorFkPlanGoalsId(item);
    this.Mas_Indicators = {
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
    this.Mas_Project_Plan_Goals_Guidelines = {
      Goals_Guidelines_Id: 0,
      FK_Plan_Goals_Id: null,
      Fk_Plan_Goals_Id: null,
      BgYear: this.currentYear,
      Project_Plan_Name: '',
      Project_Plan_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasProjectPlanGoalsGuidelinesAll)
    };
    if (this.listMasProjectPlanGoalsAll.length === 0) {
      this.warnNoGoals();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGuidelineModal(modal: any, item: any): void {
    this.isEditModeGuideline = true;
    const goalId = this.getGuidelineFkPlanGoalsId(item);
    this.Mas_Project_Plan_Goals_Guidelines = {
      ...item,
      FK_Plan_Goals_Id: goalId,
      Fk_Plan_Goals_Id: goalId
    };
    this.guidelineGoalSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  private warnNoProjectPlan(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : แผนงานที่',
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

  BtnSaveProjectPlan(): void {
    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Project_Plan',
      Mas_Project_Plan: this.Mas_Project_Plan
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการแผนงานที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveProjectPlanGoals(): void {
    const projectPlanId = this.getGoalFkProjectPlanId(this.Mas_Project_Plan_Goals);
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
    this.Mas_Project_Plan_Goals.Fk_Project_Plan_Id = projectPlanId;
    this.Mas_Project_Plan_Goals.FK_Project_Plan_Id = projectPlanId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Project_Plan_Goals',
      Mas_Project_Plan_Goals: this.Mas_Project_Plan_Goals
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveIndicators(): void {
    const goalId = this.getIndicatorFkPlanGoalsId(this.Mas_Indicators);
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
    this.Mas_Indicators.FK_Plan_Goals_Id = goalId;
    this.Mas_Indicators.Fk_Plan_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Indicators',
      Mas_Indicators: this.Mas_Indicators
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการตัวชี้วัดที่เรียบร้อยแล้ว!')
    );
  }

  BtnSaveGuidelines(): void {
    const goalId = this.getGuidelineFkPlanGoalsId(this.Mas_Project_Plan_Goals_Guidelines);
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
    this.Mas_Project_Plan_Goals_Guidelines.FK_Plan_Goals_Id = goalId;
    this.Mas_Project_Plan_Goals_Guidelines.Fk_Plan_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Project_Plan_Goals_Guidelines',
      Mas_Project_Plan_Goals_Guidelines: this.Mas_Project_Plan_Goals_Guidelines
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการแนวทางการพัฒนาที่เรียบร้อยแล้ว!')
    );
  }

  Delete_Mas_Project_Plan(item: any): void {
    this.confirmDelete(item?.Project_Plan_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Project_Plan',
        Mas_Project_Plan: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการแผนงานที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Project_Plan_Goals(item: any): void {
    this.confirmDelete(this.getGoalNameForRow(item), () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Project_Plan_Goals',
        Mas_Project_Plan_Goals: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการเป้าหมายที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Indicators(item: any): void {
    this.confirmDelete(item?.Indicators_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Indicators',
        Mas_Indicators: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการตัวชี้วัดที่เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_Project_Plan_Goals_Guidelines(item: any): void {
    this.confirmDelete(item?.Project_Plan_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Project_Plan_Goals_Guidelines',
        Mas_Project_Plan_Goals_Guidelines: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการแนวทางการพัฒนาที่เรียบร้อยแล้ว!')
      );
    });
  }
}
