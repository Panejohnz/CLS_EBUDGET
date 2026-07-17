import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'Report_R002',
    templateUrl: './Report_R002.component.html',
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
export class Report_R002Component {
    readonly reportTitle =
        'รายงานสรุปภาพรวมคำของบประมาณ จำแนกตามหน่วยงาน';

    readonly reportUrl: SafeResourceUrl;

    constructor(private sanitizer: DomSanitizer) {
        const url =
            'http://172.10.101.38/CLS_ERP_BUDGET_REPORT/Report/Budget_Report_R002.aspx';
        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
