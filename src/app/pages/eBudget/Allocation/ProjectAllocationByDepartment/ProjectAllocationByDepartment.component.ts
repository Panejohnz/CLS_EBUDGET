import { Component, Input, OnInit } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { MasterService } from 'src/app/core/services/Master.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-project-allocation-by-department',
  templateUrl: './ProjectAllocationByDepartment.component.html',
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .step-plan > td { background-color: #dff5e4 !important; }
    .step-product > td { background-color: #f3e1f7 !important; }
    .step-activity > td { background-color: #fff2c7 !important; }
    .step-budget > td { background-color: #d8eef7 !important; }
    .step-expense > td { background-color: #ffffff !important; }
    .step-detail > td { background-color: #f1f3f5 !important; }
    .allocation-table {
      border-color: #9daabd !important;
    }
    .allocation-table > :not(caption) > * > * {
      border-color: #aeb9c8 !important;
    }
    .allocation-table thead th,
    .allocation-table tfoot td {
      border-color: #d3d9e3 !important;
    }
    .allocation-table th:first-child,
    .allocation-table td:first-child {
      position: sticky;
      left: 0;
      z-index: 2;
      box-shadow: 2px 0 4px rgba(0, 0, 0, .08);
    }
    .allocation-table th:last-child,
    .allocation-table td:last-child {
      position: sticky;
      right: 0;
      z-index: 2;
      box-shadow: -2px 0 4px rgba(0, 0, 0, .08);
    }
    .allocation-table thead th:first-child,
    .allocation-table thead th:last-child,
    .allocation-table tfoot td:first-child,
    .allocation-table tfoot td:last-child {
      z-index: 4;
      background-color: #556398 !important;
    }
    .allocation-table .step-plan > td:first-child { background-color: #dff5e4 !important; }
    .allocation-table .step-product > td:first-child { background-color: #f3e1f7 !important; }
    .allocation-table .step-activity > td:first-child { background-color: #fff2c7 !important; }
    .allocation-table .step-budget > td:first-child { background-color: #d8eef7 !important; }
    .allocation-table .step-expense > td:first-child { background-color: #ffffff !important; }
    .allocation-table .step-detail > td:first-child { background-color: #f1f3f5 !important; }
    .allocation-table .step-plan > td:last-child { background-color: #dff5e4 !important; }
    .allocation-table .step-product > td:last-child { background-color: #f3e1f7 !important; }
    .allocation-table .step-activity > td:last-child { background-color: #fff2c7 !important; }
    .allocation-table .step-budget > td:last-child { background-color: #d8eef7 !important; }
    .allocation-table .step-expense > td:last-child { background-color: #ffffff !important; }
    .allocation-table .step-detail > td:last-child { background-color: #f1f3f5 !important; }
    .allocation-table-scroll { cursor: grab; touch-action: pan-y; }
    .allocation-table-scroll.is-dragging { cursor: grabbing; user-select: none; }
    .allocation-card-body { padding-bottom: 82px; }
    .allocation-save-footer {
      position: fixed;
      left: var(--vz-vertical-menu-width, 250px);
      right: 0;
      bottom: 0;
      z-index: 1030;
      padding: 10px 28px;
      background: rgba(255, 255, 255, .97);
      border-top: 1px solid #d9dee7;
      box-shadow: 0 -3px 12px rgba(0, 0, 0, .10);
    }
    :host-context(html[data-sidebar-size="sm"]) .allocation-save-footer,
    :host-context(html[data-sidebar-size="sm-hover"]) .allocation-save-footer {
      left: var(--vz-vertical-menu-width-sm, 70px);
    }
    :host-context(html[data-sidebar-size="md"]) .allocation-save-footer {
      left: var(--vz-vertical-menu-width-md, 180px);
    }
    :host-context(html[data-layout="horizontal"]) .allocation-save-footer,
    :host-context(html[data-sidebar-visibility="hidden"]) .allocation-save-footer {
      left: 0;
    }
    @media (max-width: 767.98px) {
      .allocation-save-footer { left: 0; padding: 8px 16px; }
    }
  `],
  providers: [EbudgetService]
})
export class ProjectAllocationByDepartmentComponent implements OnInit {
  @Input() readOnly = false;
  // When supplied by PlanManagement/examine, only show the signed-in
  // department.  Allocation itself omits this input and still shows all.
  @Input() departmentId: number | null = null;
  private expenseListById = new Map<number, any>();
  private planOrderById = new Map<number, number>();
  private productOrderById = new Map<number, number>();
  private activityOrderById = new Map<number, number>();
  private budgetOrderById = new Map<number, number>();
  departments: any[] = [];
  rows: any[] = [];
  loading = false;
  currentYear: number | null = null;
  private tableDragging = false;
  private tableDragMoved = false;
  private tableDragStartX = 0;
  private tableDragStartScrollLeft = 0;
  private suppressNodeClick = false;

  constructor(
    private servicebud: EbudgetService,
    private budgetYearService: BudgetYearService,
    public masterService: MasterService
  ) { }

  ngOnInit(): void {
    this.budgetYearService.yearChanged$.subscribe(year => {
      if (!year) return;
      this.currentYear = year < 2500 ? year + 543 : year;
      this.load();
    });
  }

  load(): void {
    if (!this.currentYear) return;
    this.loading = true;
    this.servicebud.GatewayGetData({
      FUNC_CODE: 'FUNC-GET_Mas_Expense_List',
      Mas_Expense_List: { Fk_Expense_Type_Id: 0 }
    }).subscribe({
      next: (response: any) => {
        const expenseLists = Array.isArray(response?.Mas_Expense_Lists) ? response.Mas_Expense_Lists : [];
        this.expenseListById = new Map(expenseLists.map((item: any) => [Number(item.Expense_Id), item]));
        this.loadPlanOrder(() => this.loadRequests());
      },
      error: () => {
        this.expenseListById.clear();
        this.loadPlanOrder(() => this.loadRequests());
      }
    });
  }

  private loadPlanOrder(done: () => void): void {
    this.servicebud.GatewayGetData({ FUNC_CODE: 'FUNC-GET_Mas_General', BgYear: this.currentYear })
      .subscribe({
        next: (response: any) => {
          const plans = Array.isArray(response?.Mas_Plan_Lists) ? response.Mas_Plan_Lists : [];
          this.planOrderById = this.toOrderMap(plans, 'Plan_Id');
          done();
        },
        error: () => done()
      });
  }

  private loadRequests(): void {
    this.servicebud.GatewayGetData({ FUNC_CODE: 'FUNC-Get_Budget_Request_List', BgYear: this.currentYear })
      .subscribe({
        next: (requestResponse: any) => {
          const requestSource = requestResponse?.List_Budget_Request_Data_Table?.Data || [];
          console.log(' const requestSource', requestSource);

          const requests = Array.isArray(requestSource) ? requestSource : [];
          this.loadPlanRows(requests);
        },
        error: () => {
          this.departments = [];
          this.rows = [];
          this.loading = false;
        }
      });
  }

  private loadPlanRows(requests: any[]): void {
    this.servicebud.GatewayGetData({ FUNC_CODE: 'FUNC-Get_Budget_Plan_main', BgYear: this.currentYear })
      .subscribe({
        next: (response: any) => {
          const source = response?.List_Budget_Plan_Data_Table?.Data || [];
          console.log('source', source);

          const plans = Array.isArray(source) ? source : [];
          // The request is the master row for Allocation.  A Budget_Plan only
          // supplies the latest allocated values after that request is saved.
          const planByRequest = new Map<number, any[]>();
          plans.forEach((plan: any) => {
            // Some historical Budget_Plan rows return the relation as
            // FK_Request_Id_Copy.  Use the request relation as the primary
            // key; Fk_Expense_List is only used to distinguish multiple rows
            // belonging to the same request.
            const requestId = Number(
              plan.FK_Request_Id || plan.Fk_Request_Id || plan.FK_Request_Id_Copy || plan.Request_Id || 0
            );
            if (requestId) {
              const plansForRequest = planByRequest.get(requestId) || [];
              plansForRequest.push(plan);
              planByRequest.set(requestId, plansForRequest);
            }
          });
          const displayRows = requests.map((request: any) => {
            const requestId = Number(
              request.Request_Id || request.FK_Request_Id || request.Fk_Request_Id || request.FK_Request_Id_Copy || 0
            );
            const expenseId = Number(request.Fk_Expense_List || 0);
            const plansForRequest = planByRequest.get(requestId) || [];
            const plan = this.findPlanForRequest(plansForRequest, expenseId);
            return this.mergeRequestAndPlan(request, plan);
          }).filter((row: any) =>
            !this.departmentId || Number(row.Department_Id || 0) === Number(this.departmentId)
          );
          const departmentMap = new Map<number, any>();
          const rootNodes: any[] = [];

          displayRows.forEach((plan: any) => {
            const departmentId = Number(plan.Department_Id || 0);
            if (!departmentId) return;
            if (!departmentMap.has(departmentId)) {
              departmentMap.set(departmentId, {
                Department_Id: departmentId,
                Department_Name:  plan.Department_Short_Name || `หน่วยงาน ${departmentId}`
              });
            }

            const amount = this.mainRowAmount(plan);
            const path = [
              { key: `plan_${plan.Fk_Plan_Id || plan.Plan_Name}`, name: plan.Plan_Name || '-', type: 'plan' },
              { key: `product_${plan.Fk_Product_Id || plan.Product_Name}`, name: plan.Product_Name || '-', type: 'product', entityId: Number(plan.Fk_Product_Id || 0) },
              { key: `activity_${plan.Fk_Activity_Id || plan.Activity_Name}`, name: plan.Activity_Name || '-', type: 'activity', entityId: Number(plan.Fk_Activity_Id || 0) },
              { key: `budget_${plan.Fk_Budget_Type || plan.Budget_Type}`, name: plan.Budget_Type_Name || plan.Budget_Type || '-', type: 'budget', entityId: Number(plan.Fk_Budget_Type || 0) },
              {
                // Do not include Plan_Id / Request_Id here.  The same expense must be
                // rendered on one row, with its amounts separated by department.
                key: `expense_${plan.Fk_Expense_List || 0}_${plan.Project_Name || plan.Expense_Name || plan.Expense_List}`,
                name: plan.Project_Name || plan.Expense_Name || plan.Expense_List || '-',
                type: 'expense',
                Plan_Id: Number(plan.Plan_Id || 0),
                Request_Id: Number(plan.FK_Request_Id || plan.Fk_Request_Id || plan.Request_Id || 0),
                Fk_Expense_List: Number(plan.Fk_Expense_List || 0),
                Department_Id: departmentId,
                isAdjustList: this.isAdjustList(plan.Fk_Expense_List),
                isDirectAmount: !this.isAdjustList(plan.Fk_Expense_List),
                source: plan
              }
            ];
            path[0].entityId = Number(plan.Fk_Plan_Id || 0);
            let nodes = rootNodes;
            let parentNode: any = null;
            path.forEach((part, index) => {
              let node = nodes.find(x => x.key === part.key);
              if (!node) {
                node = {
                  ...part,
                  parent: parentNode,
                  children: [],
                  expanded: true,
                  amounts: {},
                  totalAdjust1: 0,
                  sources: [],
                  sourcesByDepartment: {}
                };
                nodes.push(node);
              }
              if (index === path.length - 1) {
                node.sources.push(plan);
                node.sourcesByDepartment[departmentId] = node.sourcesByDepartment[departmentId] || [];
                node.sourcesByDepartment[departmentId].push(plan);
              }
              node.amounts[departmentId] = (Number(node.amounts[departmentId]) || 0) + amount;
              node.totalAdjust1 += amount;
              nodes = node.children;
              parentNode = node;
            });
          });

          this.departments = Array.from(departmentMap.values());
          this.rows = rootNodes;
          this.loadHierarchyOrder(displayRows);
          this.loadInvestmentDetailRows();
          this.loading = false;
        },
        error: () => {
          this.departments = [];
          this.rows = [];
          this.loading = false;
        }
      });
  }

  private mergeRequestAndPlan(request: any, plan: any): any {
    if (!plan) return request;

    // Request owns the descriptive hierarchy.  Plan only owns the saved
    // allocation fields.  This prevents NULL columns in Budget_Plan from
    // erasing names, department, plan/product/activity, or expense metadata.
    const row = { ...request };
    [
      'Plan_Id', 'FK_Request_Id', 'Fk_Request_Id', 'Request_Id',
      'Total', 'Total_Plan', 'Adjust1', 'Adjust2', 'Adjust3',
      'Update_Amount', 'Create_Date', 'Update_Date', 'Active'
    ].forEach(field => {
      const value = plan[field];
      if (value !== null && value !== undefined && value !== '') {
        row[field] = value;
      }
    });
    return row;
  }

  /**
   * A request that has never been allocated has no Budget_Plan, so it must
   * retain its requested Total.  When a Budget_Plan exists, use that row's
   * allocated values.  Prefer the matching expense when a request has more
   * than one expense; support old rows where Fk_Expense_List was not saved.
   */
  private findPlanForRequest(plansForRequest: any[], expenseId: number): any | undefined {
    if (!plansForRequest.length) return undefined;

    const exactExpensePlan = plansForRequest.find((plan: any) =>
      Number(plan.Fk_Expense_List || plan.FK_Expense_List || 0) === expenseId
    );
    if (exactExpensePlan) return exactExpensePlan;

    const planWithoutExpense = plansForRequest.find((plan: any) =>
      !Number(plan.Fk_Expense_List || plan.FK_Expense_List || 0)
    );
    if (planWithoutExpense) return planWithoutExpense;

    // One request normally creates one allocation row.  This fallback keeps
    // historical plans visible even when the API uses a different expense key.
    return plansForRequest.length === 1 ? plansForRequest[0] : undefined;
  }

  private loadHierarchyOrder(rows: any[]): void {
    const planIds = this.uniqueIds(rows, 'Fk_Plan_Id');
    const productIds = this.uniqueIds(rows, 'Fk_Product_Id');
    const expenseIds = this.uniqueIds(rows, 'Fk_Expense_List');
    const requests: any[] = [];

    // Products and activities are filtered master endpoints, therefore fetch
    // only IDs which occur on this Allocation page.
    planIds.forEach(id => requests.push(
      this.servicebud.GatewayGetData({ FUNC_CODE: 'FUNC-GET_Mas_Product', Mas_Plan: { Plan_Id: id } })
    ));
    productIds.forEach(id => requests.push(
      this.servicebud.GatewayGetData({ FUNC_CODE: 'FUNC-GET_Mas_Activity', Mas_Product: { Product_Id: id } })
    ));
    expenseIds.forEach(id => requests.push(
      this.servicebud.GatewayGetData({ FUNC_CODE: 'FUNC-GET_Mas_Budget_Type', Mas_Expense_List: { Expense_Id: id } })
    ));

    if (!requests.length) {
      this.sortHierarchyNodes(this.rows);
      return;
    }

    forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        const products = responses.flatMap(response => response?.Mas_Product_Lists || []);
        const activities = responses.flatMap(response => response?.Mas_Activity_Lists || []);
        const budgets = responses.flatMap(response => response?.Mas_Budget_Types || []);
        this.productOrderById = this.toOrderMap(products, 'Product_Id');
        this.activityOrderById = this.toOrderMap(activities, 'Activity_Id');
        this.budgetOrderById = this.toOrderMap(budgets, 'Budget_Type_Id');
        this.sortHierarchyNodes(this.rows);
      },
      error: () => this.sortHierarchyNodes(this.rows)
    });
  }

  private uniqueIds(rows: any[], field: string): number[] {
    return Array.from(new Set(rows.map(row => Number(row?.[field] || 0)).filter(Boolean)));
  }

  private toOrderMap(items: any[], idField: string): Map<number, number> {
    const map = new Map<number, number>();
    items.forEach(item => {
      const id = Number(item?.[idField] || 0);
      const order = Number(item?.Order_Seq);
      if (id && Number.isFinite(order)) map.set(id, order);
    });
    return map;
  }

  private sortHierarchyNodes(nodes: any[]): void {
    nodes.sort((left, right) => {
      const leftOrder = this.nodeOrder(left);
      const rightOrder = this.nodeOrder(right);
      if (leftOrder === null && rightOrder === null) return 0;
      if (leftOrder === null) return 1;
      if (rightOrder === null) return -1;
      return leftOrder - rightOrder;
    });
    nodes.forEach(node => this.sortHierarchyNodes(node.children || []));
  }

  private nodeOrder(node: any): number | null {
    const id = Number(node?.entityId || 0);
    const orders: Record<string, Map<number, number>> = {
      plan: this.planOrderById,
      product: this.productOrderById,
      activity: this.activityOrderById,
      budget: this.budgetOrderById
    };
    const value = orders[node?.type]?.get(id);
    return value === undefined ? null : value;
  }

  totalForDepartment(departmentId: number): number {
    return this.rows.reduce((sum, row) => sum + (Number(row.amounts[departmentId]) || 0), 0);
  }

  totalAdjust1(): number {
    return this.rows.reduce((sum, row) => sum + (Number(row.totalAdjust1) || 0), 0);
  }

  toggle(node: any): void {
    if (node.children?.length) node.expanded = !node.expanded;
  }

  startTableDrag(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('input, button, textarea, select, .ng-select, a, label')) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const container = event.currentTarget as HTMLElement;
    this.tableDragging = true;
    this.tableDragMoved = false;
    this.tableDragStartX = event.clientX;
    this.tableDragStartScrollLeft = container.scrollLeft;
    container.classList.add('is-dragging');
    container.setPointerCapture?.(event.pointerId);
  }

  moveTableDrag(event: PointerEvent): void {
    if (!this.tableDragging) return;
    const container = event.currentTarget as HTMLElement;
    const distance = event.clientX - this.tableDragStartX;
    if (Math.abs(distance) > 3) this.tableDragMoved = true;
    container.scrollLeft = this.tableDragStartScrollLeft - distance;
    if (this.tableDragMoved) event.preventDefault();
  }

  endTableDrag(event: PointerEvent): void {
    if (!this.tableDragging) return;
    const container = event.currentTarget as HTMLElement;
    this.tableDragging = false;
    container.classList.remove('is-dragging');
    if (container.hasPointerCapture?.(event.pointerId)) {
      container.releasePointerCapture(event.pointerId);
    }
    if (this.tableDragMoved) {
      this.suppressNodeClick = true;
      setTimeout(() => this.suppressNodeClick = false);
    }
  }

  onNodeClick(event: MouseEvent, node: any): void {
    if (this.suppressNodeClick) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.toggle(node);
  }

  private loadInvestmentDetailRows(): void {
    this.getExpenseNodes(this.rows)
      .filter(node =>
        node.isAdjustList &&
        !(node.sources || []).some((source: any) => this.isProjectTypeOne(source)) &&
        (node.Plan_Id || node.Request_Id)
      )
      .forEach(node => this.loadInvestmentDetails(node));
  }

  private isAdjustList(expenseId: any): boolean {
    const expense = this.expenseListById.get(Number(expenseId));
    return expense?.Is_Adjust_List === true;
  }

  private isProjectTypeOne(source: any): boolean {
    return Number(source?.Project_Type_Id || 0) === 1;
  }

  private loadInvestmentDetails(node: any): void {
    node.children = [];
    (node.sources || []).forEach((sourcePlan: any) => this.loadInvestmentDetailsForSource(node, sourcePlan));
  }

  private loadInvestmentDetailsForSource(node: any, sourcePlan: any): void {
    const planId = Number(sourcePlan.Plan_Id || 0);
    const requestId = Number(sourcePlan.FK_Request_Id || sourcePlan.Fk_Request_Id || sourcePlan.Request_Id || 0);
    if (!requestId) return;

    this.servicebud.GatewayGetData({
      FUNC_CODE: 'FUNC-GET_BUDGET_REQUEST_BY_ID',
      Plan_Id: 0,
      Request_Id: requestId,
      Project_Id: 0
    }).subscribe((response: any) => {
      const requestDetails = this.filterExpenseDetails(
        response?.Budget_Request_Detail_Item || response?.Budget_Request_Detail,
        node.Fk_Expense_List
      );
      if (!planId) {
        requestDetails.forEach((detail: any, index: number) => this.mergeDetailNode(node, detail, sourcePlan, index));
        return;
      }

      this.servicebud.GatewayGetData({
        FUNC_CODE: 'FUNC-GET_BUDGET_PLAN_BY_ID',
        Plan_Id: planId,
        Request_Id: 0,
        Project_Id: 0
      }).subscribe((planResponse: any) => {
        const savedDetails = this.filterExpenseDetails(planResponse?.Budget_Plan_Detail_Items, node.Fk_Expense_List)
          .filter((detail: any) => Number(detail.Fk_Budget_Plan || planId) === planId);
        const savedByKey = new Map(savedDetails.map((detail: any) => [this.detailKey(detail), detail]));

        // Once a Plan has detail items, the parent expense and every hierarchy
        // row must reflect the sum of those detail-item Update_Amount values.
        // Do not use Budget_Plan.Total/Total_Plan for that allocated row.
        const hasPlanAdjust1 = this.hasAdjust1Amount(sourcePlan);
        const hasSavedDetailAmount = savedDetails.some((detail: any) =>
          this.hasUpdateAmount(detail) || this.hasAdjust1Amount(detail)
        );
        // Budget_Plan.Adjust1 is the allocated amount for the main row.  Only
        // fall back to detail rows when the main Plan has not been adjusted.
        if (!hasPlanAdjust1 && hasSavedDetailAmount) {
          const detailTotal = savedDetails.reduce(
            (sum: number, detail: any) => sum + this.detailAllocationAmount(detail, sourcePlan),
            0
          );
          this.replaceSourceAmount(node, sourcePlan, detailTotal);
        }

        requestDetails.forEach((requestDetail: any, index: number) => {
          const savedDetail = savedByKey.get(this.detailKey(requestDetail));
          const detail = savedDetail ? {
            ...requestDetail,
            Plan_Item_Id: savedDetail.Plan_Item_Id,
            Total: savedDetail.Total,
            Adjust1: savedDetail.Adjust1,
            Adjust2: savedDetail.Adjust2,
            Adjust3: savedDetail.Adjust3,
            Update_Amount: savedDetail.Update_Amount,
            __planDetailTotal: savedDetail.Total
          } : requestDetail;
          if (!savedDetail) detail.__planDetailTotal = 0;
          this.mergeDetailNode(node, detail, sourcePlan, index);
        });
      });
    });
  }

  private replaceSourceAmount(node: any, source: any, amount: number): void {
    const departmentId = Number(source?.Department_Id || 0);
    const previous = Number(source._displayAmount ?? this.mainRowAmount(source)) || 0;
    const delta = amount - previous;
    if (!delta) return;

    source._displayAmount = amount;
    let current = node;
    while (current) {
      current.amounts[departmentId] = (Number(current.amounts[departmentId]) || 0) + delta;
      current.totalAdjust1 = (Number(current.totalAdjust1) || 0) + delta;
      current = current.parent;
    }
  }

  private updateAmountOnly(item: any): number {
    const value = item?.Update_Amount ?? item?.update_amount;
    return value !== null && value !== undefined && String(value).trim() !== ''
      ? Number(value) || 0
      : 0;
  }

  private hasUpdateAmount(item: any): boolean {
    const value = item?.Update_Amount ?? item?.update_amount;
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  private hasAdjust1Amount(item: any): boolean {
    const value = item?.Adjust1 ?? item?.adjust1;
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  private detailAllocationAmount(detail: any, source: any): number {
    // Sub-item rows use the saved allocation value from Budget_Plan_Detail_Item.
    if (Number(source?.Plan_Id || 0) > 0) {
      return this.detailAdjust1ForSave(detail, source);
    }

    // Before Plan creation, a Request detail uses its request amount.
    const adjust = detail?.Adjust1 ?? detail?.adjust1;
    if (adjust !== null && adjust !== undefined && String(adjust).trim() !== '') {
      return Number(adjust) || 0;
    }
    return this.allocationAmount(detail);
  }

  private detailAdjust1ForSave(detail: any, source?: any): number {
    const value = detail?.Adjust1 ?? detail?.adjust1;
    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return Number(value) || 0;
    }

    // An untouched Detail Item must retain the amount currently shown in the
    // input, rather than writing zero into Adjust1 on the first Allocation save.
    if (Number(source?.Plan_Id || 0) > 0) {
      return Number(detail?.__planDetailTotal ?? detail?.Total ?? detail?.total ?? detail?.Budget_Amount ?? 0) || 0;
    }
    return this.allocationAmount(detail);
  }

  private filterExpenseDetails(source: any, expenseId: number): any[] {
    const details = Array.isArray(source) ? source : source?.Data || [];
    return details.filter((detail: any) =>
      Number(detail.Fk_Expense_Id) === Number(expenseId) &&
      detail.Active !== false && Number(detail.Active ?? 1) !== 0
    );
  }

  private detailKey(detail: any): string {
    return String(
      detail.Fk_Expense_Detail_Id ??
      detail.Fk_Expense_Detial_Id ??
      detail.Fk_Plan_Detail_Id ??
      detail.Expense_Detail ?? ''
    );
  }

  /** รายการครุภัณฑ์บางรายการยังไม่มีใน Plan detail จึงดึงจาก Request detail มาเสริม */
  /* private appendEquipmentRequestDetails(node: any): void {
    if (!Number(node.Request_Id)) return;
    this.servicebud.GatewayGetData({
      FUNC_CODE: 'FUNC-GET_BUDGET_REQUEST_BY_ID',
      Request_Id: Number(node.Request_Id),
      Plan_Id: 0,
      Project_Id: 0
    }).subscribe((response: any) => {
      const source = response?.Budget_Request_Detail_Item;
      const details = (Array.isArray(source) ? source : source?.Data || [])
        .filter((detail: any) => {
          const detailId = Number(detail.Fk_Expense_Detail_Id ?? detail.Fk_Expense_Detial_Id ?? 0);
          return this.equipmentDetailIds.has(detailId) &&
            Number(detail.Fk_Expense_Id || 0) === Number(node.Fk_Expense_List) &&
            detail.Active !== false && Number(detail.Active ?? 1) !== 0;
        });

      details.forEach((detail: any, index: number) => {
        const detailId = Number(detail.Fk_Expense_Detail_Id ?? detail.Fk_Expense_Detial_Id ?? 0);
        const existingIndex = node.children.findIndex((child: any) =>
          Number(child.detail?.Fk_Expense_Detail_Id ?? child.detail?.Fk_Expense_Detial_Id ?? 0) === detailId
        );
        const detailNode = this.createDetailNode(node, detail, index);
        if (existingIndex >= 0) {
          // ใช้ชื่อจาก Request เป็นแหล่งข้อมูลหลักของรายการครุภัณฑ์
          node.children[existingIndex].name = detailNode.name;
          node.children[existingIndex].detail = { ...node.children[existingIndex].detail, ...detail };
        } else {
          node.children.push(detailNode);
        }
      });
    });
  } */

  private createDetailNode(node: any, detail: any, sourcePlan: any, index: number): any {
    const amount = this.detailAllocationAmount(detail, sourcePlan);
    return {
      key: `${node.key}_detail_${detail.Fk_Expense_Detail_Id || detail.Fk_Expense_Detial_Id || detail.Expense_Detail || index}`,
      name: detail.Expense_Detail || '-',
      type: 'detail',
      children: [],
      expanded: false,
      parent: node,
      detail,
      detailByDepartment: { [Number(sourcePlan.Department_Id)]: [detail] },
      amounts: { [Number(sourcePlan.Department_Id)]: amount },
      totalAdjust1: amount
    };
  }

  private mergeDetailNode(node: any, detail: any, sourcePlan: any, index: number): void {
    const detailNode = this.createDetailNode(node, detail, sourcePlan, index);
    const departmentId = Number(sourcePlan.Department_Id || 0);
    const existing = node.children.find((child: any) => child.key === detailNode.key);
    if (!existing) {
      detail.__allocationSource = sourcePlan;
      node.children.push(detailNode);
      return;
    }

    detail.__allocationSource = sourcePlan;
    existing.detailByDepartment[departmentId] = existing.detailByDepartment[departmentId] || [];
    existing.detailByDepartment[departmentId].push(detail);
    existing.amounts[departmentId] = (Number(existing.amounts[departmentId]) || 0) + detailNode.totalAdjust1;
    existing.totalAdjust1 += detailNode.totalAdjust1;
  }

  private applyAmountToDetails(details: any[], amount: number): void {
    details.forEach((detail: any, index: number) => {
      const nextAmount = index === 0 ? amount : 0;
      const source = detail.__allocationSource;
      const previous = this.detailAllocationAmount(detail, source);
      detail.Adjust1 = nextAmount;
      detail.Update_Amount = nextAmount;
      detail.isDirty = true;

      if (source) {
        source._allocationAmount = (source._allocationAmount ?? this.allocationAmount(source)) + (nextAmount - previous);
        source.Adjust1 = source._allocationAmount;
        source.Update_Amount = source._allocationAmount;
        source.isDirty = true;
      }
    });
  }

  private applyAmountToSources(sources: any[], amount: number): void {
    sources.forEach((source: any, index: number) => {
      const nextAmount = index === 0 ? amount : 0;
      source.Adjust1 = nextAmount;
      source.Update_Amount = nextAmount;
      source._allocationAmount = nextAmount;
      source.isDirty = true;
    });
  }

  private getExpenseNodes(nodes: any[]): any[] {
    return nodes.flatMap(node => [
      ...(node.type === 'expense' ? [node] : []),
      ...this.getExpenseNodes(node.children || [])
    ]);
  }

  /** ค่า Adjust1 ที่ว่างหมายถึงยังไม่จัดสรร จึงแสดงยอดคำของบ (Total) แทน
   * แต่ค่า 0 ที่ผู้ใช้กรอกไว้ต้องยังคงเป็น 0 */
  private allocationAmount(item: any): number {
    // A saved detail item must use its final allocated value, including 0.
    const updateAmount = item?.Update_Amount ?? item?.update_amount;
    if (updateAmount !== null && updateAmount !== undefined && String(updateAmount).trim() !== '') {
      return Number(updateAmount) || 0;
    }

    const adjust = item?.Adjust1 ?? item?.adjust1;
    const value = adjust !== null && adjust !== undefined && String(adjust).trim() !== ''
      ? adjust
      : (item?.Total ?? item?.total ?? item?.Budget_Amount ?? 0);
    return Number(value) || 0;
  }

  private mainRowAmount(item: any): number {
    // Editable Budget_Plan rows use the main Adjust1 amount first.
    if (Number(item?.Plan_Id || 0) > 0) {
      const adjust = item?.Adjust1 ?? item?.adjust1;
      if (adjust !== null && adjust !== undefined && String(adjust).trim() !== '') {
        return Number(adjust) || 0;
      }
      const updateAmount = item?.Update_Amount ?? item?.update_amount;
      if (updateAmount !== null && updateAmount !== undefined && String(updateAmount).trim() !== '') {
        return Number(updateAmount) || 0;
      }
      return Number(item.Total_Plan ?? item.Total ?? 0) || 0;
    }
    return Number(item?.Total ?? 0) || 0;
  }

  updateDetailAmount(node: any, departmentId: number, value: any): void {
    const amount = Number(value) || 0;
    const previous = Number(node.amounts[departmentId]) || 0;
    const delta = amount - previous;
    node.amounts[departmentId] = amount;
    node.totalAdjust1 = (Number(node.totalAdjust1) || 0) + delta;

    const details = node.detailByDepartment?.[departmentId] || [];
    this.applyAmountToDetails(details, amount);

    let parent = node.parent;
    while (parent) {
      parent.amounts[departmentId] = (Number(parent.amounts[departmentId]) || 0) + delta;
      parent.totalAdjust1 = (Number(parent.totalAdjust1) || 0) + delta;
      parent = parent.parent;
    }
  }

  updateDirectAmount(node: any, departmentId: number, value: any): void {
    const amount = Number(value) || 0;
    const previous = Number(node.amounts[departmentId]) || 0;
    const delta = amount - previous;
    node.amounts[departmentId] = amount;
    node.totalAdjust1 = (Number(node.totalAdjust1) || 0) + delta;
    this.applyAmountToSources(node.sourcesByDepartment?.[departmentId] || [], amount);
    node.isDirty = true;

    let parent = node.parent;
    while (parent) {
      parent.amounts[departmentId] = (Number(parent.amounts[departmentId]) || 0) + delta;
      parent.totalAdjust1 = (Number(parent.totalAdjust1) || 0) + delta;
      parent = parent.parent;
    }
  }

  formatAmount(value: any): string {
    return this.masterService.formatNumber(value || 0, 2);
  }

  onAmountInput(event: Event, node: any, departmentId: number): void {
    const input = event.target as HTMLInputElement;
    const amount = this.parseAmount(input.value);
    this.setNodeAmount(node, departmentId, amount);
    node.editAmountText = node.editAmountText || {};
    node.editAmountText[departmentId] = input.value;
  }

  onAmountFocus(node: any, departmentId: number): void {
    node.editAmountText = node.editAmountText || {};
    node.editAmountText[departmentId] = this.formatAmount(node.amounts[departmentId]);
  }

  onAmountBlur(node: any, departmentId: number): void {
    node.editAmountText = node.editAmountText || {};
    node.editAmountText[departmentId] = this.formatAmount(node.amounts[departmentId]);
  }

  inputAmountValue(node: any, departmentId: number): string {
    return node.editAmountText?.[departmentId] ?? this.formatAmount(node.amounts[departmentId]);
  }

  private parseAmount(value: any): number {
    const numeric = String(value ?? '').replace(/,/g, '');
    return Number(numeric) || 0;
  }

  private setNodeAmount(node: any, departmentId: number, amount: number): void {
    if (node.isDirectAmount || node.type === 'expense') {
      this.updateDirectAmount(node, departmentId, amount);
    } else {
      this.updateDetailAmount(node, departmentId, amount);
    }
  }

  canEditAmount(node: any, departmentId: number): boolean {
    if (node.type === 'detail') {
      return !!node.detailByDepartment?.[departmentId]?.length;
    }
    // Projects do not have detail rows.  When Is_Adjust_List is true, adjust the
    // amount directly on the project row instead.
    const sources = node.sourcesByDepartment?.[departmentId] || [];
    if (node.type !== 'expense' || !sources.length) return false;

    const isProject = sources.some((source: any) => this.isProjectTypeOne(source));
    if (node.isAdjustList) {
      // When an adjustable list has no detail rows (including projects), the
      // allocation amount is entered on the expense row itself.
      return !node.children?.length;
    }
    return !isProject;
  }

  saveDetails(): void {
    const detailItems = this.getDetailNodes(this.rows)
      .flatMap(node => Object.values(node.detailByDepartment || {}).flat() as any[]);
    const directSources = this.getExpenseNodes(this.rows)
      .flatMap(node => node.sources || []);
    const planSources = Array.from(new Set([...directSources, ...detailItems.map((detail: any) => detail.__allocationSource)]))
      .filter((source: any) => !!source);
    if (!planSources.length) {
      basicAlert('warning', 'ไม่มีรายการที่เปลี่ยนแปลง', '');
      return;
    }

    const model = {
      FUNC_CODE: 'FUNC-Insert_Budget_Plan',
      List_Budget_Plan: planSources.map((source: any) => {
        const {
          Create_Date,
          Update_Date,
          _requestAmount,
          _allocationAmount,
          isDirty,
          ...planPayload
        } = source;
        return {
          ...planPayload,
          FK_Request_Id: Number(source.FK_Request_Id || source.Fk_Request_Id || source.Request_Id || 0),
          Request_Id: Number(source.Request_Id || source.FK_Request_Id || source.Fk_Request_Id || 0),
          Plan_Id: Number(source.Plan_Id || 0),
          Fk_Expense_List: Number(source.Fk_Expense_List || 0),
          // API request rows name this field Expense_Name; Budget_Plan stores it
          // as Expense_List, so send the value explicitly instead of null.
          Expense_List: source.Expense_List || source.Expense_Name || '',
          Adjust1: Number(source._allocationAmount ?? this.allocationAmount(source)),
          Update_Amount: Number(source._allocationAmount ?? this.allocationAmount(source)),
          BgYear: this.currentYear
        };
      }),
      Allocation_Budget_Plan_Detail_Items: detailItems.map((detail: any) => ({
        Plan_Item_Id: Number(detail.Plan_Item_Id || 0),
        Plan_Id: Number(detail.__allocationSource?.Plan_Id || 0),
        Request_Id: Number(detail.__allocationSource?.FK_Request_Id || detail.__allocationSource?.Fk_Request_Id || detail.__allocationSource?.Request_Id || 0),
        Fk_Expense_Id: Number(detail.Fk_Expense_Id || detail.__allocationSource?.Fk_Expense_List || 0),
        Fk_Expense_Detial_Id: detail.Fk_Expense_Detial_Id || detail.Fk_Expense_Detail_Id || null,
        Expense_Detail: detail.Expense_Detail || '',
        // Persist the value edited in Allocation; Total is display-only.
        Adjust1: this.detailAdjust1ForSave(detail, detail.__allocationSource),
        Adjust2: 0,
        Adjust3: 0,
        Update_Amount: this.detailAllocationAmount(detail, detail.__allocationSource)
      }))
    };

    this.servicebud.GatewayGetData(model).subscribe({
      next: (response: any) => {
        if (response?.RESULT != null) {
          basicAlert('error', 'บันทึกไม่สำเร็จ', String(response.RESULT));
          return;
        }
        detailItems.forEach((detail: any) => detail.isDirty = false);
        planSources.forEach((source: any) => source.isDirty = false);
        basicAlert('success', 'บันทึกข้อมูลเรียบร้อย', '');
        this.load();
      },
      error: () => basicAlert('error', 'บันทึกไม่สำเร็จ', '')
    });
  }

  private getDetailNodes(nodes: any[]): any[] {
    return nodes.flatMap(node => [
      ...(node.type === 'detail' ? [node] : []),
      ...this.getDetailNodes(node.children || [])
    ]);
  }
}
