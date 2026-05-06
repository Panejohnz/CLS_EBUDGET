import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-expense-list-salary',
  templateUrl: './expenseListSalary.component.html',
  styles: ``
})
export class ExpenseListSalaryComponent {
  @Input() model: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.model.dismiss();
  }


  totalQty: number = 0;
  totalAmount: number = 0;

  ngOnInit() {
    this.calculateAll();
  }

  onFileChange(event: any) {

    const file = event.target.files[0];

    console.log(file);

  }

  calculateAll() {

    const oldQty = Number(this.model.oldQty) || 0;
    const newQty = Number(this.model.newQty) || 0;

    const oldMonth = Number(this.model.oldMonth) || 0;
    const newMonth = Number(this.model.newMonth) || 0;

    // expense type 5 = คำนวณรายเดือน x 12
    if (this.model.selectedExpenseTypeId == 5) {

      this.model.oldYear = oldQty * oldMonth * 12;
      this.model.newYear = newQty * newMonth * 12;

    }

    const oldYear = Number(this.model.oldYear) || 0;
    const newYear = Number(this.model.newYear) || 0;

    this.totalQty = oldQty + newQty;

    this.totalAmount = oldYear + newYear;

  }
}
