import {
  Component,
  OnInit
} from '@angular/core';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

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
  PaginationService
} from 'src/app/core/services/pagination.service';

@Component({
  selector: 'app-report-kpi',
  templateUrl: './reportKPI.component.html'
})
export class ReportKPIComponent implements OnInit {

  constructor(
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService,
    private modalService: NgbModal,
    public sortService: PaginationService
  ) { }

  // =====================================
  // VARIABLE
  // =====================================

  kpis: any[] = [];
  Mas_Unit_Lists: any[] = [];

  get pagedKpis(): any[] {
    return this.sortService.changePage(this.kpis);
  }

  get pageStartIndex(): number {
    const total = this.kpis.length;
    const pageSize = Number(this.sortService.pageSize) || 1;
    const currentPage = Math.max(1, Number(this.sortService.page) || 1);
    const start = (currentPage - 1) * pageSize + 1;

    return total ? Math.min(start, total) : 0;
  }

  get pageEndIndex(): number {
    const total = this.kpis.length;
    const pageSize = Number(this.sortService.pageSize) || 1;
    const currentPage = Math.max(1, Number(this.sortService.page) || 1);

    return total ? Math.min(currentPage * pageSize, total) : 0;
  }

  currentYear: any;

  selectedKpi: any = null;

  selectedTri: any = null;

  form: any = {};

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

  // =====================================
  // INIT
  // =====================================

  ngOnInit(): void {

    this.sortService.page = 1;
    this.sortService.pageSize = 20;
    this.getUnitData();

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

    const model = {

      FUNC_CODE:
        'FUNC-GET_Report_KPI',

      BgYear:
        this.currentYear

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.kpis =

          response
            ?.List_Mas_Indicator || [];

        if (Array.isArray(response?.List_Mas_Unit)) {

          this.Mas_Unit_Lists =

            this.normalizeUnitList(

              response.List_Mas_Unit

            );

        }

        this.sortService.page = 1;
        console.log('   this.kpis =', this.kpis );

      });

  }

  getUnitData() {

    const model = {

      FUNC_CODE:
        'FUNC-Get_List_Mas_Unit'

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.Mas_Unit_Lists =

          this.normalizeUnitList(

            response?.List_Mas_Unit || []

          );

      });

  }

  normalizeUnitList(list: any[]): any[] {

    return Array.isArray(list)
      ? list.map((item: any) => ({

        ...item,

        Unit_Id:
          item?.Unit_Id != null && item.Unit_Id !== ''
            ? Number(item.Unit_Id)
            : null

      }))
      : [];

  }

  getKpiUnitName(kpi: any): string {
debugger
    const unitValue =

      kpi?.Unit ?? kpi?.Unit_Id ?? kpi?.Fk_Unit_Id ?? kpi?.FK_Unit_Id ?? null;

    if (unitValue == null || unitValue === '') {

      return kpi?.Unit_Name || '';

    }

    const unitId =

      Number(unitValue);

    if (Number.isNaN(unitId)) {

      return kpi?.Unit_Name || String(unitValue);

    }

    return (

      kpi?.Unit_Name ||

      this.Mas_Unit_Lists.find(

        (unit: any) =>

          Number(unit.Unit_Id) === unitId

      )?.Unit_Name ||

      ''

    );

  }

  openForm(
    modal: any,
    item: any
  ) {

    this.selectedKpi = item;

    this.selectedTri = null;

    this.resetForm();

    this.modalService.open(
      modal,
      {
        size: 'lg',
        backdrop: 'static'
      }
    );

  }


  onChangeQuarter() {


    this.resetForm();

    if (!this.selectedTri) {

      return;

    }

    this.getReportData();

  }


  getReportData() {

    const model = {

      FUNC_CODE:
        'FUNC-GET_Report_Project_Indicators_By_Id',

      Fk_Indicators:
        this.selectedKpi.Indicators_Id,

      Trimas_Id:
        this.selectedTri

    };


    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        const data =

          response
            ?.Report_Project_Indicator
          ||
          null;

        // =================================
        // เคยบันทึกแล้ว
        // =================================

        if (data) {

          this.form = {

            Report_Id:
              data.Report_Id || 0,

            Progress:
              data.Progress || '',

            Indicators_Result:
              data.Indicators_Result || '',

            Problems:
              data.Problems || '',

            Suggestions:
              data.Suggestions || ''

          };

        }

      });

  }

  // =====================================
  // RESET FORM
  // =====================================

  resetForm() {

    this.form = {

      Report_Id: 0,

      Progress: '',

      Indicators_Result: '',

      Problems: '',

      Suggestions: ''

    };

  }

  // =====================================
  // SAVE
  // =====================================

  save() {

    if (!this.selectedTri) {

      basicAlert(
        'warning',
        'กรุณาเลือกไตรมาส',
        ''
      );

      return;

    }

    const quarterName =

      this.Tri_lists.find(

        (x: any) =>

          Number(x.Trimas_Id)

          ===

          Number(this.selectedTri)

      )?.name || '';

    const payload = {

      Report_Id:
        this.form.Report_Id || 0,

      BgYear:
        this.currentYear,

      Fk_Indicators:
        this.selectedKpi.Indicators_Id,

      Trimas_Id:
        this.selectedTri,

      Trimas_Name:
        quarterName,

      Progress:
        this.form.Progress || '',

      Indicators_Result:
        this.form.Indicators_Result || '',

      Problems:
        this.form.Problems || '',

      Suggestions:
        this.form.Suggestions || '',

      Performance: this.form.Performance || '',
      Active: true,

      Create_User:
        this.authService
          ?.currentUserValue
          ?.UserName || ''

    };

    const model = {

      FUNC_CODE:
        'FUNC-Insert_Report_Project_Indicators',

      Report_Project_Indicator:
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

}
