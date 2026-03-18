import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
interface RepairItem {
  name: string;
  quantity: number;
  price: number;
}
@Component({
  selector: 'app-expense-vehicle-repair',
  templateUrl: './expenseVehicleRepair.component.html',
  styles: ``
})
export class ExpenseVehicleRepairComponent {
  @Input() modal: any;
  @Input() expenseItem: any
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  items: RepairItem[] = [
    { name: '', quantity: 1, price: 0 }
  ];

  // เพิ่มรายการ
  addItem() {
    this.items.push({ name: '', quantity: 1, price: 0 });
  }

  // ลบรายการ
  removeItem(index: number) {
    this.items.splice(index, 1);
  }

  // คำนวณราคารวมต่อแถว
  getTotal(item: RepairItem): number {
    return item.quantity * item.price;
  }

  // คำนวณรวมทั้งหมด
  getGrandTotal(): number {
    return this.items.reduce((sum, item) => sum + this.getTotal(item), 0);
  }
}
