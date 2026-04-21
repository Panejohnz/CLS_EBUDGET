import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';


@Component({
  selector: 'app-tab-guideline',
  templateUrl: './tab-guideline.component.html',
  styleUrl: './tab-guideline.component.scss'
})

export class TabGuidelineComponent {

  modalRef: any;
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  project_planing = {
    projectType: ''
  };

  @Input() model: any
  get activities() {
    return this.model?.activities || [];
  }

  ngOnChanges() {
    console.log('this.model?.activities ',this.model?.activities );
    
    if (this.model?.activities && this.model.activities.length > 0) {

      return;
    }

    if (!this.model.activities) {
      this.model.activities = [];
      this.addActivity();
    }
  }
  constructor(private modalService: NgbModal) {


  }
  selectedActivity: any;

  addActivity() {
    this.model.activities.push({
      name: '',
      owner: '',
      quarters: this.generateYear(),
      subActivities: [],
      otherExpenses: [] // 👈 ต้องมี
    });
  }
  removeActivity(i: number) {
    this.activities.splice(i, 1);
  }
  addSubActivity(activity: any) {
    activity.subActivities?.push({
      id: Date.now(),
      name: '',
      quarters: this.generateYear(),
      subActivities: []
    });
  }

  getTotal(activity: any): number {
    return activity.quarters
      .flatMap((q: any) => q.months)
      .reduce((sum: any, m: any) => sum + (m.budget || 0), 0);
  }

  generateYear() {
    const MONTHS = ['ต.ค.', 'พ.ย.', 'ธ.ค.', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.'];

    const q = [];
    for (let i = 0; i < 4; i++) {
      q.push({
        quarter: i + 1,
        months: MONTHS.slice(i * 3, i * 3 + 3).map(m => ({
          month: m,
          selected: false,
          budget: null
        }))
      });
    }
    return q;
  }
  addSub(act: any) {
    act.subActivities.push({
      name: '',
      owner: '',
      quarters: this.generateYear(),
      subActivities: []
    });
  }
  removeSub(act: any, i: number) {
    act.subActivities.splice(i, 1);
  }
  months = [
    'ต.ค.', 'พ.ย.', 'ธ.ค.',
    'ม.ค.', 'ก.พ.', 'มี.ค.',
    'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.'
  ];
  generateQuarters(): any[] {
    const quarters: any[] = [];

    for (let i = 0; i < 4; i++) {
      quarters.push({
        quarter: i + 1,
        months: this.months.slice(i * 3, i * 3 + 3).map(m => ({
          month: m,
          selected: false,
          budget: null
        }))
      });
    }

    return quarters;
  }

  fullModal(modal: any, data: any) {



    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }

  type: string = '';
  formTypeMap: any = {
    73: 'seminar',
    74: 'pr',
    64: 'investment',
    75: 'consult',
    70: 'other'
  }
  openMultiplierModal(content: any, act: any) {

    this.selectedActivity = act;

    if (!this.selectedActivity.otherExpenses) {
      this.selectedActivity.otherExpenses = [];
    }

    this.type = this.formTypeMap[this.model.projectType?.Expense_Id];
    if (!this.type) {
      basicAlert('info', 'เลือกประเภทโครงการ', '');
      return;
    }

    if (!this.selectedActivity.otherExpenses) {
      this.selectedActivity.otherExpenses = [];
    }

    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }
  getActivityTotal(act: any): number {

    let total = 0;

    // รวมกิจกรรมหลัก
    act.quarters.forEach((q: any) => {
      q.months.forEach((m: any) => {
        total += Number(m.budget) || 0;
      });
    });

    // รวมกิจกรรมย่อย
    total += this.getSubActivitiesTotal(act);

    return total;
  }
  getSubActivitiesTotal(act: any): number {

    let total = 0;

    act.subActivities.forEach((sub: any) => {
      sub.quarters.forEach((q: any) => {
        q.months.forEach((m: any) => {
          total += Number(m.budget) || 0;
        });
      });
    });

    return total;
  }
  onBudgetChange(month: any) {

    if (month.budget && month.budget > 0) {
      month.selected = true;
    } else {
      month.selected = false;
    }

  }
}
