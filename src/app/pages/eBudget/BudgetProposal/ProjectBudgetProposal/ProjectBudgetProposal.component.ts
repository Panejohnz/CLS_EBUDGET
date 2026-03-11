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

@Component({
  selector: 'app-project-budget-proposal',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './ProjectBudgetProposal.component.html',
  styles: ``
})
export class ProjectBudgetProposalComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public servicebud: EbudgetService
    , private authService: AuthenticationService,) {
  }
  allData: any[] = [];
  griddata = [
    {
      department: 'กองแผนงาน',
      plan: 'พัฒนาระบบบริหารจัดการภาครัฐ',
      output: 'ระบบบริหารจัดการข้อมูลกลาง',
      activity: 'พัฒนาระบบ e-Monitoring',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการพัฒนาระบบ e-Budget',
      budget: 2500000,
      status_id: 7,
      status_name: 'ไม่ผ่าน'
    },

    {
      department: 'กองคลัง',
      plan: 'เพิ่มประสิทธิภาพการบริหารงบประมาณ',
      output: 'ระบบติดตามงบประมาณ',
      activity: 'ปรับปรุงระบบรายงานงบประมาณ',
      budgetType: 'งบลงทุน',
      project: 'โครงการพัฒนาระบบรายงานงบ',
      budget: 1800000,
      status_id: 2,
      status_name: 'รอตรวจสอบ'
    },

    {
      department: 'กองเทคโนโลยีสารสนเทศ',
      plan: 'พัฒนาโครงสร้างพื้นฐานดิจิทัล',
      output: 'ระบบคลาวด์ภาครัฐ',
      activity: 'ติดตั้งระบบ Server กลาง',
      budgetType: 'งบลงทุน',
      project: 'โครงการศูนย์ข้อมูลกลาง',
      budget: 5200000,
      status_id: 8,
      status_name: 'อนุมัติแล้ว'
    },

    {
      department: 'กองนโยบาย',
      plan: 'ยกระดับการบริหารนโยบาย',
      output: 'ระบบวิเคราะห์ข้อมูลเชิงนโยบาย',
      activity: 'พัฒนา Dashboard วิเคราะห์ข้อมูล',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการระบบ BI ภาครัฐ',
      budget: 950000,
      status_id: 2,
      status_name: 'รอตรวจสอบ'
    },

    {
      department: 'กองพัสดุ',
      plan: 'เพิ่มประสิทธิภาพการจัดซื้อจัดจ้าง',
      output: 'ระบบจัดซื้อจัดจ้างอิเล็กทรอนิกส์',
      activity: 'พัฒนาระบบ e-Procurement',
      budgetType: 'งบดำเนินงาน',
      project: 'โครงการพัฒนาระบบจัดซื้อจัดจ้าง',
      budget: 1200000,
      status_id: 8,
      status_name: 'อนุมัติแล้ว'
    }
  ];
  modalRef: any;
  total$!: Observable<number>;
  project_budget = {
    projectType: '',
    Budget_Id: 0
  };
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  ngOnInit(): void {
    this.allData = Array.isArray(this.griddata)
      ? this.griddata
      : [];
    this.griddata = [...this.allData];
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

  async CancelSignoff() {
    const userConfirmed = await confirmAlert('info', 'ต้องการ Cancel Singoff โครงการ ?', '');

    if (userConfirmed) {
      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
    }
  }
  async SignOff() {
    const userConfirmed = await confirmAlert('info', 'ต้องการ Singoff โครงการ ?', '');

    if (userConfirmed) {
      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
    }
  }

  fullModal(modal: any, data: any) {


    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    });
  }
  deletePlan(data: any) {

  }

  saveTarget() {

  }
}
