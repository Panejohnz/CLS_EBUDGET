import { Component, OnInit } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {

  constructor(
    private servicebud: EbudgetService,
    private budgetYearService: BudgetYearService
  ) { }

  breadCrumbItems: any[] = [];
  statData: any[] = [];
  dashboardData: any[] = [];
  currentYear = 0;
  selectedDepartmentId = 0;

  chartNotes = {
    pieBudgetType: '',
    barBudgetType: '',
    plan: '',
    department: '',
    quarterPie: '',
    quarterBar: ''
  };

  pieChart: any = {
    series: [],
    chart: {
      type: 'pie',
      height: 300
    },
    labels: [],
    colors: ['#4e73df', '#1cc88a', '#f6c23e', '#ff0000', '#00d9ff']
  };

  barLineChart: any = {
    series: [],
    chart: {
      type: 'line',
      height: 300
    },
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth'
    },
    colors: ['#4e73df', '#1cc88a', '#e74a3b'],
    xaxis: {
      categories: []
    },
    legend: {
      position: 'top'
    }
  };

  comboChart: any = {
    series: [],
    chart: {
      height: 350,
      type: 'line'
    },
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth'
    },
    colors: ['#4e73df', '#1cc88a', '#e74a3b'],
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: []
    },
    legend: {
      position: 'top'
    }
  };

  comboChart2: any = {
    series: [],
    chart: {
      height: 350,
      type: 'line'
    },
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth'
    },
    colors: ['#4e73df', '#1cc88a', '#e74a3b'],
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: []
    },
    legend: {
      position: 'top'
    }
  };

  pieChart2: any = {
    series: [],
    chart: {
      type: 'pie',
      height: 300
    },
    labels: [],
    colors: ['#4e73df', '#1cc88a', '#f6c23e', '#ff0000']
  };

  barLineChart2: any = {
    series: [],
    chart: {
      type: 'line',
      height: 300
    },
    stroke: {
      width: [0, 0, 3],
      curve: 'smooth'
    },
    colors: ['#4e73df', '#1cc88a', '#e74a3b'],
    xaxis: {
      categories: []
    },
    legend: {
      position: 'top'
    }
  };

  ngOnInit(): void {
    this.breadCrumbItems = [{ label: 'Dashboard' }];

    this.budgetYearService.yearChanged$
      .subscribe((year: any) => {
        if (!year) {
          return;
        }

        this.currentYear = year < 2500 ? year + 543 : year;
        this.getDashboard();
      });
  }

  getDashboard() {
    const model = {
      FUNC_CODE: 'FUNC-Get_Dashboard',
      BgYear: this.currentYear,
      Department_Id: this.selectedDepartmentId || 0
    };

    this.servicebud.GatewayGetData(model).subscribe({
      next: (response: any) => {
        console.log('response.List_Dashboard?.Data', response.List_Dashboard?.Data);

        this.dashboardData =
          Array.isArray(response.List_Dashboard?.Data)
            ? response.List_Dashboard.Data
            : Array.isArray(response.Data)
              ? response.Data
              : Array.isArray(response)
                ? response
                : [];

        this.bindDashboard();
      },
      error: (err: any) => {
        console.error('GET DASHBOARD ERROR', err);
        this.dashboardData = [];
        this.bindDashboard();
      }
    });
  }

  bindDashboard() {
    const data = this.dashboardData || [];

    const totalBudget = this.sum(data, 'Total_Plan');
    const totalAdjust = this.sum(data, 'Adjust');
    const totalburse = 0;
    const totalRemaining = totalAdjust - totalburse;

    const recurringAdjust = this.sumByBudgetTypeIds(data, 'Adjust', [1, 2, 4, 5]);
    const recurringBudget = this.sumByBudgetTypeIds(data, 'Total_Plan', [1, 2, 4, 5]);
    const recurringburse = 0;
    const recurringRemaining =  recurringAdjust  - recurringburse;

    const investmentAdjust = this.sumByBudgetTypeIds(data, 'Adjust', [3]);
    const investmentBudget = this.sumByBudgetTypeIds(data, 'Total_Plan', [3]);
    const investmentburse = 0;
    const investmentRemaining = investmentAdjust - investmentburse;

    this.statData = [
      {
        title: 'ภาพรวมงบประมาณ',
        value: this.formatMoney(totalAdjust),
        Reimburse: this.formatMoney(totalburse),
        Remaining: this.formatMoney(totalRemaining),
        icon: 'ri-money-dollar-circle-line',
        persantage: '',
        profit: 'up',
        month: 'บาท'
      },
      {
        title: 'รายจ่ายประจำ',
        value: this.formatMoney(recurringAdjust),
        Reimburse: this.formatMoney(recurringburse),
        Remaining: this.formatMoney(recurringRemaining),
        icon: 'ri-wallet-3-line',
        persantage: '',
        profit: 'up',
        month: 'บาท'
      },
      {
        title: 'รายจ่ายลงทุน',
        value: this.formatMoney(investmentAdjust),
        Reimburse: this.formatMoney(investmentburse),
        Remaining: this.formatMoney(investmentRemaining),
        icon: 'ri-funds-line',
        persantage: '',
        profit: 'up',
        month: 'บาท'
      }
    ];

    this.bindPieBudgetType(data);
    this.bindBarBudgetType(data);
    this.bindPlanChart(data);
    this.bindDepartmentChart(data);
    this.bindQuarterChart(data);
  }

  bindPieBudgetType(data: any[]) {
    const useCountFallback = data.length > 0 && !this.hasAnyNonZero(data, ['Total_Plan']);
    const map = new Map<string, number>();

    data.forEach((x: any) => {
      const key = x.Budget_Type_Name || x.Budget_Type_Name_Thai || x.Budget_Type || '-';
      const value = useCountFallback ? 1 : Number(x.Total_Plan || 0);
      map.set(key, (map.get(key) || 0) + value);
    });

    this.pieChart = {
      ...this.pieChart,
      series: Array.from(map.values()),
      labels: Array.from(map.keys())
    };

    this.chartNotes.pieBudgetType = useCountFallback
      ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
      : '';
  }

  bindBarBudgetType(data: any[]) {
    const useCountFallback =
      data.length > 0 &&
      !this.hasAnyNonZero(data, ['Total_Plan', 'Adjust', 'Sum_Withdraw']);

    const map = new Map<string, any>();

    data.forEach((x: any) => {
      const key = x.Budget_Type_Name || x.Budget_Type || '-';

      if (!map.has(key)) {
        map.set(key, { plan: 0, adjust: 0, withdraw: 0, count: 0 });
      }

      const row = map.get(key);
      row.plan += Number(x.Total_Plan || 0);
      row.adjust += Number(x.Adjust || 0);
      row.withdraw += Number(x.Sum_Withdraw || 0);
      row.count += 1;
    });

    const labels = Array.from(map.keys());
    const rows = Array.from(map.values());

    this.barLineChart = {
      ...this.barLineChart,
      series: useCountFallback
        ? [
          {
            name: 'จำนวนรายการ',
            type: 'column',
            data: rows.map((x: any) => x.count)
          }
        ]
        : [
          {
            name: 'แผน',
            type: 'column',
            data: rows.map((x: any) => x.plan)
          },
          {
            name: 'จัดสรร',
            type: 'column',
            data: rows.map((x: any) => x.adjust)
          },
          {
            name: 'เบิกจ่าย',
            type: 'line',
            data: rows.map((x: any) => x.withdraw)
          }
        ],
      xaxis: {
        categories: labels
      }
    };

    this.chartNotes.barBudgetType = useCountFallback
      ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
      : '';
  }

  bindPlanChart(data: any[]) {
    const useCountFallback =
      data.length > 0 &&
      !this.hasAnyNonZero(data, ['Total_Plan', 'Adjust', 'Total_Transfer']);

    const map = new Map<string, any>();

    data.forEach((x: any) => {
      const key = x.Plan_Name || '-';

      if (!map.has(key)) {
        map.set(key, { plan: 0, adjust: 0, transfer: 0, count: 0 });
      }

      const row = map.get(key);
      row.plan += Number(x.Total_Plan || 0);
      row.adjust += Number(x.Adjust || 0);
      row.transfer += Number(x.Total_Transfer || 0);
      row.count += 1;
    });

    const labels = Array.from(map.keys());
    const rows = Array.from(map.values());

    this.comboChart = {
      ...this.comboChart,
      series: useCountFallback
        ? [
          {
            name: 'จำนวนรายการ',
            type: 'column',
            data: rows.map((x: any) => x.count)
          }
        ]
        : [
          {
            name: 'แผน',
            type: 'column',
            data: rows.map((x: any) => x.plan)
          },
          {
            name: 'จัดสรร',
            type: 'column',
            data: rows.map((x: any) => x.adjust)
          },
          {
            name: 'โอนงบ',
            type: 'line',
            data: rows.map((x: any) => x.transfer)
          }
        ],
      xaxis: {
        categories: labels
      }
    };

    this.chartNotes.plan = useCountFallback
      ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
      : '';
  }

  bindDepartmentChart(data: any[]) {
    const useCountFallback =
      data.length > 0 &&
      !this.hasAnyNonZero(data, ['Total_Plan', 'Adjust', 'Sum_Withdraw']);

    const map = new Map<string, any>();

    data.forEach((x: any) => {
      const key = x.Department_Name || '-';

      if (!map.has(key)) {
        map.set(key, { plan: 0, adjust: 0, withdraw: 0, count: 0 });
      }

      const row = map.get(key);
      row.plan += Number(x.Total_Plan || 0);
      row.adjust += Number(x.Adjust || 0);
      row.withdraw += Number(x.Sum_Withdraw || 0);
      row.count += 1;
    });

    const labels = Array.from(map.keys());
    const rows = Array.from(map.values());

    this.comboChart2 = {
      ...this.comboChart2,
      series: useCountFallback
        ? [
          {
            name: 'จำนวนรายการ',
            type: 'column',
            data: rows.map((x: any) => x.count)
          }
        ]
        : [
          {
            name: 'แผน',
            type: 'column',
            data: rows.map((x: any) => x.plan)
          },
          {
            name: 'จัดสรร',
            type: 'column',
            data: rows.map((x: any) => x.adjust)
          },
          {
            name: 'เบิกจ่าย',
            type: 'line',
            data: rows.map((x: any) => x.withdraw)
          }
        ],
      xaxis: {
        categories: labels
      }
    };

    this.chartNotes.department = useCountFallback
      ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
      : '';
  }

  bindQuarterChart(data: any[]) {
    const hasQuarterAmount = this.hasAnyNonZero(data, ['Adjust1', 'Adjust2', 'Adjust3', 'Adjust4']);

    const q1 = hasQuarterAmount ? this.sum(data, 'Adjust1') : 0;
    const q2 = hasQuarterAmount ? this.sum(data, 'Adjust2') : 0;
    const q3 = hasQuarterAmount ? this.sum(data, 'Adjust3') : 0;
    const q4 = hasQuarterAmount ? this.sum(data, 'Adjust4') : 0;

    const labels = ['ไตรมาส 1', 'ไตรมาส 2', 'ไตรมาส 3', 'ไตรมาส 4'];
    const quarterData = [q1, q2, q3, q4];

    this.pieChart2 = {
      ...this.pieChart2,
      series: hasQuarterAmount ? quarterData : [],
      labels: hasQuarterAmount ? labels : []
    };

    this.barLineChart2 = {
      ...this.barLineChart2,
      series: hasQuarterAmount
        ? [
          {
            name: 'แผน',
            type: 'column',
            data: quarterData
          },
          {
            name: 'เบิกจ่าย',
            type: 'column',
            data: [0, 0, 0, 0]
          },
          {
            name: 'แนวโน้ม',
            type: 'line',
            data: quarterData
          }
        ]
        : [],
      xaxis: {
        categories: hasQuarterAmount ? labels : []
      }
    };

    this.chartNotes.quarterPie = hasQuarterAmount
      ? ''
      : 'ยังไม่มีข้อมูลยอดรายไตรมาสสำหรับการแสดงกราฟ';
    this.chartNotes.quarterBar = hasQuarterAmount
      ? ''
      : 'ยังไม่มีข้อมูลยอดรายไตรมาสสำหรับการแสดงกราฟ';
  }

  sum(data: any[], field: string): number {
    return data.reduce((s: number, x: any) => s + Number(x[field] || 0), 0);
  }

  getBudgetTypeId(row: any): number {
    const value = row?.Budget_Type_Id ?? row?.Fk_Budget_Type ?? row?.Budget_Type ?? row?.BudgetType_Id;
    return Number(value || 0);
  }

  sumByBudgetTypeIds(data: any[], field: string, ids: number[]): number {
    return data
      .filter((row: any) => ids.includes(this.getBudgetTypeId(row)))
      .reduce((s: number, row: any) => s + Number(row[field] || 0), 0);
  }

  hasAnyNonZero(data: any[], fields: string[]): boolean {
    return data.some((row: any) =>
      fields.some((field: string) => Number(row?.[field] || 0) !== 0)
    );
  }

  formatMoney(value: number): string {
    return Number(value || 0).toLocaleString('th-TH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
