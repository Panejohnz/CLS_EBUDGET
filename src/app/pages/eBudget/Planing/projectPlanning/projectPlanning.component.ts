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
import { EmonitorService } from 'src/app/core/services/emonitor.service';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'projectPlanning',
  providers: [GridJsService, DecimalPipe, EmonitorService],
  templateUrl: './projectPlanning.component.html'
})
export class ProjectPlanningComponent {
  emptyplan: any = {
    Plan_Id: 0,
    Plan_Name: '',
    Active: 1
  };
  griddata: any[] = [];
  allData: any[] = [];
  project_planing: any = {};
  modalRef: any;
  total$!: Observable<number>;
  constructor(private modalService: NgbModal, public service: GridJsService
    , private sortService: PaginationService, public serviceemo: EmonitorService
    , private authService: AuthenticationService,) {
  }
  ngOnInit(): void {

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

    this.project_planing = { ...data };

    if (!this.project_planing.planing_Id) {

      const currentYear = new Date().getFullYear() + 543;

      this.project_planing = {
        ...this.emptyplan
      };
    }

    this.modalRef = this.modalService.open(modal, { size: 'lg', backdrop: 'static' });
  }
  deletePlan(data: any) {

  }
  savePlan() {

  }
}
