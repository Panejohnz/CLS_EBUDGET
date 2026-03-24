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
import { EmonitorMasterRoutingModule } from './PlanManagement-roution.module';
import { PlanManagementComponent } from './PlanManagement/PlanManagement.component';
import { AddPlanManagementComponent } from './PlanManagement/AddPlanManagement/AddPlanManagement.component';
import { ExamineComponent } from './examine/examine.component';
import { ExpenseListSalaryComponent } from './PlanManagement/AddPlanManagement/expenseListSalary/expenseListSalary.component';
import { ExpenseRentHouseComponent } from './PlanManagement/AddPlanManagement/expenseRentHouse/expenseRentHouse.component';
import { ExpenseOTComponent } from './PlanManagement/AddPlanManagement/expenseOT/expenseOT.component';
import { ExpenseMeetingSupportComponent } from './PlanManagement/AddPlanManagement/expenseMeetingSupport/expenseMeetingSupport.component';
import { ExpenseMeetingLitigationComponent } from './PlanManagement/AddPlanManagement/expenseMeetingLitigation/expenseMeetingLitigation.component';
import { ExpenseCommitteeComponent } from './PlanManagement/AddPlanManagement/expenseCommittee/expenseCommittee.component';
import { ExpenseCarAllowanceComponent } from './PlanManagement/AddPlanManagement/expenseCarAllowance/expenseCarAllowance.component';
import { ExpenseTravelComponent } from './PlanManagement/AddPlanManagement/expenseTravel/expenseTravel.component';
import { ExpenseTrainingSeminarComponent } from './PlanManagement/AddPlanManagement/expenseTrainingSeminar/expenseTrainingSeminar.component';
import { ExpenseOfficeRentComponent } from './PlanManagement/AddPlanManagement/expenseOfficeRent/expenseOfficeRent.component';
import { ExpenseCopierRentComponent } from './PlanManagement/AddPlanManagement/expenseCopierRent/expenseCopierRent.component';
import { ExpenseServiceContractComponent } from './PlanManagement/AddPlanManagement/expenseServiceContract/expenseServiceContract.component';
import { ExpenseOtherComponent } from './PlanManagement/AddPlanManagement/expenseOther/expenseOther.component';
import { ExpenseVehicleRepairComponent } from './PlanManagement/AddPlanManagement/expenseVehicleRepair/expenseVehicleRepair.component';
import { ExpenseRepairConstructionComponent } from './PlanManagement/AddPlanManagement/expenseRepairConstruction/expenseRepairConstruction.component';
import { ExpenseEquipmentRepairComponent } from './PlanManagement/AddPlanManagement/expenseEquipmentRepair/expenseEquipmentRepair.component';
import { ExpenseAdvertisingComponent } from './PlanManagement/AddPlanManagement/expenseAdvertising/expenseAdvertising.component';
import { ExpenseCeremonialComponent } from './PlanManagement/AddPlanManagement/expenseCeremonial/expenseCeremonial.component';
import { ExpenseWitnessComponent } from './PlanManagement/AddPlanManagement/expenseWitness/expenseWitness.component';
import { ExpenseSection61Component } from './PlanManagement/AddPlanManagement/expenseSection61/expenseSection61.component';
import { ExpenseOtherOperatingCostComponent } from './PlanManagement/AddPlanManagement/expenseOtherOperatingCost/expenseOtherOperatingCost.component';
import { ExpenseOfficeSuppliesCostComponent } from './PlanManagement/AddPlanManagement/expenseOfficeSuppliesCost/expenseOfficeSuppliesCost.component';
import { ExpenseFuelAndLubricantCostComponent } from './PlanManagement/AddPlanManagement/expenseFuelAndLubricantCost/expenseFuelAndLubricantCost.component';
import { ExpenseConstructionMaterialCostComponent } from './PlanManagement/AddPlanManagement/expenseConstructionMaterialCost/expenseConstructionMaterialCost.component';
import { ExpenseComputerMaterialCostComponent } from './PlanManagement/AddPlanManagement/expenseComputerMaterialCost/expenseComputerMaterialCost.component';
import { ExpenseUtilityAndTelecomCostComponent } from './PlanManagement/AddPlanManagement/expenseUtilityAndTelecomCost/expenseUtilityAndTelecomCost.component';
import { ExpenseSystemMaintenanceCostComponent } from './PlanManagement/AddPlanManagement/expenseSystemMaintenanceCost/expenseSystemMaintenanceCost.component';
import { ExpenseCarRentalCostComponent } from './PlanManagement/AddPlanManagement/expenseCarRentalCost/expenseCarRentalCost.component';
import { ExpenseAssetInvestmentFormComponent } from './PlanManagement/AddPlanManagement/expenseAssetInvestmentForm/expenseAssetInvestmentForm.component';
import { ExpenseConstructionFormComponent } from './PlanManagement/AddPlanManagement/expenseConstructionForm/expenseConstructionForm.component';
import { ExpenseForeignTravelComponent } from './PlanManagement/AddPlanManagement/expenseForeignTravel/expenseForeignTravel.component';
import { ExpenseWitnessProtectionComponent } from './PlanManagement/AddPlanManagement/expenseWitnessProtection/expenseWitnessProtection.component';
import { ExpenseConsultantHireComponent } from './PlanManagement/AddPlanManagement/expenseConsultantHire/expenseConsultantHire.component';
import { ExpenseGrantFormComponent } from './PlanManagement/AddPlanManagement/expenseGrantForm/expenseGrantForm.component';
import { ExpenseFuelLubricantComponent } from './PlanManagement/AddPlanManagement/expenseFuelLubricant/expenseFuelLubricant.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
    url: 'https://httpbin.org/post',
    maxFilesize: 50,
    acceptedFiles: 'image/*'
};

@NgModule({
    declarations: [
        PlanManagementComponent,
        AddPlanManagementComponent,
        ExamineComponent,
        ExpenseListSalaryComponent,
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
        ExpenseAssetInvestmentFormComponent,
        ExpenseConstructionFormComponent,
        ExpenseForeignTravelComponent,
        ExpenseWitnessProtectionComponent,
        ExpenseConsultantHireComponent,
        ExpenseGrantFormComponent,
        ExpenseFuelLubricantComponent
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