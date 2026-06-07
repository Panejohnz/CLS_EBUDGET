import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R011-routing.module';
import { Report_R011Component } from './Report_R011/Report_R011.component';

@NgModule({
  declarations: [Report_R011Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
