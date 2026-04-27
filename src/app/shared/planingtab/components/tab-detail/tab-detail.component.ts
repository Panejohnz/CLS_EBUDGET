import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';


@Component({
  selector: 'app-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrl: './tab-detail.component.scss'
})
export class TabDetailComponent implements OnInit, OnChanges {
  constructor(public serviceebud: EbudgetService) {
    this.get_data()
  }
  allData: any
  Mas_Unit_Lists: any
  get_data() {
    let model = {
      FUNC_CODE: "FUNC-Get_List_Mas_Unit",
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {

      this.allData = Array.isArray(response.List_Mas_Unit)
        ? response.List_Mas_Unit
        : [];
      this.Mas_Unit_Lists = [...this.allData];

    })
  }

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
    this.projectDetail.Start_Date =
      this.convertJsonDateToInput(this.projectDetail.Start_Date);

    this.projectDetail.End_Date =
      this.convertJsonDateToInput(this.projectDetail.End_Date);
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
        Unit: null
      });
    }

    this.model.Project_Output.forEach((x: any) => {
      x.Unit = x.Unit ? Number(x.Unit) : null;
    });

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
        Unit: null
      });
    }

    this.model.Project_TargetGroup = this.model.Project_TargetGroup.map((x: any) => ({
      ...x,
      Unit: x.Unit ? Number(x.Unit) : null
    }));
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
  convertJsonDateToInput(dateStr: string): string {

    if (!dateStr) return '';

    const timestamp = Number(dateStr.replace(/[^0-9]/g, ''));
    const date = new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
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
      Unit: null
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