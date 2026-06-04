import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';

// Auth
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  // { path: '', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  // { path: 'pages', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  { path: 'landing', loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule) },

  //e_buget
  { path: 'Planing', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Planing/Planing.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOff', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOff/singOffPlanning.module').then(m => m.EmonitorMasterModule), },
  { path: 'ConfirmBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmBudgetProposal/ConfirmBudgetProposal.module').then(m => m.EmonitorMasterModule), },
  { path: 'ConfirmSuperDeptBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmSuperDeptBudgetProposal/ConfirmSuperDeptBudgetProposal.module').then(m => m.EmonitorMasterModule), },
  { path: 'Confirm', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Confirm/ConfirmPlanning.module').then(m => m.EmonitorMasterModule), },
  { path: 'ConfirmSuperDept', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmSuperDept/ConfirmSuperDept.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffSuperDept', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffSuperDept/singOffSuperDept.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffMinistry', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffMinistry/singOffMinistry.module').then(m => m.EmonitorMasterModule), },
  { path: 'ProjectBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/BudgetProposal/BudgetProposal.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffBudgetProposal/singOffBudgetProposal.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffSuperDeptBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffSuperDeptBudgetProposal/singOffSuperDeptBudgetProposal.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffMinistryBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffMinistryBudgetProposal/singOffMinistryBudgetProposal.module').then(m => m.EmonitorMasterModule), },
  { path: 'Allocation', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Allocation/Allocation.module').then(m => m.EmonitorMasterModule), },
  { path: 'PlanManagement', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/PlanManagement/PlanManagement.module').then(m => m.EmonitorMasterModule), },
  { path: 'Transfer', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Transfer/Transfer.module').then(m => m.EmonitorMasterModule), },
  { path: 'Dashboard', component: LayoutComponent, loadChildren: () => import('./pages/dashboards/dashboards.module').then(m => m.DashboardsModule), },
  { path: 'Moniter', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Moniter/Moniter.module').then(m => m.EmonitorMasterModule), },

  { path: 'MasterData', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/MasterData/MasterData.module').then(m => m.PagesModule), },
  { path: 'ConfirmAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmAction/ConfirmAction.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffAction/singOffAction.module').then(m => m.EmonitorMasterModule), },
  { path: 'ConfirmSuperDeptAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmSuperDeptAction/ConfirmSuperDeptAction.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffSuperDeptAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffSuperDeptAction/singOffSuperDeptAction.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOffMinistryAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffMinistryAction/singOffMinistryAction.module').then(m => m.EmonitorMasterModule), },

  { path: 'Report_R001', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R001/Report_R001.module').then(m => m.EmonitorMasterModule), },
  { path: 'Report_R002', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R002/Report_R002.module').then(m => m.EmonitorMasterModule), },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
