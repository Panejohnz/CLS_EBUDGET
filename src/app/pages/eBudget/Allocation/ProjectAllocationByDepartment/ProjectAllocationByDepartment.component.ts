import { Component, Input, OnInit } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { MasterService } from 'src/app/core/services/Master.service';

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
  `],
  providers: [EbudgetService]
})
export class ProjectAllocationByDepartmentComponent implements OnInit {
  @Input() readOnly = false;
  private expenseListById = new Map<number, any>();
  departments: any[] = [];
  rows: any[] = [];
  loading = false;
  currentYear: number | null = null;

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
        this.loadRequests();
      },
      error: () => {
        this.expenseListById.clear();
        this.loadRequests();
      }
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
          const planByRequestAndExpense = new Map<string, any>();
          plans.forEach((plan: any) => {
            const requestId = Number(plan.FK_Request_Id || plan.Fk_Request_Id || plan.Request_Id || 0);
            const expenseId = Number(plan.Fk_Expense_List || 0);
            if (requestId) {
              planByRequestAndExpense.set(`${requestId}_${expenseId}`, plan);
            }
          });
          const displayRows = requests.map((request: any) => {
            const requestId = Number(request.Request_Id || request.FK_Request_Id || request.Fk_Request_Id || 0);
            const expenseId = Number(request.Fk_Expense_List || 0);
            const plan = planByRequestAndExpense.get(`${requestId}_${expenseId}`);
            // Request is used only until allocation is saved.  Once a matching
            // plan exists, Plan is the single source of truth for that row.
            return plan || request;
          });
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
              { key: `product_${plan.Fk_Product_Id || plan.Product_Name}`, name: plan.Product_Name || '-', type: 'product' },
              { key: `activity_${plan.Fk_Activity_Id || plan.Activity_Name}`, name: plan.Activity_Name || '-', type: 'activity' },
              { key: `budget_${plan.Fk_Budget_Type || plan.Budget_Type}`, name: plan.Budget_Type_Name || plan.Budget_Type || '-', type: 'budget' },
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

  totalForDepartment(departmentId: number): number {
    return this.rows.reduce((sum, row) => sum + (Number(row.amounts[departmentId]) || 0), 0);
  }

  totalAdjust1(): number {
    return this.rows.reduce((sum, row) => sum + (Number(row.totalAdjust1) || 0), 0);
  }

  toggle(node: any): void {
    if (node.children?.length) node.expanded = !node.expanded;
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
        if (savedDetails.length) {
          const detailTotal = savedDetails.reduce(
            // Do not fall back to Total here.  A blank Update_Amount means
            // that detail has not been allocated and contributes zero.
            (sum: number, detail: any) => sum + this.updateAmountOnly(detail),
            0
          );
          this.replaceSourceAmount(node, sourcePlan, detailTotal);
        }

        requestDetails.forEach((requestDetail: any, index: number) => {
          const savedDetail = savedByKey.get(this.detailKey(requestDetail));
          const detail = savedDetail ? {
            ...requestDetail,
            Plan_Item_Id: savedDetail.Plan_Item_Id,
            Adjust1: savedDetail.Adjust1,
            Adjust2: savedDetail.Adjust2,
            Adjust3: savedDetail.Adjust3,
            Update_Amount: savedDetail.Update_Amount
          } : requestDetail;
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

  private detailAllocationAmount(detail: any, source: any): number {
    // Once a Plan exists, detail rows show only the final saved amount.
    return Number(source?.Plan_Id || 0) > 0
      ? this.updateAmountOnly(detail)
      : this.allocationAmount(detail);
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
    // Update_Amount is the final allocated amount after the allocation is saved.
    // It must take precedence over the original plan/request totals.
    if (Number(item?.Plan_Id || 0) > 0) {
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
      .flatMap(node => Object.values(node.detailByDepartment || {}).flat() as any[])
      .filter((detail: any) => detail.isDirty);
    const directSources = this.getExpenseNodes(this.rows)
      .filter(node => node.isDirty)
      .flatMap(node => node.sources || []);
    const planSources = Array.from(new Set([...directSources, ...detailItems.map((detail: any) => detail.__allocationSource)]))
      .filter((source: any) => !!source && source.isDirty);
    if (!detailItems.length && !planSources.length) {
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
        Adjust1: Number(detail.Adjust1 || 0),
        Adjust2: 0,
        Adjust3: 0,
        Update_Amount: Number(detail.Update_Amount ?? detail.Adjust1 ?? 0)
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
