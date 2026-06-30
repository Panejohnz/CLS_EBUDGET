import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
@Component({
  selector: 'MasProjectPlan',
  templateUrl: './MasProjectPlan.component.html',
  styleUrls: ['./MasProjectPlan.component.scss']
})
export class MasProjectPlanComponent {
  projectPlanList: any[] = [];
  Mas_Project_Plan: any = {};
  modalRef: any;

  menuItems = [
    {
      no: 1,
      title: 'ยุทธศาสตร์ชาติที่เกี่ยวข้องโดยตรง (Z)',
      path: '/MasterData/MasProjectPlan/NationalStrategyZ',
      icon: 'ri-flag-line'
    },
    {
      no: 2,
      title: 'ความสอดคล้องกับแผนแม่บทภายใต้ยุทธศาสตร์ชาติ (Y)',
      path: '/MasterData/MasProjectPlan/MasterPlanY',
      icon: 'ri-book-open-line'
    },
    {
      no: 3,
      title: 'แผนพัฒนาเศรษฐกิจและสังคมแห่งชาติ',
      path: '/MasterData/MasProjectPlan/NationalSocialDevelopmentPlan',
      icon: 'ri-community-line'
    },
    {
      no: 4,
      title: 'ความสอดคล้องกับแผนปฏิบัติการราชการ ป.ป.ท. (แผน 5 ปี)',
      path: '/MasterData/MasProjectPlan/NationalEconomicDevelopmentPlan',
      icon: 'ri-line-chart-line'
    },
    {
      no: 5,
      title: 'ความสอดคล้องกับแผนปฏิบัติการราชการ ป.ป.ท. (แผน 1 ปี)',
      path: '/MasterData/MasProjectPlan/MinistryActionPlan',
      icon: 'ri-calendar-check-line'
    },
    {
      no: 6,
      title: 'ความสอดคล้องกับเป้าหมาย SDGs',
      path: '/MasterData/MasProjectPlan/SDGsPlan',
      icon: 'ri-global-line'
    },
      {
      no: 7,
      title: 'ความสอดคล้องกับแผนปฏิบัติการด้าน',
      path: '/MasterData/MasProjectPlan/MasterPlan5',
      icon: 'ri-briefcase-2-line'
    }
  ];

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

  constructor(
    private modalService: NgbModal,
    private router: Router
  ) { }

  goToSubPage(path: string) {
    this.router.navigateByUrl(path);
  }

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
