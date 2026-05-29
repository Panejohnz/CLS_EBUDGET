import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfirmActionComponent } from './ConfirmAction/ConfirmAction.component';

const routes: Routes = [
    {
        path: "",
        component: ConfirmActionComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }