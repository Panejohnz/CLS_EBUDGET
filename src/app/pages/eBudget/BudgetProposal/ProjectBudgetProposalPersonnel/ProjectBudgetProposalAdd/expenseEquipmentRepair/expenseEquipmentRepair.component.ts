import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-expense-equipment-repair',
  templateUrl: './expenseEquipmentRepair.component.html',
  styles: ``
})
export class ExpenseEquipmentRepairComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  items = [
    { name: '', qty: 0, price: 0, total: 0 }
  ];

  grandTotal = 0;

  addItem() {
    this.items.push({ name: '', qty: 0, price: 0, total: 0 });
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.calculateAll();
  }

  calculate(i: number) {
    const item = this.items[i];
    item.total = (item.qty || 0) * (item.price || 0);
    this.calculateAll();
  }

  calculateAll() {
    this.grandTotal = this.items.reduce((sum, item) => sum + item.total, 0);
  }

  getTotalQty() {
    return this.items.reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  uploadFile(event: any) {
    const file = event.target.files[0];
    console.log(file);
  }

  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
