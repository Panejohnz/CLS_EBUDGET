import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingComponent } from './shared/components/loading/loading.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'FDA';

  private readonly historyNavigationHandler = () => this.redirectToSelectedSystem();

  ngOnInit(): void {
    window.addEventListener('popstate', this.historyNavigationHandler);
    // pageshow handles pages restored from the browser back-forward cache (bfcache).
    window.addEventListener('pageshow', this.historyNavigationHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('popstate', this.historyNavigationHandler);
    window.removeEventListener('pageshow', this.historyNavigationHandler);
  }

  private redirectToSelectedSystem(): void {
    try {
      const permission = JSON.parse(localStorage.getItem('selectedPermission') || '{}');
      const systemUrl = String(permission?.Sytem_URL ?? permission?.System_URL ?? '').trim();
      if (!systemUrl) return;

      const targetUrl = new URL(systemUrl, window.location.origin);
      targetUrl.protocol = window.location.protocol;
      targetUrl.host = window.location.host;
      targetUrl.searchParams.delete('Token');
      targetUrl.searchParams.delete('token');

      const currentBase = this.getApplicationBase(window.location.pathname);
      const targetBase = this.getApplicationBase(targetUrl.pathname);
      if (currentBase && targetBase && currentBase !== targetBase) {
        window.location.replace(targetUrl.toString());
      }
    } catch {
      // An invalid or legacy permission URL must not block the current application.
    }
  }

  private getApplicationBase(pathname: string): string {
    return pathname.split('/').filter(Boolean)[0]?.toLowerCase() || '';
  }
}
