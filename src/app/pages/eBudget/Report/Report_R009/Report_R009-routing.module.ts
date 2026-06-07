import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R009Component } from './Report_R009/Report_R009.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R009Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }