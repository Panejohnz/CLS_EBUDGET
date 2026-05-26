import {
  Component,
  OnInit
} from '@angular/core';

import {
  NgbModal
} from '@ng-bootstrap/ng-bootstrap';

import {
  GridJsService
} from '../../../tables/gridjs/gridjs.service';

import {
  PaginationService
} from 'src/app/core/services/pagination.service';

import {
  DecimalPipe
} from '@angular/common';

import {
  EbudgetService
} from 'src/app/core/services/ebudget.service';

import {
  AuthenticationService
} from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-project-transfer',
  providers: [
    GridJsService,
    DecimalPipe,
    EbudgetService
  ],
  templateUrl: './ProjectTransfer.component.html',
  styles: ``
})
export class ProjectTransferComponent
  implements OnInit {

  constructor(
    private modalService: NgbModal,
    public service: GridJsService,
    private sortService: PaginationService,
    public servicebud: EbudgetService,
    private authService: AuthenticationService
  ) { }

  department = '';

  keyword = '';

  rows: any[] = [];

  departments: any[] = [];

  plans: any[] = [];

  form: any = {};

  isEdit = false;

  editIndex = -1;

  ngOnInit(): void {

    this.getData();

  }

  getData() {

    let model = {

      FUNC_CODE:
        'FUNC-GET_TRANSFER'

    };

    this.servicebud
      .GatewayGetData(model)
      .subscribe((response: any) => {

        this.rows =

          response
            ?.Budget_Plan_Transfer ||

          [];

        this.departments =

          response
            ?.Mas_Department_Lists ||

          [];

        this.plans =

          response
            ?.Mas_Plan_Lists ||

          [];

        console.log(
          'TRANSFER',
          this.rows
        );

      });

  }

  openAdd(modal: any) {

    this.isEdit = false;

    this.editIndex = -1;

    this.reset();

    this.modalService.open(
      modal,
      {
        size: 'xl',
        backdrop: 'static'
      }
    );

  }

  openEdit(
    modal: any,
    row: any,
    index: number
  ) {

    this.isEdit = true;

    this.editIndex = index;

    this.form = {

      ...row

    };

    this.modalService.open(
      modal,
      {
        size: 'xl',
        backdrop: 'static'
      }
    );

  }

  save() {

    const payload = {

      Transfer_Id:
        this.form.Transfer_Id || 0,

      BgYear:
        this.form.BgYear || 2569,

      Transfer_Date:
        this.form.Transfer_Date,

      Transfer_Doc_Number:
        this.form.Transfer_Doc_Number,

      Transfer_Doc_Date:
        this.form.Transfer_Doc_Date,

      Transfer_Count:
        this.form.Transfer_Count,

      From_Department_Id:
        this.form.From_Department_Id || 0,

      From_Department_Name:
        this.form.From_Department_Name || '',

      From_Plan_Id:
        this.form.From_Plan_Id || 0,

      From_Plan_Name:
        this.form.From_Plan_Name || '',

      To_Department_Id:
        this.form.To_Department_Id || 0,

      To_Department_Name:
        this.form.To_Department_Name || '',

      To_Plan_Id:
        this.form.To_Plan_Id || 0,

      To_Plan_Name:
        this.form.To_Plan_Name || '',

      Transfer_Description:
        this.form.Transfer_Description || '',

      Transfer_Amount:
        Number(
          this.form.Transfer_Amount || 0
        ),

      Active: true,

      Create_User:
        this.authService
          ?.currentUserValue
          ?.UserName || ''

    };

    const model = {

      FUNC_CODE:

        this.isEdit

          ? 'FUNC-UPDATE_TRANSFER'

          : 'FUNC-INSERT_TRANSFER',

      Budget_Plan_Transfer:
        payload

    };

    console.log(
      'SAVE',
      model
    );

    this.servicebud
      .GatewayGetData(model)
      .subscribe({

        next: (response: any) => {

          basicAlert(
            'success',
            'บันทึกสำเร็จ',
            ''
          );

          this.getData();

          this.reset();

        },

        error: (err: any) => {

          console.error(err);

          basicAlert(
            'error',
            'บันทึกไม่สำเร็จ',
            ''
          );

        }

      });

  }

  async remove(index: number) {
    const userConfirmed = await confirmAlert('info', 'ต้องการลบข้อมูล ?', '');

    if (userConfirmed) {

      const model = {
        FUNC_CODE: "FUNC-Delete_Transfer",

        Transfer_Id: index
      };

      this.servicebud.GatewayGetData(model).subscribe(async () => {
        basicAlert('success', 'บันทึกข้อมูลแล้ว', '');

      });
    }

  }

  reset() {

    this.form = {

      Transfer_Id: 0,

      BgYear: 2569,

      Transfer_Date: '',

      Transfer_Doc_Number: '',

      Transfer_Doc_Date: '',

      Transfer_Count: '',

      From_Department_Id: 0,

      From_Department_Name: '',

      From_Plan_Id: 0,

      From_Plan_Name: '',

      To_Department_Id: 0,

      To_Department_Name: '',

      To_Plan_Id: 0,

      To_Plan_Name: '',

      Transfer_Description: '',

      Transfer_Amount: 0,

      Active: true

    };

  }

}