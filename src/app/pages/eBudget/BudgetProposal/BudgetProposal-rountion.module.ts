import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectBudgetProposalComponent } from './ProjectBudgetProposal/ProjectBudgetProposal.component';

const routes: Routes = [
    {
        path: "",
        component: ProjectBudgetProposalComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }