import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab-detail',

  templateUrl: './tab-detail.component.html',
  styleUrl: './tab-detail.component.scss'
})
export class TabDetailComponent {
  @Input() model: any
  // 1
  projectDetail = {
    principle: '',
    area: '',
    startDate: '',
    endDate: ''
  };

  // 2
  objectives: any[] = [];

  // 3.1
  outputs: any[] = [];

  // 3.2
  outcomes: any[] = [];

  // 4
  expectedResults: any[] = [];

  // 5
  targetGroups: any[] = [];

  // 2 วัตถุประสงค์
  addObjective() {
    this.objectives.push({ title: '' });
  }
  removeObjective(i: number) {
    this.objectives.splice(i, 1);
  }

  // 3.1 Output
  addOutput() {
    this.outputs.push({
      name: '',
      target: '',
      unit: ''
    });
  }
  removeOutput(i: number) {
    this.outputs.splice(i, 1);
  }

  // 3.2 Outcome
  addOutcome() {
    this.outcomes.push({
      name: '',
      target: '',
      unit: ''
    });
  }
  removeOutcome(i: number) {
    this.outcomes.splice(i, 1);
  }

  // 4 ผลที่คาดว่าจะได้รับ
  addExpectedResult() {
    this.expectedResults.push({ title: '' });
  }
  removeExpectedResult(i: number) {
    this.expectedResults.splice(i, 1);
  }

  // 5 กลุ่มเป้าหมาย
  addTargetGroup() {
    this.targetGroups.push({
      name: '',
      amount: '',
      unit: ''
    });
  }
  removeTargetGroup(i: number) {
    this.targetGroups.splice(i, 1);
  }
}
