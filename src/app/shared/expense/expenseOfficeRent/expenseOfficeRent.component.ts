import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-office-rent',
  templateUrl: './expenseOfficeRent.component.html',
  styles: ``
})
export class ExpenseOfficeRentComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  rentList: any = [
    {
      asset: '',
      area: 0,
      pricePerSqm: 0,
      monthlyRent: 0,
      yearlyRent: 0,
      purpose: ''
    }
  ]

  totalArea = 0
  totalRate = 0
  totalMonth = 0
  totalYear = 0


  addRow() {

    this.rentList.push({
      asset: '',
      area: 0,
      pricePerSqm: 0,
      monthlyRent: 0,
      yearlyRent: 0,
      purpose: ''
    })

  }


  removeRow(i: number) {

    this.rentList.splice(i, 1)
    this.calculateGrand()

  }


  calculate(item: any) {

    item.monthlyRent =
      (item.area || 0) *
      (item.pricePerSqm || 0)

    this.calculateYear(item)

  }


  calculateYear(item: any) {

    item.yearlyRent =
      (item.monthlyRent || 0) * 12

    this.calculateGrand()

  }


  calculateGrand() {

    this.totalArea =
      this.rentList.reduce((sum: any, i: any) => sum + (i.area || 0), 0)

    this.totalRate =
      this.rentList.reduce((sum: any, i: any) => sum + (i.pricePerSqm || 0), 0)

    this.totalMonth =
      this.rentList.reduce((sum: any, i: any) => sum + (i.monthlyRent || 0), 0)

    this.totalYear =
      this.rentList.reduce((sum: any, i: any) => sum + (i.yearlyRent || 0), 0)

  }

  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
