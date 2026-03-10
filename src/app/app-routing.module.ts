import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './layouts/layout.component';

// Auth
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'auth', loadChildren: () => import('./account/account.module').then(m => m.AccountModule) },
  { path: 'pages', component: LayoutComponent, loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule), canActivate: [AuthGuard] },
  { path: 'landing', loadChildren: () => import('./landing/landing.module').then(m => m.LandingModule) },

  //e_buget
  { path: 'Planing', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/Planing/Planing.module').then(m => m.EmonitorMasterModule), },
  { path: 'singOff', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/singOff/singOffPlanning.module').then(m => m.EmonitorMasterModule), },
  { path: 'ProjectBudgetProposal', component: LayoutComponent, loadChildren: () => import('./pages/eBudget/BudgetProposal/BudgetProposal.module').then(m => m.EmonitorMasterModule), },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
