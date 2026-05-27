import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmSuperDeptPlanningComponent } from './ConfirmSuperDeptPlanning/ConfirmSuperDeptPlanning.component';

const routes: Routes = [
    {
        path: "",
        component: ConfirmSuperDeptPlanningComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }