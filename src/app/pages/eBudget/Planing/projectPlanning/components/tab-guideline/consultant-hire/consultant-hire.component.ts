import { Component } from '@angular/core';

@Component({
  selector: 'app-consultant-hire',

  templateUrl: './consultant-hire.component.html',
  styleUrl: './consultant-hire.component.scss'
})
export class ConsultantHireComponent {
  mainStaff: any[] = []
  supportStaff: any[] = []
  otherCost: any[] = []
  totalCost: number = 0
  mainTotal: number = 0;
  supportTotal: number = 0;
  grandTotal: number = 0;
  otherTotal: number = 0
  projects: any[] = [];
  constructor() {
    this.addProject();
  }

  addMain() {

    this.projects.push({

      project_name: '',
      reason: '',
      benefit: '',

      mainStaff: [{
        name: '',
        field: '',
        edu_bachelor: false,
        edu_master: false,
        edu_phd: false,
        exp: 0,
        qty: 0,
        month: 0,
        rate: 0,
        total: 0
      }],

      supportStaff: [],

      otherCost: [],

      totalCost: 0

    });
  }




  addProject() {

    this.projects.push({

      project_name: '',
      reason: '',
      benefit: '',

      mainStaff: [{
        name: '',
        field: '',
        edu_bachelor: false,
        edu_master: false,
        edu_phd: false,
        exp: 0,
        qty: 0,
        month: 0,
        rate: 0,
        total: 0
      }],

      supportStaff: [],
      otherCost: [],

      mainTotal: 0,
      supportTotal: 0,
      otherTotal: 0,
      totalCost: 0

    })

  }

  addMainDetail(pIndex: number) {

    this.projects[pIndex].mainStaff.push({
      name: '',
      field: '',
      edu_bachelor: false,
      edu_master: false,
      edu_phd: false,
      exp: 0,
      qty: 0,
      month: 0,
      rate: 0,
      total: 0
    })

  }

  addSupportDetail(pIndex: number) {

    this.projects[pIndex].supportStaff.push({
      name: '',
      field: '',
      edu_bachelor: false,
      edu_master: false,
      edu_phd: false,
      exp: 0,
      qty: 0,
      month: 0,
      rate: 0,
      total: 0
    })

  }

  addOtherDetail(pIndex: number) {

    this.projects[pIndex].otherCost.push({
      name: '',
      rate: 0
    })

  }

  removeMain(pIndex: number, i: number) {
    this.projects[pIndex].mainStaff.splice(i, 1)
    this.calculateMain(pIndex)
  }

  removeSupport(pIndex: number, i: number) {
    this.projects[pIndex].supportStaff.splice(i, 1)
    this.calculateSupport(pIndex)
  }

  removeOther(pIndex: number, i: number) {
    this.projects[pIndex].otherCost.splice(i, 1)
    this.calculateOther(pIndex)
  }

  calculateMain(pIndex: number) {

    let total = 0

    this.projects[pIndex].mainStaff.forEach((item: any) => {

      item.total = (item.qty || 0) * (item.month || 0) * (item.rate || 0)

      total += item.total

    })

    this.projects[pIndex].mainTotal = total

    this.calculateTotal(pIndex)

  }

  calculateSupport(pIndex: number) {

    let total = 0

    this.projects[pIndex].supportStaff.forEach((item: any) => {

      item.total = (item.qty || 0) * (item.month || 0) * (item.rate || 0)

      total += item.total

    })

    this.projects[pIndex].supportTotal = total

    this.calculateTotal(pIndex)

  }

  calculateOther(pIndex: number) {

    let total = 0

    this.projects[pIndex].otherCost.forEach((item: any) => {

      total += (item.rate || 0)

    })

    this.projects[pIndex].otherTotal = total

    this.calculateTotal(pIndex)

  }

  calculateTotal(pIndex: number) {

    const p = this.projects[pIndex]

    p.totalCost =
      (p.mainTotal || 0) +
      (p.supportTotal || 0) +
      (p.otherTotal || 0)

  }
}
