import { Component, Input, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-investment-budget',
  templateUrl: './investment-budget.component.html',
  styleUrl: './investment-budget.component.scss'
})
export class InvestmentBudgetComponent {
  @Input() project_planing: any

  constructor(private modalService: NgbModal) { }
  @ViewChild('replaceModal') replaceModal: any;
  closeModal() {
    this.project_planing.dismiss();
  }
  items: any[] = [
    {
      name: '',
      standard: false,
      nonStandard: false,
      price: 0,
      qty: 0,
      new: false,
      replace: false


    }
  ]
  get totalBudget(): number {
    return this.items.reduce((sum, item) => {
      const qty = Number(item.qty) || 0;
      const price = Number(item.price) || 0;
      return sum + (qty * price);
    }, 0);
  }
  addItem() {

    this.items.push({
      name: '',
      standard: false,
      nonStandard: false,
      price: 0,
      qty: 0,
      requestQty: 0,
      reason: '',
      spec: '',
      files: []
    })

  }

  onFileChange(event: any, index: number) {

    const files = event.target.files

    this.items[index].files = files

  }
  removeItem(i: number) {

    this.items.splice(i, 1)

  }
  selectedItem: any;
  generateReplaceRows(item: any) {

    const qty = Number(item.qty) || 0;

    if (!item.replaceList) {
      item.replaceList = [];
    }

    while (item.replaceList.length < qty) {
      item.replaceList.push({
        year: '',
        assetNumber: ''
      });
    }

    while (item.replaceList.length > qty) {
      item.replaceList.pop();
    }

  }
  openReplacePopup(item: any) {

    this.selectedItem = item;

    const qty = Number(item.qty) || 0;
    if (qty === 0) {
      basicAlert('info', 'กรุณาระบุจำนวน', '');
      return
    }
    if (!item.replaceList || item.replaceList.length !== qty) {
      this.generateReplaceRows(item);
    }

    this.modalService.open(this.replaceModal, { size: 'lg' });

  }

  save() {
    basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
    this.project_planing.dismiss();
  }
}
