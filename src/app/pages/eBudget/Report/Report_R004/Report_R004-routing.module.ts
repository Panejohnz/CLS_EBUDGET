import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R004Component } from './Report_R004/Report_R004.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R004Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }