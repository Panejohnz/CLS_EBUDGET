import { Component, Input } from '@angular/core';


@Component({
  selector: 'app-tab-coordinator',
  templateUrl: './tab-coordinator.component.html',
  styleUrl: './tab-coordinator.component.scss'
})
export class TabCoordinatorComponent {
  @Input() model: any
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
      fax: ''
    })
  }

  removeContact(i: number) {
    this.items.splice(i, 1)
  }
}
