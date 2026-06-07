import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbToastModule, NgbProgressbarModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { CountUpModule } from 'ngx-countup';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgPipesModule } from 'ngx-pipes';
import { NgSelectModule } from '@ng-select/ng-select';
import { SlickCarouselModule } from 'ngx-slick-carousel'
import { LightboxModule } from 'ngx-lightbox';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { PagesRoutingModule } from "./MasterData-routing.module";
import { MasBusinessLevelComponent } from './MasBusinessLevel/MasBusinessLevel.component';
import { MasProjectPlanComponent } from './MasProjectPlan/MasProjectPlan.component';
import { MasExpenseDetailComponent } from './MasExpenseDetail/MasExpenseDetail.component';
import { MasProjectPlanNationalStrategyZComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanNationalStrategyZ/MasProjectPlanNationalStrategyZ.component';
import { MasProjectPlanMasterPlanYComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanMasterPlanY/MasProjectPlanMasterPlanY.component';
import { MasProjectPlanMinistryActionPlanComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanMinistryActionPlan/MasProjectPlanMinistryActionPlan.component';
import { NationalEconomicDevelopmentPlanComponent } from './MasProjectPlan/Sub_Pages/NationalEconomicDevelopmentPlan/NationalEconomicDevelopmentPlan.component';
import { NationalSocialDevelopmentPlanComponent } from './MasProjectPlan/Sub_Pages/NationalSocialDevelopmentPlan/NationalSocialDevelopmentPlan.component';
import { MasProjectPlanSDGsPlanComponent } from './MasProjectPlan/Sub_Pages/MasProjectPlanSDGsPlan/MasProjectPlanSDGsPlan.component';


@NgModule({
  declarations: [

    MasBusinessLevelComponent,
    MasProjectPlanComponent,
    MasExpenseDetailComponent,
    MasProjectPlanNationalStrategyZComponent,
    MasProjectPlanMasterPlanYComponent,
    NationalEconomicDevelopmentPlanComponent,
    NationalSocialDevelopmentPlanComponent,
    MasProjectPlanMinistryActionPlanComponent,
    MasProjectPlanSDGsPlanComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbToastModule,
    NgbPaginationModule,
    FlatpickrModule.forRoot(),
    CountUpModule,
    NgApexchartsModule,
    LeafletModule,
    NgbDropdownModule,
    SimplebarAngularModule,
    PagesRoutingModule,
    SlickCarouselModule,
    LightboxModule,
    NgPipesModule,
    NgSelectModule,

  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
