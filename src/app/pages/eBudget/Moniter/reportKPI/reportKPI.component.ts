import { Component } from '@angular/core';

@Component({
  selector: 'app-report-kpi',

  templateUrl: './reportKPI.component.html'
})
export class ReportKPIComponent {
  kpis = [
    {
      id: 1,
      year: 2567,
      name: 'ร้อยละความสำเร็จของการพัฒนาระบบกำกับดูแลผลิตภัณฑ์สุขภาพตามมาตรฐานสากล',
      progress: '',
      result: '',
      problem: '',
      suggest: ''
    },
    {
      id: 2,
      year: 2567,
      name: 'จำนวนโครงการที่สามารถดำเนินการได้ตามแผนที่กำหนด',
      progress: '',
      result: '',
      problem: '',
      suggest: ''
    }
  ];

  selectedKpi: any = null;

  openForm(item: any) {
    this.selectedKpi = item;
  }

  close() {
    this.selectedKpi = null;
  }

  save() {
    console.log('SAVE KPI:', this.selectedKpi);
  }
}
