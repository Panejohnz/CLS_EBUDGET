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
import { ExpenseRentHouseComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseRentHouse/expenseRentHouse.component';
import { ExpenseOTComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseOT/expenseOT.component';
import { ExpenseMeetingSupportComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseMeetingSupport/expenseMeetingSupport.component';
import { ExpenseMeetingLitigationComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseMeetingLitigation/expenseMeetingLitigation.component';
import { ExpenseCommitteeComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseCommittee/expenseCommittee.component';
import { ExpenseCarAllowanceComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseCarAllowance/expenseCarAllowance.component';
import { ExpenseTravelComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseTravel/expenseTravel.component';
import { ExpenseTrainingSeminarComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseTrainingSeminar/expenseTrainingSeminar.component';
import { ExpenseOfficeRentComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseOfficeRent/expenseOfficeRent.component';
import { ExpenseCopierRentComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseCopierRent/expenseCopierRent.component';
import { ExpenseServiceContractComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseServiceContract/expenseServiceContract.component';
import { ExpenseOtherComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseOther/expenseOther.component';
import { ExpenseVehicleRepairComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseVehicleRepair/expenseVehicleRepair.component';
import { ExpenseRepairConstructionComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseRepairConstruction/expenseRepairConstruction.component';
import { ExpenseEquipmentRepairComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseEquipmentRepair/expenseEquipmentRepair.component';
import { ExpenseAdvertisingComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseAdvertising/expenseAdvertising.component';
import { ExpenseCeremonialComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseCeremonial/expenseCeremonial.component';
import { ExpenseWitnessComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseWitness/expenseWitness.component';
import { ExpenseSection61Component } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseSection61/expenseSection61.component';
import { ExpenseOtherOperatingCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseOtherOperatingCost/expenseOtherOperatingCost.component';
import { ExpenseOfficeSuppliesCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseOfficeSuppliesCost/expenseOfficeSuppliesCost.component';
import { ExpenseFuelAndLubricantCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseFuelAndLubricantCost/expenseFuelAndLubricantCost.component';
import { ExpenseConstructionMaterialCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseConstructionMaterialCost/expenseConstructionMaterialCost.component';
import { ExpenseComputerMaterialCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseComputerMaterialCost/expenseComputerMaterialCost.component';
import { ExpenseUtilityAndTelecomCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseUtilityAndTelecomCost/expenseUtilityAndTelecomCost.component';
import { ExpenseSystemMaintenanceCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseSystemMaintenanceCost/expenseSystemMaintenanceCost.component';
import { ExpenseCarRentalCostComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseCarRentalCost/expenseCarRentalCost.component';
import { ExpenseAssetInvestmentFormComponent } from './ProjectBudgetProposalPersonnel/ProjectBudgetProposalAdd/expenseAssetInvestmentForm/expenseAssetInvestmentForm.component';

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
        ExpenseVehicleRepairComponent,
        ExpenseRepairConstructionComponent,
        ExpenseEquipmentRepairComponent,
        ExpenseAdvertisingComponent,
        ExpenseCeremonialComponent,
        ExpenseWitnessComponent,
        ExpenseSection61Component,
        ExpenseOtherOperatingCostComponent,
        ExpenseOfficeSuppliesCostComponent,
        ExpenseFuelAndLubricantCostComponent,
        ExpenseConstructionMaterialCostComponent,
        ExpenseComputerMaterialCostComponent,
        ExpenseUtilityAndTelecomCostComponent,
        ExpenseSystemMaintenanceCostComponent,
        ExpenseCarRentalCostComponent,
        ExpenseAssetInvestmentFormComponent
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