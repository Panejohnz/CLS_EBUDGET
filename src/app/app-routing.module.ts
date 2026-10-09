import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';

// Auth
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  // { path: '', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: '', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  // { path: 'pages', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  { path: 'landing', loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule) },

  //e_buget
  { path: 'Planing', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Planing/Planing.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOff', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOff/singOffPlanning.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'ConfirmBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmBudgetProposal/ConfirmBudgetProposal.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'ConfirmSuperDeptBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmSuperDeptBudgetProposal/ConfirmSuperDeptBudgetProposal.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Confirm', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Confirm/ConfirmPlanning.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'ConfirmSuperDept', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmSuperDept/ConfirmSuperDept.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffSuperDept', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffSuperDept/singOffSuperDept.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffMinistry', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffMinistry/singOffMinistry.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'ProjectBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/BudgetProposal/BudgetProposal.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffBudgetProposal/singOffBudgetProposal.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffSuperDeptBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffSuperDeptBudgetProposal/singOffSuperDeptBudgetProposal.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffMinistryBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffMinistryBudgetProposal/singOffMinistryBudgetProposal.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Allocation', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Allocation/Allocation.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'PlanManagement', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/PlanManagement/PlanManagement.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Transfer', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Transfer/Transfer.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Dashboard', component: LayoutComponent, loadChildren: () => import('./pages/dashboards/dashboards.module').then(m => m.DashboardsModule), canActivate: [AuthGuard] },
  { path: 'Moniter', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Moniter/Moniter.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },

  { path: 'MasterData', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/MasterData/MasterData.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  { path: 'ConfirmAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmAction/ConfirmAction.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffAction/singOffAction.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'ConfirmSuperDeptAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/ConfirmSuperDeptAction/ConfirmSuperDeptAction.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffSuperDeptAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffSuperDeptAction/singOffSuperDeptAction.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'singOffMinistryAction', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOffMinistryAction/singOffMinistryAction.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },

  { path: 'Report_R001', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R001/Report_R001.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R002', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R002/Report_R002.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R003', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R003/Report_R003.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R004', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R004/Report_R004.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R005', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R005/Report_R005.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R006', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R006/Report_R006.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R007', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R007/Report_R007.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R008', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R008/Report_R008.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R009', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R009/Report_R009.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R010', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R010/Report_R010.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R011', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R011/Report_R011.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R012', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R012/Report_R012.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
  { path: 'Report_R013', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Report/Report_R013/Report_R013.module').then(m => m.EmonitorMasterModule), canActivate: [AuthGuard] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
