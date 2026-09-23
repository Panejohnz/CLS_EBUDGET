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
    selector: 'app-confirm-budget-proposal',
    providers: [GridJsService, DecimalPipe, EbudgetService],
    templateUrl: './ConfirmBudgetProposal.component.html',
    styles: ``
})
export class ConfirmBudgetProposalComponent {
    constructor(private modalService: NgbModal, public service: GridJsService
        , public sortService: PaginationService, public serviceebud: EbudgetService
        , private authService: AuthenticationService, private budgetYearService: BudgetYearService) {
    }
  allData: any[] = [];
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
    model: any;
    selectedDetailRow: any = null;
    project_budget = {
        projectType: '',
        Budget_Id: 0
    };
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
            FUNC_CODE: "FUNC-Get_Budget_Request_Confirm",
            BgYear: this.currentYear,
            ...(this.isDepartmentLocked && this.lockedDepartmentId != null && {
                Department_Id: this.lockedDepartmentId
            })
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

        const requestId = Number(data?.Request_Id || data || 0);
        const remarkId = Number(data?.Remark_Id || data?.SignOff_Remark_Id || 0);
        const cancelRemark = (await cancelTracking() || '').trim();

        if (!cancelRemark) {
            // basicAlert('warning', 'กรุณาระบุหมายเหตุ', '');
            return;
        }

        const payload = [
            {
                Request_Id: requestId
            }
        ];
        const SignOff_Remark = {
            Remark_Id: remarkId,
            Remark: cancelRemark,
            Status_Id: 8,
            Fk_Request_Id: requestId,
            Fk_Plan_Id: requestId
        };

        let model = {
            FUNC_CODE: "FUNC-Cancel_Confirm_Budget_Request",
            List_Budget_Request: payload,
            SignOff_Remark: SignOff_Remark
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

            basicAlert('success', 'ยกเลิกการยืนยันแล้ว', '');

            this.get_data();

        });

    }

    async Confirm() {

        const userConfirmed = await confirmAlert('info', 'ต้องการยืนยันข้อมูลโครงการ ?', '');

        if (!userConfirmed) return;

        const selectedRows = this.griddata.filter(x => x.selected);

        if (selectedRows.length === 0) {
            basicAlert('warning', 'กรุณาเลือกรายการ', '');
            return;
        }

        const payload = selectedRows.map(x => ({
            Request_Id: x.Request_Id
        }));

        let model = {
            FUNC_CODE: "FUNC-Confirm_Budget_Request",
            List_Budget_Request: payload
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
            basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
            this.get_data(); // reload
        });

    }

    fullModal(modal: any, data: any) {
        if (!data?.Request_Id) {
            return;
        }

        this.model = null;
        this.selectedDetailRow = data;

        const model = {
            FUNC_CODE: "FUNC-GET_BUDGET_REQUEST_BY_ID",
            Request_Id: data.Request_Id,
            Project_Id: data.FK_Project_Plan_Id || data.FK_Project_Plan_Id_copy || 0
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {
            this.model = {
                newdata: false,
                Budget_Type: 1,
                Budget_Request: {
                    ...(res.Budget_Request || {}),
                    Status_Id: res.Budget_Request?.Status_Id ?? data.Status_Id ?? 0
                },
                Status_Id: res.Budget_Request?.Status_Id ?? data.Status_Id ?? 0,
                Budget_Request_Attach_File: this.mapFileUploadList(
                    res.FILE_UPLOAD_List || res.Budget_Request_Attach_File || [],
                    res.Budget_Request || {}
                ),
                Budget_Request_Detail_Item: this.toArray(res.Budget_Request_Detail_Item),
                Budget_Request_Detail: this.toArray(res.Budget_Request_Detail),
                Project_Plan: res.Project_Plan || {},
                Project_Detail: res.Project_Detail || {},
                Project_Objective: this.toArray(res.Project_Objective),
                Project_Plan_Level1: this.toArray(res.Project_Plan_Level1),
                Project_Plan_Level1_Sub: this.toArray(res.Project_Plan_Level1_Sub),
                Project_Cabinet: this.toArray(res.Project_Cabinet),
                Project_Security: this.toArray(res.Project_Security),
                Project_Plan_Level2: res.Project_Plan_Level2 || {},
                Project_Plan_Level3: res.Project_Plan_Level3 || {},
                Project_Coordinator: this.toArray(res.Project_Coordinator),
                selectedDepartment: res.Project_Plan?.Department_Id,
                projectType: res.Project_Plan?.Fk_Expense_Type,
                selectedPlan: res.Project_Plan?.Fk_Plan_Id,
                selectedProduct: res.Project_Plan?.Fk_Product_Id,
                selectedActivity: res.Project_Plan?.Fk_Activity_Id,
                selectedBudget: res.Project_Plan?.Fk_Budget_Type,
                Project_Id: data.Project_Id,
                Project_Output: this.toArray(res.Project_Output),
                Project_Outcome: this.toArray(res.Project_Outcome),
                Project_Expected: this.toArray(res.Project_Expected),
                Project_TargetGroup: this.toArray(res.Project_TargetGroup),
                FILE_UPLOAD_List: this.toArray(res.FILE_UPLOAD_List)
            };

            const details = this.toArray(res.Project_Plan_Detail);
            const items = this.toArray(res.Project_Plan_Detail_Item);

            details.forEach((d: any) => {
                d.Project_Detail_Id = Number(d.Project_Detail_Id);
                d.Parent_Id = d.Parent_Id ? Number(d.Parent_Id) : null;
            });

            const activities = this.mapPlanDetail(details);
            this.mapItems(items, activities);
            this.model.activities = activities;

            this.resolveExpenseName(() => this.openDetailModal(modal));
        }, () => {
            basicAlert('error', 'ไม่สามารถโหลดรายละเอียดโครงการได้', '');
        });
    }

    private toArray(value: any): any[] {
        if (Array.isArray(value)) return value;
        if (Array.isArray(value?.Data)) return value.Data;
        if (value && typeof value === 'object') return Object.values(value);
        return [];
    }

    private openDetailModal(modal: any): void {
        this.modalRef = this.modalService.open(modal, {
            backdrop: 'static',
            windowClass: 'full-screen-modal'
        });
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

            if (expense?.Expense_Name) {
                this.model.Budget_Request.Expense_Name = expense.Expense_Name;
            }
            done();
        }, () => done());
    }

    mapItems(items: any[], activities: any[]) {
        const map: any = {};

        const walk = (list: any[]) => {
            list.forEach(a => {
                map[Number(a.id)] = a;

                if (a.SubActivities?.length) {
                    walk(a.SubActivities);
                }
            });
        };

        walk(activities);

        Object.values(map).forEach((a: any) => {
            a.otherExpenses = [];
            a.multiplierTotal = 0;
        });

        this.toArray(items).forEach(i => {
            const target = map[Number(i.Fk_Project_Detail_Id)];

            if (target) {
                target.otherExpenses.push({
                    id: i.Project_Item_Id,
                    name: i.Expense_Name,
                    times: i.Times,
                    people: i.People,
                    rate: i.Rate,
                    total: i.Total,
                    input3: i.input3,
                    input4: i.input4,
                    input5: i.input5
                });

                target.multiplierTotal += (i.Total || 0);
            }
        });
    }

    mapPlanDetail(data: any[]) {
        return this.toArray(data).map(x => ({
            id: Number(x.Project_Detail_Id),
            name: x.Activity_Name,
            owner: x.Responsible,
            noBudget: x.Used_BG === 0,
            consult: x.Is_Consult === 1,
            Operation1: this.getOperationValue(x, 'Operation1'),
            Operation2: this.getOperationValue(x, 'Operation2'),
            consultSelf: this.getOperationValue(x, 'Operation1') === 1,
            consultHire: this.getOperationValue(x, 'Operation2') === 1,
            quarters: this.convertMonths(x.Months || []),
            sumAmount: Number(x.Sum_Amount ?? x.Sum_Amount_Total ?? 0),
            _edited: false,
            otherExpenses: [],
            multiplierTotal: 0,
            SubActivities: this.toArray(x.SubActivities).map((s: any) => ({
                id: Number(s.Project_Detail_Id),
                Project_Detail_Id: Number(s.Project_Detail_Id),
                name: s.Activity_Name,
                owner: s.Responsible,
                noBudget: s.Used_BG === 0,
                consult: s.Is_Consult === 1,
                Operation1: this.getOperationValue(s, 'Operation1'),
                Operation2: this.getOperationValue(s, 'Operation2'),
                consultSelf: this.getOperationValue(s, 'Operation1') === 1,
                consultHire: this.getOperationValue(s, 'Operation2') === 1,
                quarters: this.convertMonths(s.Months || []),
                sumAmount: Number(s.Sum_Amount) || 0,
                _edited: false,
                otherExpenses: [],
                multiplierTotal: 0
            }))
        }));
    }

    private getOperationValue(item: any, field: 'Operation1' | 'Operation2'): number {
        const upperField = field.toUpperCase();
        const lowerField = field.charAt(0).toLowerCase() + field.slice(1);

        return Number(item?.[field] ?? item?.[upperField] ?? item?.[lowerField] ?? 0);
    }

    convertMonths(months: any[]) {
        const MONTHS = [
            'ต.ค.', 'พ.ย.', 'ธ.ค.',
            'ม.ค.', 'ก.พ.', 'มี.ค.',
            'เม.ย.', 'พ.ค.', 'มิ.ย.',
            'ก.ค.', 'ส.ค.', 'ก.ย.'
        ];

        const mapped = MONTHS.map((month, i) => ({
            month,
            selected: this.toArray(months)[i]?.Selected,
            budget: this.toArray(months)[i]?.Budget
        }));

        return [
            { quarter: 1, months: mapped.slice(0, 3) },
            { quarter: 2, months: mapped.slice(3, 6) },
            { quarter: 3, months: mapped.slice(6, 9) },
            { quarter: 4, months: mapped.slice(9, 12) }
        ];
    }

    private mapFileUploadList(fileUploadList: any[], budgetRequest: any): any[] {
        if (!Array.isArray(fileUploadList)) {
            return [];
        }

        const requestId = budgetRequest?.Request_Id || 0;
        const requestExpenseId = budgetRequest?.Fk_Expense_List || 0;

        return fileUploadList.map((item: any) => ({
            IDA: item.IDA || item.Ida || 0,
            TYPE_ID: item.TYPE_ID || item.Type_Id || 0,
            FK_IDA: item.FK_IDA || item.Fk_Ida || requestId,
            Client_Attachment_Id: item.CLIENT_ATTACHMENT_ID || item.Client_Attachment_Id || '',
            Ref_Module: item.REF_MODULE || item.Ref_Module || 'BUDGET_REQUEST',
            Ref_Level: item.REF_LEVEL || item.Ref_Level || 'EXPENSE',
            Request_Id: item.FK_REQUEST_ID || item.Fk_Request_Id || item.Request_Id || requestId,
            Fk_Expense_Id: item.FK_EXPENSE_ID || item.Fk_Expense_Id || item.Expense_Id || requestExpenseId,
            Fk_Request_Detail_Item_Id: item.FK_REQUEST_DETAIL_ITEM_ID || item.Fk_Request_Detail_Item_Id || 0,
            Row_Guid: item.ROW_GUID || item.Row_Guid || null,
            File_Name: item.File_Name || item.FILE_NAME || item.NAME_FAKE || item.Name_Fake || item.GEN_FILE || item.Gen_File || '',
            File_Size: item.FILE_SIZE || item.File_Size || 0,
            File_Type: item.FILE_TYPE || item.File_Type || '',
            NAME_FAKE: item.File_Name || item.FILE_NAME || item.NAME_FAKE || item.Name_Fake || '',
            NAME_REAL: item.NAME_REAL || item.Name_Real || item.GEN_FILE || item.Gen_File || '',
            GEN_FILE: item.GEN_FILE || item.Gen_File || '',
            PATH_FILE: item.PATH_FILE || item.Path_File || '',
            File_Url: item.File_Url || item.FILE_URL || item.View_Url || item.VIEW_URL || item.URL || '',
            FILE_DATE: item.FILE_DATE || item.File_Date || null,
            Active: item.Active ?? item.ACTIVE ?? 1,
            Is_New: false,
            Pending_Delete: false,
            file: null
        }));
    }
    deletePlan(data: any) {

    }
}
