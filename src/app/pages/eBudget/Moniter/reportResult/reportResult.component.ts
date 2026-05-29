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
  steps = [
    { no: 1, name: 'ร่าง TOR' },
    { no: 2, name: 'ประกาศ' },
    { no: 3, name: '' },
    { no: 4, name: '' },
    { no: 5, name: '' },
    { no: 6, name: '' },
    { no: 7, name: '' },
    { no: 8, name: '' },
    { no: 9, name: '' }
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


  createQuarter() {

    return [

      {
        plan: 0,
        actual: 0,
        resbill: 0,

        planRemark: '',
        noPlanRemark: '',

        monthId: 0,
        monthName: ''
      },

      {
        plan: 0,
        actual: 0,
        resbill: 0,

        planRemark: '',
        noPlanRemark: '',

        monthId: 0,
        monthName: ''
      },

      {
        plan: 0,
        actual: 0,
        resbill: 0,

        planRemark: '',
        noPlanRemark: '',

        monthId: 0,
        monthName: ''
      }

    ];

  }
  getMonthId(
    quarterIndex: number,
    monthIndex: number
  ): number {

    const monthMap = [

      [10, 11, 12],
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9]

    ];

    return monthMap[quarterIndex][monthIndex];

  }


  fullModal(
    modal: any,
    data: any
  ) {
    console.log('data', data);



    this.selectedItem = data;

    const createPayload = {

      Fk_Plan_Id:
        +data.Plan_Id,

      BgYear:
        this.currentYear,

      Department_Id:
        +data.Department_Id,

      Department_Name:
        data.Department_Name,

      Fk_Expense_List:
        +data.Fk_Expense_List,

      Expense_List:
        data.Expense_List,

      Project_Name:
        data.Project_Name || ''

    };

    const createModel = {

      FUNC_CODE:
        'FUNC-Create_Report_Budget_Plan',

      Report_Budget_Plan:
        createPayload

    };

    this.servicebud
      .GatewayGetData(createModel)
      .subscribe(() => {

        const getModel = {

          FUNC_CODE:
            'FUNC-Get_Report_Budget_Plan',

          Fk_Plan_Id: data.Plan_Id

        };

        this.servicebud
          .GatewayGetData(getModel)
          .subscribe((res: any) => {


            this.reportData = [];

            const quarters = [

              this.createQuarter(),
              this.createQuarter(),
              this.createQuarter(),
              this.createQuarter()

            ];

            quarters.forEach(
              (q: any, qIndex: number) => {

                q.forEach(
                  (m: any, mIndex: number) => {

                    m.monthId =
                      this.getMonthId(
                        qIndex,
                        mIndex
                      );

                    m.monthName =
                      this.quarterMonths[qIndex][mIndex];

                  });

              });

            const detailList =
              res?.List_Report_Budget_Plan_Detail || [];

            const monthList =
              res?.List_Report_Budget_Plan_Detail_Month || [];
            const investList =
              res?.List_Report_Budget_Plan_Investment || [];


            if (detailList.length > 0) {

              const detail =
                detailList[0];

              quarters[0][0].plan = detail.Oct_Target || 0;
              quarters[0][1].plan = detail.Nov_Target || 0;
              quarters[0][2].plan = detail.Dec_Target || 0;

              quarters[1][0].plan = detail.Jan_Target || 0;
              quarters[1][1].plan = detail.Feb_Target || 0;
              quarters[1][2].plan = detail.Mar_Target || 0;

              quarters[2][0].plan = detail.Apr_Target || 0;
              quarters[2][1].plan = detail.May_Target || 0;
              quarters[2][2].plan = detail.Jun_Target || 0;

              quarters[3][0].plan = detail.Jul_Target || 0;
              quarters[3][1].plan = detail.Aug_Target || 0;
              quarters[3][2].plan = detail.Sep_Target || 0;

              // ACTUAL
              quarters[0][0].actual = detail.Oct_Amount || 0;
              quarters[0][1].actual = detail.Nov_Amount || 0;
              quarters[0][2].actual = detail.Dec_Amount || 0;

              quarters[1][0].actual = detail.Jan_Amount || 0;
              quarters[1][1].actual = detail.Feb_Amount || 0;
              quarters[1][2].actual = detail.Mar_Amount || 0;

              quarters[2][0].actual = detail.Apr_Amount || 0;
              quarters[2][1].actual = detail.May_Amount || 0;
              quarters[2][2].actual = detail.Jun_Amount || 0;

              quarters[3][0].actual = detail.Jul_Amount || 0;
              quarters[3][1].actual = detail.Aug_Amount || 0;
              quarters[3][2].actual = detail.Sep_Amount || 0;

              // WITHDRAW
              quarters[0][0].resbill = detail.Oct_Withdraw_Amount || 0;
              quarters[0][1].resbill = detail.Nov_Withdraw_Amount || 0;
              quarters[0][2].resbill = detail.Dec_Withdraw_Amount || 0;

              quarters[1][0].resbill = detail.Jan_Withdraw_Amount || 0;
              quarters[1][1].resbill = detail.Feb_Withdraw_Amount || 0;
              quarters[1][2].resbill = detail.Mar_Withdraw_Amount || 0;

              quarters[2][0].resbill = detail.Apr_Withdraw_Amount || 0;
              quarters[2][1].resbill = detail.May_Withdraw_Amount || 0;
              quarters[2][2].resbill = detail.Jun_Withdraw_Amount || 0;

              quarters[3][0].resbill = detail.Jul_Withdraw_Amount || 0;
              quarters[3][1].resbill = detail.Aug_Withdraw_Amount || 0;
              quarters[3][2].resbill = detail.Sep_Withdraw_Amount || 0;

            }

            monthList.forEach((m: any) => {

              const month =
                quarters
                  .flat()
                  .find(
                    (x: any) =>
                      +x.monthId === +m.Month_Id
                  );
              if (month) {

                month.planRemark =
                  m.Plan || '';

                month.noPlanRemark =
                  m.NoPlan || '';

              }

            });

            this.reportData.push({

              activityId:
                +data.Fk_Activity_Id || 0,

              activity:
                data.Activity_Name || '',

              remark: '',

              quarters

            });
            if (+data.Fk_Budget_Type === 3) {

              const investModel = {

                FUNC_CODE:
                  'FUNC-Get_Mas_Report_Investment'

              };

              this.servicebud
                .GatewayGetData(investModel)
                .subscribe((masterRes: any) => {

                  this.reportSteps =
                    masterRes?.List_Mas_Report_Investment || [];

                  this.reportSteps.forEach((step: any) => {

                    step.checked =
                      investList.some(
                        (x: any) =>
                          +x.Invest_Id === +step.Invest_Id
                      );

                  });

                  this.modalRef =
                    this.modalService.open(
                      modal,
                      {
                        backdrop: 'static',
                        windowClass: 'modal-95'
                      }
                    );

                });

            }
            else {

              this.modalRef =
                this.modalService.open(
                  modal,
                  {
                    backdrop: 'static',
                    windowClass: 'modal-95'
                  }
                );

            }
          });

      });

  }
  openMonthModal(
    modal: any,
    item: any,
    qIndex: number,
    mIndex: number
  ) {

    const monthData =
      item.quarters[qIndex][mIndex];

    monthData.monthId =
      this.getMonthId(
        qIndex,
        mIndex
      );

    monthData.monthName =
      this.quarterMonths[qIndex][mIndex];

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
  getTotalWithdraw(item: any) {

    return item.quarters
      .flat()
      .reduce(

        (sum: any, x: any) =>

          sum + (+x.resbill || 0),

        0

      );

  }
  getGrandWithdraw() {

    return this.reportData
      .reduce(

        (sum: any, item: any) =>

          sum +
          this.getTotalWithdraw(item),

        0

      );

  }
  buildDetailData() {

    const details: any[] = [];

    this.reportData.forEach(item => {

      const allMonths =
        item.quarters.flat();

      details.push({

        BgYear:
          this.currentYear,

        Fk_Activity_Id:
          item.activityId,

        Activity_Name:
          item.activity,

        // TARGET
        Oct_Target: allMonths[0]?.plan || 0,
        Nov_Target: allMonths[1]?.plan || 0,
        Dec_Target: allMonths[2]?.plan || 0,
        Jan_Target: allMonths[3]?.plan || 0,
        Feb_Target: allMonths[4]?.plan || 0,
        Mar_Target: allMonths[5]?.plan || 0,
        Apr_Target: allMonths[6]?.plan || 0,
        May_Target: allMonths[7]?.plan || 0,
        Jun_Target: allMonths[8]?.plan || 0,
        Jul_Target: allMonths[9]?.plan || 0,
        Aug_Target: allMonths[10]?.plan || 0,
        Sep_Target: allMonths[11]?.plan || 0,

        Sum_Target:
          allMonths.reduce(
            (s: number, x: any) =>
              s + (+x.plan || 0),
            0
          ),

        // ACTUAL
        Oct_Amount: allMonths[0]?.actual || 0,
        Nov_Amount: allMonths[1]?.actual || 0,
        Dec_Amount: allMonths[2]?.actual || 0,
        Jan_Amount: allMonths[3]?.actual || 0,
        Feb_Amount: allMonths[4]?.actual || 0,
        Mar_Amount: allMonths[5]?.actual || 0,
        Apr_Amount: allMonths[6]?.actual || 0,
        May_Amount: allMonths[7]?.actual || 0,
        Jun_Amount: allMonths[8]?.actual || 0,
        Jul_Amount: allMonths[9]?.actual || 0,
        Aug_Amount: allMonths[10]?.actual || 0,
        Sep_Amount: allMonths[11]?.actual || 0,

        Sum_Amount:
          allMonths.reduce(
            (s: number, x: any) =>
              s + (+x.actual || 0),
            0
          ),

        // USED
        Oct_Used_Amount: 0,
        Nov_Used_Amount: 0,
        Dec_Used_Amount: 0,
        Jan_Used_Amount: 0,
        Feb_Used_Amount: 0,
        Mar_Used_Amount: 0,
        Apr_Used_Amount: 0,
        May_Used_Amount: 0,
        Jun_Used_Amount: 0,
        Jul_Used_Amount: 0,
        Aug_Used_Amount: 0,
        Sep_Used_Amount: 0,

        Sum_Used_Amount: 0,

        // WITHDRAW
        Oct_Withdraw_Amount: allMonths[0]?.resbill || 0,
        Nov_Withdraw_Amount: allMonths[1]?.resbill || 0,
        Dec_Withdraw_Amount: allMonths[2]?.resbill || 0,
        Jan_Withdraw_Amount: allMonths[3]?.resbill || 0,
        Feb_Withdraw_Amount: allMonths[4]?.resbill || 0,
        Mar_Withdraw_Amount: allMonths[5]?.resbill || 0,
        Apr_Withdraw_Amount: allMonths[6]?.resbill || 0,
        May_Withdraw_Amount: allMonths[7]?.resbill || 0,
        Jun_Withdraw_Amount: allMonths[8]?.resbill || 0,
        Jul_Withdraw_Amount: allMonths[9]?.resbill || 0,
        Aug_Withdraw_Amount: allMonths[10]?.resbill || 0,
        Sep_Withdraw_Amount: allMonths[11]?.resbill || 0,

        Sum_Withdraw_Amount:
          allMonths.reduce(
            (s: number, x: any) =>
              s + (+x.resbill || 0),
            0
          )

      });

    });

    return details;

  }
  buildMonthData() {

    const months: any[] = [];

    this.reportData.forEach(item => {

      item.quarters.forEach(
        (quarter: any[]) => {

          quarter.forEach(
            (month: any) => {

              months.push({

                Month_Id:
                  month.monthId,

                Month_Name:
                  month.monthName,

                Plan:
                  month.planRemark,

                NoPlan:
                  month.noPlanRemark

              });

            }
          );

        }
      );

    });

    return months;

  }
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


      BgYear:
        this.currentYear,

      Fk_Plan_Id:
        +this.selectedItem?.Plan_Id || 0,

      Department_Id:
        +this.selectedItem?.Department_Id || 0,

      Department_Name:
        this.selectedItem?.Department_Name || '',

      Fk_Expense_List:
        +this.selectedItem?.Fk_Expense_List || 0,

      Expense_List:
        this.selectedItem?.Expense_List || '',

      Project_Name:
        this.selectedItem?.Project_Name || '',

      Project_Type_Id:
        this.selectedItem?.Project_Type_Id || '',

      Project_Type_Name:
        this.selectedItem?.Project_Type_Name || '',

      Create_User:
        this.authService?.currentUserValue?.UserName || '',

      Update_User:
        this.authService?.currentUserValue?.UserName || ''
    };

    const model = {

      FUNC_CODE:
        'FUNC-Save_Report_Budget_Plan',

      Report_Budget_Plan: payload,

      List_Report_Budget_Plan_Detail:
        this.buildDetailData(),

      List_Report_Budget_Plan_Detail_Month:
        this.buildMonthData(),

      List_Report_Budget_Plan_Investment:

        this.selectedItem?.Fk_Budget_Type == 3

          ? this.reportSteps
            .filter(x => x.checked)
            .map(x => ({
              Invest_Id: x.Invest_Id,
              Invest_Name: x.Invest_Name,
              Is_Proceed: 1
            }))

          : []

    };


    this.servicebud
      .GatewayGetData(model)
      .subscribe({

        next: (response: any) => {

          basicAlert(
            'success',
            'บันทึกข้อมูลสำเร็จ',
            ''
          );

          modal.dismiss();

          this.get_data();

        },

        error: (err: any) => {

          console.error(err);

          basicAlert(
            'error',
            'เกิดข้อผิดพลาด',
            ''
          );

        }

      });

  }
  fullModalreport(modal: any, data: any) {

    const model = {

      FUNC_CODE:
        'FUNC-Get_Mas_Report_Investment',

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.reportSteps = response.List_Mas_Report_Investment


      });


    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-75'
    });
  }
  reportSteps: any[] = []

  saveReport(modal: any) {
    const checkedList = this.reportSteps
      .filter(x => x.checked)
      .map(x => x.label);

    modal.close();
  }
}