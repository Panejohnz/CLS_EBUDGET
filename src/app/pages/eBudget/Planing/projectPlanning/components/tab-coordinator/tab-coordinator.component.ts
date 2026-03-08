import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-tab-coordinator',
  templateUrl: './tab-coordinator.component.html',
  styleUrl: './tab-coordinator.component.scss'
})
export class TabCoordinatorComponent {
  items: any[] = [
    {
      name: '',
      phone: '',
      email: '',
      fax: '',
      department: '',
      proposer: '',
      position: ''
    }
  ]
  ngOnInit(): void {
  }

  addContact() {

    this.items.push({
      name: '',
      phone: '',
      email: '',
      department: '',
      proposer: '',
      position: ''
    })

  }

  removeContact(i: number) {
    this.items.splice(i, 1)
  }
}
