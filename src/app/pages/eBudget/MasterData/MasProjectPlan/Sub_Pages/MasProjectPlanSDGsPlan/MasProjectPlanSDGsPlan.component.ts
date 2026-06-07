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
  selector: 'MasProjectPlanSDGsPlan',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './MasProjectPlanSDGsPlan.component.html',
  styleUrls: ['./MasProjectPlanSDGsPlan.component.scss']
})
export class MasProjectPlanSDGsPlanComponent implements OnInit {
  currentTab = 1;
  currentYear: any;
  modalRef: any;

  Mas_SDGs_Gloals: any = {};
  Mas_SDGs_Targets: any = {};

  isEditModeGoal = false;
  isEditModeTarget = false;

  targetGoalSelectKey = 0;

  List_Mas_SDGs_Gloals: any[] = [];
  List_Mas_SDGs_Targets: any[] = [];

  listMasSDGsGloalsAll: any[] = [];
  listMasSDGsTargetsAll: any[] = [];

  listMasSDGsGloalsFiltered: any[] = [];
  listMasSDGsTargetsFiltered: any[] = [];

  readonly pageSize = 30;
  goalPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };
  targetPagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

  searchTargetTerm = '';

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
  ) {}

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
      FUNC_CODE: 'FUNC-Get_Mas_SDGsPlan',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasSDGsGloalsAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_SDGs_Gloals ?? response?.List_Mas_SDGs_Gloal),
        ['SDGs_Gloals_Id', 'SDGS_Goals_Id']
      ).map((goal) => ({
        ...goal,
        SDGs_Gloals_Id: goal.SDGs_Gloals_Id ?? goal.SDGS_Goals_Id ?? null
      }));

      this.listMasSDGsTargetsAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_SDGs_Targets ?? response?.List_Mas_SDGs_Target),
        ['SDGs_Targets_Id', 'Fk_SDGS_Goals_Id', 'FK_SDGS_Goals_Id', 'SDGs_Gloals_Id']
      ).map((target) => {
        const goalId =
          target.Fk_SDGS_Goals_Id ??
          target.FK_SDGS_Goals_Id ??
          target.SDGs_Gloals_Id ??
          null;
        return {
          ...target,
          Fk_SDGS_Goals_Id: goalId,
          FK_SDGS_Goals_Id: goalId
        };
      });

      this.filterGoalSearch();
      this.filterTargetSearch();
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

  private refreshGoalPage(): void {
    const result = this.slicePage(this.listMasSDGsGloalsFiltered, this.goalPagination.page);
    this.List_Mas_SDGs_Gloals = result.slice;
    this.goalPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  private refreshTargetPage(): void {
    const result = this.slicePage(this.listMasSDGsTargetsFiltered, this.targetPagination.page);
    this.List_Mas_SDGs_Targets = result.slice;
    this.targetPagination = {
      page: result.page,
      startIndex: result.startIndex,
      endIndex: result.endIndex,
      total: result.total,
    };
  }

  onGoalPageChange(page: number): void {
    this.goalPagination.page = page;
    this.refreshGoalPage();
  }

  onTargetPageChange(page: number): void {
    this.targetPagination.page = page;
    this.refreshTargetPage();
  }

  filterGoalSearch(): void {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();
    this.listMasSDGsGloalsFiltered = this.filterListByKeyword(this.listMasSDGsGloalsAll, keyword);
    this.goalPagination.page = 1;
    this.refreshGoalPage();
  }

  filterTargetSearch(): void {
    const keyword = (this.searchTargetTerm || '').toLowerCase().trim();
    this.listMasSDGsTargetsFiltered = this.filterListByKeyword(this.listMasSDGsTargetsAll, keyword);
    this.targetPagination.page = 1;
    this.refreshTargetPage();
  }

  findGoalById(id: any): any {
    const normalized = this.normalizeSelectId(id);
    if (!normalized) {
      return null;
    }
    return (
      this.listMasSDGsGloalsAll.find(
        (g) =>
          g.SDGs_Gloals_Id == normalized ||
          g.SDGS_Goals_Id == normalized ||
          String(g.SDGs_Gloals_Id) === String(normalized)
      ) ?? null
    );
  }

  getGoalId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(item.SDGs_Gloals_Id ?? item.SDGS_Goals_Id ?? null);
  }

  getTargetFkGoalId(item: any): any {
    if (!item) {
      return null;
    }
    return this.normalizeSelectId(
      item.Fk_SDGS_Goals_Id ?? item.FK_SDGS_Goals_Id ?? item.SDGs_Gloals_Id ?? null
    );
  }

  getGoalNameById(id: any): string {
    const goal = this.findGoalById(id);
    return goal?.SDGs_Gloals_Name ?? goal?.SDGS_Goals_Name ?? '';
  }

  getGoalNameForRow(row: any): string {
    if (!row) {
      return '';
    }
    return row.SDGs_Gloals_Name ?? row.SDGS_Goals_Name ?? this.getGoalNameById(this.getGoalId(row));
  }

  getGoalNameForTargetRow(row: any): string {
    return this.getGoalNameById(this.getTargetFkGoalId(row));
  }

  onTargetGoalIdChange(goalId: any): void {
    const normalized = this.normalizeSelectId(goalId);
    if (!normalized) {
      this.Mas_SDGs_Targets.Fk_SDGS_Goals_Id = null;
      this.Mas_SDGs_Targets.FK_SDGS_Goals_Id = null;
      this.cdr.detectChanges();
      return;
    }
    this.Mas_SDGs_Targets.Fk_SDGS_Goals_Id = normalized;
    this.Mas_SDGs_Targets.FK_SDGS_Goals_Id = normalized;
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

  openAddGoalModal(modal: any): void {
    this.isEditModeGoal = false;
    this.Mas_SDGs_Gloals = {
      SDGs_Gloals_Id: 0,
      BgYear_Start: '',
      BgYear_End: '',
      SDGs_Gloals_Name: '',
      SDGs_Gloals_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasSDGsGloalsAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditGoalModal(modal: any, item: any): void {
    this.isEditModeGoal = true;
    const goalId = this.getGoalId(item);
    this.Mas_SDGs_Gloals = { ...item, SDGs_Gloals_Id: goalId };
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openAddTargetModal(modal: any): void {
    this.isEditModeTarget = false;
    this.targetGoalSelectKey = 0;
    this.Mas_SDGs_Targets = {
      SDGs_Targets_Id: 0,
      Fk_SDGS_Goals_Id: null,
      FK_SDGS_Goals_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      SDGs_Targets_Name: '',
      SDGs_Targets_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasSDGsTargetsAll)
    };
    if (this.listMasSDGsGloalsAll.length === 0) {
      this.warnNoGoals();
    }
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  openEditTargetModal(modal: any, item: any): void {
    this.isEditModeTarget = true;
    const goalId = this.getTargetFkGoalId(item);
    this.Mas_SDGs_Targets = {
      ...item,
      Fk_SDGS_Goals_Id: goalId,
      FK_SDGS_Goals_Id: goalId
    };
    this.targetGoalSelectKey++;
    this.cdr.detectChanges();
    this.modalRef = this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }

  private warnNoGoals(): void {
    Swal.fire({
      title: 'กรุณาเพิ่มข้อมูล',
      text: 'กรุณาเพิ่ม : เป้าหมายหลัก SDGs',
      icon: 'warning',
      confirmButtonColor: 'rgb(3, 142, 220)',
      confirmButtonText: 'OK',
    });
  }

  BtnSaveSDGsGloals(): void {
    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_SDGs_Gloals',
      Mas_SDGs_Gloals: this.Mas_SDGs_Gloals
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายหลัก SDGs เรียบร้อยแล้ว!')
    );
  }

  BtnSaveSDGsTargets(): void {
    const goalId = this.getTargetFkGoalId(this.Mas_SDGs_Targets);
    if (!goalId) {
      Swal.fire({
        title: 'กรุณาเลือกข้อมูล',
        text: 'กรุณาเลือกเป้าหมายหลัก SDGs',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }
    this.Mas_SDGs_Targets.Fk_SDGS_Goals_Id = goalId;
    this.Mas_SDGs_Targets.FK_SDGS_Goals_Id = goalId;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_SDGs_Targets',
      Mas_SDGs_Targets: this.Mas_SDGs_Targets
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการเป้าหมายย่อย SDGs เรียบร้อยแล้ว!')
    );
  }

  Delete_Mas_SDGs_Gloals(item: any): void {
    this.confirmDelete(this.getGoalNameForRow(item), () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_SDGs_Gloals',
        Mas_SDGs_Gloals: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการเป้าหมายหลัก SDGs เรียบร้อยแล้ว!')
      );
    });
  }

  Delete_Mas_SDGs_Targets(item: any): void {
    this.confirmDelete(item?.SDGs_Targets_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_SDGs_Targets',
        Mas_SDGs_Targets: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการเป้าหมายย่อย SDGs เรียบร้อยแล้ว!')
      );
    });
  }
}
