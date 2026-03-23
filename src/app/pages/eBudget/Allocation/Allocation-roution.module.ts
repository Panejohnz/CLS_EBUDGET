import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectAllocationComponent } from './ProjectAllocation/ProjectAllocation.component';

const routes: Routes = [
    {
        path: "",
        component: ProjectAllocationComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }