import { Component } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent {
  output = '';
  outcome = '';

  target = 100;

  isAchieve = false;
  isNotAchieve = false;

  progress = 0;

  problem = '';
  solution = '';
  summary = '';
  suggest = '';

  toggleResult() {
    // future: เปิด modal ได้
    console.log('open result form');
  }
}
