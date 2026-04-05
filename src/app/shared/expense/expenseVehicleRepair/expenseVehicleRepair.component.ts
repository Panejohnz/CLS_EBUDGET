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
  items = [
    {
      name: '',
      customName: '',
      quantity: 0,
      price: 0
    }
  ];
  onSelectChange(item: any) {
    // ถ้าไม่ใช่ "อื่นๆ" → ล้างค่า custom
    if (item.name !== 'อื่นๆ') {
      item.customName = '';
    }
  }
  // เพิ่มรายการ
  addItem() {
    this.items.push({ name: '', quantity: 1, price: 0, customName: '' });
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
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.modal.dismiss();

    }
  }
}
