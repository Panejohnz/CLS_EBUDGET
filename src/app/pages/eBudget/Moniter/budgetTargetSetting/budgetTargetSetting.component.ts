import { Component, OnInit } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

@Component({
  selector: 'app-budget-target-setting',
  templateUrl: './budgetTargetSetting.component.html'
})
export class BudgetTargetSettingComponent implements OnInit {

  constructor(
    public servicebud: EbudgetService,
    private authService: AuthenticationService,
    private budgetYearService: BudgetYearService
  ) { }

  currentYear: any;

  quarters = [1, 2, 3, 4];

  sections = [
    {
      Goals_Type: 1,
      title: 'เป้าหมายภาพรวม',
      Goals_Type_Name: 'เป้าหมายภาพรวม',
      Goals_Id: 0,
      pay: [0, 0, 0, 0],
      disburse: [0, 0, 0, 0]
    },
    {
      Goals_Type: 2,
      title: 'เป้าหมายรายจ่ายประจำ',
      Goals_Type_Name: 'เป้าหมายรายจ่ายประจำ',
      Goals_Id: 0,
      pay: [0, 0, 0, 0],
      disburse: [0, 0, 0, 0]
    },
    {
      Goals_Type: 3,
      title: 'เป้าหมายรายจ่ายงบลงทุน',
      Goals_Type_Name: 'เป้าหมายรายจ่ายงบลงทุน',
      Goals_Id: 0,
      pay: [0, 0, 0, 0],
      disburse: [0, 0, 0, 0]
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

  // =========================================
  // GET DATA
  // =========================================

  getData() {

    const model = {

      FUNC_CODE: 'FUNC-GET_Report_Goals',

      BgYear: this.currentYear

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        const rows =
          response?.List_Report_Goals || [];

        // =====================================
        // RESET ทุกครั้งก่อน bind
        // =====================================

        this.sections.forEach((section: any) => {

          section.Goals_Id = 0;

          section.pay = [0, 0, 0, 0];

          section.disburse = [0, 0, 0, 0];

        });

        // =====================================
        // BIND DATA
        // =====================================

        this.sections.forEach((section: any) => {

          const oldData = rows.find(

            (x: any) =>

              Number(x.Goals_Type)

              ===

              Number(section.Goals_Type)

          );

          if (oldData) {

            section.Goals_Id =

              Number(oldData.Goals_Id || 0);

            section.pay = [

              Number(
                oldData.Goals_Used_Tri1 || 0
              ),

              Number(
                oldData.Goals_Used_Tri2 || 0
              ),

              Number(
                oldData.Goals_Used_Tri3 || 0
              ),

              Number(
                oldData.Goals_Used_Tri4 || 0
              )

            ];

            section.disburse = [

              Number(
                oldData.Goals_Withdraw_Tri1 || 0
              ),

              Number(
                oldData.Goals_Withdraw_Tri2 || 0
              ),

              Number(
                oldData.Goals_Withdraw_Tri3 || 0
              ),

              Number(
                oldData.Goals_Withdraw_Tri4 || 0
              )

            ];

          }

        });

      });

  }

  // =========================================
  // SAVE
  // =========================================

  save() {

    const payload = this.sections.map((section: any) => {

      return {

        Goals_Id:
          section.Goals_Id || 0,

        BgYear:
          this.currentYear,

        Goals_Type:
          section.Goals_Type,

        Goals_Type_Name:
          section.Goals_Type_Name,

        Goals_Used_Tri1:
          Number(section.pay[0] || 0),

        Goals_Used_Tri2:
          Number(section.pay[1] || 0),

        Goals_Used_Tri3:
          Number(section.pay[2] || 0),

        Goals_Used_Tri4:
          Number(section.pay[3] || 0),

        Goals_Withdraw_Tri1:
          Number(section.disburse[0] || 0),

        Goals_Withdraw_Tri2:
          Number(section.disburse[1] || 0),

        Goals_Withdraw_Tri3:
          Number(section.disburse[2] || 0),

        Goals_Withdraw_Tri4:
          Number(section.disburse[3] || 0),

        Active: true,

        Create_User:
          this.authService
            ?.currentUserValue
            ?.UserName || ''

      };

    });

    const model = {

      FUNC_CODE:
        'FUNC-Insert_Report_Goals',

      List_Report_Goals:
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