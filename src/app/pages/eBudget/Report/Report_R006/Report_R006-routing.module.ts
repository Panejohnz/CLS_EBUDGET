import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R006Component } from './Report_R006/Report_R006.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R006Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }