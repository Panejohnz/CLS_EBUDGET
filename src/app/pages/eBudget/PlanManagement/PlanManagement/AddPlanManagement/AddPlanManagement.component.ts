import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'

@Component({
  selector: 'app-add-plan-management',
  templateUrl: './AddPlanManagement.component.html',
  styles: ``
})
export class AddPlanManagementComponent {
  @Input() modal: any;
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.modal.dismiss();
  }
  project_budget: any
  plan: any = {
    projectName: '',
    unit: '',
    totalTarget: 0,
    month: {
      oct: 0, nov: 0, dec: 0,
      jan: 0, feb: 0, mar: 0,
      apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0
    }
  }

  unit = ''
  isIndicator = false

  targetList: any = [
    {
      oct: 0, nov: 0, dec: 0,
      jan: 0, feb: 0, mar: 0,
      apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0
    }
  ]


  planOptions = [
    { id: 1, name: 'แผนงาน 1' },
    { id: 2, name: 'แผนงาน 2' }
  ];

  outputOptions = [
    { id: 1, name: 'ผลผลิต 1' },
    { id: 2, name: 'ผลผลิต 2' }
  ];

  mainDeptActivityOptions = [
    { id: 1, name: 'กิจกรรมหลักกรม 1' },
    { id: 2, name: 'กิจกรรมหลักกรม 2' }
  ];

  mainUnitActivityOptions = [
    { id: 1, name: 'กิจกรรมหลักหน่วยงาน 1' },
    { id: 2, name: 'กิจกรรมหลักหน่วยงาน 2' }
  ];

  subUnitActivityOptions = [
    { id: 1, name: 'กิจกรรมรองหน่วยงาน 1' },
    { id: 2, name: 'กิจกรรมรองหน่วยงาน 2' }
  ];

  subActivityOptions = [
    { id: 1, name: 'กิจกรรมย่อย 1' },
    { id: 2, name: 'กิจกรรมย่อย 2' }
  ];
  expenseItem: any = null
  div_modal = false
  mapExpenseType(id: number): string {

    const map: any = {
      56: 'computer',
      57: 'vehicle',
      58: 'media',
      59: 'household',
      60: 'electric',
      61: 'office',
      62: 'innovation',
      63: 'other'
    };

    return map[id] || 'other';
  }
  div_list(expenseItem: any) {
    this.div_modal = true
  }
  expenseOptions: any[] = [];
  ngOnInit(): void {
    this.Get_Dropdown_list()
  }
  openTargetModal(content: any) {

    // ถ้ายังไม่มีรายการ ให้สร้าง default 1 รายการ
    if (this.targetList.length === 0) {
      this.addTargetRow();
    }

    this.modalService.open(content, {
      fullscreen: true
    });

  }
  Get_Dropdown_list() {
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Expense_List",
      Mas_Expense_List: {
        Fk_Expense_Type_Id: 1
      }
    };

    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {

        if (response.RESULT == null) {

          this.expenseOptions = Array.isArray(response.Mas_Expense_Lists)
            ? response.Mas_Expense_Lists
            : [];
          this.subActivityOptions = response.Mas_Expense_Types.map((x: any) => ({
            id: x.Expense_Type_Id,
            name: x.Expense_Type_Name
          }));
          this.subUnitActivityOptions = response.Mas_Budget_Type.map((x: any) => ({
            id: x.Budget_Type_Id,
            name: x.Budget_Type_Name
          }));
        } else {
          basicAlert('warning', 'ผิดพลาด', '');
        }

      });

  }
  onExpenseChange(item: any) {
    if (!item) return;
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Sub_List",
      Mas_Expense_Type: {
        Fk_Budget_Type_Id: this.expenseItem.Expense_Id
      },
      Mas_Budget_Type: {
        Budget_Type_Id: this.expenseItem.Expense_Id
      }
    };
    this.serviceebud.GatewayGetData(model)
      .subscribe((response: any) => {
        this.subActivityOptions = (response.Mas_Expense_Types || []).map((x: any) => ({
          id: x.Expense_Type_Id,
          name: x.Expense_Type_Name
        }));

        this.subUnitActivityOptions = (response.Mas_Budget_Types || []).map((x: any) => ({
          id: x.Budget_Type_Id,
          name: x.Budget_Type_Name
        }));

        this.plan.subActivity = item.Fk_Expense_Type_Id;
        this.plan.subUnitActivity = item.Fk_Budget_Type_Id;
        this.formTitle = item.Expense_Name
      })

  }
  addTargetRow() {

    this.targetList.push({
      oct: null,
      nov: null,
      dec: null,
      jan: null,
      feb: null,
      mar: null,
      apr: null,
      may: null,
      jun: null,
      jul: null,
      aug: null,
      sep: null
    });

  }
  saveTarget() {

  }

  formTitle: any

  change_expense() {

  }

  modalRef: any

  fullModal(modal: any) {

    this.modalRef = this.modalService.open(modal, {
      backdrop: 'static',
      windowClass: 'modal-95'
    })
  }
}
