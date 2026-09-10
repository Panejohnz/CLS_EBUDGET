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
import { BudgetYearService } from 'src/app/core/services/budget-year.service';


type AllocField = 'alloc1' | 'alloc2' | 'alloc3';
interface BudgetNode {
  name: string;
  level: number;
  expanded?: boolean;
  children?: BudgetNode[];

  budget: number;   // คำของบ (fix)
  alloc1: number;
  alloc2: number;
  alloc3: number;
}
@Component({
  selector: 'app-examine',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './examine.component.html',
  styles: [`
    .readonly-select {
      pointer-events: none;
      background-color: var(--vz-secondary-bg, #e9ecef);
      color: #6c757d;
      opacity: 1;
    }
  `]
})
export class ExamineComponent {
  private readonly directAllocationExpenseIds = new Set<number>([64, 70, 73, 74, 75]);
  private readonly equipmentDetailIds = new Set<number>([
    67, 68, 69, 70, 456, 488, 506, 535, 550, 622, 624, 627, 630,
    638, 643, 648, 657, 673, 674, 675, 678, 681, 684, 700, 701,
    702, 703, 704
  ]);
  constructor(
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService
  ) { }

  // =====================================
  // VARIABLE
  // =====================================

  table_display: boolean = false;

  department: any[] = [];

  allData: any[] = [];

  groupData: any[] = [];

  toggleExpenseDetails(item: any): void {
    if (this.isDirectAllocation(item)) return;
    item.detailsExpanded = !item.detailsExpanded;
    if (!item.detailsExpanded || item.detailsLoaded || item.detailsLoading) return;

    const planId = Number(item.Plan_Id || 0);
    item.detailsLoading = true;
    item.detailsError = false;
    this.servicebud.GatewayGetData({
      FUNC_CODE: planId ? 'FUNC-GET_BUDGET_PLAN_BY_ID' : 'FUNC-GET_BUDGET_REQUEST_BY_ID',
      Plan_Id: planId,
      Request_Id: planId ? 0 : Number(item.FK_Request_Id || 0),
      Project_Id: 0
    }).subscribe({
      next: (response: any) => {
        item.detailsLoading = false;
        if (response.RESULT != null) {
          item.detailsError = true;
          return;
        }

        const source = planId ? response.Budget_Plan_Detail_Items : response.Budget_Request_Detail_Item;
        const rows = Array.isArray(source) ? source : (source?.Data || []);
        item.expenseDetails = rows.filter((detail: any) =>
          (!planId || Number(detail.Fk_Expense_Id || 0) === Number(item.Fk_Expense_List || 0)) &&
          (!planId || Number(detail.Fk_Budget_Plan) === planId) &&
          detail.Active !== false && Number(detail.Active ?? 1) !== 0
        );
        item.detailsLoaded = true;
        this.appendEquipmentRequestDetails(item);
      },
      error: () => {
        item.detailsLoading = false;
        item.detailsError = true;
      }
    });
  }

  isDirectAllocation(item: any): boolean {
    return this.directAllocationExpenseIds.has(Number(item?.Fk_Expense_List || 0));
  }

  private appendEquipmentRequestDetails(item: any): void {
    const requestId = Number(item.FK_Request_Id || 0);
    if (!requestId) return;
    this.servicebud.GatewayGetData({
      FUNC_CODE: 'FUNC-GET_BUDGET_REQUEST_BY_ID', Request_Id: requestId, Plan_Id: 0, Project_Id: 0
    }).subscribe((response: any) => {
      const source = response?.Budget_Request_Detail_Item;
      const details = (Array.isArray(source) ? source : source?.Data || []).filter((detail: any) => {
        const detailId = Number(detail.Fk_Expense_Detail_Id ?? detail.Fk_Expense_Detial_Id ?? 0);
        return this.equipmentDetailIds.has(detailId) &&
          Number(detail.Fk_Expense_Id || 0) === Number(item.Fk_Expense_List || 0) &&
          detail.Active !== false && Number(detail.Active ?? 1) !== 0;
      });
      item.expenseDetails = item.expenseDetails || [];
      details.forEach((detail: any) => {
        const detailId = Number(detail.Fk_Expense_Detail_Id ?? detail.Fk_Expense_Detial_Id ?? 0);
        const existing = item.expenseDetails.find((old: any) =>
          Number(old.Fk_Expense_Detail_Id ?? old.Fk_Expense_Detial_Id ?? 0) === detailId
        );
        if (existing) Object.assign(existing, detail);
        else item.expenseDetails.push(detail);
      });
    });
  }

  selectedDepartmentId: any = null;

  currentYear: any;
  userSession: any;

  get isDepartmentLocked(): boolean {
    return this.userSession?.permissionData?.VIEW_DATA == 3;
  }

  private resetDepartmentSelection(): void {
    this.selectedDepartmentId = this.isDepartmentLocked
      ? this.userSession?.permissionData?.Department_id ?? null
      : null;
  }

  // =====================================
  // INIT
  // =====================================

  ngOnInit() {
    const sessionStr = localStorage.getItem('userSession');

    if (sessionStr) {
      this.userSession = JSON.parse(sessionStr);
    }

    try {
      if (this.userSession.permissionData.VIEW_DATA == 3) {
        this.selectedDepartmentId = this.userSession.permissionData.Department_id;
      }
    } catch (error) {
    }

    this.budgetYearService.yearChanged$
      .subscribe(async year => {

        if (year) {

          if (year < 2500) {

            year = year + 543;

          }

          this.currentYear = year;

          this.get_data();

        }

      });

  }

  // =====================================
  // GET DATA
  // =====================================

  get_data() {

    let model = {

      FUNC_CODE: 'FUNC-Get_Budget_Request_List',

      BgYear: this.currentYear

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        // TABLE DATA
        this.allData =
          Array.isArray(
            response.List_Budget_Request_Data_Table.Data
          )
            ? response.List_Budget_Request_Data_Table.Data
            : [];

        // DEPARTMENT
        this.department =
          Array.isArray(
            response.Mas_Department_Lists
          )
            ? response.Mas_Department_Lists
            : [];

        if (this.selectedDepartmentId != null) {
          const matchedDepartment = this.department.find(
            (item: any) => String(item.Department_Id) === String(this.selectedDepartmentId)
          );

          if (matchedDepartment) {
            this.selectedDepartmentId = matchedDepartment.Department_Id;
          }
        }

        this.applyFilter();

      });

  }

  // =====================================
  // FILTER + GROUP
  // =====================================

  applyFilter() {

    const departmentId = this.isDepartmentLocked ? this.selectedDepartmentId : null;

    // ยังไม่เลือก
    if (this.isDepartmentLocked && !departmentId) {

      this.table_display = false;

      this.groupData = [];

      return;

    }

    // เปิด table
    this.table_display = true;

    // =====================================
    // FILTER REQUEST
    // =====================================

    const rows = structuredClone(this.allData.filter((x: any) =>
      !departmentId || x.Department_Id == departmentId
    ));

    // =====================================
    // GET BUDGET PLAN
    // =====================================

    let model = {

      FUNC_CODE: 'FUNC-Get_Budget_Plan_main',
      BgYear: this.currentYear

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        const plans = (
          Array.isArray(
            response.List_Budget_Plan_Data_Table?.Data
          )
            ? response.List_Budget_Plan_Data_Table.Data
            : []
        ).filter((plan: any) => !departmentId || plan.Department_Id == departmentId);

        // =====================================
        // MERGE PLAN
        // =====================================

        const usedPlanIds = new Set<number>();

        rows.forEach((row: any) => {

          const rowRequestId = Number(
            row.Request_Id ??
            row.FK_Request_Id ??
            0
          );
          const rowExpenseListId = Number(row.Fk_Expense_List || 0);
          const matchedPlans = plans.filter((p: any) =>
            Number(
              p.FK_Request_Id ??
              p.Fk_Request_Id ??
              p.Request_Id ??
              0
            ) === rowRequestId
          );
          const oldPlan = (
            matchedPlans.find((p: any) =>
              Number(p.Fk_Expense_List || 0) === rowExpenseListId
            ) ||
            matchedPlans[0]
          );

          // ถ้ามีข้อมูลเก่า
          if (oldPlan) {
            usedPlanIds.add(Number(oldPlan.Plan_Id || 0));

            row.Plan_Id =
              oldPlan.Plan_Id || 0;

            row.Adjust1 =
              Number(oldPlan.Adjust1 ?? oldPlan.adjust1 ?? oldPlan.ADJUST1 ?? 0);

            row.Adjust2 =
              Number(oldPlan.Adjust2 ?? oldPlan.adjust2 ?? oldPlan.ADJUST2 ?? 0);

            row.Adjust3 =
              Number(oldPlan.Adjust3 ?? oldPlan.adjust3 ?? oldPlan.ADJUST3 ?? 0);

            row.Update_Amount =
              Number(oldPlan.Update_Amount ?? oldPlan.update_amount ?? 0);

          }

        });

        plans.forEach((plan: any) => {
          const planId = Number(plan.Plan_Id || 0);

          if (planId && !usedPlanIds.has(planId)) {
            rows.push(structuredClone(plan));
          }
        });

        // =====================================
        // RESET
        // =====================================

        this.groupData = [];

        // =====================================
        // GROUP
        // =====================================

        rows.forEach((row: any) => {

          // =====================
          // PLAN
          // =====================

          const planKey =
            this.buildGroupKey(row.Fk_Plan_Id, row.Plan_Name);

          let plan = this.groupData.find(

            (x: any) =>

              x.key == planKey

          );

          if (!plan) {

            plan = {

              key: planKey,

              Plan_Name:
                row.Plan_Name || '-',

              expanded: true,

              products: []

            };

            this.groupData.push(plan);

          }

          // =====================
          // PRODUCT
          // =====================

          const productKey =
            this.buildGroupKey(row.Fk_Product_Id, row.Product_Name);

          let product = plan.products.find(

            (x: any) =>

              x.key == productKey

          );

          if (!product) {

            product = {

              key: productKey,

              Product_Name:
                row.Product_Name || '-',

              expanded: true,

              activities: []

            };

            plan.products.push(product);

          }

          // =====================
          // ACTIVITY
          // =====================

          const activityKey =
            this.buildGroupKey(row.Fk_Activity_Id, row.Activity_Name);

          let activity = product.activities.find(

            (x: any) =>

              x.key == activityKey

          );

          if (!activity) {

            activity = {

              key: activityKey,

              Activity_Name:
                row.Activity_Name || '-',

              expanded: true,

              budgets: []

            };

            product.activities.push(activity);

          }

          // =====================
          // BUDGET
          // =====================

          const budgetKey =
            this.buildGroupKey(row.Fk_Budget_Type, row.Budget_Type_Name || row.Budget_Type);

          let budget = activity.budgets.find(

            (x: any) =>

              x.key == budgetKey

          );

          if (!budget) {

            budget = {

              key: budgetKey,

              Fk_Budget_Type:
                row.Fk_Budget_Type || 0,

              Budget_Type:
                row.Budget_Type_Name || row.Budget_Type || '-',

              expanded: true,

              items: []

            };

            activity.budgets.push(budget);

          }

          // =====================
          // ITEM
          // =====================

          budget.items.push({

            // KEY
            Plan_Id:
              row.Plan_Id || 0,

            FK_Request_Id:
              row.Request_Id ||
              row.FK_Request_Id ||
              0,

            // FK
            Department_Id:
              row.Department_Id || 0,

            Department_Name:
              row.Department_Name || '',

            Fk_Activity_Id:
              row.Fk_Activity_Id || 0,

            Fk_Budget_Type:
              row.Fk_Budget_Type || 0,

            Fk_Expense_List:
              row.Fk_Expense_List || 0,

            Fk_Plan_Id:
              row.Fk_Plan_Id || 0,

            Fk_Product_Id:
              row.Fk_Product_Id || 0,

            // DETAIL
            Expense_List:
              row.Expense_List || '',

            Project_Name:
              row.Project_Name || '',

            Expense_Name:
              row.Expense_Name
              || row.Expense_List
              || '',

            Expense_Detail:
              row.Expense_Detail
              || row.Project_Name
              || '',

            // AMOUNT
            Total:
              Number(row.Total || 0),

            Adjust1:
              Number(row.Adjust1 || 0),

            Adjust2:
              Number(row.Adjust2 || 0),

            Adjust3:
              Number(row.Adjust3 || 0),

            Update_Amount:
              Number(row.Update_Amount || 0)

          });

        });

      });

  }

  // =====================================
  // GET ALL ITEMS
  // =====================================

  getAllItems(): any[] {

    let items: any[] = [];

    this.groupData.forEach((plan: any) => {

      plan.products.forEach((product: any) => {

        product.activities.forEach((activity: any) => {

          activity.budgets.forEach((budget: any) => {

            budget.items.forEach((item: any) => {

              items.push(item);

            });

          });

        });

      });

    });

    return items;

  }

  private buildGroupKey(id: any, name: any): string {
    const normalizedId = Number(id || 0);
    const normalizedName = String(name || '-').trim();

    return normalizedId
      ? `${normalizedId}`
      : normalizedName;
  }

  // =====================================
  // ROW TOTAL
  // =====================================

  getRowTotal(item: any): number {

    return (

      (Number(item.Adjust1) || 0)

      +

      (Number(item.Adjust2) || 0)

      +

      (Number(item.Adjust3) || 0)

    );

  }

  // =====================================
  // ROW BALANCE
  // =====================================

  getRowBalance(item: any): number {

    return (

      Number(item.Total || 0)

      -

      this.getRowTotal(item)

    );

  }

  // =====================================
  // SUMMARY
  // =====================================

  get totalRequest(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Total) || 0),

      0

    );

  }

  
  get totalAdjust1(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Adjust1) || 0),

      0

    );

  }

    get totalAdjust2(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Adjust2) || 0),

      0

    );

  }

    get totalAdjust3(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Adjust3) || 0),

      0

    );

  }

  get totalAllocated(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Adjust1) || 0)

        +

        (Number(item.Adjust2) || 0)

        +

        (Number(item.Adjust3) || 0),

      0

    );

  }

  get totalBalance(): number {

    return (

      this.totalRequest

      -

      this.totalAllocated

    );

  }

  // =====================================
  // AUTO ALLOCATE
  // =====================================

  autoAllocate() {

    this.getAllItems().forEach((item: any) => {

      const avg =

        Number(item.Total || 0)

        / 3;

      item.Adjust1 = avg;

      item.Adjust2 = avg;

      item.Adjust3 = avg;

    });

  }

  // =====================================
  // RESET
  // =====================================

  resetAllocate() {

    this.getAllItems().forEach((item: any) => {

      item.Adjust1 = 0;

      item.Adjust2 = 0;

      item.Adjust3 = 0;

    });

  }

  // =====================================
  // SAVE
  // =====================================

  saveAdjust() {

    const items = this.getAllItems();


    // =========================
    // VALIDATE
    // =========================

    // const invalid = items.some((item: any) => {

    //   return this.getRowTotal(item)

    //     >

    //     Number(item.Total || 0);

    // });

    // if (invalid) {


    //   basicAlert('error', 'มียอดจัดสรรเกินคำของบ', '')
    //   return;

    // }


    const payload = items.map((item: any) => {

      return {

        FK_Request_Id:
          item.FK_Request_Id,

        Plan_Id:
          item.Plan_Id,

        Adjust1:
          Number(item.Adjust1 || 0),

        Adjust2:
          Number(item.Adjust2 || 0),

        Adjust3:
          Number(item.Adjust3 || 0),

        Update_Amount:
          this.getRowTotal(item),


        Department_Id:
          item.Department_Id,

        Department_Name:
          item.Department_Name,

        Fk_Activity_Id:
          item.Fk_Activity_Id,

        Fk_Budget_Type:
          item.Fk_Budget_Type,

        Fk_Expense_List:
          item.Fk_Expense_List,

        Fk_Plan_Id:
          item.Fk_Plan_Id,

        Fk_Product_Id:
          item.Fk_Product_Id

      };

    });

    // =========================
    // MODEL
    // =========================

    const model = {

      FUNC_CODE:
        'FUNC-Insert_Budget_Plan',

      List_Budget_Plan:
        payload

    };

    // =========================
    // API
    // =========================

    this.servicebud
      .GatewayGetData(model)
      .subscribe({

        next: (response: any) => {


          basicAlert('success', 'บันทึกข้อมูล', '')
          // reload
          this.get_data();

          // refresh
          this.applyFilter();

        },

        error: (err: any) => {

          console.error(
            'SAVE ERROR',
            err
          );


          basicAlert('error', 'บันทึกไม่สำเร็จ', '')
        }

      });

  }

  // =====================================
  // BACK
  // =====================================

  backToTable() {

    this.table_display = false;

    this.groupData = [];

    this.resetDepartmentSelection();

  }
  sumTotal(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Total || 0),

        0

      );

  }
  sumBudgetTotal(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum + Number(item.Total || 0),

      0

    );

  }
  sumBudgetAdjust1(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum + Number(item.Adjust1 || 0),

      0

    );

  }
  sumBudgetAdjust2(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum + Number(item.Adjust2 || 0),

      0

    );

  }
  sumBudgetAdjust3(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum + Number(item.Adjust3 || 0),

      0

    );

  }
  sumBudgetAllocate(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum +

        Number(item.Adjust1 || 0) +

        Number(item.Adjust2 || 0) +

        Number(item.Adjust3 || 0),

      0

    );

  }
  getItemsFromNode(node: any): any[] {

    let items: any[] = [];

    // budget level
    if (node.items) {

      return node.items;

    }

    // activity level
    if (node.budgets) {

      node.budgets.forEach((budget: any) => {

        items.push(
          ...this.getItemsFromNode(budget)
        );

      });

    }

    // product level
    if (node.activities) {

      node.activities.forEach((activity: any) => {

        items.push(
          ...this.getItemsFromNode(activity)
        );

      });

    }

    // plan level
    if (node.products) {

      node.products.forEach((product: any) => {

        items.push(
          ...this.getItemsFromNode(product)
        );

      });

    }

    return items;

  }
  sumAdjust1(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust1 || 0),

        0

      );

  }
  sumAdjust2(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust2 || 0),

        0

      );

  }
  sumAdjust3(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust3 || 0),

        0

      );

  }
  sumAllocate(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust1 || 0) +

          Number(item.Adjust2 || 0) +

          Number(item.Adjust3 || 0),

        0

      );

  }
}
