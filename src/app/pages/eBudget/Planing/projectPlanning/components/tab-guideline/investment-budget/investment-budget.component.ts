import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-investment-budget',
  templateUrl: './investment-budget.component.html',
  styleUrl: './investment-budget.component.scss'
})
export class InvestmentBudgetComponent {
  @Input() modal: any;

  closeModal() {
    this.modal.dismiss();
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
  generateReplaceRows(item: any) {

    const qty = Number(item.qty) || 0;

    item.replaceList = [];

    for (let i = 0; i < qty; i++) {

      item.replaceList.push({
        year: '',
        assetNumber: ''
      });

    }

  }
  onFileChange(event: any, index: number) {

    const files = event.target.files

    this.items[index].files = files

  }
  removeItem(i: number) {

    this.items.splice(i, 1)

  }
  save() {
    basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
    this.modal.dismiss();
  }
}
