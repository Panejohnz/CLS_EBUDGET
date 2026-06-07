import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R008-routing.module';
import { Report_R008Component } from './Report_R008/Report_R008.component';

@NgModule({
  declarations: [Report_R008Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
