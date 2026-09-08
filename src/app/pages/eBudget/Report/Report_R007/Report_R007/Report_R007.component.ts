import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'Report_R007',
  templateUrl: './Report_R007.component.html',
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
export class Report_R007Component implements OnInit {
  readonly reportTitle = 'รายงานแบบฟอร์มโครงการ';
  readonly baseReportUrl =
    'https://app.celestsoft.com/CLS_ERP_BUDGET_REPORT/Report/Budget_Report_R007.aspx';

  reportUrl!: SafeResourceUrl;

  constructor(
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const query = new URLSearchParams();

      if (params['BgYear']) {
        query.set('BgYear', params['BgYear']);
      }
      if (params['Project_Id']) {
        query.set('Project_Id', params['Project_Id']);
      }
      if (params['Project_Type']) {
        query.set('Project_Type', params['Project_Type']);
      }

      const url = query.toString()
        ? `${this.baseReportUrl}?${query.toString()}`
        : this.baseReportUrl;

      this.reportUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    });
  }
}
