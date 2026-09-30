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
    selector: 'app-confirm-action',
    providers: [GridJsService, DecimalPipe, EbudgetService],
    templateUrl: './ConfirmAction.component.html',
    styles: ``
})
export class ConfirmActionComponent {
    constructor(private modalService: NgbModal, public service: GridJsService
        , public sortService: PaginationService, public serviceebud: EbudgetService
        , private authService: AuthenticationService, private budgetYearService: BudgetYearService) {
    }
  allData: any[] = [];
  model: any = null;
  userSession: any = {};

  get isDepartmentLocked(): boolean {
    return Number(this.userSession?.permissionData?.VIEW_DATA || 0) === 3;
  }

  get lockedDepartmentId(): any {
    const permission = this.userSession?.permissionData || {};
    return permission.Department_id ?? permission.Department_Id ?? permission.department_id ?? null;
  }

  private syncLockedDepartmentFilter(): void {
    if (!this.isDepartmentLocked) return;

    const permission = this.userSession?.permissionData || {};
    const departmentId = this.lockedDepartmentId;
    const matchedDepartment = this.Mas_Department_Lists.find((department: any) =>
      String(department.Department_Id) === String(departmentId)
    );
    this.selectedDepartmentName = matchedDepartment?.Department_Name ?? permission.Department_Name ?? null;
  }
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
    total$!: Observable<number>;
  get Total(): number {
    return this.griddata.reduce(
      (sum: number, item: any) =>
        sum + Number(item.Total || 0),
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
            FUNC_CODE: "FUNC-Get_Budget_Plan_Confirm",
            BgYear: this.currentYear,
            ...(this.isDepartmentLocked && this.lockedDepartmentId != null && {
                Department_Id: this.lockedDepartmentId
            })
        }
        var getData = this.serviceebud.GatewayGetData(model);
        getData.subscribe((response: any) => {
            this.allData = Array.isArray(response.List_Budget_Plan_Main.Data)
                ? response.List_Budget_Plan_Main.Data
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
    if (this.isDepartmentLocked) {
      this.syncLockedDepartmentFilter();
      this.applyFilter();
      return;
    }

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
    this.syncLockedDepartmentFilter();
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

            // ไม่เลือกแถวที่ status = 5
            if (item.Status_Id != 5) {
                item.selected = checked;
            }

        });

    }
    // async CancelConfirm() {
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
    //       FUNC_CODE: "FUNC-Cancel_Confirm_SuperDept_Project_Plan",
    //       List_Project_Plan: payload
    //     };
    //     this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
    //       basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
    //       this.get_data();
    //     });
    //   }
    // }

