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
        Principle: '',
        Area: '',
        Start_Date: '',
        End_Date: ''
      };
    }

    this.projectDetail = this.model.Project_Detail;

    if (!this.model.Project_Objective) {
      this.model.Project_Objective = [];
    }
    if (this.model.Project_Objective.length === 0) {
      this.model.Project_Objective.push({ Name: '' });
    }
    this.objectives = this.model.Project_Objective;

    if (!this.model.Project_Output) {
      this.model.Project_Output = [];
    }
    if (this.model.Project_Output.length === 0) {
      this.model.Project_Output.push({
        Name: '',
        Target: '',
        Unit: ''
      });
    }
    this.outputs = this.model.Project_Output;

    if (!this.model.Project_Outcome) {
      this.model.Project_Outcome = [];
    }
    if (this.model.Project_Outcome.length === 0) {
      this.model.Project_Outcome.push({ Name: '' });
    }
    this.outcomes = this.model.Project_Outcome;

    if (!this.model.Project_Expected) {
      this.model.Project_Expected = [];
    }
    if (this.model.Project_Expected.length === 0) {
      this.model.Project_Expected.push({ Name: '' });
    }
    this.expectedResults = this.model.Project_Expected;

    if (!this.model.Project_TargetGroup) {
      this.model.Project_TargetGroup = [];
    }
    if (this.model.Project_TargetGroup.length === 0) {
      this.model.Project_TargetGroup.push({
        Name: '',
        Amount: '',
        Unit: ''
      });
    }
    this.targetGroups = this.model.Project_TargetGroup;

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
    this.objectives.push({ Name: '' });
  }

  removeObjective(i: number) {
    if (this.objectives.length > 1) {
      this.objectives.splice(i, 1);
    }
  }

  addOutput() {
    this.outputs.push({
      Name: '',
      target: '',
      unit: ''
    });
  }

  removeOutput(i: number) {
    this.outputs.splice(i, 1);
  }

  addOutcome() {
    this.outcomes.push({ Name: '' });
  }

  removeOutcome(i: number) {
    this.outcomes.splice(i, 1);
  }

  addExpectedResult() {
    this.expectedResults.push({ Name: '' });
  }

  removeExpectedResult(i: number) {
    this.expectedResults.splice(i, 1);
  }

  addTargetGroup() {
    this.targetGroups.push({
      Name: '',
      amount: '',
      unit: ''
    });
  }

  removeTargetGroup(i: number) {
    this.targetGroups.splice(i, 1);
  }

}