import { Component, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgForm } from '@angular/forms';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormGroup, FormBuilder, FormArray, FormControl, FormControlName, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { GridJsService } from '../../../tables/gridjs/gridjs.service';
import { PaginationService } from 'src/app/core/services/pagination.service';
import { GridJsModel } from '../../../tables/gridjs/gridjs.model';
import { DecimalPipe } from '@angular/common';
import { get } from 'lodash';
import Swal from 'sweetalert2';
import { EbudgetService } from 'src/app/core/services/ebudget.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { FormsModule } from '@angular/forms';
import { ProjectPlanService } from 'src/app/core/services/ProjectPlan.service'
import { BudgetYearService } from 'src/app/core/services/budget-year.service';
@Component({
  selector: 'projectPlanning',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './projectPlanning.component.html'
})
export class ProjectPlanningComponent {
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  griddata: any[] = [
    {
      id: 1,
      department: 'สำนักบริหาร',
      plan: 'พัฒนาบุคลากร',
      output: 'บุคลากรมีศักยภาพเพิ่มขึ้น',
      activity: 'อบรมการใช้ระบบสารสนเทศ',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการอบรมระบบใหม่',
      budget: 50000,
      status_name: 'อนุมัติ',
      status_id: 8
    },
    {
      id: 2,
      department: 'ฝ่ายประชาสัมพันธ์',
      plan: 'สื่อสารองค์กร',
      output: 'ประชาชนรับรู้ข้อมูลข่าวสาร',
      activity: 'จัดทำสื่อประชาสัมพันธ์',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการประชาสัมพันธ์หน่วยงาน',
      budget: 30000,
      status_name: 'ไม่อนุมัติ',
      status_id: 7
    }
  ];
  allData: any[] = [];
  project_planing: any = {
    Department_Id: null,
    projectType: null,
    Plan_Id: null,
    Product_Id: null,
    Activity_Id: null,
    Budget_Type_Id: null,
    Project_Name: '',
    Project_Plan: {}
  };
  modalRef: any;
  total$!: Observable<number>;



  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService, private ProjectPlanService: ProjectPlanService, private budgetYearService: BudgetYearService) {
  }
  currentYear: any
  ngOnInit(): void {
    this.budgetYearService.yearChanged$.subscribe(year => {
      if (year) {
        this.currentYear = year
        this.allData = Array.isArray(this.griddata)
          ? this.griddata
          : [];
        this.griddata = [...this.allData];
      }
    });

  }

  filterSearch() {

    const keyword = (this.service.searchTerm || '').toLowerCase().trim();

    if (!keyword) {
      this.griddata = [...this.allData];
      return;
    }

    this.griddata = this.allData.filter((row: any) =>
      Object.values(row)
        .join(' ')
        .toLowerCase()
        .includes(keyword)
    );
  }
  fullModal(modal: any, data: any) {
    this.currentTab = 1
    this.project_planing = { ...data };

    if (!this.project_planing.planing_Id) {

      const currentYear = new Date().getFullYear() + 543;

      this.project_planing = {
        ...this.emptyplan
      };
    }

    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }

  currentTab = 1;

  goTab(tab: number) {
    this.currentTab = tab;
  }






  deletePlan(data: any) {

  }
  Project_Plan: any
  async savePlan(modal: any) {
    let payload: any
    this.ProjectPlanService.projectPlan$.subscribe(dep => {
      if (dep) {

        payload = {
          BgYear: "2569",
          Department_Id: dep.Department.Department_Id,
          Department_Name: dep.Department.Department_Name,
          Fk_Plan_Id: dep.Plan.Plan_Id,
          Plan_Name: dep.Plan.Plan_Name,
          Fk_Expense_List: dep.Expense.Expense_Id,
          Expense_List: dep.Expense.Expense_Name,
          Fk_Product_Id: dep.Product.Product_Id,
          Product_Name: dep.Product.Product_Name,
          Fk_Activity_Id: dep.Activity.Activity_Id,
          Activity_Name: dep.Activity.Activity_Name,
          Fk_Budget_Type: dep.Budget.Budget_Type_Id,
          Budget_Type: dep.Budget.Budget_Type_Name,
          Project_Name: this.project_planing.Project_Name

        };
      }
    });




    console.log('payload', payload);

    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {
      // 👉 call API ตรงนี้
      // this.service.save(payload)

      let model = {
        FUNC_CODE: "FUNC-Insert_Project_Plan",
        Project_Plan: payload
      }
      var getData = this.serviceebud.GatewayGetData(model);
      getData.subscribe((response: any) => {


        basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
        modal.dismiss();
      })
    }
  }
  randomItem(arr: any[]) {
    return arr[Math.floor(Math.random() * arr.length)];
  }
  addRandomRow() {

    const departments = ['สำนักบริหาร', 'ฝ่ายแผนงาน', 'ฝ่ายประชาสัมพันธ์', 'สำนัก IT'];
    const plans = ['พัฒนาบุคลากร', 'สื่อสารองค์กร', 'เพิ่มประสิทธิภาพระบบ', 'บริการประชาชน'];
    const outputs = [
      'บุคลากรมีศักยภาพเพิ่มขึ้น',
      'ประชาชนรับรู้ข้อมูลข่าวสาร',
      'ระบบทำงานเร็วขึ้น',
      'การให้บริการมีประสิทธิภาพ'
    ];
    const activities = [
      'อบรมการใช้ระบบสารสนเทศ',
      'จัดทำสื่อประชาสัมพันธ์',
      'พัฒนาระบบฐานข้อมูล',
      'จัดประชุมเชิงปฏิบัติการ'
    ];
    const status_name = [

      'รออนุมัติ',
    ]

    const budgetTypes = ['งบดำเนินงาน', 'งบลงทุน', 'งบรายจ่ายอื่น'];

    const newRow = {
      id: this.griddata.length + 1,
      department: this.randomItem(departments),
      plan: this.randomItem(plans),
      output: this.randomItem(outputs),
      activity: this.randomItem(activities),
      budgetType: this.randomItem(budgetTypes),
      project: 'โครงการ ' + Math.floor(Math.random() * 100),
      budget: Math.floor(Math.random() * 90000) + 10000,
      status_name: this.randomItem(status_name),
      status_id: 2
    };

    this.griddata.push(newRow);

  }
  maxTab = 5;

  nextTab() {
    if (this.currentTab < this.maxTab) {
      this.currentTab++;
    }
  }

  prevTab() {
    if (this.currentTab > 1) {
      this.currentTab--;
    }
  }
}
