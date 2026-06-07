import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R010-routing.module';
import { Report_R010Component } from './Report_R010/Report_R010.component';

@NgModule({
  declarations: [Report_R010Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
