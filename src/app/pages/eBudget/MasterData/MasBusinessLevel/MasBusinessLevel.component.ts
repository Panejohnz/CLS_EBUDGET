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
  selector: 'MasBusinessLevel',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './MasBusinessLevel.component.html',
  styleUrls: ['./MasBusinessLevel.component.scss']
})
export class MasBusinessLevelComponent implements OnInit {
  currentYear: any;
  modalRef: any;
  isEditMode = false;

  Mas_Business_Level: any = {};

  List_Mas_Business_Level: any[] = [];
  listMasBusinessLevelAll: any[] = [];
  listMasBusinessLevelFiltered: any[] = [];

  readonly pageSize = 30;
  pagination = { page: 1, startIndex: 0, endIndex: 0, total: 0 };

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
      FUNC_CODE: 'FUNC-Get_Mas_BusinessLevel',
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.listMasBusinessLevelAll = this.normalizeListIds(
        this.extractList(response?.List_Mas_Business_Level),
        ['Level_Id']
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
      this.listMasBusinessLevelFiltered,
      this.pagination.page
    );
    this.List_Mas_Business_Level = slice;
    this.pagination = { ...this.pagination, startIndex, endIndex, total };
  }

  filterSearch(): void {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();
    this.listMasBusinessLevelFiltered = this.filterListByKeyword(
      this.listMasBusinessLevelAll,
      keyword
    );
    this.pagination.page = 1;
    this.refreshPage();
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
    this.refreshPage();
  }

  openAddModal(modal: any): void {
    this.isEditMode = false;
    this.Mas_Business_Level = {
      Level_Id: 0,
      Level_Name: '',
      Level_Short_Name: '',
      Level_Code: '',
      BgYear: this.currentYear,
      Order_Seq: this.getNextOrderSeq(this.listMasBusinessLevelAll)
    };
    this.modalRef = this.modalService.open(modal, { size: 'lg', backdrop: 'static' });
  }

  openEditModal(modal: any, item: any): void {
    this.isEditMode = true;
    this.Mas_Business_Level = { ...item };
    this.modalRef = this.modalService.open(modal, { size: 'lg', backdrop: 'static' });
  }

  BtnSaveBusinessLevel(): void {
    if (!this.Mas_Business_Level.Level_Name?.trim()) {
      Swal.fire({
        title: 'กรุณากรอกข้อมูล',
        text: 'กรุณากรอกชื่อระดับ',
        icon: 'warning',
        confirmButtonColor: 'rgb(3, 142, 220)',
        confirmButtonText: 'OK',
      });
      return;
    }

    this.Mas_Business_Level.BgYear = this.currentYear;

    this.serviceebud.GatewayGetData({
      FUNC_CODE: 'Func-Save_Mas_Business_Level',
      Mas_Business_Level: this.Mas_Business_Level
    }).subscribe((response: any) =>
      this.handleSaveResponse(response, 'บันทึกรายการระดับบุคลากรเรียบร้อยแล้ว!')
    );
  }

  Delete_Mas_Business_Level(item: any): void {
    this.confirmDelete(item?.Level_Name, () => {
      this.serviceebud.GatewayGetData({
        FUNC_CODE: 'Func-Delete_Mas_Business_Level',
        Mas_Business_Level: item
      }).subscribe((response: any) =>
        this.handleDeleteResponse(response, 'ลบรายการระดับบุคลากรเรียบร้อยแล้ว!')
      );
    });
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
}
