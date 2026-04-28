import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'MasExpenseDetail',
  templateUrl: './MasExpenseDetail.component.html',
  styles: ``
})
export class MasExpenseDetailComponent {
  expenseDetailList: any[] = [];

  levelList = [
    { Expense_Id: 1, Expense_Name: 'ระดับ 8 ลงมา' },
    { Expense_Id: 2, Expense_Name: 'ระดับ 9 ขึ้นไป' },
    { Expense_Id: 3, Expense_Name: 'ระดับ 10 ขึ้นไป' }
  ];

  Mas_Expense_Detail: any = {};

  emptyData = {
    Expense_Detial_Id: null,
    Child_Detial_Name: null,
    Expense_Name: 'ค่าเบี้ยเลี้ยง',
    Expense_Detial_Name: '',
    Request_Rate: 0,
    Plan_Rate: 0,
    Order_Seq: 1,
    Create_Date: new Date(),
    Create_User: 'Admin'
  };
  modalRef: any;



  constructor(private modalService: NgbModal) { }

  fullModal(modal: any, data: any) {

    if (data) {
      this.Mas_Expense_Detail = { ...data };

      // edit mode
      this.detailList = [{
        Expense_Detial_Name: data.Expense_Detial_Name,
        Request_Rate: data.Request_Rate,
        Plan_Rate: data.Plan_Rate
      }];

    } else {
      this.Mas_Expense_Detail = { ...this.emptyData };

      this.detailList = [{
        Expense_Detial_Name: '',
        Request_Rate: 0,
        Plan_Rate: 0
      }];
    }

    this.modalRef = this.modalService.open(modal, {
      size: 'lg',
      backdrop: 'static'
    });
  }


  delete(item: any) {
    this.expenseDetailList = this.expenseDetailList.filter(
      x => x.Expense_Detial_Id !== item.Expense_Detial_Id
    );
  }
  detailList: any[] = [];

  // default
  addRow() {
    this.detailList.push({
      Expense_Detial_Name: '',
      Request_Rate: 0,
      Plan_Rate: 0
    });
  }

  removeRow(index: number) {
    this.detailList.splice(index, 1);
  }
  saveExpenseDetail() {

    if (this.Mas_Expense_Detail.Expense_Detial_Id) {

      const index = this.expenseDetailList.findIndex(
        x => x.Expense_Detial_Id === this.Mas_Expense_Detail.Expense_Detial_Id
      );

      if (index !== -1) {
        this.expenseDetailList[index] = { ...this.Mas_Expense_Detail };
      }

    } else {

      this.Mas_Expense_Detail.Expense_Detial_Id = Date.now();

      this.expenseDetailList.push({
        ...this.Mas_Expense_Detail
      });
    }

    this.modalRef.close();
  }
}
