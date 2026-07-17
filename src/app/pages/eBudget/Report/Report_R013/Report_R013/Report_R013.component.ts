import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'Report_R013',
  templateUrl: './Report_R013.component.html',
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
export class Report_R013Component {
  readonly reportTitle =
    'รายงานผลโครงการ';

  readonly reportUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    const url =
      'http://172.10.101.38/CLS_ERP_BUDGET_REPORT/Report/Budget_Report_R013.aspx';
    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
