import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BudgetTargetSettingComponent } from './budgetTargetSetting/budgetTargetSetting.component';
import { ReportResultComponent } from './reportResult/reportResult.component';
import { ReportComponent } from './report/report.component';
import { InvestmentReportActionComponent } from './reportInvestment/reportInvestment.component';
import { ReportKPIComponent } from './reportKPI/reportKPI.component';

const routes: Routes = [
    {
        path: "BudgetTarget",
        component: BudgetTargetSettingComponent
    },
    {
        path: "ReportResult",
        component: ReportResultComponent
    },
    {
        path: "Report",
        component: ReportComponent
    },
    {
        path: "ReportInvestment",
        component: InvestmentReportActionComponent
    },
    {
        path: "ReportKPI",
        component: ReportKPIComponent
    },
    

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EbudgetMasterRoutingModule { }