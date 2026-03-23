import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanManagementComponent } from './PlanManagement/PlanManagement.component';

const routes: Routes = [
    {
        path: "",
        component: PlanManagementComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }