import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { NonNullableFormBuilder } from '@angular/forms';
import { switchMap, tap } from 'rxjs';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { BudgetYearService } from 'src/app/core/services/budget-year.service';

interface PlanLevel1Main {
  Strategic_Id: any;
  Issues_Id: any;
  Issues_Sub_Id: any;
  Target: any;
}

@Component({
  selector: 'app-tab-alignment',
  templateUrl: './tab-alignment.component.html',
  styleUrl: './tab-alignment.component.scss'
})
export class TabAlignmentComponent implements OnChanges {

  constructor(
    public serviceebud: EbudgetService, private budgetYearService: BudgetYearService) { }
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
        Strategic_Id: null,
        Issues_Id: null,
        Issues_Sub_Id: null,
        Target: ''
      });
    }

    this.planLevel1Main = this.model.Project_Plan_Level1[0];
    if (!this.model.Project_Plan_Level1_Sub) {
      this.model.Project_Plan_Level1_Sub = [];
    }

    if (this.model.Project_Plan_Level1_Sub.length === 0) {
      this.model.Project_Plan_Level1_Sub.push({
        Strategic_Id: null,
        Issues_Id: null,
        Issues_Sub_Id: null,
        Target: '',
        AlignmentDetail: ''
      });
    }

    this.subStrategies = this.model.Project_Plan_Level1_Sub;

    if (!this.model.Project_Plan_Level2.Project_Plan_Level2_Id) {

      this.model.Project_Plan_Level2 = {
        Strategic_Id: null,
        Target_Yz_Id: null,
        Description: '',
        Subplan_Id: null,
        Target_Y1_Id: null,
        SubplanDesc: '',
        DevGuideline_Id: null,
        Master_Plan_Id: null,
        Landmark_Id: null,
        Landmark_Gloals_Id: null,
        Landmark_Tacticts_Id: null,
        Landmark_Guidelines_Id: null,
        Target_Id: null,
        Indicator_Id: null,
        Strategy_Main_Id: null,
        Strategy_Sub_Id: null,
        Plan_Tactics_Id: null,
        ValueChain_Main_Id: null,
        ValueChain_Factor_Main_Id: null,
        ValueChain_Support_Id: null,
        ValueChain_Factor_Support_Id: null,
        Landmark_Sub_Guidelines_Id: null,
        SDGs_Gloals_Id: null,
        SDGs_Targets_Id: null,
        Plan_Goals_Id: null
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
        Project_Plan_Id5: null,
        Tactics_Id: null,
        Measure_Id: null,
        Indicators_Id: null,
        Plan5_Master_Plan_Id: null,
        Plan5_Goals_Id: null,
        Plan5_Indicator_Id: null,
        Plan5_Description: '',

        Plan5_Subplan_Id: null,
        Plan5_Target_Y1_Id: null,
        Plan5_Subplan_Desc: '',
        Plan5_Guideline_Id: null,

        Plan5_ValueChain_Main_Id: null,
        Plan5_ValueChain_Factor_Main_Id: null,
        Plan5_ValueChain_Support_Id: null,
        Plan5_ValueChain_Factor_Support_Id: null,

        Master_Plan_Id: null,
        Plan_Goals_Id: null,
        Plan_Tactics_Id: null,
        Sub_Master_Plan_Id: null,
        Sub_Plan_Goals_Id: null,
        ValueChain_Main_Id: null,
        ValueChain_Factor_Main_Id: null,
        ValueChain_Support_Id: null,
        ValueChain_Factor_Support_Id: null,

        Plan5_Project_Plan_Id: null,
        Project_Plan_Goals_Id: null,
        Goals_Guidelines_Id: null,
        Guidelines_Id: null
      };
    }

    this.alignment = this.model.Project_Plan_Level3;
  }
  compareFn(a: any, b: any): boolean {
    return a === b;
  }
  currentYear: any
  loadAllMasterData() {
    this.budgetYearService.yearChanged$.subscribe(async year => {
      if (year) {
        if (year < 2500) {
          year = year + 543
        }
        let model = {
          FUNC_CODE: "FUNC-GET_Master_Data",
          BgYear: year
        };

        this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

          this.listStrategic = res.List_Mas_Strategic || [];
          this.listMasterPlan = res.List_Mas_Master_Plan || [];
          this.listLandmark = res.List_Mas_Landmark || [];
          this.listValueChain = res.List_Mas_Value_Chain || [];
          this.listSDGsGoal = res.List_Mas_SDGs_Gloal || [];
          this.listGovernment_Policy1 = res.List_Mas_Government_Policy1 || [];
          this.listGovernment_Policy2 = res.List_Mas_Government_Policy2 || [];
          this.listActionPlan = res.List_Mas_Action_Plan || [];
          this.listProjectPlan = res.List_Mas_Project_Plan || [];
          this.listMasTactic = res.List_Mas_Tactic || [];
          this.listMasterPlan5 = res.List_Mas_Master_Plan_5 || []; //new
          this.listProjectPlan5 = res.List_Mas_Project_Plan_5 || [];
          this.afterLoad();
        })
      }
    });
  }
  listMasIndicator: any[] = []
  listMasProjectPlanGoal: any[] = []
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
  listMasterPlanGoalTactic: any[] = [];
  listMasterPlanIndicator: any[] = []
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
  listMasterPlan5: any[] = [];
  listMasterPlanGoal5: any[] = [];
  listMasterPlanIndicator5: any[] = [];
  listSubMasterPlan5: any[] = [];
  listSubMasterPlanGoal5: any[] = [];
  listGuideline5: any[] = [];
  listSubGuideline5: any[] = [];
  listValueChain5: any[] = [];
  listValueChainFactorMain5: any[] = [];
  listValueChainFactorSupport5: any[] = [];
  listMasterPlanTactic5: any[] = []
  listProjectPlan5: any[] = [];
  listProjectPlanGoal5: any[] = [];
  listIndicator5: any[] = [];
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
  onChangeStrategic(id: any, isInitialLoad: boolean = false) {

    // reset ลูก
    if (!this.isInitialLoad) {
      this.planLevel1Main.Issues_Id = null
      this.planLevel1Main.Issues_Sub_Id = null;
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
  onChangeIssue(id: any, isInitialLoad: boolean = false) {

    if (!this.isInitialLoad) {
      this.planLevel1Main.Issues_Sub_Id = null;
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

    if (!this.isInitialLoad) {
      item.Issues_Id = null;
      item.Issues_Sub_Id = null;
      item.listIssue = [];
      item.listSubIssue = [];
    }


    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategic_Issue_By_FK",
      FK_Strategic_Id: item.Strategic_Id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {


        item.listIssue = res.List_Mas_Strategic_Issue || [];
        console.log('ไหน', item.listIssue);
      });
  }


  onChangeIssueSub(item: any, isInitialLoad: boolean = false) {

    if (!this.isInitialLoad) {
      item.Issues_Sub_Id = null;
      item.listSubIssue = [];

    }

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Strategic_Sub_Issue_By_FK",
      FK_Strategic_Issue_Id: item.Issues_Id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        item.listSubIssue = res.List_Mas_Strategic_Sub_Issue || [];
      });
  }
  onChangeMasterPlan(id: number, isInitialLoad: boolean = false) {

    if (!this.isInitialLoad) {
      this.planLevel2.Master_Plan_Id = null;
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
  onChangeMasterPlan5(id: any, isInitialLoad: boolean = false) {

    const p = this.model.Project_Plan_Level3;
    if (!this.isInitialLoad) {
      p.Plan5_Goals_Id = null;
      p.Plan5_Indicator_Id = null;
      p.Plan5_Subplan_Id = null;
      p.Plan5_Target_Y1_Id = null;
      p.Plan5_Guideline_Id = null;

      p.Plan5_ValueChain_Main_Id = null;
      p.Plan5_ValueChain_Support_Id = null;
      p.Plan5_ValueChain_Factor_Main_Id = null;
      p.Plan5_ValueChain_Factor_Support_Id = null;

      this.listMasterPlanGoal5 = [];
      this.listMasterPlanTactic5 = [];
      this.listSubMasterPlan5 = [];
      this.listSubMasterPlanGoal5 = [];
      this.listGuideline5 = [];
      this.listValueChain5 = [];
    }


    if (!id) return;

    this.callAPI("FUNC-GET_List_Mas_Master_Plan_Goal_5_By_FK", {
      FK_Master_Plan_Id: id
    }).subscribe(res => {
      this.listMasterPlanGoal5 = res.List_Mas_Master_Plan_Goal_5 || [];
    });

    this.callAPI("FUNC-GET_List_Mas_Sub_Master_Plan_5_By_FK", {
      FK_Master_Plan_Id: id
    }).subscribe(res => {
      this.listSubMasterPlan5 = res.List_Mas_Sub_Master_Plan_5 || [];
    });
  }
  onChangeMasterPlanGoal5(id: any, isInitialLoad: boolean = false) {

    const p = this.model.Project_Plan_Level3;
    if (!this.isInitialLoad) {
      p.Plan5_Indicator_Id = null;

      this.listMasterPlanTactic5 = [];

    }

    if (!id) return;

    this.callAPI("FUNC-GET_List_Mas_Master_Plan_Goal_Tactic_5_By_FK", {
      FK_Plan_Goals_Id: id
    }).subscribe(res => {
      this.listMasterPlanTactic5 = res.List_Mas_Master_Plan_Goal_Tactic_5 || [];
    });
  }
  onChangeSubMasterPlan5(id: any, isInitialLoad: boolean = false) {

    const p = this.model.Project_Plan_Level3;
    if (!this.isInitialLoad) {
      p.Plan5_Target_Y1_Id = null;
      p.Plan5_Guideline_Id = null;

      p.Plan5_ValueChain_Main_Id = null;
      p.Plan5_ValueChain_Support_Id = null;
      p.Plan5_ValueChain_Factor_Main_Id = null;
      p.Plan5_ValueChain_Factor_Support_Id = null;

      this.listSubMasterPlanGoal5 = [];
      this.listSubGuideline5 = [];
      this.listValueChain5 = [];
    }


    if (!id) return;

    this.callAPI("FUNC-GET_List_Mas_Sub_Master_Plan_Goal_5_By_FK", {
      FK_Sub_Master_Plan_Id: id
    }).subscribe(res => {
      this.listSubMasterPlanGoal5 = res.List_Mas_Sub_Master_Plan_Goal_5 || [];
      this.listSubGuideline5 = res.List_Mas_Sub_Plan_Guideline_5 || [];
    });
  }

  onChangeTargetY15(id: any, isInitialLoad: boolean = false) {
    const p = this.model.Project_Plan_Level3;

    if (!this.isInitialLoad) {
      p.Plan5_ValueChain_Main_Id = null;
      p.Plan5_ValueChain_Support_Id = null;
      p.Plan5_ValueChain_Factor_Main_Id = null;
      p.Plan5_ValueChain_Factor_Support_Id = null;

      this.listValueChain5 = [];
      this.listValueChainFactorMain5 = [];
      this.listValueChainFactorSupport5 = [];

    }

    if (!id) return;

    this.callAPI("FUNC-GET_List_Mas_Value_Chain_5_By_FK", {
      Target_Y1_Id: id
    }).subscribe(res => {
      this.listValueChain5 = res.List_Mas_Value_Chain_5 || [];
    });
  }
  onChangeValueChainMain5(isInitialLoad: boolean = false) {
    const p = this.model.Project_Plan_Level3;
    if (!this.isInitialLoad) {
      p.Plan5_Indicator_Id = null;

      this.listMasterPlanTactic5 = [];

    }


    this.callAPI("FUNC-GET_List_Mas_Value_Chain_Factor_5_By_FK", {
      FK_Value_Chain_Id: p.ValueChain_Main_Id
    }).subscribe(res => {
      this.listValueChainFactorMain5 = res.List_Mas_Value_Chain_Factor_5 || [];
    });
  }
  onChangeValueChainSupport5(isInitialLoad: boolean = false) {

    const p = this.model.Project_Plan_Level3;
    if (!this.isInitialLoad) {
      p.ValueChain_Factor_Main_Id = null;
      this.listValueChainFactorSupport5 = [];
    }


    this.callAPI("FUNC-GET_List_Mas_Value_Chain_Factor_5_By_FK", {
      FK_Value_Chain_Id: p.ValueChain_Support_Id
    }).subscribe(res => {
      this.listValueChainFactorSupport5 = res.List_Mas_Value_Chain_Factor_5 || [];
    });
  }
  onChangeMasterPlanGoal(id: number, isInitialLoad: boolean = false) {

    if (!this.isInitialLoad) {
      this.planLevel2.Plan_Tactics_Id = null;
      this.listMasterPlanGoalTactic = [];
    }

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Master_Plan_Goal_Tactic_By_FK",
      FK_Master_Plan_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listMasterPlanGoalTactic = res.List_Mas_Master_Plan_Goal_Tactic || [];
      });

  }
  onChangeSubMasterPlan(id: number, isInitialLoad: boolean = false) {

    if (!this.isInitialLoad) {
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
    if (!this.isInitialLoad) {
      this.planLevel2.Target_Id = null;
      this.planLevel2.Indicator_Id = null;

      this.listLandmark_Gloals = [];
      this.listLandmark_Tactic = [];
    }


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
  onChangeLandmarkGloals(isInitialLoad: boolean = false) {
    const id = this.planLevel2.Landmark_Gloals_Id;
    if (!id) return;

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Landmark_Tactic_By_Mas_Landmark_Gloals_FK",
      FK_Landmark_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        this.listLandmark_Tactic = res.List_Mas_Landmark_Tactic || [];
      });
  }
  onChangeLandmarkTactic(isInitialLoad: boolean = false) {

  }
  onChangeTarget() {

    const id = this.planLevel2.Target_Id;
    if (!this.isInitialLoad) {
      this.planLevel2.Indicator_Id = null;
      this.listLandmark_Tactic = [];

    }

    if (!id) return;

    const model = {
      FUNC_CODE: "FUNC-GET_List_Mas_Indicator_By_FK",
      FK_Target_Id: id
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((res: any) => {
        // this.listLandmark_Tactic = res.List_Mas_Indicator || [];
      });
  }
  onChangeTargetY1(isInitialLoad: boolean = false) {

    const id = this.planLevel2.Target_Y1_Id;
    if (!this.isInitialLoad) {
      this.planLevel2.ValueChain_Main_Id = null;
      this.planLevel2.ValueChain_Factor_Main_Id = null;
      this.planLevel2.ValueChain_Support_Id = null;
      this.planLevel2.ValueChain_Factor_Support_Id = null;

      this.listValueChain = [];
      this.listValueChainFactorMain = [];
      this.listValueChainFactorSupport = [];
    }


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

  onChangeStrategyMain(isInitialLoad: boolean = false) {
    if (!this.isInitialLoad) {
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
    if (!this.isInitialLoad) {
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
    if (!this.isInitialLoad) {
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
    if (!this.isInitialLoad) {
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
    if (!this.isInitialLoad) {
      this.model.Project_Plan_Level3.Government_Policy_Id2 = null;
      this.listGovernment_Policy2 = [];
    }

    this.callAPI("FUNC-Get_List_Mas_Government_Policy_Sub_By_fk2", {
      Government_Policy_Id: this.model.Project_Plan_Level3.Government_Policy_Id2
    }).subscribe(res => {
      this.listGovernment_Policy_Sub2 = res.List_Mas_Government_Policy_Sub2 || [];
    });
  }
  onChangenTactic(isInitialLoad: boolean = false) {
    if (!this.isInitialLoad) {
      this.model.Project_Plan_Level3.Project_Plan_Id = null;
      this.listMasTactic = [];
      this.listMasIndicator = [];
    }
    this.callAPI("FUNC-GET_List_Mas_Project_Plan_Goals_By_FK", {
      FK_Project_Plan_Id: this.model.Project_Plan_Level3.Project_Plan_Id
    }).subscribe(res => {
      this.listMasProjectPlanGoal = res.List_Mas_Project_Plan_Goal || [];
      // this.listMasProjectPlanGoal = res.List_Mas_Indicator || [];
    });
  }
  onChangenTactic5() {
    if (!this.isInitialLoad) {
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
  onChangenMeasure(isInitialLoad: boolean = false) {
    if (!this.isInitialLoad) {
      this.model.Project_Plan_Level3.Project_Plan_Goals_Id = null;
      this.listMasMeasure = [];
    }
    this.callAPI("FUNC-GET_List_Mas_Measure_By_FK_Tactic", {
      Tactics_Id: this.model.Project_Plan_Level3.Project_Plan_Goals_Id
    }).subscribe(res => {
      this.listMasMeasure = res.List_Mas_Measure || [];
      this.listMasIndicator = res.List_Mas_Indicator || [];
    });
  }
  onChangeProjectPlan5(isInitialLoad: boolean = false) {
    const p = this.model.Project_Plan_Level3;
    if (!this.isInitialLoad) {
      p.Project_Plan_Goals_Id5 = null;
      p.Indicators_Id5 = null;
      p.Goals_Guidelines_Id5 = null;

      this.listProjectPlanGoal5 = [];
      this.listIndicator5 = [];
      this.listGuideline5 = [];

    }

    if (!p.Project_Plan_Id_5) return;

    this.callAPI("FUNC-GET_List_Mas_Project_Plan_Goals_5_By_FK", {
      FK_Project_Plan_Id: p.Project_Plan_Id_5
    }).subscribe(res => {
      this.listProjectPlanGoal5 = res.List_Mas_Project_Plan_Goal_5 || [];
    });
  }
  onChangeGoal5(isInitialLoad: boolean = false) {

    const p = this.model.Project_Plan_Level3;
    if (!this.isInitialLoad) {
      p.Plan5_Indicator_Id = null;
      p.Plan5_Guideline_Id = null;

      this.listIndicator5 = [];
      this.listGuideline5 = [];

    }

    if (!p.Project_Plan_Goals_Id_5) return;

    this.callAPI("FUNC-GET_List_Mas_Indicators_5_By_FK", {
      FK_Plan_Goals_Id: p.Project_Plan_Goals_Id_5
    }).subscribe(res => {
      this.listIndicator5 = res.List_Mas_Indicators_5 || [];
      this.listGuideline5 = res.List_Mas_Project_Plan_Goals_Guidelines_5 || [];

    });



  }
  isInitialLoad = false
  afterLoad() {
    this.isInitialLoad = true;
    const l2 = this.planLevel2;
    if (!l2 || Object.keys(l2).length === 0) return;

    if (this.planLevel1Main.Strategic_Id) {
      this.onChangeStrategic(this.planLevel1Main.Strategic_Id);
    }

    if (this.planLevel1Main.Issues_Id) {
      this.onChangeIssue(this.planLevel1Main.Issues_Id);
    }

    if (this.subStrategies && this.subStrategies.length > 0) {

      this.subStrategies.forEach((item: any) => {
        if (item.Strategic_Id) {
          this.onChangeStrategicSub(item);
        }
        if (item.Issues_Id) {
          this.onChangeIssueSub(item);
        }

      });
    }


    if (l2.Landmark_Id) {
      this.onChangeLandmark();
    }
    if (l2.Target_Id) this.onChangeTarget();



    if (l2.ValueChain_Main_Id) this.onChangeValueChainMain();
    if (l2.ValueChain_Support_Id) this.onChangeValueChainSupport();
    if (l2.Master_Plan_Id) {
      this.onChangeMasterPlan(l2.Master_Plan_Id);
    }

    if (l2.Plan_Goals_Id) {
      this.onChangeMasterPlanGoal(l2.Plan_Goals_Id);
    }

    if (l2.Subplan_Id) {
      this.onChangeSubMasterPlan(l2.Subplan_Id);
    }

    if (l2.Target_Y1_Id) {
      this.onChangeTargetY1();
    }
    if (l2.Landmark_Gloals_Id) {
      this.onChangeLandmarkGloals();
    }
    if (l2.Landmark_Tacticts_Id) this.onChangeLandmarkTactic();

    if (l2.Landmark_Guidelines_Id) { this.onChangeStrategyMain(); }
    if (l2.SDGs_Gloals_Id) this.onChangeSDGsGoal();
    const l3 = this.model.Project_Plan_Level3;

    if (l3?.Master_Plan_Id) {
      this.onChangeMasterPlan5(l3.Master_Plan_Id);
    }

    if (l3?.Plan_Goals_Id) {
      this.onChangeMasterPlanGoal5(l3.Plan_Goals_Id);
    }

    if (l3?.Sub_Master_Plan_Id) {
      this.onChangeSubMasterPlan5(l3.Sub_Master_Plan_Id);
    }

    if (l3?.Sub_Plan_Goals_Id) {
      this.onChangeTargetY15(l3.Sub_Plan_Goals_Id);
    }
    if (l3?.ValueChain_Main_Id) {
      this.onChangeValueChainMain5()
    }
    if (l3?.ValueChain_Support_Id) {
      this.onChangeValueChainSupport5()
    }
    if (l3?.Project_Plan_Id_5) {
      this.onChangeProjectPlan5()
    }
    if (l3?.Project_Plan_Goals_Id_5) {
      this.onChangeGoal5()
    }
    if (l3?.Project_Plan_Id) {
      this.onChangenTactic()
    }
    if (l3?.Project_Plan_Goals_Id) {
      this.onChangenMeasure()
    }
    this.isInitialLoad = false;
  }
  @Input() model: any;
  planLevel1Main: PlanLevel1Main = {
    Strategic_Id: null,
    Issues_Id: null,
    Issues_Sub_Id: null,
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
    Master_Plan_Id: null,
    Strategic_Id: null,
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
    SDGs_Target_Id: null,
    Plan_Tactics_Id: null,
    Landmark_Sub_Guidelines_Id: null,
    Plan_Goals_Id: null
  };
  valueChain!: any;
  sdgs!: any;

  addSubStrategy() {
    this.subStrategies.push({
      strategySide: '',
      strategyIssue: '',
      strategySubIssue: '',
      Target: '',
      alignmentDetail: ''
    });
  }

  removeSubStrategy(i: number, item: any) {
    if (!item.Project_Plan_Level1_Sub_Id) {
      this.subStrategies.splice(i, 1);
    }
    let model = {
      FUNC_CODE: "FUNC-Delete_Project_Plan_Level1_Sub",
      Project_Detail_Id: item.Project_Plan_Level1_Sub_Id
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.subStrategies.splice(i, 1);
    })

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

  removeCabinet(i: number, item: any) {
    if (!item.Project_Cabinet_Id) {
      this.model.Project_Cabinet.splice(i, 1);
      return
    }
    let model = {
      FUNC_CODE: "FUNC-Delete_Project_Cabinet",
      Project_Detail_Id: item.Project_Cabinet_Id
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      this.model.Project_Cabinet.splice(i, 1);
    })
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