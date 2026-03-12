import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectBudgetProposalComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposal.component';
import { ProjectBudgetProposalAddPersonnelComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/ProjectBudgetProposalAdd/ProjectBudgetProposalAddPersonnel.component';
import { ProjectBudgetProposalOperatingComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalOperating.component';

const routes: Routes = [
    {
        path: "",
        component: ProjectBudgetProposalComponent
    },
    {
        path: "Personnel",
        component: ProjectBudgetProposalComponent
    },
    {
        path: "Operating",
        component: ProjectBudgetProposalOperatingComponent
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }