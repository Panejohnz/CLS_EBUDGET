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

    console.log('Coordinator (from parent)', this.model.Project_Coordinator);
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

  removeContact(i: number) {

    this.model.Project_Coordinator.splice(i, 1);

    if (this.model.Project_Coordinator.length === 0) {
      this.addContact();
    }

  }
}