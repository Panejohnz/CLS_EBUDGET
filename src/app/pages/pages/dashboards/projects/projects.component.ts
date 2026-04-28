import { Component, OnInit, ViewChild } from '@angular/core';
import { ApexChart } from 'ng-apexcharts';
import { ActiveProjects, MyTask, TeamMembers, projectstatData } from 'src/app/core/data';
import { NgApexchartsModule } from "ng-apexcharts";
import { ApexLegend } from "ng-apexcharts";
@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})

/**
 * Projects Component
 */
export class ProjectsComponent implements OnInit {
  statData: any
  pieChart = {
    series: [30, 25, 20, 15, 10],
    chart: {
      type: 'pie' as const,
      height: 300
    },
    labels: ['งบอุดหนุน', 'งบดำเนินงาน', 'ลงทุน', 'งบรายจ่ายอื่น', 'งบบุคลากร'],
    colors: ['#4e73df', '#1cc88a', '#f6c23e', '#ff0000', '#00d9ff']
  };

  barLineChart = {
    series: [
      { name: 'แผน', type: 'column', data: [30, 40, 35, 50, 49] },
      { name: 'เบิกจ่าย', type: 'column', data: [20, 30, 25, 40, 39] },
      { name: 'แนวโน้ม', type: 'line', data: [20, 30, 25, 40, 35] }
    ],
    chart: {
      type: 'line' as const,
      height: 300
    },
    stroke: { width: [0, 3] },
    colors: ['#4e73df', '#1cc88a', '#e74a3b'],
    xaxis: { categories: ['งบอุดหนุน', 'งบดำเนินงาน', 'ลงทุน', 'งบรายจ่ายอื่น', 'งบบุคลากร'] }
  };
  pieChart2 = {
    series: [25, 25, 25, 25],
    chart: {
      type: 'pie' as const,
      height: 300
    },
    labels: ['ไตรมาส 1', 'ไตรมาส 2', 'ไตรมาส 3', 'ไตรมาส 4'],
    colors: ['#4e73df', '#1cc88a', '#f6c23e', '#ff0000']
  };

