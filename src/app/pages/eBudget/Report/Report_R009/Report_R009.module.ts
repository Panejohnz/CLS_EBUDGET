import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R009-routing.module';
import { Report_R009Component } from './Report_R009/Report_R009.component';

@NgModule({
  declarations: [Report_R009Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
