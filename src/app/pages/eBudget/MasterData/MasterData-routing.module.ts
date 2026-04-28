import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MasBusinessLevelComponent } from './MasBusinessLevel/MasBusinessLevel.component';
import { MasProjectPlanComponent } from './MasProjectPlan/MasProjectPlan.component';

import { MasExpenseDetailComponent } from './MasExpenseDetail/MasExpenseDetail.component';



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
    path: 'MasExpenseDetail',
    component: MasExpenseDetailComponent
  },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
