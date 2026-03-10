import { Component, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-project-budget-proposal-add',
  templateUrl: './ProjectBudgetProposalAdd.component.html',
  styles: ``
})
export class ProjectBudgetProposalAddComponent {
  @Input() modal: any;
  constructor(private modalService: NgbModal) { }
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
  targetList: any[] = [];
  openTargetModal(content: any) {

    // ถ้ายังไม่มีรายการ ให้สร้าง default 1 รายการ
    if (this.targetList.length === 0) {
      this.addTargetRow();
    }

    this.modalService.open(content, {
      fullscreen: true
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
  saveTarget() {

  }

}
