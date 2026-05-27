import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignoffMinistryPlanningComponent } from './singOffMinistryPlanning/singOffMinistryPlanning.component';

const routes: Routes = [
    {
        path: "",
        component: SignoffMinistryPlanningComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }