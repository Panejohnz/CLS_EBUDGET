import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';

@Component({
  selector: 'app-tab-guideline',
  templateUrl: './tab-guideline.component.html',
  styleUrl: './tab-guideline.component.scss'
})

export class TabGuidelineComponent {
  activities: any[] = [];
  modalRef: any;
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  project_planing: any = {};
  @Input() model: any

  constructor(private modalService: NgbModal) {
    this.addActivity();
  }

  addActivity() {
    this.activities.push({
      id: Date.now(),
      name: '',
      quarters: this.generateYear(),
      subActivities: []
    });
  }
  removeActivity(index: number) {
    this.activities.splice(index, 1);
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

  generateYear(): any[] {
    const MONTHS = [
      'ต.ค.', 'พ.ย.', 'ธ.ค.',
      'ม.ค.', 'ก.พ.', 'มี.ค.',
      'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.'
    ];

    const quarters = [];

    for (let q = 0; q < 4; q++) {
      quarters.push({
        quarter: q + 1,
        months: MONTHS.slice(q * 3, q * 3 + 3).map(m => ({
          month: m,
          selected: false,
          budget: null
        }))
      });
    }

    return quarters;
  }
  addSub(activity: any) {
    activity.subActivities.push({
      id: Date.now(),
      name: 'กิจกรรมย่อย',
      quarters: this.generateQuarters(),
      subActivities: []
    });
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
  removeSub(activity: any, index: number) {
    activity.subActivities.splice(index, 1);
  }
  fullModal(modal: any, data: any) {



    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }

  type: string = '';
  formTypeMap: any = {
    1: 'seminar',
    2: 'pr',
    3: 'investment',
    4: 'consult',
    5: 'other'
  }
  openMultiplierModal(content: any) {

    this.type = this.formTypeMap[this.model.projectType]
    if (!this.type) {
      alert('เลือกประเภทโครงการ')
      return
    }
    this.modalService.open(content, {
      backdrop: 'static',
      windowClass: 'modal-95'
    })
  }

}
