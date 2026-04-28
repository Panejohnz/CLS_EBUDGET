import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbToastModule, NgbProgressbarModule } from '@ng-bootstrap/ng-bootstrap';

import { FlatpickrModule } from 'angularx-flatpickr';
import { CountUpModule } from 'ngx-countup';
import { NgApexchartsModule } from 'ng-apexcharts';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { SimplebarAngularModule } from 'simplebar-angular';
import { NgPipesModule } from 'ngx-pipes';
import { SlickCarouselModule } from 'ngx-slick-carousel'
import { LightboxModule } from 'ngx-lightbox';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { PagesRoutingModule } from "./MasterData-routing.module";
import { MasBusinessLevelComponent } from './MasBusinessLevel/MasBusinessLevel.component';
import { MasProjectPlanComponent } from './MasProjectPlan/MasProjectPlan.component';
import { MasExpenseDetailComponent } from './MasExpenseDetail/MasExpenseDetail.component';


@NgModule({
  declarations: [

    MasBusinessLevelComponent,
    MasProjectPlanComponent,
    MasExpenseDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgbToastModule,
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
    
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PagesModule {
  constructor() {
    defineElement(lottie.loadAnimation);
  }
}
