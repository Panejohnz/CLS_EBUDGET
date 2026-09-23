import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthenticationService } from '../../../../../core/services/auth.service';

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
export class Report_R010Component implements OnInit {
  readonly reportTitle =
    'รายงานการเบิกจ่ายงบประมาณ เปรียบเทียบกับงบประมาณที่ได้รับจัดสรร จำแนกตามหน่วยงาน และเปรียบเทียบกับเป้าหมายการเบิกจ่ายตามาตรการ';

  token: string = '';

  rawReportUrl: string = '';
  reportUrl!: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.token = this.authService.getStoredToken() || '';

    this.rawReportUrl = 'https://app.celestsoft.com/CLS_ERP_BUDGET_REPORT_DEMO/Report/Budget_Report_R010.aspx?token=' + this.token;

    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawReportUrl);
    console.log(this.rawReportUrl);
  }
}
