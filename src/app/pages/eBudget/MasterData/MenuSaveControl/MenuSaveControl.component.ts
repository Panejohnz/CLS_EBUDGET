import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { EbudgetService } from 'src/app/core/services/ebudget.service';

interface MenuSaveControl {
  IDA?: number;
  Menu_Code: string;
  Menu_Name: string;
  Route_Path: string;
  Can_Save: boolean;
  Active: boolean;
  Update_User?: string;
}

@Component({
  selector: 'app-menu-save-control',
  templateUrl: './MenuSaveControl.component.html',
  styleUrls: ['./MenuSaveControl.component.scss']
})
export class MenuSaveControlComponent implements OnInit {
  loading = false;
  savingCode = '';

  readonly menuDefaults: MenuSaveControl[] = [
    { Menu_Code: 'PROJECT_PLANNING', Menu_Name: 'จัดทำแผนงาน/โครงการ', Route_Path: '/Planing', Can_Save: true, Active: true },
    { Menu_Code: 'BUDGET_PROPOSAL_PERSONNEL', Menu_Name: 'คำของบประมาณ - งบบุคลากร', Route_Path: '/ProjectBudgetProposal/Personnel', Can_Save: true, Active: true },
    { Menu_Code: 'BUDGET_PROPOSAL_OPERATING', Menu_Name: 'คำของบประมาณ - งบดำเนินงาน', Route_Path: '/ProjectBudgetProposal/Operating', Can_Save: true, Active: true },
    { Menu_Code: 'PLAN_MANAGEMENT', Menu_Name: 'จัดการแผนงบประมาณ', Route_Path: '/PlanManagement', Can_Save: true, Active: true },
    { Menu_Code: 'PROJECT_ALLOCATION', Menu_Name: 'จัดสรรงบประมาณ', Route_Path: '/Allocation', Can_Save: true, Active: true },
    { Menu_Code: 'PROJECT_TRANSFER', Menu_Name: 'โอนงบประมาณ', Route_Path: '/Transfer', Can_Save: true, Active: true },
    { Menu_Code: 'REPORT_RESULT', Menu_Name: 'รายงานผลการดำเนินงาน', Route_Path: '/Moniter/ReportResult', Can_Save: true, Active: true },
    { Menu_Code: 'REPORT_KPI', Menu_Name: 'รายงานผลตัวชี้วัด', Route_Path: '/Moniter/ReportKPI', Can_Save: true, Active: true },
    { Menu_Code: 'MAS_EXPENSE_DETAIL', Menu_Name: 'จัดการข้อมูลค่าใช้จ่ายและอัตรา', Route_Path: '/MasterData/MasExpenseDetail', Can_Save: true, Active: true },
    { Menu_Code: 'MAS_PROJECT_PLAN', Menu_Name: 'จัดการข้อมูลแผนงาน', Route_Path: '/MasterData/MasProjectPlan', Can_Save: true, Active: true }
  ];

  controls: MenuSaveControl[] = [];

  constructor(private ebudgetService: EbudgetService) { }

  ngOnInit(): void {
    this.loadControls();
  }

  loadControls(): void {
    this.loading = true;
    this.ebudgetService.GatewayGetData({ FUNC_CODE: 'FUNC-GET_Budget_Menu_Save_Control' }).subscribe({
      next: (response: any) => {
        const saved = this.toArray(response?.List_Budget_Menu_Save_Control);
        this.controls = this.menuDefaults.map((menu) => ({
          ...menu,
          ...(saved.find((item: any) => item.Menu_Code === menu.Menu_Code) || {}),
          Can_Save: this.toBoolean(saved.find((item: any) => item.Menu_Code === menu.Menu_Code)?.Can_Save, menu.Can_Save),
          Active: true
        }));
        this.loading = false;
      },
      error: () => {
        this.controls = this.menuDefaults.map((menu) => ({ ...menu }));
        this.loading = false;
        Swal.fire('ไม่สามารถดึงข้อมูลได้', 'ตรวจสอบการเชื่อมต่อระบบ', 'error');
      }
    });
  }

  save(control: MenuSaveControl): void {
    this.savingCode = control.Menu_Code;
    const authen = JSON.parse(sessionStorage.getItem('authen') || '{}');
    const updateUser = authen?.UserName || authen?.Username || authen?.Personal_Name || '';

    this.ebudgetService.GatewayGetData({
      FUNC_CODE: 'FUNC-Save_Budget_Menu_Save_Control',
      Budget_Menu_Save_Control: { ...control, Active: true, Update_User: updateUser }
    }).subscribe({
      next: () => {
        this.savingCode = '';
        Swal.fire('บันทึกสำเร็จ', `${control.Menu_Name}: ${control.Can_Save ? 'เปิดปุ่มเพิ่ม' : 'ปิดปุ่มเพิ่ม'}`, 'success');
      },
      error: () => {
        this.savingCode = '';
        Swal.fire('บันทึกไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง', 'error');
      }
    });
  }

  private toArray(value: any): any[] {
    if (Array.isArray(value)) { return value; }
    if (value && typeof value === 'object') { return Object.values(value); }
    return [];
  }

  private toBoolean(value: any, fallback: boolean): boolean {
    if (value === undefined || value === null || value === '') { return fallback; }
    return value === true || value === 1 || value === '1' || String(value).toLowerCase() === 'true';
  }
}
