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

  totalAll: number = 0;
totalFixed: number = 0;
totalInvest: number = 0;

totalPlan = 50000;
totalUsed = 32000;
totalRemain = 18000;

fixedPlan = 20000;
fixedUsed = 15000;
fixedRemain = 5000;

investPlan = 30000;
investUsed = 17000;
investRemain = 13000;

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

<<<<<<< HEAD
   private _OverviewChart(colors:any) {
    colors = this.getChartColorsArray(colors);
    this.OverviewChart = {
      series: [{
        name: 'Number of Projects',
        type: 'bar',
        data: [34, 65, 46, 68, 49, 61, 42, 44, 78, 52, 63, 67]
      }, {
        name: 'Revenue',
        type: 'area',
        data: [89.25, 98.58, 68.74, 108.87, 77.54, 84.03, 51.24, 28.57, 92.57, 42.36, 88.51, 36.57]
      }, {
        name: 'Active Projects',
        type: 'bar',
        data: [8, 12, 7, 17, 21, 11, 5, 9, 7, 29, 12, 35]
      }],
      chart: {
          height: 374,
          type: 'line',
          toolbar: {
              show: false,
          }
      },
      stroke: {
          curve: 'smooth',
          dashArray: [0, 3, 0],
          width: [0,1, 0],
      },
      fill: {
          opacity: [1, 0.1, 1]
      },
      markers: {
          size: [0, 4, 0],
          strokeWidth: 2,
          hover: {
              size: 4,
          }
      },
      xaxis: {
          categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
          axisTicks: {
              show: false
          },
          axisBorder: {
              show: false
          }
      },
      grid: {
          show: true,
          xaxis: {
              lines: {
                  show: true,
              }
          },
          yaxis: {
              lines: {
                  show: false,
              }
          },
          padding: {
              top: 0,
              right: -2,
              bottom: 15,
              left: 10
          },
      },
      legend: {
          show: true,
          horizontalAlign: 'center',
          offsetX: 0,
          offsetY: -5,
          markers: {
              width: 9,
              height: 9,
              radius: 6,
          },
          itemMargin: {
              horizontal: 10,
              vertical: 0
          },
      },
      plotOptions: {
          bar: {
              columnWidth: '30%',
              barHeight: '70%'
          }
      },
      colors: colors,
      tooltip: {
      shared: true,
      y: [{
          formatter: function (y:any) {
            if(typeof y !== "undefined") {
              return  y.toFixed(0);
            }
            return y;
            
          }
        }, {
          formatter: function (y:any) {
            if(typeof y !== "undefined") {
              return   "$" + y.toFixed(2) + "k";
            }
            return y;
            
          }
        }, {
          formatter: function (y:any) {
            if(typeof y !== "undefined") {
              return y.toFixed(0);
            }
            return y;
            
          }
        }]
      }
    };
  }

   /**
 *  Status7
 */
    setstatusvalue(value: any) {
      if (value == 'all') {
        this.status7.series = [125, 42, 58, 89]
      }
      if (value == '7') {
        this.status7.series = [25, 52, 158, 99]
      }
      if (value == '30') {
        this.status7.series = [35, 22, 98, 99]
      }
      if (value == '90') {
        this.status7.series = [105, 32, 68, 79]
      }
    }

    private _status7(colors:any) {
      colors = this.getChartColorsArray(colors);
      this.status7 = {
        series: [125, 42, 58, 89],
        labels: ["Completed", "In Progress", "Yet to Start", "Cancelled"],
        chart: {
            type: "donut",
            height: 230,
        },
        plotOptions: {
            pie: {
                offsetX: 0,
                offsetY: 0,
                donut: {
                    size: "90%",
                    labels: {
                        show: false,
                    }
                },
            },
        },
        dataLabels: {
            enabled: false,
        },
        legend: {
            show: false,
        },
        stroke: {
            lineCap: "round",
            width: 0
        },
        colors: colors
      };
    }

  /**
   * Fetches the data
   */
  private fetchData() {
    // this.statData = projectstatData;
    this.statData = projectstatData;
    this.ActiveProjects = ActiveProjects;
    this.MyTask = MyTask;
    this.TeamMembers = TeamMembers;
  }
=======
>>>>>>> 0804b241d250b46e32d044d23463a8ba296cf2be

}
