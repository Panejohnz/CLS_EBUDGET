import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
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
      this.loadLandmark()
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
        Landmark_Id: null,
        Landmark_Gloals_Id: null,
        Landmark_Tacticts_Id: null,
        Landmark_Guidelines_Id: null,
        Target_Id: null,
        Indicator_Id: null,
        Strategy_Main_Id: null,
        Strategy_Sub_Id: null,

        ValueChain_Main_Id: null,
        ValueChain_Factor_Main_Id: null,
        ValueChain_Support_Id: null,
        ValueChain_Factor_Support_Id: null,

        SDGs_Gloals_Id: null,
        SDGs_Targets_Id: null
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
        Government_Policy_Id1: null,
        Government_Policy_Id2: null,
        Action_Plan_Id: null,
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
        PpatIndicator_Id: '',
        Project_Plan_Id: null,
        Tactics_Id : null,
        Measure_Id :null,
        Indicators_Id : null,
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
        this.callAPI("FUNC-GET_List_Mas_Landmark")
      ),
      tap((res: any) => {
        this.listLandmark = res.List_Mas_Landmark || [];
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
      }),
      switchMap(() =>
        this.callAPI("FUNC-Get_List_Mas_Government_Policy")
      ),
      tap((res: any) => {
        this.listGovernment_Policy1 = res.List_Mas_Government_Policy1 || [];
        this.listGovernment_Policy2 = res.List_Mas_Government_Policy2 || [];
      }),
      switchMap(() =>
        this.callAPI("FUNC-GET_List_Mas_Action_Plan")
      ),
      tap((res: any) => {
        this.listActionPlan = res.List_Mas_Action_Plan || [];
      }),
      switchMap(() =>
        this.callAPI("FUNC-GET_List_Mas_Project_Plan")
      ),
      tap((res: any) => {
        this.listProjectPlan = res.List_Mas_Project_Plan || [];
      }),
      switchMap(() =>
        this.callAPI("FUNC-GET_List_Mas_Tactics")
      ),
      tap((res: any) => {
        this.listMasTactic = res.List_Mas_Tactic || [];
      }),
    ).subscribe(() => {
      this.afterLoad();
    });
  }
  listMasIndicator: any[] = []
  listMasTactic: any[] = []
  listProjectPlan: any[] = []
  listActionPlan: any[] = []
  listGovernment_Policy1: any[] = []
  listGovernment_Policy2: any[] = []
  listStrategic: any[] = [];
  listIssue: any[] = [];
  listSubIssue: any[] = [];
  listMasterPlan: any[] = [];
  listMasterPlanGoal: any[] = [];
  listSubMasterPlan: any[] = [];
  listSubMasterPlanGoal: any[] = [];
  listGuideline: any[] = [];
  listLandmark: any[] = [];
  listLandmark_Gloals: any[] = [];
  listLandmark_Tactic: any[] = [];
  listMas_Landmark_Guideline: any[] = [];
  listMas_Landmark_Sub_Guideline: any[] = [];
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
      });
  }
  loadLandmark() {

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Landmark"
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listLandmark = res.List_Mas_Landmark || [];
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
  onChangeLandmark() {

    const id = this.planLevel2.Landmark_Id;

    // 🔥 reset ลูกทั้งหมด
    this.planLevel2.Target_Id = null;
    this.planLevel2.Indicator_Id = null;

    this.listLandmark_Gloals = [];
    this.listLandmark_Tactic = [];

    if (!id) return;

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Landmark_Gloals_By_Mas_Landmark_FK",
      FK_Landmark_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listLandmark_Gloals = res.List_Mas_Landmark_Gloals || [];
        this.listLandmark_Tactic = res.List_Mas_Landmark_Tactic || [];
        this.listMas_Landmark_Guideline = res.List_Mas_Landmark_Guideline || [];
      });
  }
  onChangeTarget() {

    const id = this.planLevel2.Target_Id;

    this.planLevel2.Indicator_Id = null;
    this.listLandmark_Tactic = [];

    if (!id) return;

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Indicator_By_FK",
      FK_Target_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listLandmark_Tactic = res.List_Mas_Indicator || [];
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
        this.listMas_Landmark_Guideline = res.List_Mas_Strategy_Main || [];
      });
  }

  onChangeStrategyMain() {
    if (!this.planLevel2.Landmark_Guidelines_Id) {
      this.planLevel2.Landmark_Guidelines_Id = null;
      this.listMas_Landmark_Sub_Guideline = [];
    }


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Landmark_Sub_Guideline_By_FK",
      FK_Guidelines_Id: this.planLevel2.Landmark_Guidelines_Id
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listMas_Landmark_Sub_Guideline = res.List_Mas_Landmark_Sub_Guideline || [];
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
  listGovernment_Policy_Sub1: any
  listGovernment_Policy_Sub2: any
  onChangenGovernment_Policy1() {
    if (!this.model.Project_Plan_Level3.Government_Policy_Id1) {
      this.model.Project_Plan_Level3.Government_Policy_Id1 = null;
      this.listGovernment_Policy1 = [];
    }

    this.callAPI("FUNC-Get_List_Mas_Government_Policy_Sub_By_fk1", {
      Government_Policy_Id: this.model.Project_Plan_Level3.Government_Policy_Id1
    }).subscribe(res => {
      this.listGovernment_Policy_Sub1 = res.List_Mas_Government_Policy_Sub1 || [];
    });
  }
  onChangenGovernment_Policy2() {
    if (!this.model.Project_Plan_Level3.Government_Policy_Id2) {
      this.model.Project_Plan_Level3.Government_Policy_Id2 = null;
      this.listGovernment_Policy2 = [];
    }

    this.callAPI("FUNC-Get_List_Mas_Government_Policy_Sub_By_fk2", {
      Government_Policy_Id: this.model.Project_Plan_Level3.Government_Policy_Id2
    }).subscribe(res => {
      this.listGovernment_Policy_Sub2 = res.List_Mas_Government_Policy_Sub2 || [];
    });
  }
  onChangenTactic() {
    if (!this.model.Project_Plan_Level3.Project_Plan_Id) {
      this.model.Project_Plan_Level3.Project_Plan_Id = null;
      this.listMasTactic = [];
      this.listMasIndicator = [];
    }
    this.callAPI("FUNC-GET_List_Mas_Tactic_By_FK_Project_Plan", {
      Project_Id: this.model.Project_Plan_Level3.Project_Plan_Id
    }).subscribe(res => {
      this.listMasTactic = res.List_Mas_Tactic || [];
      this.listMasIndicator = res.List_Mas_Indicator || [];
    });
  }
  listMasMeasure: any[] = []
  onChangenMeasure() {
    if (!this.model.Project_Plan_Level3.Tactics_Id) {
      this.model.Project_Plan_Level3.Tactics_Id = null;
      this.listMasMeasure = [];
    }
    this.callAPI("FUNC-GET_List_Mas_Measure_By_FK_Tactic", {
      Tactics_Id: this.model.Project_Plan_Level3.Tactics_Id
    }).subscribe(res => {
      this.listMasMeasure = res.List_Mas_Measure || [];

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

    if (l2.Landmark_Id) this.onChangeLandmark();
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
    Landmark_Id: null,
    Landmark_Gloals_Id: null,
    Landmark_Tacticts_Id: null,
    Landmark_Guidelines_Id: null,
    Target_Id: null,
    Indicator_Id: null,
    Strategy_Main_Id: null,
    Strategy_Sub_Id: null,
    ValueChain_Main_Id: null,
    ValueChain_Factor_Main_Id: null,
    ValueChain_Support_Id: null,
    ValueChain_Factor_Support_Id: null,
    SDGs_Gloals_Id: null,
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
  //       Landmark: '',
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