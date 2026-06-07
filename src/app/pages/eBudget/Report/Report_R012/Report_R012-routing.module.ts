import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R012Component } from './Report_R012/Report_R012.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R012Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }