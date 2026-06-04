import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R001Component } from './Report_R001/Report_R001.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R001Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }