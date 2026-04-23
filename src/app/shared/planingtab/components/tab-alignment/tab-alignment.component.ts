import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { switchMap, tap } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

interface PlanLevel1Main {
  Strategy_Side_Id: any;
  Strategy_Issue_Id: any;
  Strategy_SubIssue_Id: any;
  Target: any;
}

@Component({
  selector: 'app-tab-alignment',
  templateUrl: './tab-alignment.component.html',
  styleUrl: './tab-alignment.component.scss'
})
export class TabAlignmentComponent implements OnChanges {

  constructor(
    public serviceebud: EbudgetService) { }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['model'] && this.model) {
      this.initData();
      this.loadAllMasterData();
    }
  }
  initData() {

    if (!this.model.Project_Plan_Level1) {
      this.model.Project_Plan_Level1 = [];
    }

    if (this.model.Project_Plan_Level1.length === 0) {
      this.model.Project_Plan_Level1.push({
        Strategy_Side_Id: null,
        Strategy_Issue_Id: null,
        Strategy_SubIssue_Id: null,
        Target: ''
      });
    }

    this.planLevel1Main = this.model.Project_Plan_Level1[0];
    if (!this.model.Project_Plan_Level1_Sub) {
      this.model.Project_Plan_Level1_Sub = [];
    }

    if (this.model.Project_Plan_Level1_Sub.length === 0) {
      this.model.Project_Plan_Level1_Sub.push({
        Strategy_Side_Id: null,
        Strategy_Issue_Id: null,
        Strategy_SubIssue_Id: null,
        Target: '',
        AlignmentDetail: ''
      });
    }

    this.subStrategies = this.model.Project_Plan_Level1_Sub;

    if (!this.model.Project_Plan_Level2.Strategy_Side_Id) {

      this.model.Project_Plan_Level2 = {
        Strategy_Side_Id: null,
        Target_Yz_Id: null,
        Description: '',
        Subplan_Id: null,
        Target_Y1_Id: null,
        SubplanDesc: '',
        DevGuideline_Id: null,
        Milestone_Id: null,
        Target_Id: null,
        Indicator_Id: null,
        Strategy_Main_Id: null,
        Strategy_Sub_Id: null,

        ValueChain_Main_Id: null,
        ValueChain_Factor_Main_Id: null,
        ValueChain_Support_Id: null,
        ValueChain_Factor_Support_Id: null,

        SDGs_Goal_Id: null,
        SDGs_Target_Id: null
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

    this.alignment = this.model.Project_Plan_Level3;
  }
  compareFn(a: any, b: any): boolean {
    return a === b;
  }
  loadAllMasterData() {

    this.callAPI("FUNC-GET_List_Mas_Strategic").pipe(

      tap((res: any) => {
        this.listStrategic = res.List_Mas_Strategic || [];
      }),

      switchMap(() =>
        this.callAPI("FUNC-GET_List_Mas_Master_Plan")
      ),
      tap((res: any) => {
        this.listMasterPlan = res.List_Mas_Master_Plan || [];
      }),

      switchMap(() =>
        this.callAPI("FUNC-GET_List_Mas_Milestone")
      ),
      tap((res: any) => {
        this.listMilestone = res.List_Mas_Milestone || [];
      }),

      switchMap(() =>
        this.callAPI("FUNC-GET_List_Mas_Value_Chain")
      ),
      tap((res: any) => {
        this.listValueChain = res.List_Mas_Value_Chain || [];
      }),

      switchMap(() =>
        this.callAPI("FUNC-GET_List_Mas_SDGs_Gloal")
      ),
      tap((res: any) => {
        this.listSDGsGoal = res.List_Mas_SDGs_Gloal || [];
      })

    ).subscribe(() => {
      // 🔥 ทุก list โหลดเสร็จแล้ว
      this.afterLoad();
    });
  }

  listStrategic: any[] = [];
  listIssue: any[] = [];
  listSubIssue: any[] = [];
  listMasterPlan: any[] = [];
  listMasterPlanGoal: any[] = [];
  listSubMasterPlan: any[] = [];
  listSubMasterPlanGoal: any[] = [];
  listGuideline: any[] = [];
  listMilestone: any[] = [];
  listTarget: any[] = [];
  listIndicator: any[] = [];
  listStrategyMain: any[] = [];
  listStrategySub: any[] = [];
  listValueChain: any[] = [];
  listValueChainFactorMain: any[] = [];
  listValueChainFactorSupport: any[] = [];
  listSDGsGoal: any[] = [];
  listSDGsTarget: any[] = [];
  loadStrategic() {
    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategic"
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listStrategic = res.List_Mas_Strategic || [];
        console.log('  this.listStrategic ', this.listStrategic);

      });
  }
  loadMilestone() {

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Milestone"
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listMilestone = res.List_Mas_Milestone || [];
      });
  }
  loadMasterPlan() {

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Master_Plan"
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listMasterPlan = res.List_Mas_Master_Plan || [];
      });

  }
  loadValueChain() {
    this.callAPI("FUNC-GET_List_Mas_Value_Chain")
      .subscribe(res => {
        this.listValueChain = res.List_Mas_Value_Chain || [];
      });
  }
  onChangeValueChainMain() {

    if (!this.planLevel2.ValueChain_Factor_Main_Id) {
      this.planLevel2.ValueChain_Factor_Main_Id = null;
      this.listValueChainFactorMain = [];
    }


    this.callAPI("FUNC-GET_List_Mas_Value_Chain_Factor_By_FK", {
      FK_Value_Chain_Id: this.planLevel2.ValueChain_Main_Id
    }).subscribe(res => {
      this.listValueChainFactorMain = res.List_Mas_Value_Chain_Factor || [];
    });
  }
  onChangeStrategic(id: any) {

    // reset ลูก
    if (!this.planLevel1Main.Strategy_Issue_Id) {
      this.planLevel1Main.Strategy_Issue_Id = null
      this.planLevel1Main.Strategy_SubIssue_Id = null;
      this.listIssue = [];
      this.listSubIssue = [];
    }




    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategic_Issue_By_FK",
      FK_Strategic_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listIssue = res.List_Mas_Strategic_Issue || [];
      });
  }
  onChangeIssue(id: any) {

    if (!this.planLevel1Main.Strategy_SubIssue_Id) {
      this.planLevel1Main.Strategy_SubIssue_Id = null;
      this.listSubIssue = [];
    }



    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategic_Sub_Issue_By_FK",
      FK_Strategic_Issue_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listSubIssue = res.List_Mas_Strategic_Sub_Issue || [];
      });
  }
  onChangeStrategicSub(item: any) {

    if (!item.Strategy_Issue_Id) {
      item.Strategy_Issue_Id = null;
      item.Strategy_SubIssue_Id = null;
      item.listIssue = [];
      item.listSubIssue = [];
    }


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategic_Issue_By_FK",
      FK_Strategic_Id: item.Strategy_Side_Id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {


        item.listIssue = res.List_Mas_Strategic_Issue || [];
        console.log('ไหน', item.listIssue);
      });
  }


  onChangeIssueSub(item: any) {

    if (!item.Strategy_SubIssue_Id) {
      item.Strategy_SubIssue_Id = null;
      item.listSubIssue = [];

    }

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategic_Sub_Issue_By_FK",
      FK_Strategic_Issue_Id: item.Strategy_Issue_Id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        item.listSubIssue = res.List_Mas_Strategic_Sub_Issue || [];
      });
  }
  onChangeMasterPlan(id: number) {

    if (!this.planLevel2.Target_Yz_Id) {
      this.planLevel2.Target_Yz_Id = null;
      this.planLevel2.Subplan_Id = null;
      this.planLevel2.Target_Y1_Id = null;
      this.planLevel2.DevGuideline_Id = null;

      this.listMasterPlanGoal = [];
      this.listSubMasterPlan = [];
      this.listSubMasterPlanGoal = [];
      this.listGuideline = [];
    }

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Master_Plan_Goal_By_FK",
      FK_Master_Plan_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listMasterPlanGoal = res.List_Mas_Master_Plan_Goal || [];
      });

    const model2 = {
      FUNC_CODE: "FUNC-GET_List_Mas_Sub_Master_Plan_By_FK",
      FK_Master_Plan_Id: id
    };

    this.serviceebud.GatewayGetData(model2)
      .subscribe((res2: any) => {
        this.listSubMasterPlan = res2.List_Mas_Sub_Master_Plan || [];
      });
  }
  onChangeSubMasterPlan(id: number) {

    if (!this.planLevel2.Target_Y1_Id) {
      this.planLevel2.Target_Y1_Id = null;
      this.planLevel2.DevGuideline_Id = null;

      this.listSubMasterPlanGoal = [];
      this.listGuideline = [];

    }


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Sub_Master_Plan_Goal_By_FK",
      FK_Sub_Master_Plan_Id: id
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listSubMasterPlanGoal = res.List_Mas_Sub_Master_Plan_Goal || [];
      });

    const model2 = {
      FUNC_CODE: "FUNC-GET_List_Mas_Sub_Plan_Guideline_By_FK",
      FK_Sub_Master_Plan_Id: id
    };
    this.serviceebud.GatewayGetData(model2)
      .subscribe((res2: any) => {
        this.listGuideline = res2.List_Mas_Sub_Plan_Guideline || [];
      });
  }
  onChangeMilestone() {
    if (!this.planLevel2.Target_Id) {
      this.planLevel2.Target_Id = null;
      this.planLevel2.Indicator_Id = null;

      this.listTarget = [];
      this.listIndicator = [];
    }


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Target_By_FK",
      FK_Milestone_Id: this.planLevel2.Milestone_Id
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listTarget = res.List_Mas_Target || [];
      });
  }
  onChangeTarget() {
    if (!this.planLevel2.Indicator_Id) {
      this.planLevel2.Indicator_Id = null;
      this.listIndicator = [];
    }


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Indicator_By_FK",
      FK_Target_Id: this.planLevel2.Target_Id
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listIndicator = res.List_Mas_Indicator || [];
      });

  }
  onChangeTargetY1() {

    const id = this.planLevel2.Target_Y1_Id;

    this.planLevel2.ValueChain_Main_Id = null;
    this.planLevel2.ValueChain_Factor_Main_Id = null;
    this.planLevel2.ValueChain_Support_Id = null;
    this.planLevel2.ValueChain_Factor_Support_Id = null;

    this.listValueChain = [];
    this.listValueChainFactorMain = [];
    this.listValueChainFactorSupport = [];

    if (!id) return;


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Value_Chain_By_FK",
      Target_Y1_Id: this.planLevel2.Target_Y1_Id
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listValueChain = res.List_Mas_Value_Chain || [];
      });

  }
  loadStrategyMain() {

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategy_Main"
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listStrategyMain = res.List_Mas_Strategy_Main || [];
      });
  }

  onChangeStrategyMain() {
    if (!this.planLevel2.Strategy_Sub_Id) {
      this.planLevel2.Strategy_Sub_Id = null;
      this.listStrategySub = [];
    }


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategy_Sub_By_FK"
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listStrategySub = res.List_Mas_Strategy_Sub || [];
      });
  }



  onChangeValueChainSupport() {
    if (!this.planLevel2.ValueChain_Factor_Support_Id) {
      this.planLevel2.ValueChain_Factor_Support_Id = null;
      this.listValueChainFactorSupport = [];
    }


    this.callAPI("FUNC-GET_List_Mas_Value_Chain_Factor_By_FK", {
      FK_Value_Chain_Id: this.planLevel2.ValueChain_Support_Id
    }).subscribe(res => {
      this.listValueChainFactorSupport = res.List_Mas_Value_Chain_Factor || [];
    });
  }
  loadSDGsGoal() {
    this.callAPI("FUNC-GET_List_Mas_SDGs_Gloal")
      .subscribe(res => {
        this.listSDGsGoal = res.List_Mas_SDGs_Gloal || [];
      });
  }

  onChangeSDGsGoal() {
    if (!this.planLevel2.SDGs_Target_Id) {
      this.planLevel2.SDGs_Target_Id = null;
      this.listSDGsTarget = [];
    }


    this.callAPI("FUNC-GET_List_Mas_SDGs_Target_By_FK", {
      SDGs_Gloals_Id: this.planLevel2.SDGs_Gloals_Id
    }).subscribe(res => {
      this.listSDGsTarget = res.List_Mas_SDGs_Target || [];
    });
  }
  afterLoad() {
    debugger
    const l2 = this.planLevel2;
    if (!l2 || Object.keys(l2).length === 0) return;

    if (this.planLevel1Main.Strategy_Side_Id) {
      this.onChangeStrategic(this.planLevel1Main.Strategy_Side_Id);
    }

    if (this.planLevel1Main.Strategy_Issue_Id) {
      this.onChangeIssue(this.planLevel1Main.Strategy_Issue_Id);
    }

    if (this.subStrategies && this.subStrategies.length > 0) {

      this.subStrategies.forEach((item: any) => {
        if (item.Strategy_Side_Id) {
          this.onChangeStrategicSub(item);
        }
        if (item.Strategy_Issue_Id) {
          this.onChangeIssueSub(item);
        }

      });
    }

    if (l2.Strategy_Side_Id) this.onChangeMasterPlan(l2.Strategy_Side_Id);
    if (l2.Subplan_Id) this.onChangeSubMasterPlan(l2.Subplan_Id);

    if (l2.Milestone_Id) this.onChangeMilestone();
    if (l2.Target_Id) this.onChangeTarget();

    if (l2.Strategy_Main_Id) this.onChangeStrategyMain();

    if (l2.ValueChain_Main_Id) this.onChangeValueChainMain();
    if (l2.ValueChain_Support_Id) this.onChangeValueChainSupport();

    if (l2.SDGs_Gloals_Id) this.onChangeSDGsGoal();
  }
  @Input() model: any;
  planLevel1Main: PlanLevel1Main = {
    Strategy_Side_Id: null,
    Strategy_Issue_Id: null,
    Strategy_SubIssue_Id: null,
    Target: ''
  };

  subStrategies!: any[];
  policyList!: any[];
  alignment!: any;
  urgentPolicies!: any[];
  midLongPolicies!: any[];
  cabinetList!: any[];

  ppatPlans!: any[];

  projectPlaningAlignment!: string;

  planLevel2: any = {
    Strategy_Side_Id: null,
    Target_Yz_Id: null,
    Description: '',
    Subplan_Id: null,
    Target_Y1_Id: null,
    SubplanDesc: '',
    DevGuideline_Id: null,
    Milestone_Id: null,
    Target_Id: null,
    Indicator_Id: null,
    Strategy_Main_Id: null,
    Strategy_Sub_Id: null,

    ValueChain_Main_Id: null,
    ValueChain_Factor_Main_Id: null,
    ValueChain_Support_Id: null,
    ValueChain_Factor_Support_Id: null,

    SDGs_Goal_Id: null,
    SDGs_Target_Id: null
  };
  valueChain!: any;
  sdgs!: any;
  // ngOnInit(): void {

  //   // LEVEL 1
  //   if (!this.model.Project_Plan_Level1) {
  //     this.model.Project_Plan_Level1 = [];
  //   }

  //   if (this.model.Project_Plan_Level1.length === 0) {
  //     this.model.Project_Plan_Level1.push({
  //       Strategy_Side_Id: '',
  //       Strategy_Issue_Id: '',
  //       Strategy_SubIssue_Id: '',
  //       Target: ''
  //     });
  //   }

  //   this.planLevel1Main = this.model.Project_Plan_Level1[0];

  //   // SUB
  //   if (!this.model.Project_Plan_Level1_Sub) {
  //     this.model.Project_Plan_Level1_Sub = [];
  //   }

  //   if (this.model.Project_Plan_Level1_Sub.length === 0) {
  //     this.model.Project_Plan_Level1_Sub.push({
  //       strategySide: '',
  //       strategyIssue: '',
  //       strategySubIssue: '',
  //       Target: '',
  //       alignmentDetail: ''
  //     });
  //   }

  //   this.subStrategies = this.model.Project_Plan_Level1_Sub;

  //   // LEVEL 2
  //   if (!this.model.Project_Plan_Level2) {
  //     this.model.Project_Plan_Level2 = {
  //       strategySide: '',
  //       targetYz: '',
  //       description: '',
  //       subplan: '',
  //       targetY1: '',
  //       subplanDesc: '',
  //       devGuideline: '',
  //       milestone: '',
  //       target: '',
  //       indicator: '',
  //       strategyMain: '',
  //       strategySub: ''
  //     };
  //   }

  //   this.planLevel2 = this.model.Project_Plan_Level2;

  //   // CABINET
  //   if (!this.model.Project_Cabinet) {
  //     this.model.Project_Cabinet = [];
  //   }

  //   if (this.model.Project_Cabinet.length === 0) {
  //     this.model.Project_Cabinet.push({ title: '' });
  //   }

  //   this.cabinetList = this.model.Project_Cabinet;
  //   if (!this.model.Project_Plan_Level3) {
  //     this.model.Project_Plan_Level3 = {
  //       urgentFixed: [
  //         { name: '', checked: false },
  //         { name: '', checked: false }
  //       ],
  //       midLongFixed: [
  //         { name: '', checked: false },
  //         { name: '', checked: false }
  //       ],
  //       projectPlaningAlignment: '',
  //       ppatFixed: {
  //         planName: '',
  //         strategy: '',
  //         measure: '',
  //         indicator: ''
  //       }
  //     };
  //   }

  //   this.alignment = this.model.Project_Plan_Level3;

  // }

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
  callAPI(func: string, payload: any = {}) {
    const model = {
      FUNC_CODE: func,
      ...payload
    };

    return this.serviceebud.GatewayGetData(model);
  }
}