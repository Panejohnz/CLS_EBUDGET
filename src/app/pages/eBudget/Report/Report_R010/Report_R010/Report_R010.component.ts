import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'Report_R010',
  templateUrl: './Report_R010.component.html',
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
export class Report_R010Component {
  readonly reportTitle =
    'รายงานการเบิกจ่ายงบประมาณ เปรียบเทียบกับงบประมาณที่ได้รับจัดสรร จำแนกตามหน่วยงาน และเปรียบเทียบกับเป้าหมายการเบิกจ่ายตามาตรการ';

  readonly reportUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    const url =
      'https://app.celestsoft.com/CLS_ERP_BUDGET_REPORT/Report/Budget_Report_R010.aspx';
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
