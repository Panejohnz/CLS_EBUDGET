import { Component } from '@angular/core';
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
  styles: ``
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

  constructor(private router: Router, private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService, private budgetYearService: BudgetYearService
    , public masterService: MasterService) {
  }
  List_Mas_Strategic: any[] = [];
  List_Mas_Strategic_Issue: any[] = [];
  List_Mas_Strategic_Sub_Issue: any[] = [];

  listMasStrategicAll: any[] = [];
  listMasStrategicIssueAll: any[] = [];
  private listMasStrategicSubIssueAll: any[] = [];

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
      this.listMasStrategicAll = this.extractList(response?.List_Mas_Strategic);
      this.List_Mas_Strategic = [...this.listMasStrategicAll];

      this.listMasStrategicIssueAll = this.extractList(response?.List_Mas_Strategic_Issue);
      this.List_Mas_Strategic_Issue = [...this.listMasStrategicIssueAll];

      this.listMasStrategicSubIssueAll = this.extractList(response?.List_Mas_Strategic_Sub_Issue);
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

  /** ลำดับถัดไป = Order_Seq สูงสุดใน list + 1 */
  private getNextOrderSeq(list: any[]): number {
    if (!list?.length) {
      return 1;
    }
    const maxOrder = Math.max(...list.map((item) => Number(item.Order_Seq) || 0));
    return maxOrder + 1;
  }

  filterSearch() {
    const keyword = (this.service.searchTerm || '').toLowerCase().trim();

    if (!keyword) {
      this.List_Mas_Strategic = [...this.listMasStrategicAll];
      return;
    }

    this.List_Mas_Strategic = this.listMasStrategicAll.filter((row: any) =>
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }

  filterIssueSearch() {
    const keyword = (this.searchIssueTerm || '').toLowerCase().trim();
    if (!keyword) {
      this.List_Mas_Strategic_Issue = [...this.listMasStrategicIssueAll];
      return;
    }
    this.List_Mas_Strategic_Issue = this.listMasStrategicIssueAll.filter((row: any) =>
      Object.values(row).join(' ').toLowerCase().includes(keyword)
    );
  }

  filterSubIssueSearch() {
    const keyword = (this.searchSubIssueTerm || '').toLowerCase().trim();
    if (!keyword) {
      this.List_Mas_Strategic_Sub_Issue = [...this.listMasStrategicSubIssueAll];
      return;
    }
    this.List_Mas_Strategic_Sub_Issue = this.listMasStrategicSubIssueAll.filter((row: any) =>
      Object.values(row).join(' ').toLowerCase().includes(keyword)
    );
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

  get filteredIssueListForSubIssue(): any[] {
    if (this.subIssueModalStrategicId == null || this.subIssueModalStrategicId === '') {
      return [];
    }
    return this.listMasStrategicIssueAll.filter(
      (item) => item.FK_Strategic_Id == this.subIssueModalStrategicId
    );
  }

  onSubIssueStrategicChange() {
    this.Mas_Strategic_Sub_Issue.FK_Strategic_Issues_Id = null;
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

  BtnSave() {


    const model = {
      FUNC_CODE: 'Func-Save_Mas_Strategic',
      Mas_Strategic: this.Mas_Strategic
    };

    this.serviceebud.GatewayGetData(model).subscribe({
      next: (response: any) => {


        if (response.RESULT == null) {
          this.Mas_Strategic = response.Mas_Strategic;
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
    this.Mas_Strategic_Sub_Issue = {
      Issues_Sub_Id: 0,
      FK_Strategic_Issues_Id: null,
      BgYear_Start: '',
      BgYear_End: '',
      Strategic_Sub_Issues_Name: '',
      Strategic_Sub_Issues_Short_Name: '',
      Order_Seq: this.getNextOrderSeq(this.listMasStrategicSubIssueAll)
    };
    this.modalRef = this.modalService.open(modal, {
      size: 'xl',
      backdrop: 'static'
    });
  }

  openEditSubIssueModal(modal: any, item: any) {
    this.isEditModeSubIssue = true;
    this.Mas_Strategic_Sub_Issue = { ...item };
    const parentIssue = this.listMasStrategicIssueAll.find(
      (i) => i.Issues_Id == item.FK_Strategic_Issues_Id
    );
    this.subIssueModalStrategicId = parentIssue?.FK_Strategic_Id ?? null;
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
    if (!this.isEditModeSubIssue) {
      if (this.subIssueModalStrategicId == null || this.subIssueModalStrategicId === '') {
        Swal.fire({
          title: 'กรุณาเลือกข้อมูล',
          text: 'กรุณาเลือกยุทธศาสตร์ชาติด้าน',
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        return;
      }
      if (this.Mas_Strategic_Sub_Issue.FK_Strategic_Issues_Id == null || this.Mas_Strategic_Sub_Issue.FK_Strategic_Issues_Id === '') {
        Swal.fire({
          title: 'กรุณาเลือกข้อมูล',
          text: 'กรุณาเลือกประเด็นยุทธศาสตร์',
          icon: 'warning',
          confirmButtonColor: 'rgb(3, 142, 220)',
          confirmButtonText: 'OK',
        });
        return;
      }
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
