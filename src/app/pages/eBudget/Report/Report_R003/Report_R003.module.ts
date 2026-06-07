import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R003-routing.module';
import { Report_R003Component } from './Report_R003/Report_R003.component';

@NgModule({
  declarations: [Report_R003Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
