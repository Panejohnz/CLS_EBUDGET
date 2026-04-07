import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'MasBusinessLevel',
  templateUrl: './MasBusinessLevel.component.html',
  styles: ``
})
export class MasBusinessLevelComponent {
  levelList: any[] = [];
  Mas_Level: any = {};
  modalRef: any;

  emptyData = {
    Level_Id: null,
    Level_Name: '',
    Level_Short_Name: '',
    Level_Code: '',
    Order_Seq: 1,
    BgYear: new Date().getFullYear() + 543,
    Create_Date: new Date(),
    Create_User: 'Admin'
  };

  constructor(private modalService: NgbModal) { }

  fullModal(modal: any, data: any) {

    if (data) {
      this.Mas_Level = { ...data };
    } else {
      this.Mas_Level = { ...this.emptyData };
    }

    this.modalRef = this.modalService.open(modal, {
      size: 'lg',
      backdrop: 'static'
    });
  }

  saveLevel() {

    if (this.Mas_Level.Level_Id) {

      const index = this.levelList.findIndex(
        x => x.Level_Id === this.Mas_Level.Level_Id
      );

      this.levelList[index] = this.Mas_Level;

    } else {

      this.Mas_Level.Level_Id = Date.now();
      this.levelList.push(this.Mas_Level);

    }

    this.modalRef.close();
  }

  delete(item: any) {
    this.levelList = this.levelList.filter(
      x => x.Level_Id !== item.Level_Id
    );
  }
}
