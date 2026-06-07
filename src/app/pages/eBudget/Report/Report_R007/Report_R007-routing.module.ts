import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R007Component } from './Report_R007/Report_R007.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R007Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }