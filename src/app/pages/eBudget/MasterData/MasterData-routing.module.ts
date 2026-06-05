import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasBusinessLevelComponent } from './MasBusinessLevel/MasBusinessLevel.component';
import { MasProjectPlanComponent } from './MasProjectPlan/MasProjectPlan.component';
import { MasProjectPlanMasterPlanYComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanMasterPlanY/MasProjectPlanMasterPlanY.component';
import { MasProjectPlanNationalStrategyZComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanNationalStrategyZ/MasProjectPlanNationalStrategyZ.component';


const routes: Routes = [


  {
    path: 'MasBusinessLevel',
    component: MasBusinessLevelComponent
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
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
