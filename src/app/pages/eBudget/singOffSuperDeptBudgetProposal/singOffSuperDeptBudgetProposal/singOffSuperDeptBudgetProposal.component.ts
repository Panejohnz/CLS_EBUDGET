import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import { get } from 'lodash';
import Swal from 'sweetalert2';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

@Component({
    selector: 'app-signoff-super-dept-budget-proposal',
    providers: [GridJsService, DecimalPipe, EbudgetService],
    templateUrl: './singOffSuperDeptBudgetProposal.component.html'
})
export class SignoffSuperDeptBudgetProposalComponent {
    constructor(private modalService: NgbModal, public service: GridJsService
        , public sortService: PaginationService, public serviceebud: EbudgetService
        , private authService: AuthenticationService, private budgetYearService: BudgetYearService) {
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
  Mas_Department_Lists: any[] = [];
  Mas_Plan_Lists: any[] = [];
  Mas_Product_Lists: any[] = [];
  Mas_Activity_Lists: any[] = [];

    griddata: any[] = [
        {
            selected: false,
            department: 'สำนักยุทธศาสตร์',
            plan: 'แผนพัฒนาระบบสารสนเทศ',
            output: 'ระบบบริหารจัดการข้อมูล',
            activity: 'พัฒนาระบบ Dashboard',
            budgetType: 'งบดำเนินงาน',
            project: 'ระบบข้อมูลกลาง',
            budget: 250000,
            Status_Number: 2,
            status_name: 'รออนุมัติ'
        },
        {
            selected: false,
            department: 'กองแผนงาน',
            plan: 'แผนพัฒนาบุคลากร',
            output: 'อบรมเพิ่มทักษะ',
            activity: 'อบรม Data Analytics',
            budgetType: 'งบลงทุน',
            project: 'พัฒนาศักยภาพบุคลากร',
            budget: 120000,
            Status_Number: 8,
            status_name: 'อนุมัติแล้ว'
        }
    ];
    modalRef: any;
    model: any;
    selectedDetailRow: any = null;
    detailTab = 1;

    get isProjectPlanningExpense(): boolean {
        const request = this.model?.Budget_Request || {};
        const project = this.model?.Project_Plan || {};
        const expenseId = Number(request.Fk_Expense_List || project.Fk_Expense_List || 0);
        return [64, 70, 73, 74, 75].includes(expenseId);
    }
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

    emptyplan: any = {
        Plan_Id: 0,
        Plan_Name: '',
        Active: 1
    };
    currentYear: any
    userSession: any = {};

    get isDepartmentLocked(): boolean { return Number(this.userSession?.permissionData?.VIEW_DATA || 0) === 3; }
    get lockedDepartmentId(): any {
        const permission = this.userSession?.permissionData || {};
        return permission.Department_id ?? permission.Department_Id ?? permission.department_id ?? null;
    }
    private syncLockedDepartmentFilter(): void {
        if (!this.isDepartmentLocked) return;
        const permission = this.userSession?.permissionData || {};
        const department = this.Mas_Department_Lists.find((item: any) => String(item.Department_Id) === String(this.lockedDepartmentId));
        this.selectedDepartmentName = department?.Department_Name ?? permission.Department_Name ?? null;
    }
    ngOnInit(): void {
        this.userSession = JSON.parse(localStorage.getItem('userSession') || '{}');
    this.sortService.pageSize = this.service.pageSize;

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
        let model = {
            FUNC_CODE: "FUNC-Get_Budget_Request_SingOff_SuperDeptBudgetProposal",
            BgYear: this.currentYear,
            ...(this.isDepartmentLocked && this.lockedDepartmentId != null && { Department_Id: this.lockedDepartmentId })
        }
        var getData = this.serviceebud.GatewayGetData(model);
        getData.subscribe((response: any) => {
            this.allData = Array.isArray(response.List_Budget_Request_Main.Data)
                ? response.List_Budget_Request_Main.Data
                : [];
            this.loadMasSearchOptions();

        })
    }
  private loadMasSearchOptions() {
    const model = {
      FUNC_CODE: "FUNC-GET_Mas_Search",
      BgYear: this.currentYear
    };

    this.serviceebud.GatewayGetData(model).subscribe((response: any) => {
      this.Mas_Department_Lists = Array.isArray(response.Mas_Department_Lists)
        ? response.Mas_Department_Lists
        : [];
      this.Mas_Plan_Lists = Array.isArray(response.Mas_Plan_Lists)
        ? response.Mas_Plan_Lists
        : [];
      this.Mas_Product_Lists = Array.isArray(response.Mas_Product_Lists)
        ? response.Mas_Product_Lists
        : [];
      this.Mas_Activity_Lists = Array.isArray(response.Mas_Activity_Lists)
        ? response.Mas_Activity_Lists
        : [];

            this.syncLockedDepartmentFilter();
            this.buildFilterOptions();
      this.applyFilter();
    });
  }

  private getUniqueFilterOptions(data: any[], key: string): any[] {
    const seen = new Set<string>();

    return data
      .map((item: any) => (item?.[key] || '').toString().trim())
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
      ? data.filter(x => x.Department_Name == this.selectedDepartmentName)
      : data;
  }

  private updateCascadingFilterOptions() {
    this.departmentFilterOptions = this.getUniqueFilterOptions(this.Mas_Department_Lists, 'Department_Name');
    if (!this.hasFilterOption(this.departmentFilterOptions, this.selectedDepartmentName)) {
      this.selectedDepartmentName = null;
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    this.planFilterOptions = this.getUniqueFilterOptions(this.Mas_Plan_Lists, 'Plan_Name');
    if (!this.hasFilterOption(this.planFilterOptions, this.selectedPlanName)) {
      this.selectedPlanName = null;
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    this.productFilterOptions = this.getUniqueFilterOptions(this.Mas_Product_Lists, 'Product_Name');
    if (!this.hasFilterOption(this.productFilterOptions, this.selectedProductName)) {
      this.selectedProductName = null;
      this.selectedActivityName = null;
    }

    this.activityFilterOptions = this.getUniqueFilterOptions(this.Mas_Activity_Lists, 'Activity_Name');
    if (!this.hasFilterOption(this.activityFilterOptions, this.selectedActivityName)) {
      this.selectedActivityName = null;
    }
  }

    onDepartmentFilterChange() {
        if (this.isDepartmentLocked) { this.syncLockedDepartmentFilter(); this.applyFilter(); return; }
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
        this.syncLockedDepartmentFilter();

    let data = [...this.allData];
    this.updateCascadingFilterOptions();

    data = this.filterByDepartment(data);

    if (this.selectedPlanName) {
      data = data.filter(x => x.Plan_Name == this.selectedPlanName);
    }

    if (this.selectedProductName) {
      data = data.filter(x => x.Product_Name == this.selectedProductName);
    }

    if (this.selectedActivityName) {
      data = data.filter(x => x.Activity_Name == this.selectedActivityName);
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

        

    toggleAll(event: any) {

        const checked = event.target.checked;

        this.griddata.forEach((item: any) => {

            // ไม่เลือกแถวที่ status = 6
            if (item.Status_Id != 6) {
                item.selected = checked;
            }

        });

    }
    // toggleAll(event: any) {
    //   const checked = event.target.checked;

    //   this.griddata.forEach(item => {
    //     item.selected = checked;
    //   });
    // }
    // async CancelSignOff() {
    //   const userConfirmed = await confirmAlert('info', 'ต้องการยกเลิกการยืนยันโครงการ ?', '');

    //   if (!userConfirmed) return;

    //   const selectedRows = this.griddata.filter(x => x.selected);

    //   if (selectedRows.length === 0) {
    //     basicAlert('warning', 'กรุณาเลือกรายการ', '');
    //     return;
    //   }

    //   if (userConfirmed) {
    //     const payload = selectedRows.map(x => ({
    //       Project_Id: x.Project_Id,
    //       Status_Number: 8
    //     }));

    //     let model = {
    //       FUNC_CODE: "FUNC-Cancel_SignOff_SuperDept_Project_Plan",
    //       List_Project_Plan: payload
    //     };
    //     this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
    //       basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
    //       this.get_data();
    //     });
    //   }
    // }

    async CancelSignOff(Request_Id: number) {

        const userConfirmed = await confirmAlert(
            'info',
            'ต้องการยกเลิก Sign Off ข้อมูลคำของบประมาณ ?',
            ''
        );

        if (!userConfirmed) return;

        const cancelRemark = (await cancelTracking() || '').trim();

        // if (!cancelRemark) {
        //     // basicAlert('warning', 'กรุณาระบุหมายเหตุ', '');
        //     return;
        // }

        const payload = [
            {
                Request_Id: Request_Id,
                Status_Number: 8
            }
        ];
        const SignOff_Remark = {
            Remark_Id: 0,
            Remark: cancelRemark,
            Status_Id: 8,
            Fk_Request_Id: Request_Id,
            Fk_Plan_Id: Request_Id
        };

        let model = {
            FUNC_CODE: "FUNC-Cancel_SingOff_SuperDeptBudgetProposal_Budget_Request",
            List_Budget_Request: payload,
            SignOff_Remark: SignOff_Remark
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

            basicAlert('success', 'ยกเลิกการ Sign Off ข้อมูลคำของบประมาณแล้ว', '');

            this.get_data();

        });

    }
    async SignOff() {

        const userConfirmed = await confirmAlert('info', 'ต้องการ Sign Off ข้อมูลคำของบประมาณ ?', '');

        if (!userConfirmed) return;

        const selectedRows = this.griddata.filter(x => x.selected);

        if (selectedRows.length === 0) {
            basicAlert('warning', 'กรุณาเลือกรายการ', '');
            return;
        }

        const payload = selectedRows.map(x => ({
            Request_Id: x.Request_Id,
            Status_Number: 8
        }));

        let model = {
            FUNC_CODE: "FUNC-SingOff_SuperDeptBudgetProposal_Budget_Request",
            List_Budget_Request: payload
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
            basicAlert('success', 'บันทึก Sign Off ข้อมูลคำของบประมาณแล้ว', '');
            this.get_data(); // reload
        });

    }

    fullModal(modal: any, data: any) {
        if (!data?.Request_Id) return;

        this.model = null;
        this.selectedDetailRow = data;
        this.detailTab = 1;
        this.serviceebud.GatewayGetData({
            FUNC_CODE: 'FUNC-GET_BUDGET_REQUEST_BY_ID',
            Request_Id: data.Request_Id,
            Project_Id: data.FK_Project_Plan_Id || data.FK_Project_Plan_Id_copy || 0
        }).subscribe((response: any) => {
            this.model = {
                Budget_Request: response.Budget_Request || {},
                Budget_Request_Detail_Item: this.toArray(response.Budget_Request_Detail_Item),
                Budget_Request_Detail: this.toArray(response.Budget_Request_Detail),
                Project_Plan: response.Project_Plan || {},
                Project_Detail: response.Project_Detail || {},
                Project_Objective: this.toArray(response.Project_Objective),
                Project_Plan_Level1: this.toArray(response.Project_Plan_Level1),
                Project_Plan_Level1_Sub: this.toArray(response.Project_Plan_Level1_Sub),
                Project_Cabinet: this.toArray(response.Project_Cabinet),
                Project_Security: this.toArray(response.Project_Security),
                Project_Plan_Level2: response.Project_Plan_Level2 || {},
                Project_Plan_Level3: response.Project_Plan_Level3 || {},
                Project_Coordinator: this.toArray(response.Project_Coordinator),
                Project_Output: this.toArray(response.Project_Output),
                Project_Outcome: this.toArray(response.Project_Outcome),
                Project_Expected: this.toArray(response.Project_Expected),
                Project_TargetGroup: this.toArray(response.Project_TargetGroup)
            };
            this.model.selectedDepartment = this.model.Project_Plan?.Department_Id;
            this.model.projectType = this.model.Project_Plan?.Fk_Expense_List;
            this.model.selectedPlan = this.model.Project_Plan?.Fk_Plan_Id;
            this.model.selectedProduct = this.model.Project_Plan?.Fk_Product_Id;
            this.model.selectedActivity = this.model.Project_Plan?.Fk_Activity_Id;
            this.model.selectedBudget = this.model.Project_Plan?.Fk_Budget_Type;
            this.model.activities = this.mapPlanDetail(this.toArray(response.Project_Plan_Detail));
            this.mapItems(this.toArray(response.Project_Plan_Detail_Item), this.model.activities);
            this.resolveExpenseName(() => this.openDetailModal(modal));
        }, () => {
            basicAlert('error', 'ไม่สามารถโหลดรายละเอียดคำของบประมาณได้', '');
        });
    }

    private toArray(value: any): any[] {
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.Data)) return value.Data;
        if (value && typeof value === 'object') return Object.values(value);
        return [];
    }

    private mapPlanDetail(details: any[]): any[] {
        return details.map((detail: any) => ({
            id: Number(detail.Project_Detail_Id),
            Project_Detail_Id: Number(detail.Project_Detail_Id),
            name: detail.Activity_Name,
            owner: detail.Responsible,
            noBudget: Number(detail.Used_BG) === 0,
            consult: Number(detail.Is_Consult) === 1,
            Operation1: Number(detail.Operation1 || 0),
            Operation2: Number(detail.Operation2 || 0),
            consultSelf: Number(detail.Operation1 || 0) === 1,
            consultHire: Number(detail.Operation2 || 0) === 1,
            quarters: this.convertMonths(this.toArray(detail.Months)),
            sumAmount: Number(detail.Sum_Amount ?? detail.Sum_Amount_Total ?? 0),
            otherExpenses: [],
            multiplierTotal: 0,
            SubActivities: this.mapPlanDetail(this.toArray(detail.SubActivities))
        }));
    }

    private mapItems(items: any[], activities: any[]): void {
        const allActivities: any[] = [];
        const flatten = (list: any[]) => list.forEach(activity => {
            allActivities.push(activity);
            flatten(activity.SubActivities || []);
        });
        flatten(activities);

        items.forEach((item: any) => {
            const activity = allActivities.find(entry =>
                Number(entry.id) === Number(item.Fk_Project_Detail_Id));
            if (!activity) return;

            const total = Number(item.Total || 0);
            activity.otherExpenses.push({
                id: item.Project_Item_Id,
                name: item.Expense_Name,
                times: item.Times,
                people: item.People,
                rate: item.Rate,
                total
            });
            activity.multiplierTotal += total;
        });
    }

    private convertMonths(months: any[]): any[] {
        const labels = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
        const mapped = months.map((month: any, index: number) => ({
            month: labels[index],
            selected: month.Selected,
            budget: month.Budget
        }));
        return [0, 1, 2, 3].map(index => ({
            quarter: index + 1,
            months: mapped.slice(index * 3, index * 3 + 3)
        }));
    }

    private openDetailModal(modal: any): void {
        this.modalRef = this.modalService.open(modal, {
            backdrop: 'static',
            windowClass: 'full-screen-modal'
        });

        this.modalRef.result.then(
            () => this.closeDetailModal(),
            () => this.closeDetailModal()
        );
    }

    private closeDetailModal(): void {
        this.model = null;
        this.selectedDetailRow = null;
        this.get_data();
    }

    private resolveExpenseName(done: () => void): void {
        const request = this.model?.Budget_Request || {};
        const existingName = request.Expense_Name || request.Expense_List ||
            this.selectedDetailRow?.Expense_Name || this.selectedDetailRow?.Expense_List;
        if (existingName || !request.Fk_Expense_List) {
            done();
            return;
        }

        this.serviceebud.GatewayGetData({
            FUNC_CODE: 'FUNC-GET_Mas_Expense_List',
            Mas_Expense_List: { Fk_Expense_Type_Id: 0 }
        }).subscribe((response: any) => {
            const expense = this.toArray(response?.Mas_Expense_Lists)
                .find((item: any) => String(item.Expense_Id) === String(request.Fk_Expense_List));
            if (expense?.Expense_Name) request.Expense_Name = expense.Expense_Name;
            done();
        }, () => done());
    }
    deletePlan(data: any) {

    }
}
