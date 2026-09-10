import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProjectAllocationByDepartmentComponent } from './ProjectAllocationByDepartment.component';

@NgModule({
  declarations: [ProjectAllocationByDepartmentComponent],
  imports: [CommonModule, FormsModule],
  exports: [ProjectAllocationByDepartmentComponent]
})
export class ProjectAllocationByDepartmentModule { }
