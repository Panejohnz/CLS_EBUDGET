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

  async removeItem(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }
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
  async removeSubItem(item: any, index: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

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
