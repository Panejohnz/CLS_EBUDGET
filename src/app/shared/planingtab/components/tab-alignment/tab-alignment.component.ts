import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab-alignment',
  templateUrl: './tab-alignment.component.html',
  styleUrl: './tab-alignment.component.scss'
})
export class TabAlignmentComponent {
  @Input() model: any
  // 3.1 นโยบายเร่งด่วน
  urgentPolicies: any[] = [];

  // 3.2 นโยบายระยะกลาง/ยาว
  midLongPolicies: any[] = [];

  // 3.3 มติ ครม.
  cabinetList: any[] = [];

  // 3.4 แผนปฏิบัติราชการ ปปท.
  projectPlaningAlignment: string = ''; // radio value

  // 3.5 แผนงาน ปปท.
  ppatPlans: any[] = [];
  // 3.1

  ngOnInit(): void {
    console.log('00', this.model);
    this.subStrategies.push({
      strategySide: '',
      strategyIssue: '',
      strategySubIssue: '',
      target: '',
      alignmentDetail: ''
    });
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
    this.urgentPolicies[i].items.push({ name: '', checked: false });
  }
  removeUrgentItem(i: number, j: number) {
    this.urgentPolicies[i].items.splice(j, 1);
  }

  // 3.2
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
    this.midLongPolicies[i].items.push({ name: '', checked: false });
  }
  removeMidLongItem(i: number, j: number) {
    this.midLongPolicies[i].items.splice(j, 1);
  }

  // 3.3
  addCabinet() {
    this.cabinetList.push({ title: '' });
  }
  removeCabinet(i: number) {
    this.cabinetList.splice(i, 1);
  }

  // 3.5
  addPpatPlan() {
    this.ppatPlans.push({
      planName: '',
      strategy: '',
      measure: ''
    });
  }
  removePpatPlan(i: number) {
    this.ppatPlans.splice(i, 1);
  }
  subStrategies: any[] = [];
  addSubStrategy() {
    this.subStrategies.push({
      strategySide: '',
      strategyIssue: '',
      strategySubIssue: '',
      target: '',
      alignmentDetail: ''
    });
  }

  removeSubStrategy(index: number) {
    this.subStrategies.splice(index, 1);
  }


  policyList: any[] = [
    {
      title: '',
      detail: ''
    }
  ];

  addPolicy() {
    this.policyList.push({

      detail: ''
    });
  }



  removePolicy(index: number) {
    if (this.policyList.length > 1) {
      this.policyList.splice(index, 1);
    }
  }
}
