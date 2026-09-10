import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectAllocationComponent } from './ProjectAllocation/ProjectAllocation.component';
import { ProjectAllocationByDepartmentComponent } from './ProjectAllocationByDepartment/ProjectAllocationByDepartment.component';

const routes: Routes = [
    {
        path: "",
        component: ProjectAllocationByDepartmentComponent
    },
    {
        path: "old",
        component: ProjectAllocationComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }
