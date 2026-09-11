import { AfterViewInit, Component, NgZone, OnDestroy } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject, filter, takeUntil } from 'rxjs';
import { EbudgetService } from './core/services/ebudget.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  
})
export class AppComponent implements AfterViewInit, OnDestroy {
  title = 'FDA';
  private readonly destroy$ = new Subject<void>();
  private saveEnabledByRoute = new Map<string, boolean>();
  private observer?: MutationObserver;

  private readonly saveControlRoutes: Record<string, string> = {
    '/Planing': 'PROJECT_PLANNING',
    '/ProjectBudgetProposal/Personnel': 'BUDGET_PROPOSAL_PERSONNEL',
    '/ProjectBudgetProposal/Operating': 'BUDGET_PROPOSAL_OPERATING',
    '/PlanManagement': 'PLAN_MANAGEMENT',
    '/Allocation': 'PROJECT_ALLOCATION',
    '/Transfer': 'PROJECT_TRANSFER',
    '/Moniter/ReportResult': 'REPORT_RESULT',
    '/Moniter/ReportKPI': 'REPORT_KPI',
    '/MasterData/MasExpenseDetail': 'MAS_EXPENSE_DETAIL',
    '/MasterData/MasProjectPlan': 'MAS_PROJECT_PLAN'
  };

  constructor(
    private router: Router,
    private ebudgetService: EbudgetService,
    private ngZone: NgZone
  ) { }

  ngAfterViewInit(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => this.loadSaveControls());

    this.observer = new MutationObserver(() => this.applyAddButtonState());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.loadSaveControls();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.observer?.disconnect();
  }

  private loadSaveControls(): void {
    this.ebudgetService.GatewayGetData({ FUNC_CODE: 'FUNC-GET_Budget_Menu_Save_Control' }).subscribe({
      next: (response: any) => {
        const controls = Array.isArray(response?.List_Budget_Menu_Save_Control)
          ? response.List_Budget_Menu_Save_Control
          : Object.values(response?.List_Budget_Menu_Save_Control || {});

        this.saveEnabledByRoute.clear();
        controls.forEach((control: any) => {
          if (control?.Menu_Code) {
            this.saveEnabledByRoute.set(control.Menu_Code, this.toBoolean(control.Can_Save));
          }
        });
        this.applyAddButtonState();
      },
      error: () => {
        // หาก API ยังไม่พร้อม ให้ปุ่มเพิ่มทำงานตามปกติ
        this.saveEnabledByRoute.clear();
        this.applyAddButtonState();
      }
    });
  }

  private applyAddButtonState(): void {
    this.ngZone.runOutsideAngular(() => {
      const menuCode = this.currentMenuCode();
      const canSave = menuCode ? this.saveEnabledByRoute.get(menuCode) !== false : true;
      document.querySelectorAll<HTMLButtonElement>('button').forEach((button) => {
        const text = (button.textContent || '').replace(/\s+/g, ' ').trim();
        const isAddButton = text.includes('เพิ่ม');
        if (!isAddButton) { return; }

        button.disabled = !canSave;
        button.classList.toggle('save-control-locked', !canSave);
        button.title = !canSave ? 'เมนูนี้ปิดการเพิ่มข้อมูลชั่วคราว' : '';
      });
    });
  }

  private currentMenuCode(): string | null {
    const url = this.router.url.split('?')[0].split('#')[0];
    const route = Object.keys(this.saveControlRoutes)
      .sort((a, b) => b.length - a.length)
      .find((item) => url === item || url.startsWith(item + '/'));
    return route ? this.saveControlRoutes[route] : null;
  }

  private toBoolean(value: any): boolean {
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
  }
}
