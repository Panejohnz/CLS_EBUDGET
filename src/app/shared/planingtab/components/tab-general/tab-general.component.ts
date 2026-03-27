import { Component, Input } from '@angular/core';
export interface ProjectPlan {
  projectType: string;
}
@Component({
  selector: 'app-tab-general',

  templateUrl: './tab-general.component.html',
  styleUrl: './tab-general.component.scss'
})
export class TabGeneralComponent {
  @Input() project_planing: any
  @Input() model: any
  projectType: any = ''
  projectNature: string = '';
  totalYears: number | null = null;
  currentYear: number | null = null;
  ngOnInit(): void {
    console.log('00', this.model);

  }
  Onchange_type() {
    this.model.projectType = this.projectType
  }
}
