import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R008Component } from './Report_R008/Report_R008.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R008Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }