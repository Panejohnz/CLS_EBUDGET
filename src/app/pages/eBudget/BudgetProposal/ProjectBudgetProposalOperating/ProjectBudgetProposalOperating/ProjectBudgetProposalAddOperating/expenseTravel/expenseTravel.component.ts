import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-travel',
  templateUrl: './expenseTravel.component.html',
  styles: ``
})
export class ExpenseTravelComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  list: any = [
    {
      level: '',
      times: 0,
      perdiem: 0,
      hotel: 0,
      airplane: 0,
      taxi: 0,
      total: 0
    }
  ]
  sections: any = [
    {
      description: '',
      details: [this.newDetail()]
    }
  ]
  add() {

    this.list.push({
      level: '',
      times: 0,
      perdiem: 0,
      hotel: 0,
      airplane: 0,
      taxi: 0,
      total: 0
    })

  }
  addSection() {

    this.sections.push({
      description: '',
      details: [this.newDetail()]
    })

  }
  remove(i: number) {
    this.sections.splice(i, 1)
  }

  detail: any = {

    level: '',
    times: 0,

    perdiemPerson: 0,
    perdiemDay: 0,
    perdiemRate: 0,
    perdiemTotal: 0,

    hotelPerson: 0,
    hotelNight: 0,
    hotelRate: 0,
    hotelTotal: 0,

    planePerson: 0,
    planeTrip: 0,
    planeRate: 0,
    planeTotal: 0,

    taxiPerson: 0,
    taxiTrip: 0,
    taxiRate: 0,
    taxiTotal: 0,

    grandTotal: 0

  }


  calculate(d: any) {

    d.perdiemTotal =
      (d.perdiemPerson || 0) *
      (d.perdiemDay || 0) *
      (d.perdiemRate || 0)

    d.hotelTotal =
      (d.hotelPerson || 0) *
      (d.hotelNight || 0) *
      (d.hotelRate || 0)

    d.planeTotal =
      (d.planePerson || 0) *
      (d.planeTrip || 0) *
      (d.planeRate || 0)

    d.taxiTotal =
      (d.taxiPerson || 0) *
      (d.taxiTrip || 0) *
      (d.taxiRate || 0)

    d.grandTotal =
      d.perdiemTotal +
      d.hotelTotal +
      d.planeTotal +
      d.taxiTotal

  }
  addDetail(section: any) {

    section.details.push(this.newDetail())

  }

  newDetail() {
    return {

      level: '',
      times: 0,

      perdiemPerson: 0,
      perdiemDay: 0,
      perdiemRate: 0,
      perdiemTotal: 0,

      hotelPerson: 0,
      hotelNight: 0,
      hotelRate: 0,
      hotelTotal: 0,

      planePerson: 0,
      planeTrip: 0,
      planeRate: 0,
      planeTotal: 0,

      taxiPerson: 0,
      taxiTrip: 0,
      taxiRate: 0,
      taxiTotal: 0,

      grandTotal: 0

    }
  }
  removeDetail(section: any, i: number) {

    section.details.splice(i, 1)

  }
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
