import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'MasProjectPlanNationalStrategyZ',
  templateUrl: './MasProjectPlanNationalStrategyZ.component.html',
  styles: ``
})
export class MasProjectPlanNationalStrategyZComponent {
  constructor(private router: Router) { }

  goBackToPlan() {
    this.router.navigateByUrl('/MasterData/MasProjectPlan');
  }
}
