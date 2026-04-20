import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrl: './tab-detail.component.scss'
})
export class TabDetailComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] && this.model) {
      this.initData();
    }
  }
  initData() {
    if (!this.model.Project_Detail || Array.isArray(this.model.Project_Detail)) {
      this.model.Project_Detail = {
        principle: '',
        area: '',
        Start_Date: '',
        End_Date: ''
      };
    }

    this.projectDetail = this.model.Project_Detail;

    if (!this.model.Project_Objective) {
      this.model.Project_Objective = [];
    }

    if (this.model.Project_Objective.length === 0) {
      this.model.Project_Objective.push({ name: '' });
    }

    this.objectives = this.model.Project_Objective;
    if (!this.model.Project_Output) {
      this.model.Project_Output = [];
    }
    this.outputs = this.model.Project_Output;
    if (!this.model.Project_Outcome) {
      this.model.Project_Outcome = [];
    }
    this.outcomes = this.model.Project_Outcome;

    if (!this.model.Project_Expected) {
      this.model.Project_Expected = [];
    }
    this.expectedResults = this.model.Project_Expected;

    if (!this.model.Project_TargetGroup) {
      this.model.Project_TargetGroup = [];
    }
    this.targetGroups = this.model.Project_TargetGroup;
    console.log('123',this.model);
    
  }
  @Input() model: any;

  projectDetail: any;

  objectives!: any[];

  outputs!: any[];
  outcomes!: any[];
  expectedResults!: any[];
  targetGroups!: any[];

  ngOnInit(): void {



  }

  addObjective() {
    this.objectives.push({ name: '' });
  }

  removeObjective(i: number) {
    if (this.objectives.length > 1) {
      this.objectives.splice(i, 1);
    }
  }

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

  addOutcome() {
    this.outcomes.push({ name: '' });
  }

  removeOutcome(i: number) {
    this.outcomes.splice(i, 1);
  }

  addExpectedResult() {
    this.expectedResults.push({ name: '' });
  }

  removeExpectedResult(i: number) {
    this.expectedResults.splice(i, 1);
  }

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