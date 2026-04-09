import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProjectPlanService {

    private projectPlanSource = new BehaviorSubject<any>({});
    projectPlan$ = this.projectPlanSource.asObservable();

    setProjectPlan(data: any) {
        const current = this.projectPlanSource.value;
        this.projectPlanSource.next({ ...current, ...data });
    }
}