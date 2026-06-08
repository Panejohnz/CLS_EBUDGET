import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasBusinessLevelComponent } from './MasBusinessLevel/MasBusinessLevel.component';
import { MasExpenseDetailComponent } from './MasExpenseDetail/MasExpenseDetail.component';
import { MasProjectPlanComponent } from './MasProjectPlan/MasProjectPlan.component';
import { MasProjectPlanMasterPlanYComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanMasterPlanY/MasProjectPlanMasterPlanY.component';
import { MasProjectPlanMinistryActionPlanComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanMinistryActionPlan/MasProjectPlanMinistryActionPlan.component';
import { NationalEconomicDevelopmentPlanComponent } from './MasProjectPlan/Sub_Pages/NationalEconomicDevelopmentPlan/NationalEconomicDevelopmentPlan.component';
import { NationalSocialDevelopmentPlanComponent } from './MasProjectPlan/Sub_Pages/NationalSocialDevelopmentPlan/NationalSocialDevelopmentPlan.component';
import { MasProjectPlanNationalStrategyZComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanNationalStrategyZ/MasProjectPlanNationalStrategyZ.component';
import { MasProjectPlanSDGsPlanComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanSDGsPlan/MasProjectPlanSDGsPlan.component';


const routes: Routes = [


  {
    path: 'MasBusinessLevel',
    component: MasBusinessLevelComponent
  },
  {
    path: 'MasExpenseDetail',
    component: MasExpenseDetailComponent
  },
  {
    path: 'MasProjectPlan',
    component: MasProjectPlanComponent
  },
  {
    path: 'MasProjectPlan/NationalStrategyZ',
    component: MasProjectPlanNationalStrategyZComponent
  },
  {
    path: 'MasProjectPlan/MasterPlanY',
    component: MasProjectPlanMasterPlanYComponent
  },
  {
    path: 'MasProjectPlan/NationalSocialDevelopmentPlan',
    component: NationalSocialDevelopmentPlanComponent
  },
  {
    path: 'MasProjectPlan/NationalEconomicDevelopmentPlan',
    component: NationalEconomicDevelopmentPlanComponent
  },
  {
    path: 'MasProjectPlan/MinistryActionPlan',
    component: MasProjectPlanMinistryActionPlanComponent
  },
  {
    path: 'MasProjectPlan/SDGsPlan',
    component: MasProjectPlanSDGsPlanComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
