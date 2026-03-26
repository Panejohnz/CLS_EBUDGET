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
import { ProjectBudgetProposalComponent } from './BudgetProposalPersonnel/BudgetProposal.component';
import { ProjectBudgetProposalAddPersonnelComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/BudgetProposalAdd/BudgetProposalAddPersonnel.component';
import { ProjectBudgetProposalOperatingComponent } from './BudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalOperating.component';
import { ProjectBudgetProposalAddOperatingComponent } from './BudgetProposalOperating/ProjectBudgetProposalOperating/ProjectBudgetProposalAddOperating/ProjectBudgetProposalAddOperating/ProjectBudgetProposalOperating.component';
import { ExpenseListSalaryComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseListSalary/expenseListSalary.component';
import { ExpenseRentHouseComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseRentHouse/expenseRentHouse.component';
import { ExpenseOTComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseOT/expenseOT.component';
import { ExpenseMeetingSupportComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseMeetingSupport/expenseMeetingSupport.component';
import { ExpenseMeetingLitigationComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseMeetingLitigation/expenseMeetingLitigation.component';
import { ExpenseCommitteeComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseCommittee/expenseCommittee.component';
import { ExpenseCarAllowanceComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseCarAllowance/expenseCarAllowance.component';
import { ExpenseTravelComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseTravel/expenseTravel.component';
import { ExpenseTrainingSeminarComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseTrainingSeminar/expenseTrainingSeminar.component';
import { ExpenseOfficeRentComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseOfficeRent/expenseOfficeRent.component';
import { ExpenseCopierRentComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseCopierRent/expenseCopierRent.component';
import { ExpenseServiceContractComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseServiceContract/expenseServiceContract.component';
import { ExpenseOtherComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseOther/expenseOther.component';
import { ExpenseVehicleRepairComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseVehicleRepair/expenseVehicleRepair.component';
import { ExpenseRepairConstructionComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseRepairConstruction/expenseRepairConstruction.component';
import { ExpenseEquipmentRepairComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseEquipmentRepair/expenseEquipmentRepair.component';
import { ExpenseAdvertisingComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseAdvertising/expenseAdvertising.component';
import { ExpenseCeremonialComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseCeremonial/expenseCeremonial.component';
import { ExpenseWitnessComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseWitness/expenseWitness.component';
import { ExpenseSection61Component } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseSection61/expenseSection61.component';
import { ExpenseOtherOperatingCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseOtherOperatingCost/expenseOtherOperatingCost.component';
import { ExpenseOfficeSuppliesCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseOfficeSuppliesCost/expenseOfficeSuppliesCost.component';
import { ExpenseFuelAndLubricantCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseFuelAndLubricantCost/expenseFuelAndLubricantCost.component';
import { ExpenseConstructionMaterialCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseConstructionMaterialCost/expenseConstructionMaterialCost.component';
import { ExpenseComputerMaterialCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseComputerMaterialCost/expenseComputerMaterialCost.component';
import { ExpenseUtilityAndTelecomCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseUtilityAndTelecomCost/expenseUtilityAndTelecomCost.component';
import { ExpenseSystemMaintenanceCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseSystemMaintenanceCost/expenseSystemMaintenanceCost.component';
import { ExpenseCarRentalCostComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseCarRentalCost/expenseCarRentalCost.component';
import { ExpenseAssetInvestmentFormComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseAssetInvestmentForm/expenseAssetInvestmentForm.component';
import { ExpenseConstructionFormComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseConstructionForm/expenseConstructionForm.component';
import { ExpenseForeignTravelComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseForeignTravel/expenseForeignTravel.component';
import { ExpenseWitnessProtectionComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseWitnessProtection/expenseWitnessProtection.component';
import { ExpenseConsultantHireComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseConsultantHire/expenseConsultantHire.component';
import { ExpenseGrantFormComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseGrantForm/expenseGrantForm.component';
import { ExpenseFuelLubricantComponent } from './BudgetProposalPersonnel/BudgetProposalAdd/expenseFuelLubricant/expenseFuelLubricant.component';
import { ProjectPlanningComponent } from './Planing/projectPlanning/projectPlanning.component';
import { TabGeneralComponent } from './Planing/projectPlanning/components/tab-general/tab-general.component';
import { TabAlignmentComponent } from './Planing/projectPlanning/components/tab-alignment/tab-alignment.component';
import { TabDetailComponent } from './Planing/projectPlanning/components/tab-detail/tab-detail.component';
import { TabGuidelineComponent } from './Planing/projectPlanning/components/tab-guideline/tab-guideline.component';
import { TrainingSeminarComponent } from './Planing/projectPlanning/components/tab-guideline/training-seminar/training-seminar.component';
import { PublicRelationsComponent } from './Planing/projectPlanning/components/tab-guideline/public-relations/public-relations.component';
import { InvestmentBudgetComponent } from './Planing/projectPlanning/components/tab-guideline/investment-budget/investment-budget.component';
import { ConsultantHireComponent } from './Planing/projectPlanning/components/tab-guideline/consultant-hire/consultant-hire.component';
import { TabCoordinatorComponent } from './Planing/projectPlanning/components/tab-coordinator/tab-coordinator.component';

const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
    url: 'https://httpbin.org/post',
    maxFilesize: 50,
    acceptedFiles: 'image/*'
};

@NgModule({
    declarations: [
        ProjectBudgetProposalComponent,
        ProjectBudgetProposalAddPersonnelComponent,
        ProjectBudgetProposalOperatingComponent,
        ProjectBudgetProposalAddOperatingComponent,
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
        ExpenseFuelLubricantComponent,
        ProjectPlanningComponent,
        TabGeneralComponent,
        TabAlignmentComponent,
        TabDetailComponent,
        TabGuidelineComponent,
        TrainingSeminarComponent,
        PublicRelationsComponent,
        InvestmentBudgetComponent,
        ConsultantHireComponent,
        TabCoordinatorComponent,
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