import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-tab-general',

  templateUrl: './tab-general.component.html',
  styleUrl: './tab-general.component.scss'
})
export class TabGeneralComponent {
  project_planing: any
  @Input() model: any
}
