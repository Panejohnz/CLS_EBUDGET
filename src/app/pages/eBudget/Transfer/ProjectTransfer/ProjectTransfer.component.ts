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


@Component({
  selector: 'app-project-transfer',
  providers: [GridJsService, DecimalPipe, EbudgetService],

  templateUrl: './ProjectTransfer.component.html',
})
export class ProjectTransferComponent {
  constructor(private modalService: NgbModal) { }
  department = '';
  keyword = '';

  departments = [
    'กองแผนงาน',
    'กองคลัง',
    'กอง IT'
  ];

  rows: any[] = [
    {
      date: '2026-03-01',
      round: '1',
      remark: 'โอนงบเพื่อสนับสนุนโครงการ IT',
      fromDept: 'กองแผนงาน',
      toDept: 'กอง IT',
      expense: 'ค่าพัฒนาระบบ',
      type: 'increase',
      amount: 150000
    },
    {
      date: '2026-03-05',
      round: '2',
      remark: 'ปรับลดงบประมาณส่วนเกิน',
      fromDept: 'กองคลัง',
      toDept: 'กองแผนงาน',
      expense: 'ค่าใช้จ่ายสำนักงาน',
      type: 'decrease',
      amount: 80000
    }
  ];

  // form: any = {
  //   date: '',
  //   round: '',
  //   remark: '',
  //   fromDept: '',
  //   toDept: '',
  //   expense: '',
  //   type: 'increase',
  //   amount: 0
  // };

  // -------------------
  addRow() {
    this.reset();
  }

  save() {
    this.rows.push({ ...this.form });
    this.reset();
  }
  div = false
  edit(row: any) {
    this.div = true
    this.form = { ...row };
  }
  close_detail() {
    this.div = false
  }
  remove(index: number) {
    this.rows.splice(index, 1);
  }

  reset() {
    this.form = {
      date: '',
      round: '',
      remark: '',
      fromDept: '',
      toDept: '',
      expense: '',
      type: 'increase',
      amount: 0
    };
  }
  form: any = {};
  // rows: any[] = [];

  isEdit: boolean = false;
  editIndex: number = -1;
  openAdd(modal: any) {
    this.isEdit = false;

    this.form = {
      fromDept: '',
      project: '',
      projectBudget: null,
      balance: null
    };

    this.modalService.open(modal, { size: 'xl' });
  }

  openEdit(modal: any, row: any, index: number) {
    this.isEdit = true;
    this.editIndex = index;

    this.form = { ...row };

    this.modalService.open(modal, { size: 'xl', backdrop: 'static' });
  }
}