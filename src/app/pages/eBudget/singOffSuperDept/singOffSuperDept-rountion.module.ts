import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignoffSuperDeptPlanningComponent } from './singOffSuperDeptPlanning/singOffSuperDeptPlanning.component';

const routes: Routes = [
    {
        path: "",
        component: SignoffSuperDeptPlanningComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }