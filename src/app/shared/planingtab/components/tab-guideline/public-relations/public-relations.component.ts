import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-public-relations',
  templateUrl: './public-relations.component.html',
  styleUrl: './public-relations.component.scss'
})
export class PublicRelationsComponent {
  @Input() project_planing: any

  closeModal() {
    this.project_planing.dismiss();
  }
  prItems: any[] = [
    {
      name: '',
      duration: 0,
      minute: 0,
      times: 0,
      rate: 0,
      total: 0
    }
  ]
  mainItems: any[] = [
    {
      name: '',
      subItems: [
        {
          name: '',
          duration: 0,
          minute: 0,
          times: 0,
          rate: 0,
          total: 0
        }
      ]
    }
  ];
  addItem() {

    this.mainItems.push({
      name: '',
      subItems: [
        {
          name: '',
          duration: 0,
          minute: 0,
          times: 0,
          rate: 0,
          total: 0
        }
      ]
    });

  }

  removeItem(i: number) {
    this.mainItems.splice(i, 1)
  }

  addSubItem(item: any) {

    item.subItems.push({
      name: '',
      duration: 0,
      minute: 0,
      times: 0,
      rate: 0,
      total: 0
    });

  }
  removeSubItem(item: any, index: number) {

    item.subItems.splice(index, 1);

  }
  getMainTotal(main: any) {
    return main.subItems.reduce((sum: number, sub: any) => {
      const duration = Number(sub.duration) || 0;
      const minute = Number(sub.minute) || 0;
      const times = Number(sub.times) || 0;
      const rate = Number(sub.rate) || 0;

      return sum + (duration * minute * times * rate);
    }, 0);
  }
  calculateSubTotal(sub: any) {
    const duration = Number(sub.duration) || 0;
    const minute = Number(sub.minute) || 0;
    const times = Number(sub.times) || 0;
    const rate = Number(sub.rate) || 0;

    sub.total = duration * minute * times * rate;
  }
  getGrandTotal() {
    return this.mainItems.reduce((sum: number, main: any) => {
      return sum + this.getMainTotal(main);
    }, 0);
  }
  save() {
    basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
    this.project_planing.dismiss();
  }
}
