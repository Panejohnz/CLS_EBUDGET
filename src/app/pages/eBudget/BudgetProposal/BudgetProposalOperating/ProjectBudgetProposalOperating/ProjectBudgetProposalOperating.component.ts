import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-project-budget-proposal-operating',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './ProjectBudgetProposalOperating.component.html',
  styles: ``
})
export class ProjectBudgetProposalOperatingComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , public sortService: PaginationService, public servicebud: EbudgetService
    , private authService: AuthenticationService) {
  }
  allData: any[] = [];
  selectedDepartmentName: string | null = null;
  selectedPlanName: string | null = null;
  selectedProductName: string | null = null;
  selectedActivityName: string | null = null;
  departmentFilterOptions: any[] = [];
  planFilterOptions: any[] = [];
  productFilterOptions: any[] = [];
  activityFilterOptions: any[] = [];
  department: any[] = [{ name: 'หน่วยงาน 1' }, { name: 'หน่วยงาน 2' }]
  griddata = [
    {
      department: 'กองแผนงาน',
      plan: 'พัฒนาระบบบริหารจัดการภาครัฐ',
      output: 'ระบบบริหารจัดการข้อมูลกลาง',
      activity: 'พัฒนาระบบ e-Monitoring',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการพัฒนาระบบ e-Budget',
      budget: 2500000,
      Status_Number: 7,
      status_name: 'ไม่ผ่าน'
    },

    {
      department: 'กองคลัง',
      plan: 'เพิ่มประสิทธิภาพการบริหารงบประมาณ',
      output: 'ระบบติดตามงบประมาณ',
      activity: 'ปรับปรุงระบบรายงานงบประมาณ',
      budgetType: 'งบลงทุน',
      project: 'โครงการพัฒนาระบบรายงานงบ',
      budget: 1800000,
      Status_Number: 2,
      status_name: 'รอตรวจสอบ'
    },

    {
      department: 'กองเทคโนโลยีสารสนเทศ',
      plan: 'พัฒนาโครงสร้างพื้นฐานดิจิทัล',
      output: 'ระบบคลาวด์ภาครัฐ',
      activity: 'ติดตั้งระบบ Server กลาง',
      budgetType: 'งบลงทุน',
      project: 'โครงการศูนย์ข้อมูลกลาง',
      budget: 5200000,
      Status_Number: 8,
      status_name: 'อนุมัติแล้ว'
    },

  ];
  modalRef: any;
  total$!: Observable<number>;
  get Total(): number {
    return this.griddata.reduce(
      (sum: number, item: any) =>
        sum + Number(item.Total || item.budget || 0),
      0
    );
  }

  get pagedGriddata(): any[] {
    return this.sortService.changePage(this.griddata);
  }

  get pageStartIndex(): number {
    const total = this.griddata.length;
    if (!total) return 0;

    const pageSize = Number(this.sortService.pageSize) || 1;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, Number(this.sortService.page) || 1), maxPage);
    return (safePage - 1) * pageSize + 1;
  }

  get pageEndIndex(): number {
    const total = this.griddata.length;
    if (!total) return 0;

    const pageSize = Number(this.sortService.pageSize) || 1;
    const maxPage = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, Number(this.sortService.page) || 1), maxPage);
    return Math.min(safePage * pageSize, total);
  }
  project_budget = {
    projectType: '',
    Budget_Id: 0
  };
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  ngOnInit(): void {
    this.sortService.pageSize = this.service.pageSize;
    this.allData = Array.isArray(this.griddata)
      ? this.griddata
      : [];
    this.buildFilterOptions();
    this.applyFilter();
  }
  private getField(item: any, ...keys: string[]): any {
    return keys.map(key => item?.[key]).find(value => value !== null && value !== undefined && value !== '') ?? '';
  }

  private getUniqueFilterOptions(data: any[], ...keys: string[]): any[] {
    const seen = new Set<string>();

    return data
      .map((item: any) => this.getField(item, ...keys).toString().trim())
      .filter((name: string) => {
        if (!name || seen.has(name)) {
          return false;
        }

        seen.add(name);
        return true;
      })
      .map((name: string) => ({ name }));
  }

  private buildFilterOptions() {
    this.updateCascadingFilterOptions();
  }

  private hasFilterOption(options: any[], value: string | null): boolean {
    return !value || options.some(option => option.name === value);
  }

  private filterByDepartment(data: any[]): any[] {
    return this.selectedDepartmentName
      ? data.filter(x => this.getField(x, 'Department_Name', 'department') == this.selectedDepartmentName)
      : data;
  }

  private updateCascadingFilterOptions() {
    this.departmentFilterOptions = this.getUniqueFilterOptions(this.allData, 'Department_Name', 'department');
    if (!this.hasFilterOption(this.departmentFilterOptions, this.selectedDepartmentName)) {
      this.selectedDepartmentName = null;
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    const departmentData = this.filterByDepartment([...this.allData]);

    this.planFilterOptions = this.getUniqueFilterOptions(departmentData, 'Plan_Name', 'plan');
    if (!this.hasFilterOption(this.planFilterOptions, this.selectedPlanName)) {
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    const planData = this.selectedPlanName
      ? departmentData.filter(x => this.getField(x, 'Plan_Name', 'plan') == this.selectedPlanName)
      : departmentData;

    this.productFilterOptions = this.getUniqueFilterOptions(planData, 'Product_Name', 'output');
    if (!this.hasFilterOption(this.productFilterOptions, this.selectedProductName)) {
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    const productData = this.selectedProductName
      ? planData.filter(x => this.getField(x, 'Product_Name', 'output') == this.selectedProductName)
      : planData;

    this.activityFilterOptions = this.getUniqueFilterOptions(productData, 'Activity_Name', 'activity');
    if (!this.hasFilterOption(this.activityFilterOptions, this.selectedActivityName)) {
      this.selectedActivityName = null;
    }
  }

  onDepartmentFilterChange() {
    this.selectedPlanName = null;
    this.selectedProductName = null;
    this.selectedActivityName = null;
    this.applyFilter();
  }

  onPlanFilterChange() {
    this.selectedProductName = null;
    this.selectedActivityName = null;
    this.applyFilter();
  }

  onProductFilterChange() {
    this.selectedActivityName = null;
    this.applyFilter();
  }

  applyFilter() {
    this.sortService.page = 1;

    let data = [...this.allData];
    this.updateCascadingFilterOptions();

    data = this.filterByDepartment(data);

    if (this.selectedPlanName) {
      data = data.filter(x => this.getField(x, 'Plan_Name', 'plan') == this.selectedPlanName);
    }

    if (this.selectedProductName) {
      data = data.filter(x => this.getField(x, 'Product_Name', 'output') == this.selectedProductName);
    }

    if (this.selectedActivityName) {
      data = data.filter(x => this.getField(x, 'Activity_Name', 'activity') == this.selectedActivityName);
    }

    const keyword = (this.service.searchTerm || '').toLowerCase().trim();

    if (keyword) {
      data = data.filter((row: any) =>
        Object.values(row)
          .join(' ')
          .toLowerCase()
          .includes(keyword)
      );
    }

    this.griddata = data;
  }

  filterSearch() {
    this.applyFilter();
  }


  fullModal(modal: any, data: any) {


    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }
  deletePlan(data: any) {

  }

  saveTarget() {

  }
}
