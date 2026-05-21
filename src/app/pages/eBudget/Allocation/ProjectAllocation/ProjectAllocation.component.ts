import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { DecimalPipe } from '@angular/common';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

@Component({
  selector: 'app-project-allocation',
  providers: [
    GridJsService,
    DecimalPipe,
    EbudgetService
  ],
  templateUrl: './ProjectAllocation.component.html',
  styles: ``
})
export class ProjectAllocationComponent implements OnInit {

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

  selectedDepartmentId: any = null;

  currentYear: any;

  // =====================================
  // INIT
  // =====================================

  ngOnInit() {

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

      FUNC_CODE: 'FUNC-Get_Budget_Request',

      BgYear: this.currentYear

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        // table data
        this.allData =
          Array.isArray(
            response.List_Budget_Request_Data_Table.Data
          )
            ? response.List_Budget_Request_Data_Table.Data
            : [];

        // department
        this.department =
          Array.isArray(
            response.Mas_Department_Lists
          )
            ? response.Mas_Department_Lists
            : [];

        console.log(
          'ALL DATA',
          this.allData
        );

      });

  }

  // =====================================
  // FILTER + GROUP
  // =====================================

  applyFilter() {

    // ยังไม่เลือก
    if (!this.selectedDepartmentId) {

      this.table_display = false;

      this.groupData = [];

      return;

    }

    // เปิด table
    this.table_display = true;

    // filter department
    const rows = this.allData.filter(

      (x: any) =>

        x.Department_Id ==

        this.selectedDepartmentId

    );

    console.log(
      'ROWS',
      rows
    );

    // reset
    this.groupData = [];

    // =====================================
    // GROUP
    // =====================================

    rows.forEach((row: any) => {

      // =====================
      // PLAN
      // =====================

      let plan = this.groupData.find(

        (x: any) =>

          x.Plan_Name ==

          row.Plan_Name

      );

      if (!plan) {

        plan = {

          Plan_Name:

            row.Plan_Name ||

            '-',

          products: []

        };

        this.groupData.push(plan);

      }

      // =====================
      // PRODUCT
      // =====================

      let product = plan.products.find(

        (x: any) =>

          x.Product_Name ==

          row.Product_Name

      );

      if (!product) {

        product = {

          Product_Name:

            row.Product_Name ||

            '-',

          activities: []

        };

        plan.products.push(product);

      }

      // =====================
      // ACTIVITY
      // =====================

      let activity = product.activities.find(

        (x: any) =>

          x.Activity_Name ==

          row.Activity_Name

      );

      if (!activity) {

        activity = {

          Activity_Name:

            row.Activity_Name ||

            '-',

          budgets: []

        };

        product.activities.push(activity);

      }

      // =====================
      // BUDGET
      // =====================

      let budget = activity.budgets.find(

        (x: any) =>

          x.Budget_Type ==

          row.Budget_Type

      );

      if (!budget) {

        budget = {

          Budget_Type:

            row.Budget_Type ||

            '-',

          items: []

        };

        activity.budgets.push(budget);

      }

      // =====================
      // ITEM
      // =====================

      budget.items.push({

        // key
        Plan_Id:

          row.Plan_Id || 0,

        FK_Request_Id:

          row.FK_Request_Id || 0,

        // detail
        Expense_List:

          row.Expense_List || '',

        Project_Name:

          row.Project_Name || '',

        // amount
        Total:

          Number(
            row.Total || 0
          ),

        Adjust1:

          Number(
            row.Adjust1 || 0
          ),

        Adjust2:

          Number(
            row.Adjust2 || 0
          ),

        Adjust3:

          Number(
            row.Adjust3 || 0
          ),

        Update_Amount:

          Number(
            row.Update_Amount || 0
          )

      });

    });

    console.log(
      'GROUP DATA',
      this.groupData
    );

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
  // ROW PERCENT
  // =====================================

  getRowPercent(item: any): number {

    if ((Number(item.Total) || 0) <= 0) {

      return 0;

    }

    return (

      this.getRowTotal(item)

      /

      Number(item.Total)

    ) * 100;

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

  get allocationPercent(): number {

    if (this.totalRequest <= 0) {

      return 0;

    }

    return (

      this.totalAllocated

      /

      this.totalRequest

    ) * 100;

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

    const items =
      this.getAllItems();

    // validate
    const invalid = items.some((item: any) => {

      return this.getRowTotal(item)

        >

        Number(item.Total || 0);

    });

    if (invalid) {

      alert(
        'มียอดจัดสรรเกินคำของบ'
      );

      return;

    }

    // =====================================
    // PAYLOAD
    // =====================================

    const payload = items.map((item: any) => {

      return {

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

        Update_User:

          this.authService
            .currentUserValue
            .User_Id

      };

    });

    console.log(
      'SAVE PAYLOAD',
      payload
    );

    // =====================================
    // API SAVE
    // =====================================

    let model = {

      FUNC_CODE:
        'FUNC-SAVE_PROJECT_ALLOCATION',

      DATA:
        payload

    };

    this.servicebud.GatewayGetData(model)
      .subscribe((response: any) => {

        alert(
          'บันทึกสำเร็จ'
        );

        this.get_data();

      });

  }

  // =====================================
  // BACK
  // =====================================

  backToTable() {

    this.table_display = false;

    this.groupData = [];

    this.selectedDepartmentId = null;

  }

}