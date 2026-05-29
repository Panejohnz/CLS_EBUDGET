import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingOffActionComponent } from './singOffAction/singOffAcion.component';

const routes: Routes = [
    {
        path: "",
        component: SingOffActionComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }