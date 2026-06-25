import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { DecimalPipe } from '@angular/common';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { MasterService } from 'src/app/core/services/Master.service';

@Component({
  selector: 'app-project-allocation',
  providers: [
    GridJsService,
    DecimalPipe,
    EbudgetService
  ],
  templateUrl: './ProjectAllocation.component.html',
  styles: [`
    .readonly-select {
      pointer-events: none;
      background-color: var(--vz-secondary-bg, #e9ecef);
      color: #6c757d;
      opacity: 1;
    }
  `]
})
export class ProjectAllocationComponent implements OnInit {

  constructor(
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService,
    public masterService: MasterService
  ) { }

  // =====================================
  // VARIABLE
  // =====================================
  Mas_Budget_Types: any[] = [];
  Mas_Expense_Lists: any[] = [];
  table_display: boolean = false;

  department: any[] = [];

  allData: any[] = [];

  groupData: any[] = [];

  selectedDepartmentId: any = null;

  currentYear: any;

  // =====================================
  // INIT
  // =====================================
  userSession: any

  get isDepartmentLocked(): boolean {
    return this.userSession?.permissionData?.VIEW_DATA == 3;
  }

  private resetDepartmentSelection(): void {
    this.selectedDepartmentId = this.isDepartmentLocked
      ? this.userSession?.permissionData?.Department_id ?? null
      : null;
  }

  ngOnInit() {
    const sessionStr = localStorage.getItem('userSession');

    if (sessionStr) {
      this.userSession = JSON.parse(sessionStr);
    } try {

      if (this.userSession.permissionData.VIEW_DATA == 3) {
        this.selectedDepartmentId = this.userSession.permissionData.Department_id
      } else {

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

  get_data(afterLoad?: () => void) {

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

        this.Mas_Budget_Types =
          Array.isArray(response.Mas_Budget_Types)
            ? response.Mas_Budget_Types
            : [];
        this.Mas_Expense_Lists =
          Array.isArray(response.Mas_Expense_Lists)
            ? response.Mas_Expense_Lists
            : this.buildExpenseListOptions(this.allData);

        if (afterLoad) {
          afterLoad();
          return;
        }

        if (this.selectedDepartmentId) {
          this.applyFilter();
        }
      });

  }

  // =====================================
  // FILTER + GROUP
  // =====================================

  applyFilter() {

    if (!this.selectedDepartmentId) {

      this.table_display = false;

      this.groupData = [];

      return;

    }

    this.table_display = true;

    const rows = structuredClone(

      this.allData.filter(

        (x: any) =>

          x.Department_Id ==

          this.selectedDepartmentId

      )

    );

    let model = {

      FUNC_CODE: 'FUNC-Get_Budget_Plan_Tabel',

      Department_Id: this.selectedDepartmentId

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        const plans =
          Array.isArray(
            response.List_Budget_Plan_Data_Table.Data
          )
            ? response.List_Budget_Plan_Data_Table.Data
            : [];
        this.Mas_Budget_Types =
          Array.isArray(response.Mas_Budget_Types)
            ? response.Mas_Budget_Types
            : [];
        this.Mas_Expense_Lists =
          Array.isArray(response.Mas_Expense_Lists)
            ? response.Mas_Expense_Lists
            : this.buildExpenseListOptions(this.allData);
        // =========================
        // MAP OLD PLAN
        // =========================
        console.log(',', plans);

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
            )

            ===

            rowRequestId

          );
          const oldPlan = (
            matchedPlans.find((p: any) =>
              Number(p.Fk_Expense_List || 0) === rowExpenseListId
            ) ||
            matchedPlans[0]
          );


          if (oldPlan) {
            usedPlanIds.add(Number(oldPlan.Plan_Id || 0));

            const adjust1 = Number(

              oldPlan.Adjust1 ??

              oldPlan.adjust1 ??

              oldPlan.ADJUST1 ??

              0

            );

            const adjust2 = Number(

              oldPlan.Adjust2 ??

              oldPlan.adjust2 ??

              oldPlan.ADJUST2 ??

              0

            );

            const adjust3 = Number(

              oldPlan.Adjust3 ??

              oldPlan.adjust3 ??

              oldPlan.ADJUST3 ??

              0

            );

            row.Plan_Id =
              oldPlan.Plan_Id || 0;

            row.Adjust1 = adjust1;
            row.Adjust2 = adjust2;
            row.Adjust3 = adjust3;

            row.Adjust1Temp = adjust1;
            row.Adjust2Temp = adjust2;
            row.Adjust3Temp = adjust3;
            this.syncAdjustDisplays(row);

            row.Update_Amount =
              Number(
                oldPlan.Update_Amount ??
                oldPlan.update_amount ??
                0
              );

          }

        });

        plans.forEach((plan: any) => {
          const planId = Number(plan.Plan_Id || 0);

          if (planId && !usedPlanIds.has(planId)) {
            rows.push(structuredClone(plan));
          }
        });

        // =========================
        // RESET GROUP
        // =========================

        this.groupData = [];

        // =========================
        // GROUP DATA
        // =========================

        rows.forEach((row: any) => {

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

          const activityKey =
            this.buildGroupKey(row.Fk_Activity_Id, row.Activity_Name);

          let activity = product.activities.find(

            (x: any) =>

              x.key == activityKey

          );

          if (!activity) {

            activity = {
              key: activityKey,

              Activity_Name: row.Activity_Name || '-',

              Fk_Plan_Id: row.Fk_Plan_Id || 0,
              Fk_Product_Id: row.Fk_Product_Id || 0,
              Fk_Activity_Id: row.Fk_Activity_Id || 0,

              expanded: true,
              budgets: []
            };
            product.activities.push(activity);

          }

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

          const item = structuredClone(row);

          budget.items.push({

            ...item,

            Plan_Id:
              item.Plan_Id || 0,

            FK_Request_Id:
              item.Request_Id ||
              item.FK_Request_Id ||
              0,

            Department_Id:
              item.Department_Id || 0,

            Department_Name:
              item.Department_Name || '',

            Fk_Activity_Id:
              item.Fk_Activity_Id || 0,

            Fk_Budget_Type:
              item.Fk_Budget_Type || 0,

            Fk_Expense_List:
              item.Fk_Expense_List || 0,

            Fk_Plan_Id:
              item.Fk_Plan_Id || 0,

            Fk_Product_Id:
              item.Fk_Product_Id || 0,

            Expense_List:
              item.Expense_List || '',

            Project_Name:
              item.Project_Name || '',

            Expense_Name:
              item.Expense_Name
              || item.Expense_List
              || '',

            Expense_Detail:
              item.Expense_Detail
              || item.Project_Name
              || '',

            Total:
              Number(item.Total ?? 0),

            Adjust1:
              Number(item.Adjust1 ?? 0),

            Adjust2:
              Number(item.Adjust2 ?? 0),

            Adjust3:
              Number(item.Adjust3 ?? 0),

            Adjust1Temp:
              Number(item.Adjust1Temp ?? item.Adjust1 ?? 0),

            Adjust2Temp:
              Number(item.Adjust2Temp ?? item.Adjust2 ?? 0),

            Adjust3Temp:
              Number(item.Adjust3Temp ?? item.Adjust3 ?? 0),

            Update_Amount:
              Number(item.Update_Amount ?? 0)

          });

        });

        this.syncAllAdjustDisplays();

      });

  }
  addBudget(budget: any) {

    const template = budget.items?.[0] || {};
    const requestId =
      template.Request_Id ||
      template.FK_Request_Id ||
      template.Fk_Request_Id ||
      0;

    const fkExpenseTypeId =
      template.Fk_Expense_Type ||
      template.Fk_Expense_Type_Id ||
      0;

    let model = {
      FUNC_CODE: 'FUNC-GET_Mas_Expense_List_by_fk',
      Mas_Expense_List: {
        Fk_Expense_Type_Id: budget.Fk_Budget_Type
      }
    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        const expenseOptions =
          Array.isArray(response.Mas_Expense_Lists)
            ? response.Mas_Expense_Lists
            : [];

        budget.expanded = true;

        const newItem = {
          Plan_Id: 0,
          Request_Id: requestId,
          FK_Request_Id: requestId,

          Department_Id: template.Department_Id || this.selectedDepartmentId,
          Department_Name: template.Department_Name || '',

          Fk_Plan_Id: template.Fk_Plan_Id || 0,
          Plan_Name: template.Plan_Name || '',
          Fk_Product_Id: template.Fk_Product_Id || 0,
          Product_Name: template.Product_Name || '',
          Fk_Activity_Id: template.Fk_Activity_Id || 0,
          Activity_Name: template.Activity_Name || '',

          Fk_Budget_Type: budget.Fk_Budget_Type || template.Fk_Budget_Type || 0,
          Budget_Type: budget.Budget_Type || template.Budget_Type || '',
          Budget_Type_Name: budget.Budget_Type || template.Budget_Type_Name || '',
          Fk_Expense_Type: fkExpenseTypeId,
          Fk_Expense_Type_Id: fkExpenseTypeId,
          Expense_Type: template.Expense_Type || '',

          Fk_Expense_List: 0,
          Expense_List: '',
          Expense_Name: '',
          Expense_List_Options: expenseOptions,
          Project_Name: '',

          Total: 0,
          Adjust1Temp: 0,
          Adjust2Temp: 0,
          Adjust3Temp: 0,

          isDirty: true,
          isNewBudget: true
        };

        budget.items.push(newItem);
        this.syncAdjustDisplays(newItem);

      });
  }

  removeBudgetItem(budget: any, item: any) {
    if (!item?.isNewBudget || !Array.isArray(budget?.items)) {
      return;
    }

    budget.items = budget.items.filter((row: any) => row !== item);
  }

  onExpenseListChange(item: any, selected: any) {
    const expenseOptions = item.Expense_List_Options || this.Mas_Expense_Lists;
    const selectedExpense = typeof selected === 'object'
      ? selected
      : expenseOptions.find((expense: any) => expense.Expense_Id == selected);

    item.Fk_Expense_List = selectedExpense?.Expense_Id || 0;
    item.Expense_List = selectedExpense?.Expense_Name || '';
    item.Expense_Name = selectedExpense?.Expense_Name || '';
    item.isDirty = true;
  }

  private buildExpenseListOptions(rows: any[]): any[] {
    const map = new Map<number, any>();

    rows.forEach((row: any) => {
      const id = Number(row.Fk_Expense_List || row.Expense_Id || 0);
      const name = row.Expense_Name || row.Expense_List || '';

      if (id && name && !map.has(id)) {
        map.set(id, {
          Expense_Id: id,
          Expense_Name: name
        });
      }
    });

    return Array.from(map.values());
  }

  private buildGroupKey(id: any, name: any): string {
    const normalizedId = Number(id || 0);
    const normalizedName = String(name || '-').trim();

    return normalizedId
      ? `${normalizedId}`
      : normalizedName;
  }

  onBudgetTypeChange(budget: any, selected: any) {
    const selectedBudgetType = typeof selected === 'object'
      ? selected
      : this.Mas_Budget_Types.find((item: any) => item.Budget_Type_Id == selected);

    budget.Budget_Type =
      selectedBudgetType?.Budget_Type_Name || '';

    budget.Fk_Budget_Type =
      selectedBudgetType?.Budget_Type_Id || 0;

    budget.items.forEach((item: any) => {
      item.Fk_Budget_Type = budget.Fk_Budget_Type;
      item.Budget_Type = budget.Budget_Type;
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

  // =====================================
  // ROW TOTAL
  // =====================================

  getRowTotal(item: any): number {

    return (

      (Number(item.Adjust1Temp) || 0)

      +

      (Number(item.Adjust2Temp) || 0)

      +

      (Number(item.Adjust3Temp) || 0)

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

  private isBudgetItemChanged(item: any): boolean {
    return item.isNewBudget === true ||
      item.isDirty === true ||
      Number(item.Adjust1Temp || 0) !== Number(item.Adjust1 || 0) ||
      Number(item.Adjust2Temp || 0) !== Number(item.Adjust2 || 0) ||
      Number(item.Adjust3Temp || 0) !== Number(item.Adjust3 || 0);
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

        (Number(item.Adjust1Temp) || 0),

      0

    );

  }

  get totalAdjust2(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Adjust2Temp) || 0),

      0

    );

  }

  get totalAdjust3(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Adjust3Temp) || 0),

      0

    );

  }

  get totalAllocated(): number {

    return this.getAllItems().reduce(

      (sum: number, item: any) =>

        sum +

        (Number(item.Adjust1Temp) || 0)

        +

        (Number(item.Adjust2Temp) || 0)

        +

        (Number(item.Adjust3Temp) || 0),

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

      item.Adjust1Temp = avg;
      item.Adjust2Temp = avg;
      item.Adjust3Temp = avg;
      item.isDirty = true;
      this.syncAdjustDisplays(item);

    });

  }

  resetAllocate() {

    this.getAllItems().forEach((item: any) => {

      item.Adjust1Temp = 0;
      item.Adjust2Temp = 0;
      item.Adjust3Temp = 0;
      item.isDirty = true;
      this.syncAdjustDisplays(item);
    });

  }


  saveAdjust() {

    const allItems = this.getAllItems();
    const items = allItems.filter((item: any) => this.isBudgetItemChanged(item));

    if (items.length === 0) {
      basicAlert('warning', 'ไม่มีรายการที่เปลี่ยนแปลง', '');
      return;
    }

    const invalidNewItems = items.filter((item: any) =>
      item.isNewBudget === true &&
      (!Number(item.Fk_Expense_List || 0) || this.getRowTotal(item) <= 0)
    );

    if (invalidNewItems.length > 0) {
      basicAlert('warning', 'กรุณาเลือกรายการและระบุยอดจัดสรรก่อนบันทึก', '');
      return;
    }

    // const invalid = items.some((item: any) => {

    //   return this.getRowTotal(item)

    //     >

    //     Number(item.Total || 0);

    // });

    // if (invalid) {

    //   basicAlert(
    //     'error',
    //     'มียอดจัดสรรเกินคำของบ',
    //     ''
    //   );

    //   return;

    // }

    const payload = items.map((item: any) => {
      const requestId =
        item.Request_Id ||
        item.FK_Request_Id ||
        item.Fk_Request_Id ||
        0;
      const userIdentify = this.userSession?.authenData?.IDENTIFY || '';

      return {

        FK_Request_Id:
          requestId,

        Request_Id:
          requestId,

        Plan_Id:
          item.Plan_Id,

        Adjust1:
          Number(item.Adjust1Temp || 0),

        Adjust2:
          Number(item.Adjust2Temp || 0),

        Adjust3:
          Number(item.Adjust3Temp || 0),
        Total: Number(item.Total || 0),
        Total_Plan: this.getRowTotal(item),
        Update_Amount:
          this.getRowTotal(item),

        Department_Id:
          item.Department_Id,

        Department_Name:
          item.Department_Name,

        Fk_Activity_Id:
          item.Fk_Activity_Id,

        Activity_Name:
          item.Activity_Name,

        Fk_Budget_Type:
          item.Fk_Budget_Type,

        Fk_Expense_List:
          item.Fk_Expense_List,

        Fk_Plan_Id:
          item.Fk_Plan_Id,

        Plan_Name:
          item.Plan_Name,

        Fk_Product_Id:
          item.Fk_Product_Id,

        Product_Name:
          item.Product_Name,

        BgYear:
          this.currentYear,
        Budget_Type: item.Budget_Type,
        Budget_Type_Name: item.Budget_Type_Name || item.Budget_Type,
        Expense_List: item.Expense_List || item.Expense_Name,
        Expense_Name: item.Expense_Name || item.Expense_List,
        Fk_Expense_Type: item.Fk_Expense_Type || item.Fk_Expense_Type_Id || 0,
        Fk_Expense_Type_Id: item.Fk_Expense_Type_Id || item.Fk_Expense_Type || 0,
        Expense_Type: item.Expense_Type,
        Create_User: userIdentify,
        Update_User: userIdentify

      };

    });

    const model = {

      FUNC_CODE:
        'FUNC-Insert_Budget_Plan',

      List_Budget_Plan:
        payload

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe({

        next: async (response: any) => {

          items.forEach((item: any) => {

            item.Adjust1 = Number(item.Adjust1Temp || 0);
            item.Adjust2 = Number(item.Adjust2Temp || 0);
            item.Adjust3 = Number(item.Adjust3Temp || 0);
            item.isDirty = false;
            item.isNewBudget = false;

          });

          basicAlert(
            'success',
            'บันทึกข้อมูล',
            ''
          );
          this.get_data(() => {
            this.applyFilter();
          });
          // await this.reloadAfterSave();
          items.forEach((item: any) => {

            item.Adjust1 =
              Number(item.Adjust1Temp || 0);

            item.Adjust2 =
              Number(item.Adjust2Temp || 0);

            item.Adjust3 =
              Number(item.Adjust3Temp || 0);

            item.Update_Amount =
              this.getRowTotal(item);
            item.isDirty = false;
            item.isNewBudget = false;

          });
        },

        error: (err: any) => {

          console.error(
            'SAVE ERROR',
            err
          );

          basicAlert(
            'error',
            'บันทึกไม่สำเร็จ',
            ''
          );

        }

      });

  }
  async reloadAfterSave() {

    // โหลด request ใหม่
    let requestModel = {

      FUNC_CODE:
        'FUNC-Get_Budget_Request',

      BgYear:
        this.currentYear

    };

    this.servicebud
      .GatewayGetData(requestModel)
      .subscribe((response: any) => {

        this.allData =
          Array.isArray(
            response.List_Budget_Request_Data_Table.Data
          )
            ? response.List_Budget_Request_Data_Table.Data
            : [];

        // โหลด plan ใหม่ด้วย
        let planModel = {

          FUNC_CODE:
            'FUNC-Get_Budget_Plan',

          Department_Id:
            this.selectedDepartmentId

        };

        this.servicebud
          .GatewayGetData(planModel)
          .subscribe((planResponse: any) => {

            const plans =
              Array.isArray(
                planResponse.List_Budget_Plan_Data_Table.Data
              )
                ? planResponse.List_Budget_Plan_Data_Table.Data
                : [];

            // sync กลับเข้า allData
            this.allData.forEach((row: any) => {

              const oldPlan =
                plans.find((p: any) =>

                  p.Fk_Plan_Id ==
                  row.Fk_Plan_Id

                  &&

                  p.Fk_Product_Id ==
                  row.Fk_Product_Id

                  &&

                  p.Fk_Activity_Id ==
                  row.Fk_Activity_Id

                  &&

                  p.Fk_Budget_Type ==
                  row.Fk_Budget_Type

                  &&

                  p.Fk_Expense_List ==
                  row.Fk_Expense_List

                );

              if (oldPlan) {

                row.Plan_Id =
                  oldPlan.Plan_Id || 0;

                row.Adjust1 =
                  Number(oldPlan.Adjust1 || 0);

                row.Adjust2 =
                  Number(oldPlan.Adjust2 || 0);

                row.Adjust3 =
                  Number(oldPlan.Adjust3 || 0);
                row.Adjust1Temp =
                  Number(oldPlan.Adjust1 || 0);

                row.Adjust2Temp =
                  Number(oldPlan.Adjust2 || 0);

                row.Adjust3Temp =
                  Number(oldPlan.Adjust3 || 0);

                this.syncAdjustDisplays(row);
              }

            });

            setTimeout(() => {

              this.applyFilter();

            }, 100);

          });

      });

  }

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

        sum + Number(item.Adjust1Temp || 0),

      0

    );

  }
  sumBudgetAdjust2(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum + Number(item.Adjust2Temp || 0),

      0

    );

  }
  sumBudgetAdjust3(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum + Number(item.Adjust3Temp || 0),

      0

    );

  }
  sumBudgetAllocate(items: any[]): number {

    return items.reduce(

      (sum: number, item: any) =>

        sum +

        Number(item.Adjust1Temp || 0) +

        Number(item.Adjust2Temp || 0) +

        Number(item.Adjust3Temp || 0),

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

    if (node.activities) {

      node.activities.forEach((activity: any) => {

        items.push(
          ...this.getItemsFromNode(activity)
        );

      });

    }

    if (node.products) {

      node.products.forEach((product: any) => {

        items.push(
          ...this.getItemsFromNode(product)
        );

      });

    }

    return items;

  }
  formatAdjustCurrency(
    event: Event,
    item: any,
    field: 'Adjust1Temp' | 'Adjust2Temp' | 'Adjust3Temp'
  ): void {

    this.masterService.formatCurrency(event, (result) => {
      const displayField = field.replace('Temp', 'Display');
      item[displayField] = result.formatted;
      item[field] = result.numeric;
      item.isDirty = true;
    });

  }

  allowNumericOnly(event: KeyboardEvent): void {
    this.masterService.allowNumericOnly(event);
  }

  syncAdjustDisplays(item: any): void {

    item.Adjust1Display = this.masterService.formatNumber(item.Adjust1Temp);
    item.Adjust2Display = this.masterService.formatNumber(item.Adjust2Temp);
    item.Adjust3Display = this.masterService.formatNumber(item.Adjust3Temp);

  }

  syncAllAdjustDisplays(): void {

    this.getAllItems().forEach((item: any) =>
      this.syncAdjustDisplays(item)
    );

  }

  getItemAllocateTotal(item: any): number {

    return (Number(item.Adjust1Temp) || 0) +
      (Number(item.Adjust2Temp) || 0) +
      (Number(item.Adjust3Temp) || 0);

  }

  sumAdjust1(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust1Temp || 0),

        0

      );

  }
  sumAdjust2(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust2Temp || 0),

        0

      );

  }
  sumAdjust3(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust3Temp || 0),

        0

      );

  }
  sumAllocate(node: any): number {

    return this.getItemsFromNode(node)
      .reduce(

        (sum: number, item: any) =>

          sum +

          Number(item.Adjust1Temp || 0) +

          Number(item.Adjust2Temp || 0) +

          Number(item.Adjust3Temp || 0),

        0

      );

  }
}
