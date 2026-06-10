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
    colors: ['#0eb6c2', '#08ad71', '#ca9612', '#644afa', '#f85540']
  };

  pieQuarterChart: any = {
  series: [],
  chart: {
    type: 'pie',
    height: 350
  },
  labels: [],
  colors: [
    '#0d6efd', // ไตรมาส 1
    '#198754', // ไตรมาส 2
    '#ffc107', // ไตรมาส 3
    '#dc3545'  // ไตรมาส 4
  ],
  legend: {
    position: 'bottom'
  },
  tooltip: {},
  dataLabels: {}
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
    type: 'bar'
  },
  stroke: {
    width: [0, 0, 0]
  },
  colors: ['#0d6efd', '#198754', '#ffc107'],
  plotOptions: {
    bar: {
      columnWidth: '25%',
      borderRadius: 3
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

    barQuarterChart2: any = {
  series: [],
  chart: {
    type: 'bar',
    height: 350
  },
  colors: ['#4e73df', '#ffc107'],
  stroke: {
    width: [0, 0]
  },
  plotOptions: {
    bar: {
      columnWidth: '45%',
      borderRadius: 4
    }
  },
  dataLabels: {
    enabled: false
  },
  xaxis: {
    categories: []
  },
  yaxis: {},
  tooltip: {},
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

  dashboardCheck: any = null;

getDashboard() {
  const model = {
    FUNC_CODE: 'FUNC-Get_Dashboard',
    BgYear: this.currentYear,
    Department_Id: this.selectedDepartmentId || 0
  };

  this.servicebud.GatewayGetData(model).subscribe({
    next: (response: any) => {

      console.log('response.List_Dashboard?.Data', response.List_Dashboard?.Data);
      console.log('response.List_Dashboard_Check?.Data', response.List_Dashboard_Check?.Data);
      // console.log('List_Dashboard_Check', response.List_Dashboard_Check?.Data);
      // Dashboard หลัก
      this.dashboardData =
        Array.isArray(response.List_Dashboard?.Data)
          ? response.List_Dashboard.Data
          : Array.isArray(response.Data)
            ? response.Data
            : Array.isArray(response)
              ? response
              : [];

      // Dashboard Check (มีแค่ 1 แถว)
      this.dashboardCheck =
        Array.isArray(response.List_Dashboard_Check?.Data)
          ? response.List_Dashboard_Check.Data[0]
          : Array.isArray(response.List_Dashboard_Check)
            ? response.List_Dashboard_Check[0]
            : response.List_Dashboard_Check || null;

      console.log('dashboardCheck', this.dashboardCheck);

      this.bindDashboard();
    },

    error: (err: any) => {
      console.error('GET DASHBOARD ERROR', err);

      this.dashboardData = [];
      this.dashboardCheck = null;

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
    this.bindQuarterBarChart(data);
    this.bindQuarterPieChart(data);
  }

  // กราฟวงกลมหมวดงบ //
bindPieBudgetType(data: any[]) {
  const useCountFallback =
    data.length > 0 && !this.hasAnyNonZero(data, ['Adjust']);

  const map = new Map<number, {
    label: string;
    value: number;
  }>();

  data.forEach((x: any) => {
    const budgetTypeId = Number(x.Budget_Type_Id || 0);

    const label =
      x.Budget_Type_Name ||
      x.Budget_Type_Name_Thai ||
      x.Budget_Type ||
      '-';

    const value = useCountFallback
      ? 1
      : Number(x.Adjust || 0);

    if (map.has(budgetTypeId)) {
      map.get(budgetTypeId)!.value += value;
    } else {
      map.set(budgetTypeId, {
        label,
        value
      });
    }
  });

  // สีประจำแต่ละประเภท
  const colorMap: { [key: number]: string } = {
    1: '#0eb6c2', // งบบุคลากร
    2: '#08ad71', // งบดำเนินงาน
    3: '#ca9612', // งบลงทุน
    4: '#644afa', // งบอุดหนุน
    5: '#f85540'  // งบรายจ่ายอื่น

  };

  const items = Array.from(map.entries());

  const labels = items.map(([_, item]) => item.label);

  const series = items.map(([_, item]) => item.value);

  const colors = items.map(([id]) =>
    colorMap[id] || '#6c757d'
  );

  this.pieChart = {
    ...this.pieChart,
    series,
    labels,
    colors,

    // Tooltip แสดงตัวเลขจริง
    tooltip: {
      y: {
        formatter: (value: number) =>
          this.formatNumber(value)
      }
    },

    // แสดงเปอร์เซ็นต์บน Pie
    dataLabels: {
      enabled: true,
      formatter: (value: number) =>
        `${value.toFixed(1)}%`,
      style: {
        colors: ['#000000'],
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },

    // สีข้อความ Legend
    legend: {
      labels: {
        colors: '#000000'
      }
    }
  };

  this.chartNotes.pieBudgetType = useCountFallback
    ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
    : '';
}

formatNumber(value: number): string {
  return Number(value || 0).toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// กราฟแท่งหมวดงบ //
bindBarBudgetType(data: any[]) {

  const useCountFallback =
    data.length > 0 &&
    !this.hasAnyNonZero(data, ['Total_Plan', 'Adjust', 'Sum_Withdraw']);

  // หมวดงบทั้งหมด
  const budgetTypes = [
    { id: 1, label: 'งบบุคลากร' },
    { id: 2, label: 'งบดำเนินงาน' },
    { id: 3, label: 'งบลงทุน' },
    { id: 4, label: 'งบอุดหนุน' },
    { id: 5, label: 'งบรายจ่ายอื่น' }
  ];

  // เตรียมข้อมูลเริ่มต้น
  const map = new Map<number, any>();

  budgetTypes.forEach(type => {
    map.set(type.id, {
      label: type.label,
      plan: 0,
      adjust: 0,
      withdraw: 0,
      count: 0
    });
  });

  // รวมข้อมูลจริง
  data.forEach((x: any) => {

    const budgetTypeId = Number(x.Budget_Type_Id || 0);

    if (!map.has(budgetTypeId)) {
      return;
    }

    const row = map.get(budgetTypeId);

    row.plan += Number(x.Total_Plan || 0);
    row.adjust += Number(x.Adjust || 0);
    row.withdraw += Number(x.Sum_Withdraw || 0);
    row.count += 1;
  });

  const items = budgetTypes.map(type => ({
    id: type.id,
    ...map.get(type.id)
  }));

// เดือนปัจจุบัน (1-12)
const currentMonth = new Date().getMonth() + 1;

// แปลงเป็นเดือนงบประมาณ
// ต.ค.=1, พ.ย.=2, ..., ก.ย.=12
const fiscalMonth =
  currentMonth >= 10
    ? currentMonth - 9
    : currentMonth + 3;

// หาไตรมาสปัจจุบัน
const currentQuarter = Math.ceil(fiscalMonth / 3);

// เป้าหมายเบิกจ่าย (%) ตามไตรมาสปัจจุบัน
const withdrawPercent =
  Number(
    this.dashboardCheck?.[
      `Goals_Withdraw_Tri${currentQuarter}`
    ] || 0
  );

console.log({
  currentMonth,
  fiscalMonth,
  currentQuarter,
  withdrawPercent
});

  // ยอดจัดสรรรวม
  const totalAdjust = items.reduce(
    (sum, x) => sum + Number(x.adjust || 0),
    0
  );

  // เป้าหมายรวมเป็นจำนวนเงิน
  const totalTargetWithdraw =
    totalAdjust * withdrawPercent / 100;

  // กระจายเป้าหมายตามสัดส่วนของแต่ละหมวดง

  const targetWithdrawData = items.map(x => {

  const adjust = Number(x.adjust || 0);

  const ratio =
    totalAdjust > 0
      ? adjust / totalAdjust
      : 0;

  return totalTargetWithdraw * ratio;
});

// ผ่านเป้าหมาย = สีเขียว
const targetPassData = targetWithdrawData.map((target, index) =>
  Number(items[index].withdraw || 0) >= target
    ? target
    : null
);

// ไม่ผ่านเป้าหมาย = สีแดง
const targetFailData = targetWithdrawData.map((target, index) =>
  Number(items[index].withdraw || 0) < target
    ? target
    : null
);

  this.barLineChart = {
    ...this.barLineChart,

    plotOptions: {
      bar: {
        columnWidth: '35%',
        borderRadius: 3
      }
    },

    colors: useCountFallback
      ? ['#0d6efd']
      : [
          '#0d6efd', // จัดสรร
          '#198754', // แผน
          '#ffc107', // เบิกจ่าย
          '#dc3545'  // เป้าหมาย
        ],

    stroke: useCountFallback
      ? {
          width: [0]
        }
      : {
          width: [0, 0, 0, 3],
          curve: 'smooth'
        },

    series: useCountFallback
      ? [
          {
            name: 'จำนวนรายการ',
            type: 'column',
            data: items.map(x => x.count)
          }
        ]
      : [
          {
            name: 'จัดสรร',
            type: 'column',
            data: items.map(x => x.adjust)
          },
          {
            name: 'แผน',
            type: 'column',
            data: items.map(x => x.plan)
          },
          {
            name: 'เบิกจ่าย',
            type: 'column',
            data: items.map(x => x.withdraw)
          },
          {
            name: `เป้าหมาย ${withdrawPercent}%`,
            type: 'line',
            data: targetWithdrawData
          }
        ],

    xaxis: {
      categories: items.map(x => x.label)
    },

    dataLabels: {
      enabled: true,

      enabledOnSeries: useCountFallback
        ? [0]
        : [0, 1, 2], // ไม่แสดงบนเส้นเป้าหมาย

      formatter: (value: number) =>
        value === 0
          ? ''
          : this.formatNumber(value),

      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#ffffff']
      }
    },

    yaxis: {
      labels: {
        formatter: (value: number) =>
          useCountFallback
            ? Number(value || 0).toLocaleString('th-TH')
            : this.formatNumber(value)
      }
    },

    tooltip: {
      shared: true,
      intersect: false,

      y: {
        formatter: (value: number) =>
          useCountFallback
            ? Number(value || 0).toLocaleString('th-TH')
            : this.formatNumber(value)
      }
    },

    legend: {
      show: true,
      position: 'bottom'
    }
  };

  this.chartNotes.barBudgetType = useCountFallback
    ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
    : '';
}

// กราฟแผนงาน //
bindPlanChart(data: any[]) {

  const useCountFallback =
    data.length > 0 &&
    !this.hasAnyNonZero(data, ['Total_Plan', 'Adjust', 'Sum_Withdraw']);

  const map = new Map<string, {
    planOrder: number;
    plan: number;
    adjust: number;
    withdraw: number;
    count: number;
  }>();

  // รวมข้อมูลตามแผนงาน
  data.forEach((x: any) => {

    const key = x.Plan_Name || '-';

    if (!map.has(key)) {
      map.set(key, {
        planOrder: Number(x.Plan_Order || x.plan_order || 9999),
        plan: 0,
        adjust: 0,
        withdraw: 0,
        count: 0
      });
    }

    const row = map.get(key)!;

    row.plan += Number(x.Total_Plan || 0);
    row.adjust += Number(x.Adjust || 0);
    row.withdraw += Number(x.Sum_Withdraw || 0);
    row.count += 1;
  });

  // เรียงตาม Plan_Order
  const sortedItems = Array.from(map.entries()).sort(
    (a, b) => a[1].planOrder - b[1].planOrder
  );

  console.table(
    sortedItems.map(([key, value]) => ({
      key,
      planOrder: value.planOrder
    }))
  );

  const labels = sortedItems.map(([key]) => key);
  const rows = sortedItems.map(([_, value]) => value);

  // ==========================
  // เป้าหมายตามไตรมาสปัจจุบัน
  // ==========================

  // เดือนปัจจุบัน
  const currentMonth = new Date().getMonth() + 1;

  // เดือนงบประมาณ (ต.ค.=1 ... ก.ย.=12)
  const fiscalMonth =
    currentMonth >= 10
      ? currentMonth - 9
      : currentMonth + 3;

  // ไตรมาสปัจจุบัน
  const currentQuarter = Math.ceil(fiscalMonth / 3);

  // เป้าหมาย (%)
  const withdrawPercent =
    Number(
      this.dashboardCheck?.[
        `Goals_Withdraw_Tri${currentQuarter}`
      ] || 0
    );

  // ยอดจัดสรรรวม
  const totalAdjust = rows.reduce(
    (sum, x) => sum + Number(x.adjust || 0),
    0
  );

  // เป้าหมายรวมเป็นจำนวนเงิน
  const totalTargetWithdraw =
    totalAdjust * withdrawPercent / 100;

  // เป้าหมายแต่ละแผนงาน
  const targetWithdrawData = rows.map(x => {

    const adjust = Number(x.adjust || 0);

    const ratio =
      totalAdjust > 0
        ? adjust / totalAdjust
        : 0;

    return totalTargetWithdraw * ratio;
  });

  this.comboChart = {
    ...this.comboChart,

    plotOptions: {
      bar: {
        columnWidth: '25%',
        borderRadius: 3
      }
    },

    colors: useCountFallback
      ? ['#0d6efd']
      : [
          '#0d6efd', // จัดสรร
          '#198754', // แผน
          '#ffc107', // เบิกจ่าย
          '#dc3545'  // เป้าหมาย
        ],

    stroke: useCountFallback
      ? {
          width: [0]
        }
      : {
          width: [0, 0, 0, 3],
          curve: 'smooth'
        },

    series: useCountFallback
      ? [
          {
            name: 'จำนวนรายการ',
            type: 'column',
            data: rows.map(x => x.count)
          }
        ]
      : [
          {
            name: 'จัดสรร',
            type: 'column',
            data: rows.map(x => x.adjust)
          },
          {
            name: 'แผน',
            type: 'column',
            data: rows.map(x => x.plan)
          },
          {
            name: 'เบิกจ่าย',
            type: 'column',
            data: rows.map(x => x.withdraw)
          },
          {
            name: `เป้าหมาย ${withdrawPercent}%`,
            type: 'line',
            data: targetWithdrawData
          }
        ],

    xaxis: {
      categories: labels
    },

    dataLabels: {
      enabled: true,

      enabledOnSeries: useCountFallback
        ? [0]
        : [0, 1, 2],

      formatter: (value: number) =>
        value === 0
          ? ''
          : this.formatNumber(value),

      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#ffffff']
      }
    },

    yaxis: {
      labels: {
        formatter: (value: number) =>
          useCountFallback
            ? Number(value || 0).toLocaleString('th-TH')
            : this.formatNumber(value)
      }
    },

    tooltip: {
      shared: true,
      intersect: false,

      y: {
        formatter: (value: number) =>
          useCountFallback
            ? Number(value || 0).toLocaleString('th-TH')
            : this.formatNumber(value)
      }
    },

    legend: {
      show: true,
      position: 'bottom'
    }
  };

  this.chartNotes.plan = useCountFallback
    ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
    : '';
}

// กราฟแท่งหน่วยงาน //
bindDepartmentChart(data: any[]) {

  const useCountFallback =
    data.length > 0 &&
    !this.hasAnyNonZero(data, ['Total_Plan', 'Adjust', 'Sum_Withdraw']);

  const map = new Map<string, {
    plan: number;
    adjust: number;
    withdraw: number;
    count: number;
  }>();

  // รวมข้อมูลตามหน่วยงาน
  data.forEach((x: any) => {

    const key = x.Department_Short_Name || '-';

    if (!map.has(key)) {
      map.set(key, {
        plan: 0,
        adjust: 0,
        withdraw: 0,
        count: 0
      });
    }

    const row = map.get(key)!;

    row.plan += Number(x.Total_Plan || 0);
    row.adjust += Number(x.Adjust || 0);
    row.withdraw += Number(x.Sum_Withdraw || 0);
    row.count += 1;
  });

  const labels = Array.from(map.keys());
  const rows = Array.from(map.values());

  // ==========================
  // เป้าหมายตามไตรมาสปัจจุบัน
  // ==========================

  // เดือนปัจจุบัน (1-12)
  const currentMonth = new Date().getMonth() + 1;

  // เดือนงบประมาณ (ต.ค.=1 ... ก.ย.=12)
  const fiscalMonth =
    currentMonth >= 10
      ? currentMonth - 9
      : currentMonth + 3;

  // ไตรมาสปัจจุบัน
  const currentQuarter = Math.ceil(fiscalMonth / 3);

  // เป้าหมายเบิกจ่าย (%)
  const withdrawPercent =
    Number(
      this.dashboardCheck?.[
        `Goals_Withdraw_Tri${currentQuarter}`
      ] || 0
    );

  // ยอดจัดสรรรวมทุกหน่วยงาน
  const totalAdjust = rows.reduce(
    (sum, x) => sum + Number(x.adjust || 0),
    0
  );

  // เป้าหมายรวมเป็นจำนวนเงิน
  const totalTargetWithdraw =
    totalAdjust * withdrawPercent / 100;

  // เป้าหมายแต่ละหน่วยงานตามสัดส่วน Adjust
  const targetWithdrawData = rows.map(x => {

    const adjust = Number(x.adjust || 0);

    const ratio =
      totalAdjust > 0
        ? adjust / totalAdjust
        : 0;

    return totalTargetWithdraw * ratio;
  });

  this.comboChart2 = {
    ...this.comboChart2,

    plotOptions: {
      bar: {
        columnWidth: '25%',
        borderRadius: 3,
        borderRadiusApplication: 'end',
        borderRadiusWhenStacked: 'last'
      }
    },

    stroke: useCountFallback
      ? {
          width: [0]
        }
      : {
          width: [0, 0, 0, 3],
          curve: 'smooth'
        },

    colors: useCountFallback
      ? ['#0d6efd']
      : [
          '#0d6efd', // จัดสรร
          '#198754', // แผน
          '#ffc107', // เบิกจ่าย
          '#dc3545'  // เป้าหมาย
        ],

    series: useCountFallback
      ? [
          {
            name: 'จำนวนรายการ',
            type: 'column',
            data: rows.map(x => x.count)
          }
        ]
      : [
          {
            name: 'จัดสรร',
            type: 'column',
            data: rows.map(x => x.adjust)
          },
          {
            name: 'แผน',
            type: 'column',
            data: rows.map(x => x.plan)
          },
          {
            name: 'เบิกจ่าย',
            type: 'column',
            data: rows.map(x => x.withdraw)
          },
          {
            name: `เป้าหมาย ${withdrawPercent}%`,
            type: 'line',
            data: targetWithdrawData
          }
        ],

    xaxis: {
      categories: labels
    },

    // ตัวเลขบนแท่งกราฟ
    dataLabels: {
      enabled: true,

      enabledOnSeries: useCountFallback
        ? [0]
        : [0, 1, 2], // ไม่แสดงบนเส้นเป้าหมาย

      formatter: (value: number) => {

        if (Number(value || 0) === 0) {
          return '';
        }

        return useCountFallback
          ? Number(value).toLocaleString('th-TH')
          : this.formatNumber(value);
      },

      style: {
        fontSize: '11px',
        fontWeight: 'bold',
        colors: ['#ffffff']
      }
    },

    // ตัวเลขแกน Y
    yaxis: {
      labels: {
        formatter: (value: number) =>
          useCountFallback
            ? Number(value || 0).toLocaleString('th-TH')
            : this.formatNumber(value)
      }
    },

    // Tooltip
    tooltip: {
      shared: true,
      intersect: false,

      y: {
        formatter: (value: number) =>
          useCountFallback
            ? Number(value || 0).toLocaleString('th-TH')
            : this.formatNumber(value)
      }
    },

    legend: {
      show: true,
      position: 'bottom'
    }
  };

  this.chartNotes.department = useCountFallback
    ? 'แสดงตามจำนวนรายการ เนื่องจากยอดงบเป็น 0 ทั้งหมด'
    : '';
}

// วงกลมไตรมาส
bindQuarterPieChart(data: any[]) {

  const hasQuarterAmount =
    this.hasAnyNonZero(data, ['Trimas1', 'Trimas2', 'Trimas3', 'Trimas4']);

  const quarterData = hasQuarterAmount
    ? [
        this.sum(data, 'Trimas1'),
        this.sum(data, 'Trimas2'),
        this.sum(data, 'Trimas3'),
        this.sum(data, 'Trimas4')
      ]
    : [];

  const labels = [
    'ไตรมาส 1',
    'ไตรมาส 2',
    'ไตรมาส 3',
    'ไตรมาส 4'
  ];

  this.pieQuarterChart = {
    ...this.pieQuarterChart,

    series: quarterData,

    labels: hasQuarterAmount ? labels : [],

    colors: [
      '#0d6efd',
      '#198754',
      '#ffc107',
      '#dc3545'
    ],

    tooltip: {
      y: {
        formatter: (value: number) =>
          this.formatNumber(value)
      }
    },

    dataLabels: {
      enabled: true,
      formatter: (value: number) =>
        `${value.toFixed(1)}%`,
      style: {
        colors: ['#000000'],
        fontSize: '12px',
        fontWeight: 'bold'
      }
    },

    legend: {
      position: 'bottom'
    }
  };

  this.chartNotes.quarterPie = hasQuarterAmount
    ? ''
    : 'ยังไม่มีข้อมูลยอดรายไตรมาสสำหรับการแสดงกราฟ';
}

// แท่งไตรมาส //
// แท่งไตรมาส //
bindQuarterBarChart(data: any[]) {

  const hasQuarterAmount =
    this.hasAnyNonZero(data, [
      'Trimas1',
      'Trimas2',
      'Trimas3',
      'Trimas4',
      'Sum_Withdraw_Tri1',
      'Sum_Withdraw_Tri2',
      'Sum_Withdraw_Tri3',
      'Sum_Withdraw_Tri4'
    ]);

  const labels = [
    'ไตรมาส 1',
    'ไตรมาส 2',
    'ไตรมาส 3',
    'ไตรมาส 4'
  ];

  // แผนรายไตรมาส
  const planData = hasQuarterAmount
    ? [
        this.sum(data, 'Trimas1'),
        this.sum(data, 'Trimas2'),
        this.sum(data, 'Trimas3'),
        this.sum(data, 'Trimas4')
      ]
    : [];

  // เบิกจ่ายรายไตรมาส
  const withdrawData = hasQuarterAmount
    ? [
        this.sum(data, 'Sum_Withdraw_Tri1'),
        this.sum(data, 'Sum_Withdraw_Tri2'),
        this.sum(data, 'Sum_Withdraw_Tri3'),
        this.sum(data, 'Sum_Withdraw_Tri4')
      ]
    : [];

  // ==========================
  // เป้าหมายแต่ละไตรมาส
  // ==========================

  const quarterPercents = [
    Number(this.dashboardCheck?.Goals_Withdraw_Tri1 || 0),
    Number(this.dashboardCheck?.Goals_Withdraw_Tri2 || 0),
    Number(this.dashboardCheck?.Goals_Withdraw_Tri3 || 0),
    Number(this.dashboardCheck?.Goals_Withdraw_Tri4 || 0)
  ];

  // เป้าหมายเป็นยอดเงินของแต่ละไตรมาส
  const targetData = planData.map((plan, index) =>
    Number(plan || 0) * quarterPercents[index] / 100
  );

  this.barLineChart2 = {
    ...this.barLineChart2,

    plotOptions: {
      bar: {
        columnWidth: '25%',
        borderRadius: 4
      }
    },

    colors: [
      '#0d6efd', // แผน
      '#ffc107', // เบิกจ่าย
      '#dc3545'  // เป้าหมาย
    ],

    stroke: {
      width: [0, 0, 3],
      curve: 'smooth'
    },

    series: hasQuarterAmount
      ? [
          {
            name: 'แผน',
            type: 'column',
            data: planData
          },
          {
            name: 'เบิกจ่าย',
            type: 'column',
            data: withdrawData
          },
          {
            name: 'เป้าหมาย',
            type: 'line',
            data: targetData
          }
        ]
      : [],

    xaxis: {
      categories: hasQuarterAmount ? labels : []
    },

    // ปิดตัวเลขบนกราฟ
    dataLabels: {
      enabled: false
    },

    yaxis: {
      labels: {
        formatter: (value: number) =>
          this.formatNumber(value)
      }
    },

    tooltip: {
      shared: true,
      intersect: false,

      y: {
        formatter: (
          value: number,
          opts?: any
        ) => {

          // เส้นเป้าหมาย
          if (opts?.seriesIndex === 2) {

            const percent =
              quarterPercents[
                opts.dataPointIndex
              ] || 0;

            return `${this.formatNumber(value)} (${percent.toFixed(2)}%)`;
          }

          return this.formatNumber(value);
        }
      }
    },

    legend: {
      show: true,
      position: 'top'
    }
  };

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
