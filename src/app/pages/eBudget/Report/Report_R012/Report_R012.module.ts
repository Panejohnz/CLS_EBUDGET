import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R012-routing.module';
import { Report_R012Component } from './Report_R012/Report_R012.component';

@NgModule({
  declarations: [Report_R012Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
