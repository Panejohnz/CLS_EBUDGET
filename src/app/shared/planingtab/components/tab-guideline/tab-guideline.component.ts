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
  activities: any[] = [];

  ngOnChanges() {

    if (this.model?.activities?.length) {

      this.activities = this.model.activities;
      console.log('aa',this.activities);
      
      // 🔥 loop ทีละ activity
      this.activities.forEach((act: any) => {

        // รวมจาก otherExpenses (DB Total)
        const multiplier = (act.otherExpenses || []).reduce((sum: number, item: any) => {
          return sum + (item.total || item.Total || 0);
        }, 0);

        act.multiplierTotal = multiplier;
      });

    }

    // init กรณีไม่มี
    if (!this.model?.activities) {
      this.model.activities = [];
      this.addActivity();
    }
  }
  constructor(private modalService: NgbModal) {


  }
  onBudgetChangeNew(act: any) {
    if (act.noBudget) {
      act.quarters?.forEach((q: any) => {
        q.months?.forEach((m: any) => {
          m.budget = null;
        });
      });
    }
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
    this.clearMainIfHasSub(activity);
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
    act.subActivities = act.subActivities || [];

    act.subActivities.push({
      name: '',
      owner: '',
      noBudget: act.noBudget,
      consult: 0,
      quarters: this.generateYear(),

      // 🔥 เพิ่มให้เหมือน act
      multiplierTotal: 0,
      multiplierList: [], // ถ้ามีใน act
      subActivities: [] // เผื่อ nested ต่อ
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
  selectedActivityId: number | null = null;
  selectedLevel: 'act' | 'sub' | null = null;
  openMultiplierModal(content: any, item: any, level: 'act' | 'sub' = 'act') {

    this.selectedActivity = item; // 🔥 อันนี้ต้องมี
    this.selectedActivityId = item.Project_Detail_Id || item.id;

    this.type = this.formTypeMap[this.model.projectType?.Expense_Id];

    if (!this.type) {
      basicAlert('info', 'เลือกประเภทโครงการ', '');
      return;
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
  onToggleNoBudget(act: any) {
    if (act.noBudget) {
      act.quarters.forEach((q: any) => {
        q.months.forEach((m: any) => {
          m.budget = 0;
        });
      });
    }
  }
  formatNumber(value: any): string {
    if (value === null || value === undefined || value === '') return '';

    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  displayValue(value: any): string {
    if (!value && value !== 0) return '';

    const parts = value.toString().split('.');

    const intPart = Number(parts[0]).toLocaleString('en-US');

    return parts.length > 1
      ? intPart + '.' + parts[1]
      : intPart;
  }
  onInputFormat(value: any, obj: any) {

    if (value === null || value === undefined) {
      obj.budget = '';
      obj.selected = false;
      return;
    }

    let clean = value.toString().replace(/,/g, '');

    clean = clean.replace(/[^0-9.]/g, '');

    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts[1];
    }

    let [intPart, decimalPart] = clean.split('.');

    if (!intPart) intPart = '';

    let formattedInt = intPart
      ? Number(intPart).toLocaleString('en-US')
      : '';

    let display = decimalPart !== undefined
      ? formattedInt + '.' + decimalPart
      : formattedInt;

    obj.budget = clean;

    const num = parseFloat(clean);
    obj.selected = !isNaN(num) && num > 0;
  }
  hasSubActivities(act: any): boolean {
    return act?.subActivities && act.subActivities.length > 0;
  }
  clearMainIfHasSub(act: any) {

    if (this.hasSubActivities(act)) {

      act.quarters?.forEach((q: any) => {
        q.months?.forEach((m: any) => {
          m.budget = '';
          m.selected = false;
        });
      });

    }
  }
  calcTotal(list: any[]): number {

    if (!list?.length) return 0;

    return list.reduce((sum, item) => {

      const times = item.Times ?? item.times ?? 0;
      const people = item.People ?? item.people ?? 0;
      const rate = item.Rate ?? item.rate ?? 0;

      return sum + (times * people * rate);

    }, 0);

  }
  calcMultiplierTotal(act: any): number {
    if (!act?.otherExpenses?.length) return 0;

    return act.otherExpenses.reduce((sum: number, item: any) => {
      const times = item.Times ?? item.times ?? 0;
      const people = item.People ?? item.people ?? 0;
      const rate = item.Rate ?? item.rate ?? 0;
      return sum + (times * people * rate);
    }, 0);
  }
  updateMultiplierTotal(act: any) {

    const list = act.otherExpenses || [];

    act.multiplierTotal = list.reduce((sum: number, item: any) => {

      const times = item.times ?? item.Times ?? 0;
      const people = item.people ?? item.People ?? 0;
      const rate = item.rate ?? item.Rate ?? 0;

      return sum + (times * people * rate);

    }, 0);
  }
}
