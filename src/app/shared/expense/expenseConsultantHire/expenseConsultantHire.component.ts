import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-expense-consultant-hire',
  templateUrl: './expenseConsultantHire.component.html',
  styles: ``
})
export class ExpenseConsultantHireComponent {

  @Input() modal: any;
  @Input() expenseItem: any;
  @Input() model: any;

  closeModal() {
    this.modal.dismiss();
  }

  mainStaff: any[] = []
  supportStaff: any[] = []
  otherCost: any[] = []

  totalCost: number = 0
  mainTotal: number = 0
  supportTotal: number = 0
  grandTotal: number = 0
  otherTotal: number = 0

  projects: any[] = [];

  constructor() {
    this.addProject();
  }

  ngOnInit() {

    if (!this.model) return;

    if (!this.model.Budget_Request_Detail_Item) {

      this.model.Budget_Request_Detail_Item = [];

    }

    this.bindData();

  }

  // =========================
  // LOAD DATA
  // =========================

  bindData() {

    const rows =
      this.model.Budget_Request_Detail_Item.filter(
        (x: any) =>
          x.Fk_Expense_Id ==
          this.model.selectedExpenseTypeId
      );

    if (rows.length == 0) {
      return;
    }

    this.projects = [];

    const projectRows =
      rows.filter(
        (x: any) =>
          x.Other_Name == 'PROJECT'
      );

    projectRows.forEach((pRow: any) => {

      const projectId =
        pRow.Request_Item_Id;

      const project: any = {

        requestItemId:
          projectId,

        project_name:
          pRow.Expense_Name || '',

        reason:
          pRow.Reson || '',

        benefit:
          pRow.Purpose || '',

        mainStaff: [],

        supportStaff: [],

        otherCost: [],

        mainTotal: 0,

        supportTotal: 0,

        otherTotal: 0,

        totalCost:
          Number(pRow.Total || 0)

      };

      // MAIN
      rows
        .filter(
          (x: any) =>
            x.Fk_Request_Detail_Id == projectId &&
            x.Other_Name == 'MAIN'
        )
        .forEach((x: any) => {

          project.mainStaff.push({

            requestItemId:
              x.Request_Item_Id || 0,

            name:
              x.Expense_Detail || '',

            field:
              x.Position_Name || '',

            edu_bachelor:
              Number(x.People_Type_A || 0) == 1,

            edu_master:
              Number(x.People_Type_B || 0) == 1,

            edu_phd:
              Number(x.People_Type_C || 0) == 1,

            exp:
              Number(x.Hour || 0),

            qty:
              Number(x.Quantity || 0),

            month:
              Number(x.Month || 0),

            rate:
              Number(x.Rate || 0),

            total:
              Number(x.Total || 0)

          });

        });

      // SUPPORT
      rows
        .filter(
          (x: any) =>
            x.Fk_Request_Detail_Id == projectId &&
            x.Other_Name == 'SUPPORT'
        )
        .forEach((x: any) => {

          project.supportStaff.push({

            requestItemId:
              x.Request_Item_Id || 0,

            name:
              x.Expense_Detail || '',

            field:
              x.Position_Name || '',

            edu_bachelor:
              Number(x.People_Type_A || 0) == 1,

            edu_master:
              Number(x.People_Type_B || 0) == 1,

            edu_phd:
              Number(x.People_Type_C || 0) == 1,

            exp:
              Number(x.Hour || 0),

            qty:
              Number(x.Quantity || 0),

            month:
              Number(x.Month || 0),

            rate:
              Number(x.Rate || 0),

            total:
              Number(x.Total || 0)

          });

        });

      // OTHER
      rows
        .filter(
          (x: any) =>
            x.Fk_Request_Detail_Id == projectId &&
            x.Other_Name == 'OTHER'
        )
        .forEach((x: any) => {

          project.otherCost.push({

            requestItemId:
              x.Request_Item_Id || 0,

            name:
              x.Expense_Detail || '',

            rate:
              Number(x.Rate || 0)

          });

        });

      if (project.mainStaff.length == 0) {

        project.mainStaff.push({
          name: '',
          field: '',
          edu_bachelor: false,
          edu_master: false,
          edu_phd: false,
          exp: 0,
          qty: 0,
          month: 0,
          rate: 0,
          total: 0
        });

      }

      this.projects.push(project);

      this.calculateMain(
        this.projects.length - 1
      );

      this.calculateSupport(
        this.projects.length - 1
      );

      this.calculateOther(
        this.projects.length - 1
      );

    });

  }

