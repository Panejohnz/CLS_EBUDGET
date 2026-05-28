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

@Component({
  selector: 'app-report-kpi',
  templateUrl: './reportKPI.component.html'
})
export class ReportKPIComponent implements OnInit {

  constructor(
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService,
    private modalService: NgbModal
  ) { }


  kpis: any[] = [];

  reportList: any[] = [];

  currentYear: any;
  quarterDraft: any = {};
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

        this.reportList =

          response
            ?.List_Report_Project_Indicators_Data_Table
            ?.Data || [];

        console.log(
          'KPI',
          this.kpis
        );

        console.log(
          'REPORT LIST',
          this.reportList
        );

      });

  }

  openForm(
    modal: any,
    item: any
  ) {

    this.selectedKpi = item;

    this.selectedTri = null;

    this.resetForm();

    const model = {

      FUNC_CODE:
        'FUNC-GET_Report_Project_Indicators_By_Id',

      BgYear:
        this.currentYear,

      Fk_Indicators:
        item.Indicators_Id

    };

    console.log(
      'GET REPORT',
      model
    );

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        const data =

          response
            ?.Report_Project_Indicator || [];

        this.form = data

        if (this.form) {
          this.selectedTri =
            data.Trimas_Id || null;
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

        else {

          this.resetForm();

        }

        this.modalService.open(
          modal,
          {
            size: 'lg',
            backdrop: 'static'
          }
        );

      });

  }

  // =========================================
  // CHANGE QUARTER
  // =========================================
  onChangeQuarter() {

    if (!this.selectedTri) {

      return;

    }

    // save current draft
    this.quarterDraft[this.selectedTri] = {

      ...this.form

    };

    this.getReportData();

  }
getReportData() {

  const model = {

    FUNC_CODE:
      'FUNC-GET_Report_Project_Indicators_By_Id',

    BgYear:
      this.currentYear,

    Fk_Indicators:
      this.selectedKpi.Indicators_Id,

    Trimas_Id:
      this.selectedTri

  };

  console.log(
    'GET REPORT',
    model
  );

  this.servicebud
    .GatewayGetData(model)
    .subscribe((response: any) => {

      const data =

        response
          ?.Report_Project_Indicator
        ||
        null;

      console.log(
        'REPORT DATA',
        data
      );

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

      // =====================================
      // ยังไม่เคยบันทึก
      // =====================================

      else {

        // reset เฉพาะ id
        // ไม่ล้างค่าที่ user กำลังพิมพ์

        this.form.Report_Id = 0;

      }

    });

}

  loadQuarterData() {

    const oldData = this.reportList.find(

      (x: any) =>

        Number(x.Fk_Indicators)

        ===

        Number(this.selectedKpi.Indicators_Id)

        &&

        Number(x.Trimas_Id)

        ===

        Number(this.selectedTri)

    );

    console.log(
      'OLD DATA',
      oldData
    );

    if (oldData) {

      this.form = {

        Report_Id:
          oldData.Report_Id || 0,

        Progress:
          oldData.Progress || '',

        Indicators_Result:
          oldData.Indicators_Result || '',

        Problems:
          oldData.Problems || '',

        Suggestions:
          oldData.Suggestions || ''

      };

    }

    else {

      this.resetForm();

    }

  }

  // =========================================
  // RESET FORM
  // =========================================

  resetForm() {

    this.form = {

      Report_Id: 0,

      Progress: '',

      Indicators_Result: '',

      Problems: '',

      Suggestions: ''

    };

  }

  // =========================================
  // SAVE
  // =========================================

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

    console.log(
      'SAVE KPI',
      model
    );

    this.servicebud
      .GatewayGetData(model)
      .subscribe({

        next: (response: any) => {

          console.log(
            'SAVE RESPONSE',
            response
          );

          basicAlert(
            'success',
            'บันทึกสำเร็จ',
            ''
          );

          this.getData();

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