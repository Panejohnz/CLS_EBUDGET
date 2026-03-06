import { Component } from '@angular/core';

@Component({
  selector: 'app-public-relations',
  templateUrl: './public-relations.component.html',
  styleUrl: './public-relations.component.scss'
})
export class PublicRelationsComponent {
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

    this.prItems.splice(i, 1)

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

    let total = 0;

    main.subItems.forEach((s: any) => {
      total += Number(s.total) || 0;
    });

    return total;

  }
}
