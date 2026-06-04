import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R002-routing.module';
import { Report_R002Component } from './Report_R002/Report_R002.component';

@NgModule({
    declarations: [Report_R002Component],
    imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule { }
