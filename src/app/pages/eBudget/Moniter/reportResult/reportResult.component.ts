import {
  Component,
  OnInit
} from '@angular/core';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  GridJsService
} from '../../../tables/gridjs/gridjs.service';

import {
  PaginationService
} from 'src/app/core/services/pagination.service';

import {
  DecimalPipe
} from '@angular/common';

import {
  EbudgetService
} from 'src/app/core/services/ebudget.service';

import {
  AuthenticationService
} from 'src/app/core/services/auth.service';

import {
  BudgetYearService
} from 'src/app/core/services/budget-year.service';

@Component({
  selector: 'app-report-result',

  providers: [
    GridJsService,
    DecimalPipe,
    EbudgetService
  ],

  templateUrl:
    './reportResult.component.html'
})

export class ReportResultComponent
  implements OnInit {

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

  currentYear: any;

  department: any[] = [];

  selectedDepartmentId: any = null;

  allData: any[] = [];

  griddata: any[] = [];

  griddataTemp: any[] = [];

  selectedItem: any = null;

  modalRef: any;

  selectedMonth: any = null;

  // เดือนตามไตรมาส
  quarterMonths = [

    ['ต.ค.', 'พ.ย.', 'ธ.ค.'],

    ['ม.ค.', 'ก.พ.', 'มี.ค.'],

    ['เม.ย.', 'พ.ค.', 'มิ.ย.'],

    ['ก.ค.', 'ส.ค.', 'ก.ย.']

  ];

  // data รายงาน
  reportData: any[] = [];

  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

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

    const model = {

      FUNC_CODE:
        'FUNC-Get_Budget_Plan_Moniter',

      BgYear:
        this.currentYear,

      Department_Id:
        this.selectedDepartmentId || 0,

      Status_Id:
        7

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.allData =

          Array.isArray(
            response
              ?.List_Budget_Plan_Data_Table
              ?.Data
          )

            ? response
              .List_Budget_Plan_Data_Table
              .Data

            : [];

        this.griddataTemp = [

          ...this.allData

        ];

        this.griddata = [

          ...this.allData

        ];

        this.department =

          Array.isArray(
            response
              ?.Mas_Department_Lists
          )

            ? response
              .Mas_Department_Lists

            : [];

      });

  }

  // =====================================
  // FILTER
  // =====================================

  applyFilter() {

    const model = {

      FUNC_CODE:
        'FUNC-Get_Budget_Plan_Moniter',

      BgYear:
        this.currentYear,

      Department_Id:
        this.selectedDepartmentId || 0,

      Status_Id:
        7

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.allData =

          Array.isArray(
            response
              ?.List_Budget_Plan_Data_Table
              ?.Data
          )

            ? response
              .List_Budget_Plan_Data_Table
              .Data

            : [];

        this.griddataTemp = [

          ...this.allData

        ];

        this.griddata = [

          ...this.allData

        ];

      });

  }

  // =====================================
  // CREATE EMPTY QUARTER
  // =====================================

  createQuarter() {

    return [

      {
        plan: 0,
        actual: 0,
        resbill: 0
      },

      {
        plan: 0,
        actual: 0,
        resbill: 0
      },

      {
        plan: 0,
        actual: 0,
        resbill: 0
      }

    ];

  }

  // =====================================
  // OPEN MAIN MODAL
  // =====================================

  fullModal(
    modal: any,
    data: any
  ) {

    this.selectedItem = data;

    // reset report
    this.reportData = [];

    // ตัวอย่างสร้าง 1 activity
    // จริงๆค่อย bind api ทีหลัง

    this.reportData.push({

      activity:
        data.Activity_Name || '',

      remark: '',

      quarters: [

        this.createQuarter(),

        this.createQuarter(),

        this.createQuarter(),

        this.createQuarter()

      ]

    });

    this.modalRef =
      this.modalService.open(
        modal,
        {
          backdrop: 'static',
          windowClass: 'modal-95'
        }
      );

  }

  // =====================================
  // MONTH DETAIL
  // =====================================

  openMonthModal(
    modal: any,
    item: any,
    qIndex: number,
    mIndex: number
  ) {

    this.selectedMonth = {

      item,

      quarterIndex:
        qIndex,

      monthIndex:
        mIndex

    };

    this.modalService.open(
      modal,
      {
        backdrop: 'static'
      }
    );

  }

  // =====================================
  // TOTAL PLAN
  // =====================================

  getTotalPlan(item: any) {

    return item.quarters
      .flat()
      .reduce(

        (sum: any, x: any) =>

          sum + (+x.plan || 0),

        0

      );

  }

  // =====================================
  // TOTAL ACTUAL
  // =====================================

  getTotalActual(item: any) {

    return item.quarters
      .flat()
      .reduce(

        (sum: any, x: any) =>

          sum + (+x.actual || 0),

        0

      );

  }

  // =====================================
  // GRAND PLAN
  // =====================================

  getGrandPlan() {

    return this.reportData
      .reduce(

        (sum: any, item: any) =>

          sum +
          this.getTotalPlan(item),

        0

      );

  }

  // =====================================
  // GRAND ACTUAL
  // =====================================

  getGrandActual() {

    return this.reportData
      .reduce(

        (sum: any, item: any) =>

          sum +
          this.getTotalActual(item),

        0

      );

  }

  // =====================================
  // SAVE
  // =====================================

  async save(modal: any) {

    const userConfirmed =

      await confirmAlert(
        'info',
        'ต้องการบันทึกข้อมูล ?',
        ''
      );

    if (!userConfirmed) {

      return;

    }

    const payload = {

      Budget_Plan_Id:
        this.selectedItem
          ?.Plan_Id || 0,

      BgYear:
        this.currentYear,

      Report_Data:
        this.reportData,

      Create_User:
        this.authService
          ?.currentUserValue
          ?.UserName || ''

    };

    console.log(
      'SAVE REPORT',
      payload
    );

    // TODO:
    // CALL API SAVE

    basicAlert(
      'success',
      'บันทึกข้อมูลแล้ว',
      ''
    );

    modal.dismiss();

  }

}