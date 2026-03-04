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
  constructor() {
    this.mainStaff.push({
      name: '',
      field: '',
      edu_bachelor: false,
      edu_master: false,
      edu_phd: false,
      exp: 0,
      qty: 0,
      month: 0,
      rate: 0
    })
  }
  addMain() {
    this.mainStaff.push({})
  }

  removeMain(i: number) {
    this.mainStaff.splice(i, 1)
  }

  removeSupport(i: number) {
    this.supportStaff.splice(i, 1)
  }

  removeOther(i: number) {
    this.otherCost.splice(i, 1)
  }
  addMainDetail() {

    this.mainStaff.push({
      name: '',
      field: '',
      edu_bachelor: false,
      edu_master: false,
      edu_phd: false,
      exp: 0,
      qty: 0,
      month: 0,
      rate: 0
    })

  }
  addSupportDetail() {

    this.supportStaff.push({
      name: '',
      field: '',
      edu_bachelor: false,
      edu_master: false,
      edu_phd: false,
      exp: 0,
      qty: 0,
      month: 0,
      rate: 0
    })

  }

  addOtherDetail() {

    this.otherCost.push({
      name: '',
      rate: 0
    })

  }
}
