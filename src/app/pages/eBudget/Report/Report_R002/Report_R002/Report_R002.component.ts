import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthenticationService } from '../../../../../core/services/auth.service';

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
export class Report_R002Component implements OnInit {
    token: string = '';
    readonly reportTitle =
        'รายงานสรุปภาพรวมคำของบประมาณ จำแนกตามหน่วยงาน';

    constructor(
        private sanitizer: DomSanitizer,
        private authService: AuthenticationService
    ) { }
    rawReportUrl: string = '';
    reportUrl!: SafeResourceUrl;
    ngOnInit(): void {
        this.token = this.authService.getStoredToken() || '';

        this.rawReportUrl = 'https://app.celestsoft.com/CLS_ERP_BUDGET_REPORT_DEMO/Report/Budget_Report_R002.aspx?token=' + this.token;

        this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawReportUrl);
        console.log(this.rawReportUrl);

    }
}
