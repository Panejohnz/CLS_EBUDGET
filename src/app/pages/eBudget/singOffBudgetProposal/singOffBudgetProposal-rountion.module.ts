import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingOffBudgetProposalComponent } from './singOffBudgetProposal/singOffBudgetProposal.component';

const routes: Routes = [
    {
        path: "",
        component: SingOffBudgetProposalComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }