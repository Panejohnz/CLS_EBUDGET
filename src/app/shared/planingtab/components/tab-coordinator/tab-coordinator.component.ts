import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-tab-coordinator',
  templateUrl: './tab-coordinator.component.html',
  styleUrl: './tab-coordinator.component.scss'
})
export class TabCoordinatorComponent implements OnChanges {

  @Input() model: any;

  get items() {
    return this.model?.Project_Coordinator || [];
  }

  ngOnChanges(changes: SimpleChanges): void {

    if (!this.model) return;

    if (!this.model.Project_Coordinator) {
      this.model.Project_Coordinator = [];
    }

    if (this.model.Project_Coordinator.length === 0) {
      this.model.Project_Coordinator.push({
        Coordinator_Id: 0,
        Full_Name: '',
        Phone: '',
        Email: '',
        Fax: ''
      });
    }
  }

  addContact() {

    this.model.Project_Coordinator.push({
      Coordinator_Id: 0,
      Full_Name: '',
      Phone: '',
      Email: '',
      Fax: ''
    });

  }

  async removeContact(i: number) {

    const userConfirmed = await confirmAlert('info', '\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e32\u0e23\u0e25\u0e1a\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25 ?', '');

    if (!userConfirmed) {
      return;
    }

    this.model.Project_Coordinator.splice(i, 1);

    if (this.model.Project_Coordinator.length === 0) {
      this.addContact();
    }

  }
}