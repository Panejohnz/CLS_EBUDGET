import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmPlanningComponent } from './ConfirmPlanning/ConfirmPlanning.component';

const routes: Routes = [
    {
        path: "",
        component: ConfirmPlanningComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }