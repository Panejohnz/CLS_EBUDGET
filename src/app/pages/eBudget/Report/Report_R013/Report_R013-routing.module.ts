import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R013Component } from './Report_R013/Report_R013.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R013Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }