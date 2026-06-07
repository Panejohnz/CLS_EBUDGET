import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R003Component } from './Report_R003/Report_R003.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R003Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }