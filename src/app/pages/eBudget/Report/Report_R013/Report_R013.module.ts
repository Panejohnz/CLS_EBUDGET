import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R013-routing.module';
import { Report_R013Component } from './Report_R013/Report_R013.component';

@NgModule({
  declarations: [Report_R013Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
