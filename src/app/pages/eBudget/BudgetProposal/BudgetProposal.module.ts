import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
import { EmonitorMasterRoutingModule } from './BudgetProposal-rountion.module';
import { ProjectBudgetProposalComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposal.component';
import { ProjectBudgetProposalAddPersonnelComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/ProjectBudgetProposalAdd/ProjectBudgetProposalAddPersonnel.component';
import { ExpenseListSalaryComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseListSalary/expenseListSalary.component';
import { ProjectBudgetProposalOperatingComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalOperating.component';
import { ProjectBudgetProposalAddOperatingComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/ProjectBudgetProposalAddOperating/ProjectBudgetProposalOperating.component';
import { ExpenseListSalaryOperatingComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseListSalary/expenseListSalaryOperating.component';
import { ExpenseRentHouseComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseRentHouse/expenseRentHouse.component';
import { ExpenseOTComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseOT/expenseOT.component';
import { ExpenseMeetingSupportComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseMeetingSupport/expenseMeetingSupport.component';
import { ExpenseMeetingLitigationComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseMeetingLitigation/expenseMeetingLitigation.component';
import { ExpenseCommitteeComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseCommittee/expenseCommittee.component';
import { ExpenseCarAllowanceComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseCarAllowance/expenseCarAllowance.component';
import { ExpenseTravelComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseTravel/expenseTravel.component';
import { ExpenseTrainingSeminarComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseTrainingSeminar/expenseTrainingSeminar.component';
import { ExpenseOfficeRentComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseOfficeRent/expenseOfficeRent.component';
import { ExpenseCopierRentComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseCopierRent/expenseCopierRent.component';
import { ExpenseServiceContractComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseServiceContract/expenseServiceContract.component';
import { ExpenseOtherComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseOther/expenseOther.component';
import { ExpenseVehicleRepairComponent } from './ProjectBudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/expenseVehicleRepair/expenseVehicleRepair.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
    url: 'https://httpbin.org/post',
    maxFilesize: 50,
    acceptedFiles: 'image/*'
};

@NgModule({
    declarations: [
        ProjectBudgetProposalComponent,
        ProjectBudgetProposalAddPersonnelComponent,
        ExpenseListSalaryComponent,
        ProjectBudgetProposalOperatingComponent,
        ProjectBudgetProposalAddOperatingComponent,
        ExpenseListSalaryOperatingComponent,
        ExpenseRentHouseComponent,
        ExpenseOTComponent,
        ExpenseMeetingSupportComponent,
        ExpenseMeetingLitigationComponent,
        ExpenseCommitteeComponent,
        ExpenseCarAllowanceComponent,
        ExpenseTravelComponent,
        ExpenseTrainingSeminarComponent,
        ExpenseOfficeRentComponent,
        ExpenseCopierRentComponent,
        ExpenseServiceContractComponent,
        ExpenseOtherComponent,
        ExpenseVehicleRepairComponent
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
        DecimalPipe
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class EmonitorMasterModule {
    constructor() {
        defineElement(lottie.loadAnimation);
    }
}