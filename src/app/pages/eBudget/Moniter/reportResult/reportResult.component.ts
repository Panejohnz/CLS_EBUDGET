import { Component, OnInit } from '@angular/core'; import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { DecimalPipe } from '@angular/common';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-report-result',
  providers: [
    GridJsService,
    DecimalPipe,
    EbudgetService
  ],
  templateUrl:
    './reportResult.component.html',
  styles: [`
    .readonly-select {
      pointer-events: none;
      background-color: var(--vz-secondary-bg, #e9ecef);
      color: #6c757d;
      opacity: 1;
    }
  `]
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
  Output_Result: any[] = [];
  Outcome_Result: any[] = [];
  Progress_Percent: any
  Problems: any
  Solutions: any
  Summary_Result: any
  Suggestions: any
  Progress_Id: any
  selectedTri = null;
  Mas_Unit_Lists: any
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
  userSession: any;

  get isDepartmentLocked(): boolean {
    return this.userSession?.permissionData?.VIEW_DATA == 3;
  }

  ngOnInit(): void {
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

  get_data() {
    const model = {
      FUNC_CODE:
        'FUNC-Get_Budget_Plan_Moniter',
      BgYear:
        this.currentYear,

      Department_Id:
        this.isDepartmentLocked
          ? (this.selectedDepartmentId || 0)
          : 0,

      Status_Id:
        7

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {


        this.allData = Array.isArray(response.List_Budget_Plan_Data_Table.Data)
          ? response.List_Budget_Plan_Data_Table.Data
          : [];
        this.department = Array.isArray(response.Mas_Department_Lists)
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

        this.griddataTemp = [...this.allData];
        this.griddata = [...this.allData];
        this.applyFilter();
      });

  }

  applyFilter() {
    let data = [
      ...this.griddataTemp
    ];

    if (this.selectedDepartmentId) {
      data = data.filter(
        (x: any) => x.Department_Id == this.selectedDepartmentId
      );
    }

    this.griddata = data;

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
            const items = res.Project_Plan_Detail_Item || [];
            const details = res.Project_Plan_Detail || [];
            details.forEach((d: any) => {
              d.Project_Detail_Id = Number(d.Project_Detail_Id);
              d.Parent_Id = d.Parent_Id ? Number(d.Parent_Id) : null;
            });
            this.Mas_Unit_Lists = Array.isArray(res.List_Mas_Unit)
              ? res.List_Mas_Unit
              : [];
            const activities = this.mapPlanDetail(details);
            this.mapItems(items, activities);

            this.model.activities = activities;

            let Progress_list = res.Report_Budget_Plan_Progress
            this.Output_Result = Progress_list?.Output_Result
              ? JSON.parse(Progress_list.Output_Result)
              : (res.Project_Output || []);

            this.Outcome_Result = Progress_list?.Outcome_Result
              ? JSON.parse(Progress_list.Outcome_Result)
              : (res.Project_Outcome || []);
            this.normalizeUnitBindings();

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
  mapPlanDetail(data: any[]) {

    return data.map(x => ({

      id: Number(x.Project_Detail_Id),
      name: x.Activity_Name,
      owner: x.Responsible,

      noBudget: x.Used_BG === 0,
      consult: x.Is_Consult === 1,

      quarters: this.convertMonths(x.Months),

      // 🔥 เพิ่มตรงนี้
      sumAmount: Number(x.Sum_Amount ?? x.Sum_Amount_Total ?? 0),
      _edited: false,
      otherExpenses: [],
      multiplierTotal: 0,

      SubActivities: (x.SubActivities || []).map((s: any) => ({

        id: Number(s.Project_Detail_Id),
        Project_Detail_Id: Number(s.Project_Detail_Id),
        name: s.Activity_Name,
        owner: s.Responsible,

        noBudget: s.Used_BG === 0,
        consult: s.Is_Consult === 1,

        quarters: this.convertMonths(s.Months),

        // 🔥 เพิ่มตรงนี้
        sumAmount: Number(s.Sum_Amount) || 0,

        _edited: false,
        otherExpenses: [],
        multiplierTotal: 0

      }))

    }));
  }
  convertMonths(months: any[]) {

    const MONTHS = [
      'ต.ค.', 'พ.ย.', 'ธ.ค.',
      'ม.ค.', 'ก.พ.', 'มี.ค.',
      'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.'
    ];

    const mapped = months.map((m, i) => ({
      month: MONTHS[i],
      selected: m.Selected,
      budget: m.Budget
    }));

    return [
      { quarter: 1, months: mapped.slice(0, 3) },
      { quarter: 2, months: mapped.slice(3, 6) },
      { quarter: 3, months: mapped.slice(6, 9) },
      { quarter: 4, months: mapped.slice(9, 12) }
    ];
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

    // 🔥 reset ก่อน
    Object.values(map).forEach((a: any) => {
      a.otherExpenses = [];
      a.multiplierTotal = 0; // <<<<<< สำคัญ
    });

    items.forEach(i => {

      const key = Number(i.Fk_Project_Detail_Id);
      const target = map[key];

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

        // 🔥 บรรทัดนี้คือคำตอบ
        target.multiplierTotal += (i.Total || 0);
      }

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

        this.Output_Result = res.Report_Budget_Plan_Progress?.Output_Result
          ? JSON.parse(res.Report_Budget_Plan_Progress.Output_Result)
          : [];

        this.Outcome_Result = res.Report_Budget_Plan_Progress?.Outcome_Result
          ? JSON.parse(res.Report_Budget_Plan_Progress.Outcome_Result)
          : [];
        this.normalizeUnitBindings();
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
      Progress_Percent: this.Progress_Percent,
      Problems: this.Problems,
      Solutions: this.Solutions,
      Summary_Result: this.Summary_Result,
      Suggestions: this.Suggestions,
      BgYear: this.currentYear,
      Progress_Id: this.Progress_Id || 0,
      Active: true,
      Trimas_Id: this.selectedTri || 0
    };

    const model = {
      FUNC_CODE: 'FUNC-Save_Report_Budget_Plan',

      Report_Budget_Plan: payload,

      List_Report_Budget_Plan_Detail:
        this.buildDetailData(),

      List_Report_Budget_Plan_Detail_Month:
        this.buildMonthData(),

      List_Report_Budget_Plan_Investment:
        this.selectedItem?.Fk_Budget_Type == 3
          ? this.reportSteps.map(x => ({
            Invest_Id: x.Invest_Id,
            Invest_Name: x.Invest_Name,
            Is_Proceed: x.checked ? 1 : 0
          }))
          : [],

      Report_Budget_Plan_Progress: Plan_Progress,

      Project_Output: this.Output_Result,
      Project_Outcome: this.Outcome_Result
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
                windowClass: 'modal-full'
              }
            );

        });

    } else {

      this.modalRef =
        this.modalService.open(
          modal,
          {
            backdrop: 'static',
            windowClass: 'modal-full'
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

    modal.close();

  }

  normalizeUnitBindings() {
    this.Mas_Unit_Lists = Array.isArray(this.Mas_Unit_Lists)
      ? this.Mas_Unit_Lists.map((item: any) => ({
        ...item,
        Unit_Id: item?.Unit_Id != null ? Number(item.Unit_Id) : null
      }))
      : [];

    this.Output_Result = Array.isArray(this.Output_Result)
      ? this.Output_Result.map((item: any) => ({
        ...item,
        Unit: item?.Unit != null ? Number(item.Unit) : null
      }))
      : [];
  }

  project_planing = {
    projectType: ''
  };

  model: any = {}
  movingIndex: number | null = null;
  // ส่วนกิจกรรม
  dropActivity(event: any) {
    moveItemInArray(this.model.activities, event.previousIndex, event.currentIndex);
    this.reIndexSort();
  }
  reIndexSort() {
    this.model.activities.forEach((a: any, i: number) => {
      a.Seq = i + 1;
    });
  }
  trackById(index: number, item: any) {
    return item.id || index;
  }
  moveUp(index: number) {
    if (index === 0) return;

    this.movingIndex = index;

    const arr = this.model.activities;
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];

    this.reIndexSort();

    setTimeout(() => {
      this.movingIndex = null;
    }, 300);
  }

  moveDown(index: number) {
    const arr = this.model.activities;
    if (index === arr.length - 1) return;

    this.movingIndex = index;

    [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];

    this.reIndexSort();

    setTimeout(() => {
      this.movingIndex = null;
    }, 300);
  }
  onBudgetChange(month: any) {

    if (month.budget && month.budget > 0) {
      month.selected = true;
    } else {
      month.selected = false;
    }

  }
  syncMainFromSub(act: any) {

    if (!act.SubActivities?.length) return;

    act.quarters.forEach((q: any, qIndex: number) => {

      q.months.forEach((m: any, mIndex: number) => {

        const hasSelected = act.SubActivities.some((sub: any) => {
          return sub.quarters?.[qIndex]?.months?.[mIndex]?.selected;
        });

        m.selected = hasSelected;
      });

    });

  }
  displayValue(value: any): string {
    if (value === null || value === undefined || value === '') return '';

    let str = value.toString();

    if (!/[0-9]/.test(str)) return '';

    const parts = str.split('.');

    const intPart = Number(parts[0] || 0).toLocaleString('en-US');

    if (parts.length > 1) {
      const decimal = parts[1].slice(0, 2);
      return `${intPart}.${decimal}`;
    }

    return intPart;
  }
  onInputFormat(event: any, month: any) {

    let val = event.target.value || '';

    val = val.replace(/[^0-9.,]/g, '');

    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    event.target.value = val;
    const num = Number(val.replace(/,/g, ''));

    month.budget = isNaN(num) ? 0 : num;
    month.selected = month.budget > 0;

    this.model.activities.forEach((act: any) => {
      act._edited = true;
      act.SubActivities?.forEach((sub: any) => {
        sub._edited = true;
      });
    });
  }
  allowOnlyNumber(event: KeyboardEvent) {
    const char = event.key;
    if (!/[0-9.,]/.test(char)) {
      event.preventDefault();
    }
  }
  activities: any[] = [];
  removeActivity(i: number) {
    this.activities.splice(i, 1);
  }
  selectedActivityId: number | null = null;
  selectedLevel: 'act' | 'sub' | null = null;
  selectedActivity: any;
  type: string = '';
  formTypeMap: any = {
    73: 'seminar',
    74: 'pr',
    64: 'investment',
    75: 'consult',
    70: 'other'
  }
  openMultiplierModal(content: any, item: any, level: 'act' | 'sub' = 'act') {

    this.selectedActivity = item;
    item._useMultiplier = true;
    this.selectedActivityId = item.Project_Detail_Id || item.id;

    if (item.SubActivities?.length) {
      item.SubActivities.forEach((sub: any) => {
        sub._useMultiplier = true;
      });
    }


    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modal-95'
    }).result.then(() => {
      item._useMultiplier = true;
      item.multiplierTotal = (item.otherExpenses || []).reduce((sum: number, i: any) => {
        return sum + (i.total || i.Total || 0);
      }, 0);

    }).catch(() => { });
  }
  getMultiplierTotal(act: any): number {

    if (act.SubActivities?.length) {
      return act.SubActivities.reduce((sum: number, sub: any) => {
        return sum + this.getMultiplierTotal(sub);
      }, 0);
    }

    if (act.otherExpenses?.length) {
      return act.otherExpenses.reduce((sum: number, item: any) => {
        return sum + (item.total || item.Total || 0);
      }, 0);
    }

    return act.multiplierTotal || 0;
  }
  getActivityTotal(act: any): number {

    if (act.SubActivities?.length) {
      return act.SubActivities.reduce((sum: number, sub: any) => {
        return sum + this.getActivityTotal(sub);
      }, 0);
    }

    if (!act._edited && act.sumAmount != null) {
      return Number(act.sumAmount);
    }

    let total = 0;

    (act.quarters || []).forEach((q: any) => {
      (q.months || []).forEach((m: any) => {
        total += Number(m.budget) || 0;
      });
    });

    return total;
  }
  onSubBudgetChange(event: any, sub: any, qIndex: number, rowIndex: number) {

    let val = event.target.value || '';
    val = val.replace(/[^0-9.]/g, '');

    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }

    const [intPart, decimalPart] = val.split('.');

    const intFormatted = intPart
      ? Number(intPart).toLocaleString('en-US')
      : '';

    let finalValue = intFormatted;

    if (decimalPart !== undefined) {
      finalValue += '.' + decimalPart.slice(0, 2);
    }

    event.target.value = finalValue;

    const num = Number(intPart + (decimalPart ? '.' + decimalPart : ''));

    const month = sub.quarters?.[qIndex]?.months?.[rowIndex];

    if (month) {
      month.budget = isNaN(num) ? 0 : num;
      month.selected = month.budget > 0;
    }

    sub._edited = true;

    this.sumMainBudgetFromSub(
      this.model.activities.find((a: any) =>
        a.SubActivities?.includes(sub)
      )
    );
  }
  sumMainBudgetFromSub(act: any) {

    if (!act?.SubActivities?.length) return;

    act.quarters.forEach((q: any, qIndex: number) => {

      q.months.forEach((m: any, mIndex: number) => {

        let total = 0;
        let hasValue = false;

        act.SubActivities.forEach((sub: any) => {

          const budget =
            Number(sub.quarters?.[qIndex]?.months?.[mIndex]?.budget);

          if (!isNaN(budget) && budget > 0) {
            total += budget;
            hasValue = true;
          }

        });

        m.budget = hasValue ? total : null;

        m.selected = hasValue;

      });

    });

  }
  removeSub(act: any, i: number) {

    const sub = act.SubActivities[i];
    if (!sub.Project_Detail_Id) {
      act.SubActivities.splice(i, 1);
      return
    }
    let model = {
      FUNC_CODE: "FUNC-Delete_Project_Plan_Detail",
      Project_Detail_Id: sub.Project_Detail_Id
    }
    var getData = this.servicebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      act.SubActivities.splice(i, 1);
    })

  }
}
