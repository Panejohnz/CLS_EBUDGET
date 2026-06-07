import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R011Component } from './Report_R011/Report_R011.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R011Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }