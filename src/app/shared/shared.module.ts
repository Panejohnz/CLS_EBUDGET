import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbNavModule, NgbAccordionModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
// Swiper Slider
import { SlickCarouselModule } from 'ngx-slick-carousel';

// Counter
import { CountUpModule } from 'ngx-countup';

import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { ClientLogoComponent } from './landing/index/client-logo/client-logo.component';
import { ServicesComponent } from './landing/index/services/services.component';
import { CollectionComponent } from './landing/index/collection/collection.component';
import { CtaComponent } from './landing/index/cta/cta.component';
import { DesignedComponent } from './landing/index/designed/designed.component';
import { PlanComponent } from './landing/index/plan/plan.component';
import { FaqsComponent } from './landing/index/faqs/faqs.component';
import { ReviewComponent } from './landing/index/review/review.component';
import { CounterComponent } from './landing/index/counter/counter.component';
import { WorkProcessComponent } from './landing/index/work-process/work-process.component';
import { TeamComponent } from './landing/index/team/team.component';
import { ContactComponent } from './landing/index/contact/contact.component';
import { FooterComponent } from './landing/index/footer/footer.component';
import { ScrollspyDirective } from './scrollspy.directive';

// NFT Landing 
import { MarketPlaceComponent } from './landing/nft/market-place/market-place.component';
import { WalletComponent } from './landing/nft/wallet/wallet.component';
import { FeaturesComponent } from './landing/nft/features/features.component';
import { CategoriesComponent } from './landing/nft/categories/categories.component';
import { DiscoverComponent } from './landing/nft/discover/discover.component';
import { TopCreatorComponent } from './landing/nft/top-creator/top-creator.component';

// Job Landing 
import { BlogComponent } from './landing/job/blog/blog.component';
import { CandidateComponent } from './landing/job/candidate/candidate.component';
import { ProcessComponent } from './landing/job/process/process.component';
import { JobFooterComponent } from './landing/job/job-footer/job-footer.component';
import { FindjobsComponent } from './landing/job/findjobs/findjobs.component';
import { JobcategoriesComponent } from './landing/job/jobcategories/jobcategories.component';
import { LandingScrollspyDirective } from './landingscrollspy.directive';

//Expense
import { ExpenseListSalaryComponent } from '../shared/expense/expenseListSalary/expenseListSalary.component';
import { ExpenseRentHouseComponent } from '../shared/expense/expenseRentHouse/expenseRentHouse.component';
import { ExpenseOTComponent } from '../shared/expense/expenseOT/expenseOT.component';
import { ExpenseMeetingSupportComponent } from '../shared/expense/expenseMeetingSupport/expenseMeetingSupport.component';
import { ExpenseMeetingLitigationComponent } from '../shared/expense/expenseMeetingLitigation/expenseMeetingLitigation.component';
import { ExpenseCommitteeComponent } from '../shared/expense/expenseCommittee/expenseCommittee.component';
import { ExpenseCarAllowanceComponent } from '../shared/expense/expenseCarAllowance/expenseCarAllowance.component';
import { ExpenseTravelComponent } from '../shared/expense/expenseTravel/expenseTravel.component';
import { ExpenseTrainingSeminarComponent } from '../shared/expense/expenseTrainingSeminar/expenseTrainingSeminar.component';
import { ExpenseOfficeRentComponent } from '../shared/expense/expenseOfficeRent/expenseOfficeRent.component';
import { ExpenseCopierRentComponent } from '../shared/expense/expenseCopierRent/expenseCopierRent.component';
import { ExpenseServiceContractComponent } from '../shared/expense/expenseServiceContract/expenseServiceContract.component';
import { ExpenseOtherComponent } from '../shared/expense/expenseOther/expenseOther.component';
import { ExpenseVehicleRepairComponent } from '../shared/expense/expenseVehicleRepair/expenseVehicleRepair.component';
import { ExpenseRepairConstructionComponent } from '../shared/expense/expenseRepairConstruction/expenseRepairConstruction.component';
import { ExpenseEquipmentRepairComponent } from '../shared/expense/expenseEquipmentRepair/expenseEquipmentRepair.component';
import { ExpenseAdvertisingComponent } from '../shared/expense/expenseAdvertising/expenseAdvertising.component';
import { ExpenseCeremonialComponent } from '../shared/expense/expenseCeremonial/expenseCeremonial.component';
import { ExpenseWitnessComponent } from '../shared/expense/expenseWitness/expenseWitness.component';
import { ExpenseSection61Component } from '../shared/expense/expenseSection61/expenseSection61.component';
import { ExpenseOtherOperatingCostComponent } from '../shared/expense/expenseOtherOperatingCost/expenseOtherOperatingCost.component';
import { ExpenseOfficeSuppliesCostComponent } from '../shared/expense/expenseOfficeSuppliesCost/expenseOfficeSuppliesCost.component';
import { ExpenseFuelAndLubricantCostComponent } from '../shared/expense/expenseFuelAndLubricantCost/expenseFuelAndLubricantCost.component';
import { ExpenseConstructionMaterialCostComponent } from '../shared/expense/expenseConstructionMaterialCost/expenseConstructionMaterialCost.component';
import { ExpenseComputerMaterialCostComponent } from '../shared/expense/expenseComputerMaterialCost/expenseComputerMaterialCost.component';
import { ExpenseUtilityAndTelecomCostComponent } from '../shared/expense/expenseUtilityAndTelecomCost/expenseUtilityAndTelecomCost.component';
import { ExpenseSystemMaintenanceCostComponent } from '../shared/expense/expenseSystemMaintenanceCost/expenseSystemMaintenanceCost.component';
import { ExpenseCarRentalCostComponent } from '../shared/expense/expenseCarRentalCost/expenseCarRentalCost.component';
import { ExpenseAssetInvestmentFormComponent } from '../shared/expense/expenseAssetInvestmentForm/expenseAssetInvestmentForm.component';
import { ExpenseConstructionFormComponent } from '../shared/expense/expenseConstructionForm/expenseConstructionForm.component';
import { ExpenseForeignTravelComponent } from '../shared/expense/expenseForeignTravel/expenseForeignTravel.component';
import { ExpenseWitnessProtectionComponent } from '../shared/expense/expenseWitnessProtection/expenseWitnessProtection.component';
import { ExpenseConsultantHireComponent } from '../shared/expense/expenseConsultantHire/expenseConsultantHire.component';
import { ExpenseGrantFormComponent } from '../shared/expense/expenseGrantForm/expenseGrantForm.component';
import { ExpenseFuelLubricantComponent } from '../shared/expense/expenseFuelLubricant/expenseFuelLubricant.component';
import { NgSelectModule } from '@ng-select/ng-select';
@NgModule({
  declarations: [
    BreadcrumbsComponent,
    ClientLogoComponent,
    ServicesComponent,
    CollectionComponent,
    CtaComponent,
    DesignedComponent,
    PlanComponent,
    FaqsComponent,
    ReviewComponent,
    CounterComponent,
    WorkProcessComponent,
    TeamComponent,
    ContactComponent,
    FooterComponent,
    ScrollspyDirective,
    LandingScrollspyDirective,
    MarketPlaceComponent,
    WalletComponent,
    FeaturesComponent,
    CategoriesComponent,
    DiscoverComponent,
    TopCreatorComponent,
    BlogComponent,
    CandidateComponent,
    ProcessComponent,
    JobFooterComponent,
    FindjobsComponent,
    JobcategoriesComponent,
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
  ],
  imports: [
    FormsModule,
    CommonModule,
    NgbNavModule,
    NgbAccordionModule,
    NgbDropdownModule,
    SlickCarouselModule,
    CountUpModule,
    NgSelectModule
  ],
  exports: [BreadcrumbsComponent,
    ClientLogoComponent,
    ServicesComponent,
    CollectionComponent,
    CtaComponent,
    DesignedComponent,
    PlanComponent,
    FaqsComponent,
    ReviewComponent,
    CounterComponent,
    WorkProcessComponent,
    TeamComponent,
    ContactComponent,
    FooterComponent,
    ScrollspyDirective,
    LandingScrollspyDirective,
    WalletComponent,
    MarketPlaceComponent,
    FeaturesComponent,
    CategoriesComponent,
    DiscoverComponent,
    TopCreatorComponent,
    ProcessComponent,
    FindjobsComponent,
    CandidateComponent,
    BlogComponent,
    JobcategoriesComponent,
    JobFooterComponent,
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
    ExpenseFuelLubricantComponent,]
})
export class SharedModule { }
