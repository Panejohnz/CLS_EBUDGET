import { Component, Input } from '@angular/core';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

@Component({
  selector: 'app-other-expense-project',
  templateUrl: './other-expense-project.component.html',
  styleUrl: './other-expense-project.component.scss'
})
export class OtherExpenseProjectComponent {
  @Input() modal: any
  @Input() project_planing: any
  @Input() activity: any;
  @Input() type: any;
  @Input() activityId: any;
  constructor(public serviceebud: EbudgetService) {

  }
  closeModal() {
    this.modal.dismiss();
  }
  ngOnChanges() {

    // 🔥 1. ถ้ามี id → ไป DB
    if (this.activityId) {
      this.loadData();
      return;
    }

    // 🔥 2. ไม่มี id → ใช้ local (activity)
    if (this.activity?.otherExpenses?.length) {
      this.meetingCosts = this.activity.otherExpenses.map((x: any) => ({
        id: x.Project_Item_Id || x.id || 0,

        name: x.Expense_Name,
        times: x.Times,
        people: x.People,
        rate: x.Rate,

        input3: x.input3,
        input4: x.input4,
        input5: x.input5,

        Unit_Name_Times: x.Unit_Name_Times,
        Unit_Name_People: x.Unit_Name_People,
        Unit_Name_Rate: x.Unit_Name_Rate,
        Unit_Name_input3: x.Unit_Name_input3,
        Unit_Name_input4: x.Unit_Name_input4,
        Unit_Name_input5: x.Unit_Name_input5,
      }));
    } else {
      this.meetingCosts = [this.getDefaultItem()];
    }

    this.applyTypeDefault(); // 🔥 แยก logic ไปอีกฟังก์ชัน
  }
  applyTypeDefault() {
    if (!this.meetingCosts) return;

    this.meetingCosts.forEach((item: any) => {
      if (this.type === 'investment') {
        item.isStandard = true;
        item.isNonStandard = false;
      } else {
        item.isStandard = false;
        item.isNonStandard = true;
      }
    });
  }
  loadData() {
    const payload = {
      FUNC_CODE: 'FUNC-Get_OTHER_EXPENSE_BY_ID',
      Project_Item_Id: this.activityId,
    };

    this.serviceebud.GatewayGetData(payload).subscribe((res: any) => {
      console.log(res);

      this.meetingCosts = (res.Project_Plan_Detail_Item).map((x: any) => ({
        id: x.Project_Item_Id,

        name: x.Expense_Name,
        times: x.Times,
        people: x.People,
        rate: x.Rate,

        input3: x.input3,
        input4: x.input4,
        input5: x.input5,

        Unit_Name_Times: x.Unit_Name_Times,
        Unit_Name_People: x.Unit_Name_People,
        Unit_Name_Rate: x.Unit_Name_Rate,
        Unit_Name_input3: x.Unit_Name_input3,
        Unit_Name_input4: x.Unit_Name_input4,
        Unit_Name_input5: x.Unit_Name_input5,
      }));

      if (this.meetingCosts.length === 0) {
        this.meetingCosts = [this.getDefaultItem()];
      }

      this.applyTypeDefault(); // 🔥 สำคัญ
    });
  }

  getDefaultItem() {
    return {
      id: 0,
      name: '',
      times: null,
      people: null,
      rate: null,

      input3: null,
      input4: null,
      input5: null,

      Unit_Name_Times: '',
      Unit_Name_People: '',
      Unit_Name_Rate: '',
      Unit_Name_input3: '',
      Unit_Name_input4: '',
      Unit_Name_input5: '',
      Unit_Name_input6: '',
      // 🔥 เพิ่มตรงนี้
      isStandard: false,
      isNonStandard: false
    };
  }
  meetingCosts = [
    {
      id: 0,
      name: '',
      times: null,
      people: null,
      rate: null,

      input3: null,
      input4: null,
      input5: null,

      Unit_Name_Times: '',
      Unit_Name_People: '',
      Unit_Name_Rate: '',
      Unit_Name_input3: '',
      Unit_Name_input4: '',
      Unit_Name_input5: '',
      Unit_Name_input6: '',
      isStandard: false,
      isNonStandard: false
    }
  ];
  calcItemTotal(item: any): number | null {
    const values = [
      item.times,
      item.people,
      item.rate,
      item.input3,
      item.input4,
      item.input5
    ].filter(v => v != null && v !== '');

    if (values.length === 0) return null;

    return values.reduce((acc, val) => acc * val, 1);
  }
  getTotal() {
    return this.meetingCosts.reduce((sum, item) => {

      const values = [
        item.times,
        item.people,
        item.rate,
        item.input3,
        item.input4,
        item.input5
      ];

      // 🔥 คำนวณโดย ignore ช่องว่าง (ใช้ 1 แทน)
      const total = values.reduce((acc, val) => {
        const num = Number(val);
        return num > 0 ? acc * num : acc;
      }, 1);

      // 🔥 ถ้าไม่มีค่าเลย → ไม่เอามาคิด
      return total === 1 ? sum : sum + total;

    }, 0);
  }
  addCost() {

    const newItem = this.getDefaultItem();

    // 🔥 ถ้ามีแถวก่อนหน้า → copy ค่า
    if (this.meetingCosts.length > 0) {
      const last = this.meetingCosts[this.meetingCosts.length - 1];

      newItem.isStandard = last.isStandard;
      newItem.isNonStandard = last.isNonStandard;
    }

    this.meetingCosts.push(newItem);
  }

  removeCost(i: number) {

    this.meetingCosts.splice(i, 1)

  }
  save() {

    if (!this.activity.otherExpenses) {
      this.activity.otherExpenses = [];
    }

    this.activity.otherExpenses = this.meetingCosts.map(x => ({
      Project_Item_Id: x.id || 0,

      Expense_Name: x.name,
      Times: x.times,
      People: x.people,
      Rate: x.rate,

      input3: x.input3,
      input4: x.input4,
      input5: x.input5,
      Unit_Name_Times: x.Unit_Name_Times,
      Unit_Name_People: x.Unit_Name_People,
      Unit_Name_Rate: x.Unit_Name_Rate,
      Unit_Name_input3: x.Unit_Name_input3,
      Unit_Name_input4: x.Unit_Name_input4,
      Unit_Name_input5: x.Unit_Name_input5
    }));
    const total = this.getTotal();

    this.activity.multiplierTotal = total;
    basicAlert('success', 'บันทึกข้อมูลแล้ว', '');
    this.modal.dismiss();
  }
}
