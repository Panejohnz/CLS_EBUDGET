import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import {
  NgbDateParserFormatter,
  NgbDateStruct
} from '@ng-bootstrap/ng-bootstrap';
import { LOCALE_ID } from '@angular/core';
import { ThaiDateFormatter } from '../../../../thai-date-formatter';
import {
  NgbDatepickerI18n
} from '@ng-bootstrap/ng-bootstrap';

import { ThaiDatepickerI18n }
  from '../../../../thai-datepicker-i18n';
@Component({
  selector: 'app-tab-detail',
  templateUrl: './tab-detail.component.html',
  styleUrl: './tab-detail.component.scss',
  providers: [
    {
      provide: NgbDateParserFormatter,
      useClass: ThaiDateFormatter
    },
    {
      provide: NgbDatepickerI18n,
      useClass: ThaiDatepickerI18n
    },
    {
      provide: LOCALE_ID,
      useValue: 'th'
    }
  ]
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
  convertJsonDateToInput(
    dateStr: string
  ): NgbDateStruct | null {

    if (!dateStr) return null;

    const timestamp =
      Number(dateStr.replace(/[^0-9]/g, ''));

    const date = new Date(timestamp);

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    };
  }
  addObjective() {

    const newItem = {
      Project_Objectives_Id: 0,
      FK_Project_Id: this.model.Project_Id,
      Seq: this.objectives.length + 1,
      Name: ''
    };

    this.objectives.push(newItem);

    this.model.Project_Objective = [...this.objectives];
  }

  convertToApiDate(date: any): string {

    if (!date) return '';

    if (
      typeof date === 'object' &&
      date.year &&
      date.month &&
      date.day
    ) {
      return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
    }

    return date;
  }
  syncProjectDetailDate() {

    this.model.Project_Detail.Start_Date =
      this.convertToApiDate(
        this.projectDetail.Start_Date
      );

    this.model.Project_Detail.End_Date =
      this.convertToApiDate(
        this.projectDetail.End_Date
      );
  }
  removeObjective(i: number, item: any) {
    if (!item.Project_Objectives_Id) {
      this.objectives.splice(i, 1);
    }
    let model = {
      FUNC_CODE: "FUNC-Delete_Project_Objectives",
      Project_Detail_Id: item.Project_Objectives_Id
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.objectives.splice(i, 1);
    })

  }

  addOutput() {
    this.outputs.push({
      Name: '',
      target: '',
      Unit: null
    });
    this.outputs = [...this.model.Project_Output];
  }

  removeOutput(i: number, item: any) {

    if (!item.Project_Outpu_Id) {
      this.outputs.splice(i, 1);
    }
    let model = {
      FUNC_CODE: "FUNC-Delete_Project_Output",
      Project_Detail_Id: item.Project_Outpu_Id
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.outputs.splice(i, 1);
    })
  }

  addOutcome() {

    const item = {
      Project_Outcome_Id: 0,
      FK_Project_Id: this.model.Project_Id,
      Name: ''
    };

    this.outcomes.push(item);

    this.model.Project_Outcome = [...this.outcomes];
  }

  removeOutcome(i: number, item: any) {

    if (!item.Project_Outpu_Id) {
      this.outcomes.splice(i, 1);
    }
    let model = {
      FUNC_CODE: "FUNC-Delete_Project_Outcome",
      Project_Detail_Id: item.Project_Outcome_Id
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.outcomes.splice(i, 1);
    })
  }

  addExpectedResult() {

    const item = {
      Project_Expected_Id: 0,
      FK_Project_Id: this.model.Project_Id,
      Name: ''
    };

    this.expectedResults.push(item);

    this.model.Project_Expected = [...this.expectedResults];
  }

  removeExpectedResult(i: number) {
    this.expectedResults.splice(i, 1);
  }

  addTargetGroup() {
    this.targetGroups.push({
      Name: '',
      amount: '',
      Unit: null
    });
  }

  removeTargetGroup(i: number, item: any) {
    if (item.TargetGroup_Id) {
      let model = {
        FUNC_CODE: "FUNC-Delete_TargetGroup",
        TargetGroup_Id: item.TargetGroup_Id
      }
      var getData = this.serviceebud.GatewayGetData(model);
      getData.subscribe((response: any) => {
        this.targetGroups.splice(i, 1);

      })
    } else {
      this.targetGroups.splice(i, 1);
    }

  }

}