import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R002Component } from './Report_R002/Report_R002.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R002Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }