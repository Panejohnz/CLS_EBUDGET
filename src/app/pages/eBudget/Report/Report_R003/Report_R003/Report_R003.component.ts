import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthenticationService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'Report_R003',
  templateUrl: './Report_R003.component.html',
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
export class Report_R003Component implements OnInit {
  readonly reportTitle =
    'รายงานตัวชี้วัดสำนักงบประมาณ';

  token: string = '';

  rawReportUrl: string = '';
  reportUrl!: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.token = this.authService.getStoredToken() || '';

    this.rawReportUrl = 'https://app.celestsoft.com/CLS_ERP_BUDGET_REPORT/Report/Budget_Report_R003.aspx?token=' + this.token;

    this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawReportUrl);
    console.log(this.rawReportUrl);
  }
}
