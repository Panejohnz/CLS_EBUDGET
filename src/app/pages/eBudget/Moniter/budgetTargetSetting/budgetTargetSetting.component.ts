import { Component } from '@angular/core';

@Component({
  selector: 'app-budget-target-setting',
  templateUrl: './budgetTargetSetting.component.html'
})
export class BudgetTargetSettingComponent {


  overall = {
    pay: [0, 0, 0, 0],
    disburse: [0, 0, 0, 0]
  };

  regular = {
    pay: [0, 0, 0, 0],
    disburse: [0, 0, 0, 0]
  };

  investment = {
    pay: [0, 0, 0, 0],
    disburse: [0, 0, 0, 0]
  };
  sections = [
    {
      title: 'เป้าหมายภาพรวม',
      pay: [0, 0, 0, 0],
      disburse: [0, 0, 0, 0]
    },
    {
      title: 'เป้าหมายรายจ่ายประจำ',
      pay: [0, 0, 0, 0],
      disburse: [0, 0, 0, 0]
    },
    {
      title: 'เป้าหมายรายจ่ายงบลงทุน',
      pay: [0, 0, 0, 0],
      disburse: [0, 0, 0, 0]
    }
  ];

  quarters = [1, 2, 3, 4];
}