  // =========================
  // PROJECT
  // =========================

  addMain() {

    this.projects.push({

      project_name: '',
      reason: '',
      benefit: '',

      mainStaff: [{

        name: '',
        field: '',

        edu_bachelor: false,
        edu_master: false,
        edu_phd: false,

        exp: 0,
        qty: 0,
        month: 0,
        rate: 0,
        total: 0

      }],

      supportStaff: [],

      otherCost: [],

      totalCost: 0

    });

    this.updateDetailItems();

  }

  addProject() {

    this.projects.push({

      requestItemId: 0,

      project_name: '',

      reason: '',

      benefit: '',

      mainStaff: [{

        requestItemId: 0,

        name: '',

        field: '',

        edu_bachelor: false,
        edu_master: false,
        edu_phd: false,

        exp: 0,
        qty: 0,
        month: 0,
        rate: 0,
        total: 0

      }],

      supportStaff: [],

      otherCost: [],

      mainTotal: 0,
      supportTotal: 0,
      otherTotal: 0,
      totalCost: 0

    })

    this.updateDetailItems();

  }

  // =========================
  // MAIN
  // =========================

  addMainDetail(pIndex: number) {

    this.projects[pIndex].mainStaff.push({

      requestItemId: 0,

      name: '',
      field: '',

      edu_bachelor: false,
      edu_master: false,
      edu_phd: false,

      exp: 0,
      qty: 0,
      month: 0,
      rate: 0,
      total: 0

    })

    this.updateDetailItems();

  }

  // =========================
  // SUPPORT
  // =========================

  addSupportDetail(pIndex: number) {

    this.projects[pIndex].supportStaff.push({

      requestItemId: 0,

      name: '',
      field: '',

      edu_bachelor: false,
      edu_master: false,
      edu_phd: false,

      exp: 0,
      qty: 0,
      month: 0,
      rate: 0,
      total: 0

    })

    this.updateDetailItems();

  }

  // =========================
  // OTHER
  // =========================

  addOtherDetail(pIndex: number) {

    this.projects[pIndex].otherCost.push({

      requestItemId: 0,

      name: '',
      rate: 0

    })

    this.updateDetailItems();

  }

  // =========================
  // REMOVE
  // =========================

  removeMain(pIndex: number, i: number) {

    this.projects[pIndex].mainStaff.splice(i, 1)

    this.calculateMain(pIndex)

  }

  removeSupport(pIndex: number, i: number) {

    this.projects[pIndex].supportStaff.splice(i, 1)

    this.calculateSupport(pIndex)

  }

  removeOther(pIndex: number, i: number) {

    this.projects[pIndex].otherCost.splice(i, 1)

    this.calculateOther(pIndex)

  }

  // =========================
  // CALCULATE
  // =========================

  calculateMain(pIndex: number) {

    let total = 0

    this.projects[pIndex].mainStaff.forEach((item: any) => {

      item.total =

        (Number(item.qty) || 0) *

        (Number(item.month) || 0) *

        (Number(item.rate) || 0)

      total += item.total

    })

    this.projects[pIndex].mainTotal = total

    this.calculateTotal(pIndex)

  }

  calculateSupport(pIndex: number) {

    let total = 0

    this.projects[pIndex].supportStaff.forEach((item: any) => {

      item.total =

        (Number(item.qty) || 0) *

        (Number(item.month) || 0) *

        (Number(item.rate) || 0)

      total += item.total

    })

    this.projects[pIndex].supportTotal = total

    this.calculateTotal(pIndex)

  }

  calculateOther(pIndex: number) {

    let total = 0

    this.projects[pIndex].otherCost.forEach((item: any) => {

      total +=
        (Number(item.rate) || 0)

    })

    this.projects[pIndex].otherTotal = total

    this.calculateTotal(pIndex)

  }

  calculateTotal(pIndex: number) {

    const p = this.projects[pIndex]

    p.totalCost =

      (Number(p.mainTotal) || 0) +

      (Number(p.supportTotal) || 0) +

      (Number(p.otherTotal) || 0)

    this.updateDetailItems()

  }

  // =========================
  // UPDATE MODEL
  // =========================

  updateDetailItems() {

    if (!this.model) return;

    this.model.Budget_Request_Detail_Item =

      this.model.Budget_Request_Detail_Item.filter(

        (x: any) =>

          x.Fk_Expense_Id !=
          this.model.selectedExpenseTypeId

      );

    this.projects.forEach((p: any, pIndex: number) => {

      const projectId =
        p.requestItemId || (pIndex + 1);

      // PROJECT
      this.model.Budget_Request_Detail_Item.push({

        Request_Item_Id:
          p.requestItemId || 0,

        Fk_Expense_Id:
          this.model.selectedExpenseTypeId,

        Other_Name:
          'PROJECT',

        Expense_Name:
          p.project_name || '',

        Reson:
          p.reason || '',

        Purpose:
          p.benefit || '',

        Total:
          p.totalCost || 0

      });

      // MAIN
      p.mainStaff.forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId || 0,

          Fk_Request_Detail_Id:
            projectId,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Other_Name:
            'MAIN',

          Expense_Detail:
            item.name || '',

          Position_Name:
            item.field || '',

          People_Type_A:
            item.edu_bachelor ? 1 : 0,

          People_Type_B:
            item.edu_master ? 1 : 0,

          People_Type_C:
            item.edu_phd ? 1 : 0,

          Hour:
            item.exp || 0,

          Quantity:
            item.qty || 0,

          Month:
            item.month || 0,

          Rate:
            item.rate || 0,

          Total:
            item.total || 0

        });

      });

      // SUPPORT
      p.supportStaff.forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId || 0,

          Fk_Request_Detail_Id:
            projectId,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Other_Name:
            'SUPPORT',

          Expense_Detail:
            item.name || '',

          Position_Name:
            item.field || '',

          People_Type_A:
            item.edu_bachelor ? 1 : 0,

          People_Type_B:
            item.edu_master ? 1 : 0,

          People_Type_C:
            item.edu_phd ? 1 : 0,

          Hour:
            item.exp || 0,

          Quantity:
            item.qty || 0,

          Month:
            item.month || 0,

          Rate:
            item.rate || 0,

          Total:
            item.total || 0

        });

      });

      // OTHER
      p.otherCost.forEach((item: any) => {

        this.model.Budget_Request_Detail_Item.push({

          Request_Item_Id:
            item.requestItemId || 0,

          Fk_Request_Detail_Id:
            projectId,

          Fk_Expense_Id:
            this.model.selectedExpenseTypeId,

          Other_Name:
            'OTHER',

          Expense_Detail:
            item.name || '',

          Rate:
            item.rate || 0,

          Total:
            item.rate || 0

        });

      });

    });

  }

  // =========================
  // SAVE
  // =========================

  async save() {

    this.updateDetailItems();

    const userConfirmed = await confirmAlert(
      'info',
      'ต้องการบันทึกข้อมูล ?',
      ''
    );

    if (userConfirmed) {

      basicAlert(
        'success',
        'บันทึกข้อมูลแล้ว',
        ''
      );

      this.modal.dismiss();

    }

  }

}