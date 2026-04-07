import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'MasProjectPlan',
  templateUrl: './MasProjectPlan.component.html',
  styles: ``
})
export class MasProjectPlanComponent {
  projectPlanList: any[] = [];
  Mas_Project_Plan: any = {};
  modalRef: any;

  emptyData = {
    Project_Plan_Id: null,
    BgYear: new Date().getFullYear() + 543,
    Project_Plan_Name: '',
    Project_Plan_Short_Name: '',
    Order_Seq: 1,
    Create_Date: new Date(),
    Create_User: 'Admin',
    Active: 1
  };

  constructor(private modalService: NgbModal) { }

  fullModal(modal: any, data: any) {

    if (data) {
      this.Mas_Project_Plan = { ...data };
    } else {
      this.Mas_Project_Plan = { ...this.emptyData };
    }

    this.modalRef = this.modalService.open(modal, {
      size: 'lg',
      backdrop: 'static'
    });
  }

  saveProjectPlan() {

    this.Mas_Project_Plan.Active = this.Mas_Project_Plan.Active ? 1 : 0;

    if (this.Mas_Project_Plan.Project_Plan_Id) {

      const index = this.projectPlanList.findIndex(
        x => x.Project_Plan_Id === this.Mas_Project_Plan.Project_Plan_Id
      );

      this.projectPlanList[index] = this.Mas_Project_Plan;

    } else {

      this.Mas_Project_Plan.Project_Plan_Id = Date.now();
      this.projectPlanList.push(this.Mas_Project_Plan);

    }

    this.modalRef.close();
  }

  delete(item: any) {
    this.projectPlanList = this.projectPlanList.filter(
      x => x.Project_Plan_Id !== item.Project_Plan_Id
    );
  }
}
