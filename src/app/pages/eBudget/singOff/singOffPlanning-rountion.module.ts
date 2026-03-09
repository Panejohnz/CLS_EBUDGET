import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SingOffPlaningComponent } from './singOffPlaning/singOffPlaning.component';

const routes: Routes = [
    {
        path: "",
        component: SingOffPlaningComponent
    },


];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmonitorMasterRoutingModule { }