import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PlanManagementComponent } from './PlanManagement/PlanManagement.component';
import { ExamineComponent } from './examine/examine.component';

const routes: Routes = [
    {
        path: "",
        component: PlanManagementComponent
    },
    {
        path: "examine",
        component: ExamineComponent

    }

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }