import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingOffMinistryActionComponent } from './singOffMinistryAction/singOffMinistryAction.component';

const routes: Routes = [
    {
        path: "",
        component: SingOffMinistryActionComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }