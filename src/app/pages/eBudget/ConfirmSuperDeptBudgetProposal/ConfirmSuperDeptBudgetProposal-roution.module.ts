import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmSuperDeptBudgetProposalComponent } from './ConfirmSuperDeptBudgetProposal/ConfirmSuperDeptBudgetProposal.component';

const routes: Routes = [
    {
        path: "",
        component: ConfirmSuperDeptBudgetProposalComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }