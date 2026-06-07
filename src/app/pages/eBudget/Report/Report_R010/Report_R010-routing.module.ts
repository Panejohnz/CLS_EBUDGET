import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { Report_R010Component } from './Report_R010/Report_R010.component';

const routes: Routes = [
    {
        path: "",
        component: Report_R010Component
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }