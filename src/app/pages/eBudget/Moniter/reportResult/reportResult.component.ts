import { Component, OnInit } from '@angular/core'; import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { DecimalPipe } from '@angular/common';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

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
  currentYear: any;
  department: any[] = [];
  selectedDepartmentId: any = null;
  allData: any[] = [];
  griddata: any[] = [];
  griddataTemp: any[] = [];
  selectedItem: any = null;
  modalRef: any;
  selectedMonth: any = null;
  Output_Result: any
  Outcome_Result: any
  Progress_Percent: any
  Problems: any
  Solutions: any
  Summary_Result: any
  Suggestions: any
  Progress_Id: any
  selectedTri = null;
  Tri_lists = [

    {
      Trimas_Id: 1,
      name: 'ไตรมาส 1'
    },

    {
      Trimas_Id: 2,
      name: 'ไตรมาส 2'
    },

    {
      Trimas_Id: 3,
      name: 'ไตรมาส 3'
    },

    {
      Trimas_Id: 4,
      name: 'ไตรมาส 4'
    }

  ];
  quarterMonths = [

    ['ต.ค.', 'พ.ย.', 'ธ.ค.'],
    ['ม.ค.', 'ก.พ.', 'มี.ค.'],
    ['เม.ย.', 'พ.ค.', 'มิ.ย.'],
    ['ก.ค.', 'ส.ค.', 'ก.ย.']
  ];
  steps: any[] = []
  reportData: any[] = [];
  currentStepIndex = -1;
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

            let Progress_list = res.Report_Budget_Plan_Progress
            this.Output_Result = Progress_list.Output_Result
            this.Outcome_Result = Progress_list.Outcome_Result
            this.Progress_Percent = Progress_list.Progress_Percent
            this.Problems = Progress_list.Problems
            this.Solutions = Progress_list.Solutions
            this.Summary_Result = Progress_list.Summary_Result
            this.Suggestions = Progress_list.Suggestions
            this.Progress_Id = Progress_list.Progress_Id
            this.selectedTri = Progress_list.Trimas_Id
            if (detailList.length > 0) {
              const detail = detailList[0];

              const months = [
                'Oct', 'Nov', 'Dec',
                'Jan', 'Feb', 'Mar',
                'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep'
              ];

              months.forEach((month, index) => {
                const q = Math.floor(index / 3);
                const m = index % 3;

                quarters[q][m] = {
                  ...quarters[q][m],
                  plan: detail[`${month}_Target`] || 0,
                  actual: detail[`${month}_Amount`] || 0,
                  resbill: detail[`${month}_Withdraw_Amount`] || 0
                };
              });
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
                          && +x.Is_Proceed === 1
                      );

                  });
                  this.currentStepIndex =
                    this.reportSteps.findIndex(
                      (x: any) => x.checked
                    );
                  const currentIndex =
                    this.reportSteps.findIndex(
                      (x: any) => x.checked
                    );

                  this.steps =
                    this.reportSteps.map(
                      (x: any, index: number) => ({

                        no: index + 1,

                        name: x.Invest_Name,

                        active:
                          index === currentIndex,

                        done:
                          index < currentIndex

                      })
                    );
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
  onSelectInvest(selected: any) {

    this.reportSteps.forEach((x: any) => {
      x.checked = false;
    });

    selected.checked = true;

    this.currentStepIndex =
      this.reportSteps.findIndex(
        (x: any) => x.checked
      );

  }
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
    const months = [
      'Oct', 'Nov', 'Dec',
      'Jan', 'Feb', 'Mar',
      'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep'
    ];

    return this.reportData.map(item => {
      const allMonths = item.quarters.flat();

      const detail: any = {
        BgYear: this.currentYear,
        Fk_Activity_Id: item.activityId,
        Activity_Name: item.activity,
        Sum_Used_Amount: 0
      };

      ['Target', 'Amount', 'Used_Amount', 'Withdraw_Amount']
        .forEach(type => {
          months.forEach((month, i) => {
            const data = allMonths[i] || {};

            detail[`${month}_${type}`] =
              type === 'Target' ? data.plan || 0 :
                type === 'Amount' ? data.actual || 0 :
                  type === 'Withdraw_Amount' ? data.resbill || 0 :
                    0;
          });
        });

      detail.Sum_Target = allMonths.reduce((s: any, x: any) => s + (+x?.plan || 0), 0);
      detail.Sum_Amount = allMonths.reduce((s: any, x: any) => s + (+x?.actual || 0), 0);
      detail.Sum_Withdraw_Amount = allMonths.reduce((s: any, x: any) => s + (+x?.resbill || 0), 0);

      return detail;
    });
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
  onQuarterChange() {

    const model = {
      FUNC_CODE: 'FUNC-Get_Report_Budget_Plan_Progress',
      Fk_Plan_Id: this.selectedItem.Plan_Id,
      Trimas_Id: this.selectedTri
    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((res: any) => {

        this.Output_Result = res.Report_Budget_Plan_Progress.Output_Result;
        this.Outcome_Result = res.Report_Budget_Plan_Progress.Outcome_Result;
        this.Progress_Percent = res.Report_Budget_Plan_Progress.Progress_Percent;
        this.Problems = res.Report_Budget_Plan_Progress.Problems;
        this.Solutions = res.Report_Budget_Plan_Progress.Solutions;
        this.Summary_Result = res.Report_Budget_Plan_Progress.Summary_Result;
        this.Suggestions = res.Report_Budget_Plan_Progress.Suggestions;
        this.Progress_Id = res.Report_Budget_Plan_Progress.Progress_Id;

      });

  }
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

    const Plan_Progress = {
      Output_Result: this.Output_Result,
      Outcome_Result: this.Outcome_Result,
      Progress_Percent: this.Progress_Percent,
      Problems: this.Problems,
      Solutions: this.Solutions,
      Summary_Result: this.Summary_Result,
      Suggestions: this.Suggestions,
      BgYear: this.currentYear,
      Progress_Id: this.Progress_Id || 0,
      Active: true,
      Trimas_Id: this.selectedTri
    }

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

          ? this.reportSteps.map(x => ({

            Invest_Id:
              x.Invest_Id,

            Invest_Name:
              x.Invest_Name,

            Is_Proceed:
              x.checked ? 1 : 0

          }))

          : []
      ,
      Report_Budget_Plan_Progress: Plan_Progress
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

    if (!this.reportSteps?.length) {

      const model = {

        FUNC_CODE:
          'FUNC-Get_Mas_Report_Investment',

      };

      this.servicebud
        .GatewayGetData(model)
        .subscribe((response: any) => {

          this.reportSteps =
            response.List_Mas_Report_Investment || [];

          this.modalRef =
            this.modalService.open(
              modal,
              {
                backdrop: 'static',
                windowClass: 'modal-75'
              }
            );

        });

    } else {

      this.modalRef =
        this.modalService.open(
          modal,
          {
            backdrop: 'static',
            windowClass: 'modal-75'
          }
        );

    }

  }
  reportSteps: any[] = []
  saveReport(modal: any) {

    const checkedList =
      this.reportSteps
        .filter(x => x.checked)
        .map(x => x.Invest_Name);

    console.log(checkedList);

    modal.close();

  }
}