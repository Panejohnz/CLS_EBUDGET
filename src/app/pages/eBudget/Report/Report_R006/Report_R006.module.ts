import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmonitorMasterRoutingModule } from './Report_R006-routing.module';
import { Report_R006Component } from './Report_R006/Report_R006.component';

@NgModule({
  declarations: [Report_R006Component],
  imports: [CommonModule, EmonitorMasterRoutingModule],
})
export class EmonitorMasterModule {}