  barLineChart2 = {
    series: [
      { name: 'แผน', type: 'column', data: [30, 40, 35, 50] },
      { name: 'เบิกจ่าย', type: 'column', data: [20, 30, 25, 40] },
      { name: 'แนวโน้ม', type: 'line', data: [20, 30, 25, 40] }
    ],
    chart: {
      type: 'line' as const,
      height: 300
    },
    stroke: { width: [0, 3] },
    colors: ['#4e73df', '#1cc88a','#e74a3b'],
    xaxis: { categories: ['ไตรมาส 1', 'ไตรมาส 2', 'ไตรมาส 3', 'ไตรมาส 4'] }
  };
  planChart = {
    series: [
      {
        name: 'แผน',
        data: [50, 40, 60, 70, 50]
      },
      {
        name: 'เบิกจ่าย',
        data: [30, 20, 40, 60, 30]
      }
    ],
    chart: {
      type: 'bar' as const,
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%'
      }
    },
    xaxis: {
      categories: ['แผน1', 'แผน2', 'แผน3', 'แผน4', 'แผน5']
    }
  };

  trendChart = {
    series: [
      {
        name: 'แผน',
        data: [20, 30, 25, 40, 35, 50, 30, 45, 40, 55]
      },
      {
        name: 'เบิกจ่าย',
        data: [10, 20, 15, 30, 25, 40, 20, 35, 30, 45]
      }
    ],
    chart: {
      type: 'bar' as const,
      height: 350
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '40%',
        borderRadius: 4
      }
    },
    colors: ['#4e73df', '#e74a3b'], // 🔥 สีแยกชัด
    xaxis: {
      categories: [
        'ส่วนกลาง', 'เขต 1', 'เขต 2', 'เขต 3', 'เขต 4',
        'เขต 5', 'เขต 6', 'เขต 7', 'เขต 8', 'เขต 9'
      ]
    },
    legend: {
      position: 'top'
    }
  };
  comboChart = {
    series: [
      {
        name: 'แผน',
        type: 'column',
        data: [30, 40, 35, 50, 45]
      },
      {
        name: 'เบิกจ่าย',
        type: 'column',
        data: [20, 30, 25, 40, 35]
      },
      {
        name: 'แนวโน้ม',
        type: 'line',
        data: [20, 30, 25, 40, 35]
      }
    ],
    chart: {
      height: 350,
      type: 'line' as const
    },
    stroke: {
      width: [0, 0, 3], // 🔥 เส้นแดงหนา
      curve: 'smooth' as const
    },
    colors: ['#4e73df', '#1cc88a', '#e74a3b'], // 🔵🟢🔴
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
      categories: ['แผน1', 'แผน2', 'แผน3', 'แผน4', 'แผน5']
    },
    legend: {
      position: 'top' as const
    }
  };

  comboChart2 = {
    series: [
      {
        name: 'แผน',
        type: 'column',
        data: [20, 30, 25, 40, 35, 50, 30, 45, 40, 55]
      },
      {
        name: 'เบิกจ่าย',
        type: 'column',
        data: [10, 20, 15, 30, 25, 40, 20, 35, 30, 45]
      },
      {
        name: 'แนวโน้ม',
        type: 'line',
        data: [10, 20, 15, 30, 25, 40, 20, 35, 30, 45]// 🔴 เส้นแดง
      }
    ],
    chart: {
      height: 350,
      type: 'line' as const
    },
    stroke: {
      width: [0, 0, 3], // 🔥 เส้นแดงหนา
      curve: 'smooth' as const
    },
    colors: ['#4e73df', '#1cc88a', '#e74a3b'],
    plotOptions: {
      bar: {
        columnWidth: '40%',
        borderRadius: 4
      }
    },
    dataLabels: {
      enabled: true
    },
    xaxis: {
      categories: [
        'ส่วนกลาง', 'เขต 1', 'เขต 2', 'เขต 3', 'เขต 4',
        'เขต 5', 'เขต 6', 'เขต 7', 'เขต 8', 'เขต 9'
      ]
    },
    legend: {
      position: 'top' as const
    }
  };


  constructor() {
  }
  totalSummary = {
    plan: 0,
    reimburse: 0,
    balance: 0
  };

  calculateSummary() {
    const data = this.statData; // หรือ data จาก API

    this.totalSummary.plan = data.reduce((sum: any, i: any) => sum + Number(i.plan || 0), 0);
    this.totalSummary.reimburse = data.reduce((sum: any, i: any) => sum + Number(i.reimburse || 0), 0);
    this.totalSummary.balance = data.reduce((sum: any, i: any) => sum + Number(i.balance || 0), 0);
  }
  ngOnInit(): void {
    /**
     * BreadCrumb
     */

    /**
     * Fetches the data
     */

  }

  ngAfterViewInit() {

  }

  num: number = 0;
  option = {
    startVal: this.num,
    useEasing: true,
    duration: 2,
    decimalPlaces: 2,
  };

  // Chart Colors Set
  private getChartColorsArray(colors: any) {
    colors = JSON.parse(colors);
    return colors.map(function (value: any) {
      var newValue = value.replace(" ", "");
      if (newValue.indexOf(",") === -1) {
        var color = getComputedStyle(document.documentElement).getPropertyValue(newValue);
        if (color) {
          color = color.replace(" ", "");
          return color;
        }
        else return newValue;;
      } else {
        var val = value.split(',');
        if (val.length == 2) {
          var rgbaColor = getComputedStyle(document.documentElement).getPropertyValue(val[0]);
          rgbaColor = "rgba(" + rgbaColor + "," + val[1] + ")";
          return rgbaColor;
        } else {
          return newValue;
        }
      }
    });
  }


  /**
 * Projects Overview
 */


}
