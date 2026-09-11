import {
  Component,
  OnInit
} from '@angular/core';
import {
  NgbDateParserFormatter,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { LOCALE_ID } from '@angular/core';
import { ThaiDateFormatter } from '../../../../thai-date-formatter';
import {
  NgbDatepickerI18n
} from '@ng-bootstrap/ng-bootstrap';

import { ThaiDatepickerI18n }
  from '../../../../thai-datepicker-i18n';
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

import {
  MasterService
} from 'src/app/core/services/Master.service';

@Component({
  selector: 'app-project-transfer',
  providers: [
    GridJsService,
    DecimalPipe,
    EbudgetService,
    {
      provide: NgbDateParserFormatter,
      useClass: ThaiDateFormatter
    },
    {
      provide: NgbDatepickerI18n,
      useClass: ThaiDatepickerI18n
    },
    {
      provide: LOCALE_ID,
      useValue: 'th'
    }
  ],
  templateUrl: './ProjectTransfer.component.html',
  styleUrls: ['./ProjectTransfer.component.scss']
})
export class ProjectTransferComponent
  implements OnInit {

  constructor(
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService,
    public masterService: MasterService
  ) { }

  keyword = '';

  rows: any[] = [];

  departments: any[] = [];

  plans: any[] = [];
  allPlans: any[] = [];

  form: any;

  isEdit = false;

  editIndex = -1;
  fromPlans: any[] = [];

  toPlans: any[] = [];
  fromPlanDetails: any[] = [];
  fromPlanDetailsLoading = false;
  currentYear: any;
  readonly pageSize = 30;
  pagination = { page: 1 };

  ngOnInit(): void {

    this.budgetYearService.yearChanged$
      .subscribe(async year => {

        if (year) {

          if (year < 2500) {

            year = year + 543;

          }

          this.currentYear = year;

          this.getData();

        }

      });

  }

  getData() {

    let model = {

      FUNC_CODE:
        'FUNC-GET_Budget_Plan_Transfer',

      BgYear:
        this.currentYear

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.rows = (

          response
            ?.List_Budget_Plan_Transfer_Data_Table?.Data ||

          []

        ).map((item: any) => {

          return {

            ...item,

            Transfer_Date:
              this.convertDateInput(
                item.Transfer_Date
              ),

            Transfer_Doc_Date:
              this.convertDateInput(
                item.Transfer_Doc_Date
              )

          };

        });

        this.departments =

          response
            ?.Mas_Department_Lists ||

          [];

        this.allPlans =
          response?.List_Budget_Plan || [];
        this.plans = [];
        this.pagination.page = 1;

      });

  }

  openAdd(modal: any) {

    this.isEdit = false;

    this.editIndex = -1;

    this.reset();

    this.modalService.open(
      modal,
      {
        size: 'xl',
        centered: true,
        windowClass: 'modal-xl-custom'
      }
    );

  }

  openEdit(
    modal: any,
    row: any,
    index: number
  ) {

    this.isEdit = true;

    this.editIndex = index;

    this.form = {

      ...row,

      From_Department_Id:
        Number(row.From_Department_Id),

      To_Department_Id:
        Number(row.To_Department_Id),

      From_Plan_Id:
        Number(row.From_Plan_Id),

      To_Plan_Id:
        Number(row.To_Plan_Id),
      From_Plan_Detail_Item_Id:
        Number(row.From_Plan_Detail_Item_Id || row.From_Plan_Item_Id || 0) || null,
      From_Plan_Detail_Name:
        row.From_Plan_Detail_Name || row.From_Plan_Item_Name || '',
      Plan_Id:
        Number(row.Plan_Id),
      Transfer_Date:
        row.Transfer_Date,

      Transfer_Doc_Date:
        row.Transfer_Doc_Date
    };
    this.displayAmount =
      this.masterService.formatNumber(
        row.Transfer_Amount
      );

    this.onChangeFromDepartment(true);

    this.onChangeToDepartment();

    this.onChangeFromPlan(true);

    this.onChangeToPlan();

    this.modalService.open(
      modal,
      {
        size: 'xl',
        centered: true,
        windowClass: 'modal-xl-custom'

      }
    );

  }

  displayAmount: string = '';
  displayProjectBudget: string = '';
  displayBalance: string = '';

  formatCurrency(
    event: Event,
    field: 'Transfer_Amount' | 'projectBudget' | 'balance' = 'Transfer_Amount'
  ): void {

    this.masterService.formatCurrency(event, (result) => {
      if (field === 'projectBudget') {
        this.displayProjectBudget = result.formatted;
        this.form.projectBudget = result.raw;
        return;
      }

      if (field === 'balance') {
        this.displayBalance = result.formatted;
        this.form.balance = result.raw;
        return;
      }

      this.displayAmount = result.formatted;
      this.form.Transfer_Amount = result.raw;
    });

  }

  onAmountChange(value: string): void {

    // เอา comma ออก
    const numericValue = value.replace(/,/g, '');

    // เก็บค่า
    this.form.Transfer_Amount = parseFloat(numericValue) || 0;

  }

  convertDateInput(date: any): NgbDateStruct | null {

    if (!date) return null;

    if (date?.year && date?.month && date?.day) {
      return {
        ...date,
        year: this.toChristianYear(Number(date.year))
      };
    }

    if (date instanceof Date) {
      return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear()
      };
    }

    // yyyy-mm-dd
    if (
      typeof date === 'string' &&
      date.includes('-')
    ) {

      const parts = date.split('T')[0].split('-');

      return {

        year: this.toChristianYear(Number(parts[0])),
        month: Number(parts[1]),
        day: Number(parts[2])

      };

    }

    // dd/mm/yyyy
    if (
      typeof date === 'string' &&
      date.includes('/')
    ) {

      const splitDate =
        date.split(' ')[0];

      const parts =
        splitDate.split('/');

      if (parts.length === 3) {

        return {

          day: Number(parts[0]),
          month: Number(parts[1]),
          year: this.toChristianYear(Number(parts[2]))

        };

      }

    }

    return null;

  }

  private toChristianYear(year: number): number {
    return year > 2500 ? year - 543 : year;
  }
  onChangeFromDepartment(isEditMode = false) {
    const dep =
      this.departments.find(
        (x: any) =>
          Number(x.Department_Id)
          ===
          Number(this.form.From_Department_Id)
      );

    this.form.From_Department_Name =
      dep?.Department_Name || '';

    if (!isEditMode) {

      this.form.From_Plan_Id = null;
      this.form.From_Plan_Detail_Item_Id = null;
      this.form.From_Plan_Detail_Name = '';

    }

    // filter plans ตาม Department_Id
    this.fromPlans = this.allPlans.filter(
      (x: any) =>
        Number(x.Department_Id)
        ===
        Number(this.form.From_Department_Id)
    );

    this.form.projectBudget = 0;
    this.form.balance = 0;
    this.displayProjectBudget = '';
    this.displayBalance = '';
    this.fromPlanDetails = [];
    this.fromPlanDetailsLoading = false;

  }

  onChangeToDepartment() {

    const dep =
      this.departments.find(
        (x: any) =>
          Number(x.Department_Id)
          ===
          Number(
            this.form.To_Department_Id
          )
      );

    this.form.To_Department_Name =
      dep?.Department_Name || '';
    this.toPlans = this.allPlans.filter(
      (x: any) =>
        Number(x.Department_Id)
        ===
        Number(this.form.To_Department_Id)
    );
  }

  onChangeFromPlan(preserveDetail = false) {
    const selectedDetailId = preserveDetail
      ? this.form.From_Plan_Detail_Item_Id
      : null;
    const selectedDetailName = preserveDetail
      ? this.form.From_Plan_Detail_Name
      : '';
    const plan =
      this.fromPlans.find(
        (x: any) =>
          Number(x.Plan_Id)
          ===
          Number(
            this.form.From_Plan_Id
          )
      );

    this.form.From_Plan_Name =
      plan?.Project_Name || plan?.Expense_List;
    this.form.From_Plan_Detail_Item_Id = selectedDetailId;
    this.form.From_Plan_Detail_Name = selectedDetailName;
    this.fromPlanDetails = [];

    this.form.projectBudget =
      Number(plan?.Total_Plan || 0);

    this.displayProjectBudget =
      this.masterService.formatNumber(this.form.projectBudget);

    this.loadPlanBalance(plan);
    this.loadFromPlanDetails(plan);

  }

  private loadPlanBalance(plan: any): void {
    const totalPlan = Number(plan?.Total_Plan || 0);
    const departmentId = Number(this.form?.From_Department_Id || 0);
    const planId = Number(this.form?.From_Plan_Id || 0);
    const bgYear = Number(this.currentYear || 0);

    if (!departmentId || !planId || !bgYear) {
      this.form.balance = totalPlan;
      this.displayBalance = this.masterService.formatNumber(totalPlan);
      return;
    }

    this.form.balance = 0;
    this.displayBalance = '';

    this.servicebud.GetBudgetPlanSumUse(bgYear, departmentId, planId)
      .subscribe({
        next: (response: any) => {
          if (
            Number(this.form?.From_Department_Id) !== departmentId ||
            Number(this.form?.From_Plan_Id) !== planId
          ) {
            return;
          }

          const usedAmount = (response?.List_Sum_Use_Amount_Budget_Plan_Api || [])
            .reduce(
              (total: number, item: any) => total + Number(item?.sum_use_amount || 0),
              0
            );

          this.form.balance = usedAmount;
          this.displayBalance = this.masterService.formatNumber(this.form.balance);


        },
        error: (error: any) => {
          console.error('Unable to load used budget amount.', error);
          this.form.balance = totalPlan;
          this.displayBalance = this.masterService.formatNumber(totalPlan);
        }
      });
  }

  private loadFromPlanDetails(plan: any): void {
    const planId = Number(plan?.Plan_Id || this.form?.From_Plan_Id || 0);
    const requestId = Number(plan?.FK_Request_Id || plan?.Request_Id || 0);
    const expenseId = Number(plan?.Fk_Expense_List || plan?.Fk_Expense_Id || 0);

    if (!planId && !requestId) {
      return;
    }

    this.fromPlanDetailsLoading = true;

    this.servicebud.GatewayGetData({
      FUNC_CODE: planId ? 'FUNC-GET_BUDGET_PLAN_BY_ID' : 'FUNC-GET_BUDGET_REQUEST_BY_ID',
      Plan_Id: planId,
      Request_Id: requestId,
      Project_Id: 0
    }).subscribe({
      next: (response: any) => {
        this.fromPlanDetailsLoading = false;

        if (response?.RESULT != null) {
          this.fromPlanDetails = [];
          return;
        }

        const source = planId
          ? response?.Budget_Plan_Detail_Items
          : response?.Budget_Request_Detail_Item;
        const rows = Array.isArray(source) ? source : (source?.Data || []);

        this.fromPlanDetails = rows
          .filter((detail: any) =>
            (planId
              ? Number(detail.Fk_Budget_Plan || detail.Plan_Id || 0) === planId
              : Number(detail.Fk_Request_Budget || detail.Request_Id || 0) === requestId) &&
            (!expenseId || Number(detail.Fk_Expense_Id || 0) === expenseId) &&
            detail.Active !== false &&
            Number(detail.Active ?? 1) !== 0
          )
          .map((detail: any) => {
            const itemId = Number(detail.Plan_Item_Id || detail.Request_Item_Id || detail.IDA || 0);
            return {
              ...detail,
              Plan_Item_Id: itemId,
              Request_Item_Id: Number(detail.Request_Item_Id || itemId || 0),
              Expense_Detail: detail.Expense_Detail || '-',
              Total: Number(detail.Total || detail.Sum_Amount || detail.Price || detail.Update_Amount || 0)
            };
          })
          .filter((detail: any) => detail.Plan_Item_Id);

        this.resolveSelectedFromPlanDetail();
      },
      error: () => {
        this.fromPlanDetailsLoading = false;
        this.fromPlanDetails = [];
      }
    });
  }

  private resolveSelectedFromPlanDetail(): void {
    if (!this.fromPlanDetails.length) {
      return;
    }

    const selectedId = Number(this.form.From_Plan_Detail_Item_Id || 0);
    const selectedName = String(this.form.From_Plan_Detail_Name || '').trim();
    const transferAmount = Number(this.form.Transfer_Amount || 0);

    let detail = selectedId
      ? this.fromPlanDetails.find((x: any) =>
        Number(x.Plan_Item_Id) === selectedId ||
        Number(x.Request_Item_Id) === selectedId ||
        Number(x.IDA || 0) === selectedId
      )
      : null;

    if (!detail && selectedName) {
      detail = this.fromPlanDetails.find((x: any) =>
        String(x.Expense_Detail || '').trim() === selectedName
      );
    }

    if (!detail && transferAmount) {
      const amountMatches = this.fromPlanDetails.filter((x: any) =>
        Number(x.Total || 0) === transferAmount
      );

      if (amountMatches.length === 1) {
        detail = amountMatches[0];
      }
    }

    if (!detail) {
      return;
    }

    this.form.From_Plan_Detail_Item_Id = detail.Plan_Item_Id;
    this.form.From_Plan_Detail_Name = detail.Expense_Detail || '';
  }

  onChangeFromPlanDetail(): void {
    const detail = this.fromPlanDetails.find((x: any) =>
      Number(x.Plan_Item_Id) === Number(this.form.From_Plan_Detail_Item_Id) ||
      Number(x.Request_Item_Id) === Number(this.form.From_Plan_Detail_Item_Id) ||
      Number(x.IDA || 0) === Number(this.form.From_Plan_Detail_Item_Id)
    );

    this.form.From_Plan_Detail_Name = detail?.Expense_Detail || '';
  }

  onChangeToPlan() {
    const plan =
      this.toPlans.find(
        (x: any) =>
          Number(x.Plan_Id)
          ===
          Number(
            this.form.To_Plan_Id
          )
      );

    this.form.To_Plan_Name =
      plan?.Project_Name || plan?.Expense_List;

  }

  save(modal?: any) {
    const fromPlan = this.fromPlans.find(
      (x: any) =>
        Number(x.Plan_Id)
        ===
        Number(this.form.From_Plan_Id)
    );

    const toPlan = this.toPlans.find(
      (x: any) =>
        Number(x.Plan_Id)
        ===
        Number(this.form.To_Plan_Id)
    );
    const payload = {

      Transfer_Id:
        this.form.Transfer_Id || 0,

      BgYear:
        this.currentYear,

      Transfer_Date:
        this.convertToApiDate(
          this.form.Transfer_Date
        ),

      Transfer_Doc_Number:
        this.form.Transfer_Doc_Number,

      Transfer_Doc_Date:
        this.convertToApiDate(
          this.form.Transfer_Doc_Date
        ),
      Transfer_Count:
        this.form.Transfer_Count,

      From_Department_Id:
        this.form.From_Department_Id || 0,

      From_Department_Name:
        this.form.From_Department_Name || '',

      From_Plan_Id:
        this.form.From_Plan_Id || 0,

      From_Plan_Name:
        fromPlan?.Project_Name
        ||
        fromPlan?.Expense_List
        ||
        '',

      From_Plan_Detail_Item_Id:
        this.form.From_Plan_Detail_Item_Id || 0,

      From_Plan_Detail_Name:
        this.form.From_Plan_Detail_Name || '',

      To_Plan_Name:
        toPlan?.Project_Name
        ||
        toPlan?.Expense_List
        ||
        '',

      To_Department_Id:
        this.form.To_Department_Id || 0,

      To_Department_Name:
        this.form.To_Department_Name || '',

      To_Plan_Id:
        this.form.To_Plan_Id || 0,



      Transfer_Description:
        this.form.Transfer_Description || '',

      Transfer_Amount:
        Number(
          this.form.Transfer_Amount || 0
        ),

      Active: true,

      Create_User:
        this.authService
          ?.currentUserValue
          ?.UserName || ''

    };

    const model = {

      FUNC_CODE:

        this.isEdit

          ? 'FUNC-Update_Budget_Transfer'

          : 'FUNC-Insert_Budget_Transfer',

      Budget_Plan_Transfer:
        payload

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe({

        next: (response: any) => {

          basicAlert(
            'success',
            'บันทึกสำเร็จ',
            ''
          );

          this.getData();

          this.reset();

          modal?.close();

        },

        error: (err: any) => {

          console.error(err);

          basicAlert(
            'error',
            'บันทึกไม่สำเร็จ',
            ''
          );

        }

      });

  }

  async remove(index: any) {

    const userConfirmed =
      await confirmAlert(
        'info',
        'ต้องการลบข้อมูล ?',
        ''
      );

    if (userConfirmed) {

      const model = {

        FUNC_CODE:
          "FUNC-Delete_Transfer",

        Transfer_Id:
          index.Transfer_Id

      };

      this.servicebud
        .GatewayGetData(model)
        .subscribe(async () => {

          basicAlert(
            'success',
            'ลบข้อมูลสำเร็จ',
            ''
          );

          this.getData();

        });

    }

  }
  convertToApiDate(
    date: NgbDateStruct | null
  ): string {

    if (!date) return '';

    const year = this.toChristianYear(date.year);

    const month =
      String(date.month).padStart(2, '0');

    const day =
      String(date.day).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
  syncProjectDetailDate() {

    this.form.Transfer_Date_API =
      this.convertToApiDate(
        this.form.Transfer_Date
      );

    this.form.Transfer_Doc_Date_API =
      this.convertToApiDate(
        this.form.Transfer_Doc_Date
      );

  }
  get filteredRows() {

    if (!this.keyword) {

      return this.rows;

    }

    const keyword =
      this.keyword.toLowerCase();

    return this.rows.filter((row: any) => {

      return (

        String(
          row.Transfer_Date_Display || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.Transfer_Count || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.From_Department_Name || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.From_Plan_Name || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.To_Department_Name || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.To_Plan_Name || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.Transfer_Doc_Number || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.Transfer_Description || ''
        ).toLowerCase().includes(keyword)

        ||

        String(
          row.Transfer_Amount || ''
        ).toLowerCase().includes(keyword)

      );

    });

  }

  get pagedRows(): any[] {
    const rows = this.filteredRows;
    const safePage = this.clampPage(this.pagination.page, rows.length);

    if (safePage !== this.pagination.page) {
      this.pagination.page = safePage;
    }

    return rows.slice((safePage - 1) * this.pageSize, safePage * this.pageSize);
  }

  get Total(): number {
    return this.filteredRows.reduce(
      (sum: number, item: any) =>
        sum + Number(item.Transfer_Amount || 0),
      0
    );
  }

  get pageStartIndex(): number {
    const total = this.filteredRows.length;
    if (!total) return 0;

    const safePage = this.clampPage(this.pagination.page, total);
    return (safePage - 1) * this.pageSize + 1;
  }

  get pageEndIndex(): number {
    const total = this.filteredRows.length;
    if (!total) return 0;

    const safePage = this.clampPage(this.pagination.page, total);
    return Math.min(safePage * this.pageSize, total);
  }

  onFilterChange(): void {
    this.pagination.page = 1;
  }

  onPageChange(page: number): void {
    this.pagination.page = page;
  }

  private clampPage(page: number, total: number): number {
    const maxPage = Math.max(1, Math.ceil(total / this.pageSize) || 1);
    return Math.min(Math.max(1, page), maxPage);
  }

  private getTodayDate(): NgbDateStruct {
    const today = new Date();

    return {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
  }

  reset() {

    const today = this.getTodayDate();

    this.form = {

      Transfer_Id: 0,

      BgYear:
        this.currentYear,

      Transfer_Date: today,

      Transfer_Doc_Number: '',

      Transfer_Doc_Date: { ...today },

      Transfer_Count: '',

      From_Department_Id: null,

      From_Department_Name: '',

      From_Plan_Id: null,

      From_Plan_Name: '',

      From_Plan_Detail_Item_Id: null,

      From_Plan_Detail_Name: '',

      To_Department_Id: null,

      To_Department_Name: '',

      To_Plan_Id: null,

      To_Plan_Name: '',

      Transfer_Description: '',

      Transfer_Amount: 0,

      projectBudget: 0,

      balance: 0,

      Active: true

    };

    this.displayAmount = '';
    this.displayProjectBudget = '';
    this.displayBalance = '';
    this.fromPlanDetails = [];
    this.fromPlanDetailsLoading = false;

  }

}
