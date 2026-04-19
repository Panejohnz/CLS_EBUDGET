import { Component, Input, OnInit } from '@angular/core';

interface PlanLevel1Main {
  strategySide: string;
  strategyIssue: string;
  strategySubIssue: string;
  target: string;
}

@Component({
  selector: 'app-tab-alignment',
  templateUrl: './tab-alignment.component.html',
  styleUrl: './tab-alignment.component.scss'
})
export class TabAlignmentComponent implements OnInit {

  @Input() model: any;
  planLevel1Main: PlanLevel1Main = {
    strategySide: '',
    strategyIssue: '',
    strategySubIssue: '',
    target: ''
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

    if (!this.model.Project_Plan) {
      this.model.Project_Plan = {};
    }

    if (!this.model.Project_Plan.alignment) {
      this.model.Project_Plan.alignment = {};
    }

    const a = this.model.Project_Plan.alignment;
    if (!a.subStrategies) {
      a.subStrategies = [];
    }
    if (a.subStrategies.length === 0) {
      a.subStrategies.push({
        strategySide: '',
        strategyIssue: '',
        strategySubIssue: '',
        target: '',
        alignmentDetail: ''
      });
    }

    // 🔥 สำคัญ
    this.subStrategies = a.subStrategies;
    if (!a.cabinetList) {
      a.cabinetList = [];
    }
    if (a.cabinetList.length === 0) {
      a.cabinetList.push({ title: '' });
    }
    // init structure
    if (!a.urgentFixed) {
      a.urgentFixed = [
        { name: '', checked: false },
        { name: '', checked: false }
      ];
    }

    if (!a.midLongFixed) {
      a.midLongFixed = [
        { name: '', checked: false },
        { name: '', checked: false }
      ];
    }

    if (!a.cabinetList) {
      a.cabinetList = [];
    }

    if (!a.projectPlaningAlignment) {
      a.projectPlaningAlignment = '';
    }

    if (!a.ppatFixed) {
      a.ppatFixed = {
        planName: '',
        strategy: '',
        measure: '',
        indicator: ''
      };
    }

    // 🔥 สำคัญ
    this.alignment = a;
  }

  addSubStrategy() {
    this.subStrategies.push({
      strategySide: '',
      strategyIssue: '',
      strategySubIssue: '',
      target: '',
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
    this.alignment.cabinetList.push({
      title: ''
    });
  }
removeCabinet(i: number) {
  this.alignment.cabinetList.splice(i, 1);
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