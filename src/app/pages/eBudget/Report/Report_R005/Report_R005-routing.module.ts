import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R005Component } from './Report_R005/Report_R005.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R005Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }