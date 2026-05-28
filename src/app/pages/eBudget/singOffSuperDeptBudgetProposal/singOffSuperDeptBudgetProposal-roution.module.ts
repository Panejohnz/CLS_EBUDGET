import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignoffSuperDeptBudgetProposalComponent } from './singOffSuperDeptBudgetProposal/singOffSuperDeptBudgetProposal.component';

const routes: Routes = [
    {
        path: "",
        component: SignoffSuperDeptBudgetProposalComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }