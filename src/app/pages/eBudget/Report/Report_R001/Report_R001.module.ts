import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R001-routing.module';
import { Report_R001Component } from './Report_R001/Report_R001.component';

@NgModule({
  declarations: [Report_R001Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
