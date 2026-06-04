import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'Report_R001',
  templateUrl: './Report_R001.component.html',
  styles: [`
    .report-iframe-wrap {
      min-height: calc(100vh - 220px);
    }
    .report-iframe {
      width: 100%;
      min-height: calc(100vh - 220px);
      border: 0;
      display: block;
    }
  `]
})
export class Report_R001Component {
  readonly reportTitle =
    'รายงานสรุปภาพรวมคำของบประมาณรายจ่าย จำแนกตามแผนงาน ผลผลิต กิจกรรม งบรายจ่าย';

  readonly reportUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    const url =
      'https://app.celestsoft.com/CLS_ERP_BUDGET_REPORT/Report/Budget_Report_R001.aspx';
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
