import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectTransferComponent } from './ProjectTransfer/ProjectTransfer.component';

const routes: Routes = [
    {
        path: "",
        component: ProjectTransferComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EbudgetMasterRoutingModule { }