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
  selector: 'app-project-transfer',
  providers: [
    GridJsService,
    DecimalPipe,
    EbudgetService
  ],
  templateUrl: './ProjectTransfer.component.html',
  styles: ``
})
export class ProjectTransferComponent
  implements OnInit {

  constructor(
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService
  ) { }

  keyword = '';

  rows: any[] = [];

  departments: any[] = [];

  plans: any[] = [];
  allPlans: any[] = [];

  form: any;

  isEdit = false;

  editIndex = -1;

  currentYear: any;

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
        console.log(
          'TRANSFER',
          this.rows
        );

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
        backdrop: 'static'
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

      Transfer_Date:
        this.convertDateInput(
          row.Transfer_Date
        ),

      Transfer_Doc_Date:
        this.convertDateInput(
          row.Transfer_Doc_Date
        )

    };
    console.log('this.form', this.form);

    this.onChangeFromDepartment();

    this.onChangeToDepartment();

    this.onChangeFromPlan();

    this.onChangeToPlan();

    this.modalService.open(
      modal,
      {
        size: 'xl',
        backdrop: 'static'
      }
    );

  }

  formatNumber(value: any): string {

    if (value === null || value === undefined || value === '') {
      return '';
    }

    const number = Number(value.toString().replace(/,/g, ''));

    if (isNaN(number)) {
      return '';
    }

    return number.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

  }

  displayAmount: string = '';

  formatCurrency(event: any): void {

    let value = event.target.value;

    // เอา comma ออก
    value = value.replace(/,/g, '');

    // อนุญาตเฉพาะเลขกับ .
    value = value.replace(/[^0-9.]/g, '');

    // กัน . ซ้ำ
    const parts = value.split('.');

    if (parts.length > 2) {
      return;
    }

    let integerPart = parts[0];
    const decimalPart = parts[1];

    // ใส่ comma
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // รวมกลับ
    this.displayAmount =
      decimalPart !== undefined
        ? `${integerPart}.${decimalPart}`
        : integerPart;

    // เก็บค่าจริงแบบไม่มี comma
    this.form.Transfer_Amount = value;

  }

  onAmountChange(value: string): void {

    // เอา comma ออก
    const numericValue = value.replace(/,/g, '');

    // เก็บค่า
    this.form.Transfer_Amount = parseFloat(numericValue) || 0;

  }

  convertDateInput(date: any): string {

    if (!date) return '';

    if (
      typeof date === 'string'
      &&
      date.includes('/')
    ) {

      const splitDate =
        date.split(' ')[0];

      const parts =
        splitDate.split('/');

      if (parts.length === 3) {

        const day =
          parts[0].padStart(2, '0');

        const month =
          parts[1].padStart(2, '0');

        const year =
          parts[2];

        return `${year}-${month}-${day}`;

      }

    }

    return date;

  }
  onChangeFromDepartment() {
    debugger
    const dep =
      this.departments.find(
        (x: any) =>
          Number(x.Department_Id)
          ===
          Number(this.form.From_Department_Id)
      );

    this.form.From_Department_Name =
      dep?.Department_Name || '';

    // reset plan
    this.form.From_Plan_Id = null;

    // filter plans ตาม Department_Id
    this.plans = this.allPlans.filter(
      (x: any) =>
        Number(x.Department_Id)
        ===
        Number(this.form.From_Department_Id)
    );

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

  }

  onChangeFromPlan() {
    console.log('plans',this.plans);
    debugger
    const plan =
      this.plans.find(
        (x: any) =>
          Number(x.Plan_Id)
          ===
          Number(
            this.form.From_Plan_Id
          )
      );

    this.form.From_Plan_Name =
      plan?.Project_Name || plan?.Expense_List;

    this.form.projectBudget =
      Number(plan?.Total_Plan || 0);

    this.form.balance =
      Number(plan?.Total_Plan || 0);

  }

  onChangeToPlan() {
debugger
    const plan =
      this.plans.find(
        (x: any) =>
          Number(x.Plan_Id)
          ===
          Number(
            this.form.To_Plan_Id
          )
      );

    this.form.To_Plan_Name =
      plan?.Project_Name || '';

  }

  save() {

    const payload = {

      Transfer_Id:
        this.form.Transfer_Id || 0,

      BgYear:
        this.currentYear,

      Transfer_Date:
        this.form.Transfer_Date,

      Transfer_Doc_Number:
        this.form.Transfer_Doc_Number,

      Transfer_Doc_Date:
        this.form.Transfer_Doc_Date,

      Transfer_Count:
        this.form.Transfer_Count,

      From_Department_Id:
        this.form.From_Department_Id || 0,

      From_Department_Name:
        this.form.From_Department_Name || '',

      From_Plan_Id:
        this.form.From_Plan_Id || 0,

      From_Plan_Name:
        this.form.From_Plan_Name || '',

      To_Department_Id:
        this.form.To_Department_Id || 0,

      To_Department_Name:
        this.form.To_Department_Name || '',

      To_Plan_Id:
        this.form.To_Plan_Id || 0,

      To_Plan_Name:
        this.form.To_Plan_Name || '',

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

    console.log(
      'SAVE',
      model
    );

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
  reset() {

    this.form = {

      Transfer_Id: 0,

      BgYear:
        this.currentYear,

      Transfer_Date: '',

      Transfer_Doc_Number: '',

      Transfer_Doc_Date: '',

      Transfer_Count: '',

      From_Department_Id: null,

      From_Department_Name: '',

      From_Plan_Id: null,

      From_Plan_Name: '',

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

  }

}