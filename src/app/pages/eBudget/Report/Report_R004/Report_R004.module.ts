import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R004-routing.module';
import { Report_R004Component } from './Report_R004/Report_R004.component';

@NgModule({
  declarations: [Report_R004Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
