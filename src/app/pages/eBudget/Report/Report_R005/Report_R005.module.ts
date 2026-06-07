import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R005-routing.module';
import { Report_R005Component } from './Report_R005/Report_R005.component';

@NgModule({
  declarations: [Report_R005Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
