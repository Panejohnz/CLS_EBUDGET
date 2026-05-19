import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
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
export class ProjectAllocationComponent {

  constructor(
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService
  ) { }

  table_display: boolean = false;

  department: any[] = [];

  griddata: any[] = [];

  griddataTemp: any[] = [];

  flattenData: any[] = [];

  allData: any[] = [];

  selectedDepartmentId: any = null;

  currentYear: any;

  item: any = {

    alloc1: 0,

    alloc2: 0,

    alloc3: 0

  };

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

      FUNC_CODE: "FUNC-Get_Budget_Request",

      BgYear: this.currentYear

    };

    var getData =
      this.servicebud.GatewayGetData(model);

    getData.subscribe((response: any) => {

      this.allData =
        Array.isArray(
          response.List_Budget_Request_Data_Table.Data
        )
          ? response.List_Budget_Request_Data_Table.Data
          : [];

      this.griddataTemp = [
        ...this.allData
      ];

      this.griddata = [
        ...this.allData
      ];

      this.department =
        Array.isArray(
          response.Mas_Department_Lists
        )
          ? response.Mas_Department_Lists
          : [];

    });

  }

  // =====================================
  // FILTER
  // =====================================

  applyFilter() {

    let data = [
      ...this.griddataTemp
    ];

    if (this.selectedDepartmentId) {

      data = data.filter(
        x =>
          x.Department_Id ==
          this.selectedDepartmentId
      );

    }

    if (this.service.searchTerm) {

      const keyword =
        this.service.searchTerm.toLowerCase();

      data = data.filter(x =>

        (x.Department_Name || '')
          .toLowerCase()
          .includes(keyword)

        ||

        (x.Plan_Name || '')
          .toLowerCase()
          .includes(keyword)

        ||

        (x.Product_Name || '')
          .toLowerCase()
          .includes(keyword)

        ||

        (x.Activity_Name || '')
          .toLowerCase()
          .includes(keyword)

        ||

        (x.Budget_Type || '')
          .toLowerCase()
          .includes(keyword)

        ||

        (x.Project_Name || '')
          .toLowerCase()
          .includes(keyword)

        ||

        (x.Status_Name || '')
          .toLowerCase()
          .includes(keyword)

        ||

        String(x.Total || '')
          .includes(keyword)

      );

    }

    this.griddata = data;

  }

  // =====================================
  // DETAIL
  // =====================================

  Detail(item: any) {

    this.table_display = true;

    // filter ข้อมูลตาม row ที่กด
    const rows = this.allData.filter(

      (x: any) =>

        x.Department_Id ==
        item.Department_Id

        &&

        x.Fk_Plan_Id ==
        item.Fk_Plan_Id

        &&

        x.Fk_Product_Id ==
        item.Fk_Product_Id

        &&

        x.Fk_Activity_Id ==
        item.Fk_Activity_Id

        &&

        x.Fk_Budget_Type ==
        item.Fk_Budget_Type

    );

    console.log('DETAIL ROWS', rows);

    // map ลง table
    this.flattenData = rows.map((x: any) => {

      return {

        // =====================
        // PLAN
        // =====================

        Plan_Name:

          x.Plan_Name ||

          '',

        // =====================
        // PRODUCT
        // =====================

        Product_Name:

          x.Product_Name ||

          '',

        // =====================
        // ACTIVITY
        // =====================

        Activity_Name:

          x.Activity_Name ||

          '',

        // =====================
        // BUDGET TYPE
        // =====================

        Budget_Type:

          x.Budget_Type ||

          x.Budget_Type_Name ||

          '',

        // =====================
        // EXPENSE
        // =====================

        Expense_List:

          x.Expense_List ||

          x.Expense_Detail ||

          x.Expense_Name ||

          '',

        // =====================
        // BUDGET
        // =====================

        Total:

          Number(
            x.Total || 0
          ),

        // =====================
        // ALLOCATE
        // =====================

        Adjust1:

          Number(
            x.Adjust1 || 0
          ),

        Adjust2:

          Number(
            x.Adjust2 || 0
          ),

        Adjust3:

          Number(
            x.Adjust3 || 0
          ),

        // =====================
        // ID
        // =====================

        Request_Id:

          x.Request_Id || 0,

        Request_Detail_Id:

          x.Request_Detail_Id || 0,

        Fk_Expense_Id:

          x.Fk_Expense_Id || 0

      };

    });

    console.log(
      'FLATTEN DATA',
      this.flattenData
    );

  }

  // =====================================
  // SAVE ADJUST
  // =====================================

  saveAdjust() {

    console.log(this.flattenData);

  }

  // =====================================
  // BACK
  // =====================================

  backToTable() {

    this.table_display = false;

  }

}