import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';

interface PlanLevel1Main {
  Strategy_Side_Id: string;
  Strategy_Issue_Id: string;
  Strategy_SubIssue_Id: string;
  Target: string;
}

@Component({
  selector: 'app-tab-alignment',
  templateUrl: './tab-alignment.component.html',
  styleUrl: './tab-alignment.component.scss'
})
export class TabAlignmentComponent implements OnInit, OnChanges {
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] && this.model) {
      this.initData();
    }
  }
  initData() {


    // LEVEL 1
    if (!this.model.Project_Plan_Level1) {
      this.model.Project_Plan_Level1 = [];
    }

    if (this.model.Project_Plan_Level1.length === 0) {
      this.model.Project_Plan_Level1.push({
        Strategy_Side_Id: '',
        Strategy_Issue_Id: '',
        Strategy_SubIssue_Id: '',
        Target: ''
      });
    }

    this.planLevel1Main = this.model.Project_Plan_Level1[0];

    // SUB
    if (!this.model.Project_Plan_Level1_Sub) {
      this.model.Project_Plan_Level1_Sub = [];
    }

    if (this.model.Project_Plan_Level1_Sub.length === 0) {
      this.model.Project_Plan_Level1_Sub.push({
        strategySide: '',
        strategyIssue: '',
        strategySubIssue: '',
        Target: '',
        alignmentDetail: ''
      });
    }

    this.subStrategies = this.model.Project_Plan_Level1_Sub;

    // LEVEL 2
    if (!this.model.Project_Plan_Level2) {
      this.model.Project_Plan_Level2 = {};
    }

    this.planLevel2 = this.model.Project_Plan_Level2;

    // CABINET
    if (!this.model.Project_Cabinet) {
      this.model.Project_Cabinet = [];
    }

    if (this.model.Project_Cabinet.length === 0) {
      this.model.Project_Cabinet.push({ title: '' });
    }

    this.cabinetList = this.model.Project_Cabinet;

    // LEVEL 3
    if (!this.model.Project_Plan_Level3) {
      this.model.Project_Plan_Level3 = {
        Urgent1_Checked: false,
        Urgent1_Name: '',
        Urgent2_Checked: false,
        Urgent2_Name: '',
        Mid1_Checked: false,
        Mid1_Name: '',
        Mid2_Checked: false,
        Mid2_Name: '',
        ProjectPlaningAlignment: '',
        PpatPlanName: '',
        PpatStrategy_Id: '',
        PpatMeasure_Id: '',
        PpatIndicator_Id: ''
      };
    }
    console.log('this.model.Project_Plan_Level3', this.model.Project_Plan_Level3);

    this.alignment = this.model.Project_Plan_Level3;
  }
  @Input() model: any;
  planLevel1Main: PlanLevel1Main = {
    Strategy_Side_Id: '',
    Strategy_Issue_Id: '',
    Strategy_SubIssue_Id: '',
    Target: ''
  };;
  subStrategies!: any[];
  policyList!: any[];
  alignment!: any;
  urgentPolicies!: any[];
  midLongPolicies!: any[];
  cabinetList!: any[];

  ppatPlans!: any[];

  projectPlaningAlignment!: string;

  planLevel2: any = {
    strategySide: '',
    targetYz: '',
    description: '',
    subplan: '',
    targetY1: '',
    subplanDesc: '',
    devGuideline: '',
    milestone: '',
    target: '',
    indicator: '',
    strategyMain: '',
    strategySub: ''
  };
  valueChain!: any;
  sdgs!: any;
  ngOnInit(): void {

    // LEVEL 1
    if (!this.model.Project_Plan_Level1) {
      this.model.Project_Plan_Level1 = [];
    }

    if (this.model.Project_Plan_Level1.length === 0) {
      this.model.Project_Plan_Level1.push({
        Strategy_Side_Id: '',
        Strategy_Issue_Id: '',
        Strategy_SubIssue_Id: '',
        Target: ''
      });
    }

    this.planLevel1Main = this.model.Project_Plan_Level1[0];

    // SUB
    if (!this.model.Project_Plan_Level1_Sub) {
      this.model.Project_Plan_Level1_Sub = [];
    }

    if (this.model.Project_Plan_Level1_Sub.length === 0) {
      this.model.Project_Plan_Level1_Sub.push({
        strategySide: '',
        strategyIssue: '',
        strategySubIssue: '',
        Target: '',
        alignmentDetail: ''
      });
    }

    this.subStrategies = this.model.Project_Plan_Level1_Sub;

    // LEVEL 2
    if (!this.model.Project_Plan_Level2) {
      this.model.Project_Plan_Level2 = {
        strategySide: '',
        targetYz: '',
        description: '',
        subplan: '',
        targetY1: '',
        subplanDesc: '',
        devGuideline: '',
        milestone: '',
        target: '',
        indicator: '',
        strategyMain: '',
        strategySub: ''
      };
    }

    this.planLevel2 = this.model.Project_Plan_Level2;

    // CABINET
    if (!this.model.Project_Cabinet) {
      this.model.Project_Cabinet = [];
    }

    if (this.model.Project_Cabinet.length === 0) {
      this.model.Project_Cabinet.push({ title: '' });
    }

    this.cabinetList = this.model.Project_Cabinet;
    if (!this.model.Project_Plan_Level3) {
      this.model.Project_Plan_Level3 = {
        urgentFixed: [
          { name: '', checked: false },
          { name: '', checked: false }
        ],
        midLongFixed: [
          { name: '', checked: false },
          { name: '', checked: false }
        ],
        projectPlaningAlignment: '',
        ppatFixed: {
          planName: '',
          strategy: '',
          measure: '',
          indicator: ''
        }
      };
    }

    this.alignment = this.model.Project_Plan_Level3;

  }

  addSubStrategy() {
    this.subStrategies.push({
      strategySide: '',
      strategyIssue: '',
      strategySubIssue: '',
      Target: '',
      alignmentDetail: ''
    });
  }

  removeSubStrategy(i: number) {
    this.subStrategies.splice(i, 1);
  }

  addPolicy() {
    this.policyList.push({
      detail: ''
    });
  }

  removePolicy(i: number) {
    if (this.policyList.length > 1) {
      this.policyList.splice(i, 1);
    }
  }

  addUrgentPolicy() {
    this.urgentPolicies.push({
      title: '',
      items: []
    });
  }

  removeUrgentPolicy(i: number) {
    this.urgentPolicies.splice(i, 1);
  }

  addUrgentItem(i: number) {
    this.urgentPolicies[i].items.push({
      name: '',
      checked: false
    });
  }

  removeUrgentItem(i: number, j: number) {
    this.urgentPolicies[i].items.splice(j, 1);
  }
  addMidLongPolicy() {
    this.midLongPolicies.push({
      title: '',
      items: []
    });
  }

  removeMidLongPolicy(i: number) {
    this.midLongPolicies.splice(i, 1);
  }

  addMidLongItem(i: number) {
    this.midLongPolicies[i].items.push({
      name: '',
      checked: false
    });
  }

  removeMidLongItem(i: number, j: number) {
    this.midLongPolicies[i].items.splice(j, 1);
  }
  addCabinet() {
    this.model.Project_Cabinet.push({
      title: ''
    });
  }

  removeCabinet(i: number) {
    this.model.Project_Cabinet.splice(i, 1);
  }
  addPpatPlan() {
    this.ppatPlans.push({
      planName: '',
      strategy: '',
      measure: '',
      indicator: ''
    });
  }

  removePpatPlan(i: number) {
    this.ppatPlans.splice(i, 1);
  }

}