    async CancelConfirm(data: any) {

        const planId = Number(data?.Plan_Id || data || 0);
        const remarkId = Number(data?.Remark_Id || data?.SignOff_Remark_Id || 0);
        const cancelRemark = (await cancelTracking() || '').trim();

        if (!cancelRemark) {
            // basicAlert('warning', 'กรุณาระบุหมายเหตุ', '');
            return;
        }

        const payload = [
            {
                Plan_Id: planId
            }
        ];
        const SignOff_Remark = {
            Remark_Id: remarkId,
            Remark: cancelRemark,
            Status_Id: 8,
            Fk_Plan_Id: planId
        };

        let model = {
            FUNC_CODE: "FUNC-Cancel_Confirm_Budget_Plan",
            List_Budget_Plan: payload,
            SignOff_Remark: SignOff_Remark
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

            basicAlert('success', 'ยกเลิกการยืนยันแผนปฎิบัติการแล้ว', '');

            this.get_data();

        });

    }

    async Confirm() {

        const userConfirmed = await confirmAlert('info', 'ต้องการยืนยันข้อมูลแผนปฎิบัติการ ?', '');

        if (!userConfirmed) return;

        const selectedRows = this.griddata.filter(x => x.selected);

        if (selectedRows.length === 0) {
            basicAlert('warning', 'กรุณาเลือกรายการ', '');
            return;
        }

        const payload = selectedRows.map(x => ({
            Plan_Id: x.Plan_Id
        }));

        let model = {
            FUNC_CODE: "FUNC-Confirm_Budget_Plan",
            List_Budget_Plan: payload
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
            basicAlert('success', 'บันทึกข้อมูลแผนปฎิบัติการแล้ว', '');
            this.get_data(); // reload
        });

    }

    fullModal(modal: any, data: any) {
        if (!data?.Plan_Id) return;

        this.serviceebud.GatewayGetData({
          FUNC_CODE: 'FUNC-GET_BUDGET_PLAN_BY_ID',
          Plan_Id: data.Plan_Id,
          ...(data?.FK_Project_Plan_Id && { Project_Id: data.FK_Project_Plan_Id })
        }).subscribe((res: any) => {
          this.model = {
            Budget_Type: 1,
            Budget_Plan: { ...(res?.Budget_Plan || {}), Status_Id: res?.Budget_Plan?.Status_Id ?? data.Status_Id ?? 0 },
            Status_Id: res?.Budget_Plan?.Status_Id ?? data.Status_Id ?? 0,
            Budget_Request_Detail_Item: res?.Budget_Plan_Detail_Items || [],
            Budget_Plan_Detail: res?.Budget_Plan_Details || {},
            Project_Plan: res?.Project_Plan || {},
            Project_Detail: res?.Project_Detail || {},
            Project_Objective: res?.Project_Objective || [],
            Project_Plan_Level1: res?.Project_Plan_Level1 || [],
            Project_Plan_Level1_Sub: res?.Project_Plan_Level1_Sub || [],
            Project_Plan_Level2: res?.Project_Plan_Level2 || {},
            Project_Plan_Level3: res?.Project_Plan_Level3 || {},
            Project_Coordinator: res?.Project_Coordinator || [],
            Project_Output: res?.Project_Output || [],
            Project_Outcome: res?.Project_Outcome || [],
            Project_Expected: res?.Project_Expected || [],
            Project_TargetGroup: res?.Project_TargetGroup || [],
            selectedDepartment: res?.Project_Plan?.Department_Id,
            projectType: res?.Project_Plan?.Fk_Expense_Type,
            selectedPlan: res?.Project_Plan?.Fk_Plan_Id,
            selectedProduct: res?.Project_Plan?.Fk_Product_Id,
            selectedActivity: res?.Project_Plan?.Fk_Activity_Id,
            selectedBudget: res?.Project_Plan?.Fk_Budget_Type,
            selectedExpenseTypeId: res?.Budget_Plan?.Fk_Expense_List ?? data?.Fk_Expense_List,
            Project_Id: data?.FK_Project_Plan_Id || data?.Project_Id,
            activities: this.mapPlanDetails(res?.Project_Plan_Detail || [], res?.Project_Plan_Detail_Item || [])
          };

          this.modalRef = this.modalService.open(modal, {
            backdrop: 'static',
            windowClass: 'full-screen-modal'
          });
        });
    }

    private mapPlanDetails(details: any[], items: any[]): any[] {
      const monthNames = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];
      const create = (detail: any): any => ({
        id: Number(detail?.Project_Detail_Id), Project_Detail_Id: Number(detail?.Project_Detail_Id),
        name: detail?.Activity_Name, owner: detail?.Responsible,
        noBudget: Number(detail?.Used_BG || 0) === 0, consult: Number(detail?.Is_Consult || 0) === 1,
        consultSelf: Number(detail?.Operation1 || 0) === 1, consultHire: Number(detail?.Operation2 || 0) === 1,
        quarters: [0, 1, 2, 3].map(q => ({ quarter: q + 1, months: (detail?.Months || []).slice(q * 3, q * 3 + 3)
          .map((m: any, i: number) => ({ month: monthNames[q * 3 + i], selected: m.Selected, budget: m.Budget })) })),
        sumAmount: Number(detail?.Sum_Amount ?? detail?.Sum_Amount_Total ?? 0), otherExpenses: [], multiplierTotal: 0, _edited: false,
        SubActivities: (detail?.SubActivities || []).map((child: any) => create(child))
      });
      const activities = (Array.isArray(details) ? details : []).map(create);
      const byId = new Map<number, any>();
      const visit = (list: any[]) => list.forEach(activity => { byId.set(Number(activity.id), activity); visit(activity.SubActivities || []); });
      visit(activities);
      (Array.isArray(items) ? items : []).forEach((item: any) => {
        const activity = byId.get(Number(item?.Fk_Project_Detail_Id));
        if (!activity) return;
        const total = Number(item?.Total || 0);
        activity.otherExpenses.push({ id: item.Project_Item_Id, name: item.Expense_Name, times: item.Times, people: item.People, rate: item.Rate, total, input3: item.input3, input4: item.input4, input5: item.input5 });
        activity.multiplierTotal += total;
      });
      return activities;
    }
    deletePlan(data: any) {

    }
}
