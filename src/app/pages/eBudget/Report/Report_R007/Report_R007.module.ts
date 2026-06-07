import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R007-routing.module';
import { Report_R007Component } from './Report_R007/Report_R007.component';

@NgModule({
  declarations: [Report_R007Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
