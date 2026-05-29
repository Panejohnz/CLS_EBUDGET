import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmSuperDeptActionComponent } from './ConfirmSuperDeptAction/ConfirmSuperDeptAction.component';

const routes: Routes = [
    {
        path: "",
        component: ConfirmSuperDeptActionComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }