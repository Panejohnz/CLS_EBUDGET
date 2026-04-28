import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-expense-list-salary',
  templateUrl: './expenseListSalary.component.html',
  styles: ``
})
export class ExpenseListSalaryComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }


  totalQty: number = 0
  totalAmount: number = 0

  ngOnInit() {
    this.calculateTotal()
  }


  onFileChange(event: any) {

    const file = event.target.files[0]

    console.log(file)

  }

  salary: any = {

    oldQty: 0,
    oldMonth: 0,
    oldYear: 0,

    newQty: 0,
    newMonth: 0,
    newYear: 0

  }

  calculateYear() {

    this.salary.oldYear =
      (Number(this.salary.oldQty) || 0) *
      (Number(this.salary.oldMonth) || 0) *
      12

    this.salary.newYear =
      (Number(this.salary.newQty) || 0) *
      (Number(this.salary.newMonth) || 0) *
      12

    this.calculateTotal()

  }

  calculateTotal() {

    this.totalQty =
      (Number(this.salary.oldQty) || 0) +
      (Number(this.salary.newQty) || 0);

    this.totalAmount =
      (Number(this.salary.oldYear) || 0) +
      (Number(this.salary.newYear) || 0);

  }
}
