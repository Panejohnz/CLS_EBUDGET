import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAccordionModule, NgbDropdownModule, NgbNavModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { UiSwitchModule } from 'ngx-ui-switch';
import { FlatpickrModule } from 'angularx-flatpickr';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask, IConfig } from 'ngx-mask';
import { NgxSliderModule } from 'ngx-slider-v2';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { NgStepperModule } from 'angular-ng-stepper';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { DropzoneModule } from 'ngx-dropzone-wrapper';
import { DROPZONE_CONFIG } from 'ngx-dropzone-wrapper';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { defineElement } from '@lordicon/element';
import lottie from 'lottie-web';
import { SharedModule } from '../../../shared/shared.module';
import { ProjectPlanningComponent } from './projectPlanning/projectPlanning.component';
import { EmonitorMasterRoutingModule } from './Planing-roution.module';
import { TabGeneralComponent } from './projectPlanning/components/tab-general/tab-general.component';
import { TabAlignmentComponent } from './projectPlanning/components/tab-alignment/tab-alignment.component';
import { TabDetailComponent } from './projectPlanning/components/tab-detail/tab-detail.component';
import { TabGuidelineComponent } from './projectPlanning/components/tab-guideline/tab-guideline.component';
import { TrainingSeminarComponent } from './projectPlanning/components/tab-guideline/training-seminar/training-seminar.component';
import { PublicRelationsComponent } from './projectPlanning/components/tab-guideline/public-relations/public-relations.component';
import { InvestmentBudgetComponent } from './projectPlanning/components/tab-guideline/investment-budget/investment-budget.component';
import { ConsultantHireComponent } from './projectPlanning/components/tab-guideline/consultant-hire/consultant-hire.component';
import { OtherExpenseProjectComponent } from './projectPlanning/components/tab-guideline/other-expense-project/other-expense-project.component';
import { TabCoordinatorComponent } from './projectPlanning/components/tab-coordinator/tab-coordinator.component';
const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
    url: 'https://httpbin.org/post',
    maxFilesize: 50,
    acceptedFiles: 'image/*'
};

@NgModule({
    declarations: [
        ProjectPlanningComponent,
        TabGeneralComponent,
        TabAlignmentComponent,
        TabDetailComponent,
        TabGuidelineComponent,
        TrainingSeminarComponent,
        PublicRelationsComponent,
        InvestmentBudgetComponent,
        ConsultantHireComponent,
        OtherExpenseProjectComponent,
        TabCoordinatorComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        NgbPaginationModule,
        ReactiveFormsModule,
        NgbDropdownModule,
        NgbNavModule,
        NgSelectModule,
        UiSwitchModule,
        FlatpickrModule,
        ColorPickerModule,
        NgxMaskDirective,
        NgxMaskPipe,
        NgxSliderModule,
        CdkStepperModule,
        NgStepperModule,
        CKEditorModule,
        DropzoneModule,
        AutocompleteLibModule,
        NgbAccordionModule,
        SharedModule,
        EmonitorMasterRoutingModule
    ],
    providers: [
        provideNgxMask(),
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmonitorMasterModule {
    constructor() {
        defineElement(lottie.loadAnimation);
    }
}