import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-rent-house',
  templateUrl: './expenseRentHouse.component.html',
  styles: ``
})
export class ExpenseRentHouseComponent {
  @Input() model: any;
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.model.dismiss();
  }
  rentList: any = [
    {
      department: '',
      qty: 0,
      amount: 0
    }
  ]

  departments = [
    { id: 1, name: 'กองคลัง' },
    { id: 2, name: 'กองแผนงาน' },
    { id: 3, name: 'กองเทคโนโลยีสารสนเทศ' }
  ]

  totalQty: number = 0
  totalAmount: number = 0

  file: any = null
  ngOnInit() {

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [
        {
          department: null,
          qty: 0,
          amount: 0
        }
      ];

    }

    this.calculateTotal();

  }
  addRow() {

    this.model.Budget_Request_Detail_Item.push({
      department: null,
      qty: 0,
      amount: 0
    });

  }

  removeRow(i: number) {

    this.model.Budget_Request_Detail_Item.splice(i, 1);

    this.calculateTotal();

  }

  calculateTotal() {

    this.totalQty =
      this.model.Budget_Request_Detail_Item.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.qty) || 0),
        0
      );

    this.totalAmount =
      this.model.Budget_Request_Detail_Item.reduce(
        (sum: number, row: any) =>
          sum + (Number(row.amount) || 0),
        0
      );

  }

  onFileChange(event: any) {

    this.file = event.target.files[0]

  }

  save() {

    if (!this.file) {
      alert('กรุณาแนบไฟล์')
      return
    }

    console.log(this.rentList)

  }
}
