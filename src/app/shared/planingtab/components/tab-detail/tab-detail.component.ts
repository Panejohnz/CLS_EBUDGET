import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrl: './tab-detail.component.scss'
})
export class TabDetailComponent implements OnInit {

  @Input() model: any;

  // 👉 จะชี้ไปที่ model.Project_Plan.detail
  projectDetail!: any;

  // =============================
  // INIT
  // =============================
  ngOnInit(): void {

    // 🔥 กัน null
    if (!this.model.Project_Plan) {
      this.model.Project_Plan = {};
    }

    // 🔥 init detail ถ้ายังไม่มี
    if (!this.model.Project_Plan.detail) {
      this.model.Project_Plan.detail = {
        principle: '',
        objectives: [],
        outputs: [],
        outcomes: [],
        expectedResults: [],
        targetGroups: [],
        area: '',
        startDate: null,
        endDate: null
      };
    }

    // 🔥 bind reference (สำคัญที่สุด)
    this.projectDetail = this.model.Project_Plan.detail;
  }

  // =============================
  // OBJECTIVE
  // =============================
  addObjective() {
    this.projectDetail.objectives.push({
      name: ''
    });
  }

  removeObjective(i: number) {
    this.projectDetail.objectives.splice(i, 1);
  }

  // =============================
  // OUTPUT
  // =============================
  addOutput() {
    this.projectDetail.outputs.push({
      name: '',
      target: '',
      unit: ''
    });
  }

  removeOutput(i: number) {
    this.projectDetail.outputs.splice(i, 1);
  }

  // =============================
  // OUTCOME
  // =============================
  addOutcome() {
    this.projectDetail.outcomes.push({
      name: ''
    });
  }

  removeOutcome(i: number) {
    this.projectDetail.outcomes.splice(i, 1);
  }

  // =============================
  // EXPECTED RESULT
  // =============================
  addExpectedResult() {
    this.projectDetail.expectedResults.push({
      name: ''
    });
  }

  removeExpectedResult(i: number) {
    this.projectDetail.expectedResults.splice(i, 1);
  }

  // =============================
  // TARGET GROUP
  // =============================
  addTargetGroup() {
    this.projectDetail.targetGroups.push({
      name: '',
      amount: '',
      unit: ''
    });
  }

  removeTargetGroup(i: number) {
    this.projectDetail.targetGroups.splice(i, 1);
  }

}