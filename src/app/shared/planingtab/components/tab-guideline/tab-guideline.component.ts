import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { EbudgetService } from 'src/app/core/services/ebudget.service';


@Component({
  selector: 'app-tab-guideline',
  templateUrl: './tab-guideline.component.html',
  styleUrl: './tab-guideline.component.scss'
})

export class TabGuidelineComponent {
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) {


  }
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

      this.activities.forEach((act: any) => {

        if (act.SubActivities?.length) {

          let subSum = 0;

          act.SubActivities.forEach((sub: any) => {

            const subTotal = (sub.otherExpenses || []).reduce((sum: number, item: any) => {
              return sum + (item.total || item.Total || 0);
            }, 0);

            if (!subTotal) {
              sub.multiplierTotal = this.getActivityTotal(sub);
            } else {
              sub.multiplierTotal = subTotal;
            }

            subSum += sub.multiplierTotal;
          });

          act.multiplierTotal = subSum;

        } else {

          const mainTotal = (act.otherExpenses || []).reduce((sum: number, item: any) => {
            return sum + (item.total || item.Total || 0);
          }, 0);

          // 👉 fallback เป็น plan
          if (!mainTotal) {
            act.multiplierTotal = this.getActivityTotal(act);
          } else {
            act.multiplierTotal = mainTotal;
          }
        }

      });
    }

    if (!this.model?.activities) {
      this.model.activities = [];
      this.addActivity();
    }
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
      SubActivities: [],
      otherExpenses: []
    });
  }
  removeActivity(i: number) {
    this.activities.splice(i, 1);
  }
  addSubActivity(activity: any) {
    activity.SubActivities?.push({
      id: Date.now(),
      name: '',
      quarters: this.generateYear(),
      SubActivities: []
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

    act.quarters?.forEach((q: any) => {
      q.months?.forEach((m: any) => {
        m.budget = null;
        m.selected = false;
      });
    });

    act.otherExpenses = [];
    act.multiplierTotal = 0;

    act.SubActivities.push({
      name: '',
      owner: '',
      quarters: this.generateYear(),
      SubActivities: [],
      otherExpenses: [],
      multiplierTotal: 0,
      noBudget: act.noBudget,
      consultSelf: false,
      consultHire: false
    });

  }
  removeSub(act: any, i: number) {

    const sub = act.SubActivities[i];
    if (!sub.Project_Detail_Id) {
      act.SubActivities.splice(i, 1);
      return
    }
    let model = {
      FUNC_CODE: "FUNC-Delete_Project_Plan_Detail",
      Project_Detail_Id: sub.Project_Detail_Id
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      act.SubActivities.splice(i, 1);
    })

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

    this.selectedActivity = item;
    item._useMultiplier = true;
    this.selectedActivityId = item.Project_Detail_Id || item.id;

    this.type = this.formTypeMap[this.model.projectType?.Expense_Id];
    if (item.SubActivities?.length) {
      item.SubActivities.forEach((sub: any) => {
        sub._useMultiplier = true;
      });
    }
    if (!this.type) {
      basicAlert('info', 'เลือกประเภทโครงการ', '');
      return;
    }

    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modal-95'
    }).result.then(() => {
      item._useMultiplier = true;
      item.multiplierTotal = (item.otherExpenses || []).reduce((sum: number, i: any) => {
        return sum + (i.total || i.Total || 0);
      }, 0);

    }).catch(() => { });
  }
  calcMultiplier(act: any): number {

    if (act.SubActivities?.length) {
      return act.SubActivities.reduce((sum: number, sub: any) => {
        return sum + this.calcMultiplier(sub);
      }, 0);
    }

    const list = act.otherExpenses || [];

    return list.reduce((sum: number, item: any) => {
      return sum + (item.total || item.Total || 0);
    }, 0);
  }
  getActivityTotal(act: any): number {

    // 🔥 มี sub → รวม sub
    if (act.SubActivities?.length) {
      return act.SubActivities.reduce((sum: number, sub: any) => {
        return sum + this.getActivityTotal(sub);
      }, 0);
    }

    // 🔥 ตอน GET ใช้ DB
    if (!act._edited && act.sumAmount != null) {
      return Number(act.sumAmount);
    }

    // 🔥 คำนวณใหม่
    let total = 0;

    (act.quarters || []).forEach((q: any) => {
      (q.months || []).forEach((m: any) => {
        total += Number(m.budget) || 0;
      });
    });

    return total;
  }
  getSubActivitiesTotal(act: any): number {

    let total = 0;

    // act.SubActivities.forEach((sub: any) => {
    //   sub.quarters.forEach((q: any) => {
    //     q.months.forEach((m: any) => {
    //       total += Number(m.budget) || 0;
    //     });
    //   });
    // });

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
  onInputFormat(value: any, month: any) {
    month.budget = value;

    // 🔥 หา act แล้ว set
    this.model.activities.forEach((act: any) => {
      act._edited = true;

      act.SubActivities?.forEach((sub: any) => {
        sub._edited = true;
      });
    });
  }
  hasSubActivities(act: any): boolean {
    return act?.SubActivities && act.SubActivities.length > 0;
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
      const input3 = item.input3 ?? item.input3 ?? 0;
      const input4 = item.input4 ?? item.input4 ?? 0;
      const input5 = item.input5 ?? item.input5 ?? 0;
      return sum + (times * people * rate * input3 * input4 * input5);

    }, 0);

  }
  calcMultiplierTotal(act: any): number {
    if (!act?.otherExpenses?.length) return 0;

    return act.otherExpenses.reduce((sum: number, item: any) => {
      const times = item.Times ?? item.times ?? 0;
      const people = item.People ?? item.people ?? 0;
      const rate = item.Rate ?? item.rate ?? 0;
      const input3 = item.input3 ?? item.input3 ?? 0;
      const input4 = item.input4 ?? item.input4 ?? 0;
      const input5 = item.input5 ?? item.input5 ?? 0;
      return sum + (times * people * rate * input3 * input4 * input5);
    }, 0);
  }
  updateMultiplierTotal(act: any) {
    act._edited = true;
    const list = act.otherExpenses || [];

    act.multiplierTotal = list.reduce((sum: number, item: any) => {

      const times = item.times ?? item.Times ?? 0;
      const people = item.people ?? item.People ?? 0;
      const rate = item.rate ?? item.Rate ?? 0;
      const input3 = item.input3 ?? item.input3 ?? 0;
      const input4 = item.input4 ?? item.input4 ?? 0;
      const input5 = item.input5 ?? item.input5 ?? 0;
      return sum + (times * people * rate * input3 * input4 * input5);

    }, 0);
  }
  updateAllMultiplier() {

    this.activities.forEach((act: any) => {

      act.multiplierTotal = this.getMultiplierTotal(act);

      if (act.SubActivities?.length) {
        act.SubActivities.forEach((sub: any) => {
          sub.multiplierTotal = this.getMultiplierTotal(sub);
        });
      }

    });

  }
  getMultiplierTotal(act: any): number {

    // 🔥 มี sub → รวม sub
    if (act.SubActivities?.length) {
      return act.SubActivities.reduce((sum: number, sub: any) => {
        return sum + this.getMultiplierTotal(sub);
      }, 0);
    }

    // 🔥 ถ้ายังไม่เคยกด modal → ใช้ค่าจาก DB
    if (!act._useMultiplier) {
      return act.multiplierTotal || 0;
    }

    // 🔥 กด modal แล้ว → ใช้ค่าปัจจุบัน
    return (act.otherExpenses || []).reduce((sum: number, item: any) => {
      return sum + (item.total || item.Total || 0);
    }, 0);
  }
  syncMainFromSub(act: any) {

    if (!act.SubActivities?.length) return;

    act.quarters.forEach((q: any, qIndex: number) => {

      q.months.forEach((m: any, mIndex: number) => {

        // 🔥 ถ้ามี sub ตัวไหนติ๊ก → main ติ๊ก
        const hasSelected = act.SubActivities.some((sub: any) => {
          return sub.quarters?.[qIndex]?.months?.[mIndex]?.selected;
        });

        m.selected = hasSelected;
      });

    });

  }
  onSubBudgetChange(act: any, qIndex: number, mIndex: number) {

    const sub = act.SubActivities;

    sub.forEach((s: any) => {
      const m = s.quarters?.[qIndex]?.months?.[mIndex];

      if (m?.budget && m.budget > 0) {
        m.selected = true;
      } else {
        m.selected = false;
      }
    });

    const hasSelected = sub.some((s: any) => {
      return s.quarters?.[qIndex]?.months?.[mIndex]?.selected;
    });

    act.quarters[qIndex].months[mIndex].selected = hasSelected;
  }
}
