import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BudgetYearService {
  private listYearSubject = new BehaviorSubject<any[]>([]);
  public listYear$: Observable<any[]> = this.listYearSubject.asObservable();

  // Flag to track if list has been initialized
  private listYearInitialized = false;

  private bgyearSubject = new BehaviorSubject<number>(0);
  public bgyear$: Observable<number> = this.bgyearSubject.asObservable();

  constructor() { }

  setListYear(years: any[]): void {
    if (years && Array.isArray(years) && years.length > 0) {
      this.listYearInitialized = true;
      this.listYearSubject.next(years);
    }
  }
  private yearChangeSubject = new BehaviorSubject<number>(
    new Date().getFullYear()
  );

  yearChanged$ = this.yearChangeSubject.asObservable();

  setYear(year: number) {
    this.yearChangeSubject.next(year);
  }

  getBgyear(): number {
    return this.yearChangeSubject.value;
  }

  getListYear(): any[] {
    return this.listYearSubject.value;
  }

}

