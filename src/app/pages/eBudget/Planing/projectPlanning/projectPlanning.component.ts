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
    Active: 1,

    // 🔥 เพิ่มทั้งหมดนี้
    selectedDepartment: null,
    projectType: null,
    selectedPlan: null,
    selectedProduct: null,
    selectedActivity: null,
    selectedBudget: null,

    Used_BG: null,
    Project_Type_Id: null,
    totalYears: null,
    currentYear: null,
    Operation1: 0,
    Operation2: 0
  };
  griddata: any[] = [
  ];
  allData: any[] = [];
  project_planing: any = {
    Department_Id: null,
    Fk_Expense_Type: null,
    Fk_Plan_Id: null,
    Fk_Product_Id: null,
    Fk_Activity_Id: null,
    Fk_Budget_Type: null,
    Project_Name: '',
    Project_Plan: {
      detail: {},
      alignment: {}
    }
  };
  modalRef: any;
  total$!: Observable<number>;
  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Budget_Types: any[] = []


  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService, private ProjectPlanService: ProjectPlanService, private budgetYearService: BudgetYearService) {
  }
  currentYear: any
  ngOnInit(): void {

    this.get_data()

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
  get_data() {
    let model = {
      FUNC_CODE: "FUNC-Get_Project_Plan",
    }
    var getData = this.serviceebud.GatewayGetData(model);
    getData.subscribe((response: any) => {
      console.log('sa', response);

      this.allData = Array.isArray(response.List_Project_Plan_Data_Table.Data)
        ? response.List_Project_Plan_Data_Table.Data
        : [];
      this.griddata = [...this.allData];

    })
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
    this.currentTab = 1;

    if (data?.Project_Id) {
      this.project_planing = {
        ...data,

        selectedDepartment: data.Department_Id,
        projectType: data.Fk_Expense_Type,
        selectedPlan: data.Fk_Plan_Id,
        selectedProduct: data.Fk_Product_Id,
        selectedActivity: data.Fk_Activity_Id,
        selectedBudget: data.Fk_Budget_Type,
      };
      console.log('ss', this.project_planing);

    } else {
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
  firstLoad = true;

  goTab(tab: number) {
    this.currentTab = tab;
    this.firstLoad = false; // 👈 พอกดครั้งแรก จบโหมดเริ่มต้น
  }

  async deletePlan(data: any) {

    const userConfirmed = await confirmAlert('info', 'ต้องการลบข้อมูล ?', '');

    if (userConfirmed) {
      const payload = {
        Project_Id: data.Project_Id,
      }
      const model = {
        FUNC_CODE: "FUNC-Delete_Project_Plan",

        Project_Plan: payload
      };

      this.serviceebud.GatewayGetData(model).subscribe(async () => {
        basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
        this.get_data();

      });
    }

  }
  Project_Plan: any
  async savePlan(modal: any) {
    console.log('save', this.project_planing.Project_Plan);
    const getId = (obj: any, key: string) =>
      typeof obj === 'object' ? obj?.[key] : obj;

    const payload = {
      BgYear: "2569",
      Project_Id: this.project_planing.Project_Id,

      Department_Id: getId(this.project_planing.selectedDepartment, 'Department_Id'),
      Department_Name: this.project_planing.selectedDepartment?.Department_Name,

      Fk_Plan_Id: getId(this.project_planing.selectedPlan, 'Plan_Id'),
      Plan_Name: this.project_planing.selectedPlan?.Plan_Name,

      Fk_Expense_List: getId(this.project_planing.projectType, 'Expense_Id'),
      Expense_List: this.project_planing.projectType?.Expense_Name,

      Fk_Product_Id: getId(this.project_planing.selectedProduct, 'Product_Id'),
      Product_Name: this.project_planing.selectedProduct?.Product_Name,

      Fk_Activity_Id: getId(this.project_planing.selectedActivity, 'Activity_Id'),
      Activity_Name: this.project_planing.selectedActivity?.Activity_Name,

      Fk_Budget_Type: getId(this.project_planing.selectedBudget, 'Budget_Type_Id'),
      Budget_Type: this.project_planing.selectedBudget?.Budget_Type_Name,

      Project_Name: this.project_planing.Project_Name,
      Used_BG: this.project_planing.Used_BG,
      Project_Type_Id: this.project_planing.Project_Type_Id,

      Project_Year_Count: this.project_planing.Project_Year_Count,
      Project_Year_Number: this.project_planing.Project_Year_Number,

      Operation1: this.project_planing.Operation1,
      Operation2: this.project_planing.Operation2
    };

    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (!userConfirmed) return;

    const model = {
      FUNC_CODE: this.project_planing.Project_Id > 0
        ? "FUNC-Update_Project_Plan"
        : "FUNC-Insert_Project_Plan",
      Project_Plan: payload,

      Project_Detail: this.project_planing.Project_Plan?.detail,

      Project_Objective: this.project_planing.Project_Plan?.detail?.objectives,

      Project_SubStrategy: this.project_planing.Project_Plan?.alignment?.subStrategies,

      Project_Cabinet: this.project_planing.Project_Plan?.alignment?.cabinetList

    };

    this.serviceebud.GatewayGetData(model).subscribe(() => {
      basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
      this.get_data();
      modal.dismiss();
    });
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
