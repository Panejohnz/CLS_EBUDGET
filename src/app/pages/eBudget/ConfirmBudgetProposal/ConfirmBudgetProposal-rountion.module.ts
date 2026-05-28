import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmBudgetProposalComponent } from './ConfirmBudgetProposal/ConfirmBudgetProposal.component';

const routes: Routes = [
    {
        path: "",
        component: ConfirmBudgetProposalComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }