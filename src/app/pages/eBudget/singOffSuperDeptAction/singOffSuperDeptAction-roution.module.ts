import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingOffSuperDeptActionComponent } from './singOffSuperDeptAction/singOffSuperDeptAction.component';

const routes: Routes = [
    {
        path: "",
        component: SingOffSuperDeptActionComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }