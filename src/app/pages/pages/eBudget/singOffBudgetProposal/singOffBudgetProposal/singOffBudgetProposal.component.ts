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
  selector: 'app-sing-off-budget-proposal',
  providers: [GridJsService, DecimalPipe, EbudgetService],
  templateUrl: './singOffBudgetProposal.component.html',
  styles: ``
})
export class SingOffBudgetProposalComponent {
  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public serviceebud: EbudgetService
    , private authService: AuthenticationService,) {
  }
  allData: any[] = [];
  griddata = [
    {
      selected: false,
      department: 'สำนักยุทธศาสตร์',
      plan: 'แผนพัฒนาระบบสารสนเทศ',
      output: 'ระบบบริหารจัดการข้อมูล',
      activity: 'พัฒนาระบบ Dashboard',
      budgetType: 'งบดำเนินงาน',
      project: 'ระบบข้อมูลกลาง',
      budget: 250000,
      Status_Number: 2,
      status_name: 'รออนุมัติ'
    },
    {
      selected: false,
      department: 'กองแผนงาน',
      plan: 'แผนพัฒนาบุคลากร',
      output: 'อบรมเพิ่มทักษะ',
      activity: 'อบรม Data Analytics',
      budgetType: 'งบลงทุน',
      project: 'พัฒนาศักยภาพบุคลากร',
      budget: 120000,
      Status_Number: 8,
      status_name: 'อนุมัติแล้ว'
    }
  ];
  modalRef: any;
  total$!: Observable<number>;

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
  toggleAll(event: any) {
    const checked = event.target.checked;

    this.griddata.forEach(item => {
      item.selected = checked;
    });
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
}

