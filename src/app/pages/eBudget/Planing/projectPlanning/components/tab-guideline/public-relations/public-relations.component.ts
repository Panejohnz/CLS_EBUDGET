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

  addItem() {

    this.prItems.push({
      name: '',
      duration: 0,
      minute: 0,
      times: 0,
      rate: 0,
      total: 0
    })

  }

  removeItem(i: number) {

    this.prItems.splice(i, 1)

  }
}
