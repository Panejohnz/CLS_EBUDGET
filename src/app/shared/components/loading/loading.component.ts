import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { LoadingService } from '../../../core/services/loading.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit, OnDestroy {
  loading$: Observable<boolean>;
  loadingMessage$: Observable<string>;
  loading: boolean = false;
  loadingMessage: string = 'กำลังโหลด...';
  private subscriptions: Subscription[] = [];

  constructor(
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef
  ) {
    this.loading$ = this.loadingService.loading$;
    this.loadingMessage$ = this.loadingService.loadingMessage$;
  }

  ngOnInit(): void {
    // Subscribe to loading state changes
    const loadingSub = this.loading$.subscribe(loading => {
      // ใช้ setTimeout เพื่อเลื่อนการเปลี่ยนแปลงไปยัง change detection cycle ถัดไป
      setTimeout(() => {
        this.loading = loading;
        this.cdr.detectChanges();
      }, 0);
    });
    this.subscriptions.push(loadingSub);

    // Subscribe to loading message changes
    const messageSub = this.loadingMessage$.subscribe(message => {
      setTimeout(() => {
        this.loadingMessage = message;
        this.cdr.detectChanges();
      }, 0);
    });
    this.subscriptions.push(messageSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}


