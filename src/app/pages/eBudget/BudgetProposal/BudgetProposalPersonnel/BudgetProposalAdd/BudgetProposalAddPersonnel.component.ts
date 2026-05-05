import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EbudgetService } from 'src/app/core/services/ebudget.service'
@Component({
  selector: 'app-project-budget-proposal-add',
  templateUrl: './BudgetProposalAdd.component.html',
  styles: ``
})
export class ProjectBudgetProposalAddPersonnelComponent {
  @Input() model: any;
  constructor(private modalService: NgbModal, public serviceebud: EbudgetService) { }
  closeModal() {
    this.model.dismiss();
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
  targetList: any = [
    {
      oct: 0, nov: 0, dec: 0,
      jan: 0, feb: 0, mar: 0,
      apr: 0, may: 0, jun: 0,
      jul: 0, aug: 0, sep: 0
    }
  ]
  unit = ''
  isIndicator = false

  Mas_Department_Lists: any[] = []
  Mas_Plan_Lists: any[] = []
  Mas_Expense_Lists: any[] = []
  Mas_Product: any[] = []
  Mas_Activity: any[] = []
  Mas_Budget_Types: any[] = []
  Mas_Expense_Group: any[] = []
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
    let model = {
      FUNC_CODE: "FUNC-GET_Mas_General",
      BgYear: "2569"
    };

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Department_Lists = res.Mas_Department_Lists || [];
      this.Mas_Plan_Lists = res.Mas_Plan_Lists || [];
      this.Mas_Expense_Lists = res.Mas_Expense_Lists || [];

    });

    this.Get_Dropdown_list()
  }
  ngOnChanges() {


    if (this.model?.Project_Id) {
      this.mapInitialData();
    }
  }
  mapInitialData() {

    const find = (list: any[], key: string, value: any) =>
      list.find(x => x[key] == value);

    this.model.selectedDepartment =
      find(this.Mas_Department_Lists, 'Department_Id', this.model.Department_Id);

    this.model.projectType =
      find(this.Mas_Expense_Lists, 'Expense_Id', this.model.Fk_Expense_List);

    this.model.selectedPlan =
      find(this.Mas_Plan_Lists, 'Plan_Id', this.model.Fk_Plan_Id);

    // 🔥 chain load ต่อ
    if (this.model.projectType) {
      this.Onchange_type();
    }

    if (this.model.selectedPlan) {
      this.Onchange_type_Plan();
    }
  }
  Onchange_type() {


    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type_Main",
    };


    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Budget_Types = res.Mas_Budget_Type_Lists || [];

    });
  }
  Onchange_type_Plan() {

    if (!this.model.selectedPlan) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Product",
      Mas_Plan: {
        Plan_Id: this.model.selectedPlan.Plan_Id
      }
    };

    this.model.Fk_Plan_Id = this.model.selectedPlan.Plan_Id;

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Product = res.Mas_Product_Lists || [];

      // 👉 map product ตอน edit
      if (this.model.Fk_Product_Id) {
        this.model.selectedProduct =
          this.Mas_Product.find(x => x.Product_Id == this.model.Fk_Product_Id);
      }

      // 👉 load activity ต่อ
      if (this.model.selectedProduct) {
        this.Onchange_type_Product();
      }
    });
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


        } else {
          basicAlert('warning', 'ผิดพลาด', '');
        }

      });
    let model2 = {
      FUNC_CODE: "FUNC-GET_Mas_Budget_Type_Main",
    };


    this.serviceebud.GatewayGetData(model2).subscribe((res: any) => {

      this.Mas_Budget_Types = res.Mas_Budget_Type_Lists || [];

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
        // this.subActivityOptions = (response.Mas_Expense_Types || []).map((x: any) => ({
        //   id: x.Expense_Type_Id,
        //   name: x.Expense_Type_Name
        // }));

        // this.subUnitActivityOptions = (response.Mas_Budget_Types || []).map((x: any) => ({
        //   id: x.Budget_Type_Id,
        //   name: x.Budget_Type_Name
        // }));

        this.plan.subActivity = item.Fk_Expense_Type_Id;
        this.plan.subUnitActivity = item.Fk_Budget_Type_Id;
        this.formTitle = item.Expense_Name
      })

  }

  Onchange_type_Product() {

    if (!this.model.selectedProduct) return;

    let model = {
      FUNC_CODE: "FUNC-GET_Mas_Activity",
      Mas_Product: {
        Product_Id: this.model.selectedProduct.Product_Id
      }
    };

    this.model.Fk_Product_Id = this.model.selectedProduct.Product_Id;

    this.serviceebud.GatewayGetData(model).subscribe((res: any) => {

      this.Mas_Activity = res.Mas_Activity_Lists || [];

      // 👉 map activity ตอน edit
      if (this.model.Fk_Activity_Id) {
        this.model.selectedActivity =
          this.Mas_Activity.find(x => x.Activity_Id == this.model.Fk_Activity_Id);
      }
    });
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
  async save() {
    const userConfirmed = await confirmAlert('info', 'ต้องการบันทึกข้อมูล ?', '');

    if (userConfirmed) {

      basicAlert('success', 'บันทึกข้อมูลแล้ว', '')
      this.model.dismiss();

    }
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
