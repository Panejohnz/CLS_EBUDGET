import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'MasProjectPlanMasterPlanY',
  templateUrl: './MasProjectPlanMasterPlanY.component.html',
  styles: ``
})
export class MasProjectPlanMasterPlanYComponent {
  constructor(private router: Router) { }

  goBackToPlan() {
    this.router.navigateByUrl('/MasterData/MasProjectPlan');
  }
}
