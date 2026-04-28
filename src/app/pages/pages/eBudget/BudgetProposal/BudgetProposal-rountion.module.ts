import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectBudgetProposalComponent } from './BudgetProposalPersonnel/BudgetProposal.component';
import { ProjectBudgetProposalAddPersonnelComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/BudgetProposalAddPersonnel.component';
import { ProjectBudgetProposalOperatingComponent } from './BudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalOperating.component'

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