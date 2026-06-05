import { Component, OnInit, OnDestroy, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subscription } from 'rxjs';

// import { MENU } from './menu';
import { MenuItem } from './menu.model';
import { environment } from 'src/environments/environment';

import { UserProfileService } from 'src/app/core/services/user.service';
import { MenuService } from 'src/app/core/services/menu.service';
import { SessionService } from 'src/app/core/services/session.service';
import { EventService } from 'src/app/core/services/event.service';
interface TbGroup {
  IDA: number;
  GROUP_NAME: string;
  menu_group: string;
  menu_group_icon: string;
  menu_group_controller: string;
  menu_group_actionname: string;
  sort_index: number;
  isTitle: boolean;
  isCollapsed: boolean;
  Activefact: boolean;
  Create_Date: string;
  Create_By: string;
  Update_Date: string;
  Update_By: string;
}

interface TbMenu {
  IDA: number;
  menu_name: string;
  menu_icon: string;
  menu_controller: string;
  menu_actionname: string;
  menu_group: string;
  isCollapsed: boolean;
  menu_active: boolean;
  sort_index: number;
}

interface TbSubmenu {
  IDA: number;
  submenu_name: string;
  submenu_icon: string;
  submenu_controller: string;
  submenu_actionname: string;
  submenu_active: boolean;
  menu_id: number;
  sort_index: number;
}

interface MenuDataResponse {
  List_tb_group_menu: TbGroup[];
  List_menu: TbMenu[];
  List_submenu: TbSubmenu[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  menu: any;
  user: any;
  toggle: any = true;
  // menuItems: MenuItem[] = [

  //   {
  //     label: 'หน้าหลัก',
  //     isTitle: true
  //   },
  //   {
  //     label: 'Dashboard',
  //     icon: 'bx bx-home-circle',
  //     link: '/Dashboard/projects'
  //   },

  //   {
  //     label: 'ระบบวางแผน',
  //     isTitle: true
  //   },
  //   {
  //     label: 'วางแผนโครงการ (Planing)',
  //     icon: 'bx bx-task',
  //     link: '/Planing'
  //   },
  //   {
  //     label: 'Sign off โครงการ',
  //     icon: 'bx bx-check-circle',
  //     link: '/singOff'
  //   },

  //   {
  //     label: 'ระบบจัดทำคำของบประมาณ',
  //     isTitle: true
  //   },
  //   {
  //     label: 'จัดทำคำของบประมาณ',
  //     icon: 'bx bx-file',
  //     link: '/ProjectBudgetProposal/Personnel'
  //   },
  //   {
  //     label: 'Sign off คำของบประมาณ',
  //     icon: 'bx bx-check-shield',
  //     link: '/singOffBudgetProposal'
  //   },

  //   {
  //     label: 'ระบบจัดสรรงบประมาณ',
  //     isTitle: true
  //   },
  //   {
  //     label: 'จัดสรรงบประมาณ',
  //     icon: 'bx bx-wallet',
  //     link: '/Allocation'
  //   },

  //   {
  //     label: 'ระบบจัดทำแผนที่ปฎิบัติการ',
  //     isTitle: true
  //   },
  //   {
  //     label: 'งบประมาณที่ได้รับจัดสรร',
  //     icon: 'bx bx-money',
  //     link: '/PlanManagement/examine'
  //   },
  //   {
  //     label: 'จัดทำแผนปฎิบัติการ',
  //     icon: 'bx bx-edit-alt',
  //     link: '/PlanManagement'
  //   },
  //   {
  //     label: 'Sign off แผนปฎิบัติการ',
  //     icon: 'bx bx-check-double',
  //     link: '/singOffAction'
  //   },
  //   {
  //     label: 'โอนเปลี่ยนแปลงงบประมาณ',
  //     isTitle: true
  //   },
  //   {
  //     label: 'โอนเปลี่ยนแปลงงบประมาณ',
  //     icon: 'bx bx-transfer',
  //     link: '/Transfer'
  //   },
  //   {
  //     label: 'ระบบติดตามการดำเนินงาน',
  //     isTitle: true
  //   },
  //   {
  //     label: 'เมนูกำหนดเป้าหมาย',
  //     icon: 'bx bx-target-lock',
  //     link: '/Moniter/BudgetTarget'
  //   },
  //   {
  //     label: 'เมนูรายงานผล',
  //     icon: 'bx bx-bar-chart-alt-2',
  //     link: '/Moniter/ReportResult'
  //   },
  //   // {
  //   //   label: 'รายงานผลกรณีโครงการ',
  //   //   icon: 'bx bx-task',
  //   //   link: '/Moniter/Report'
  //   // },
  //   // {
  //   //   label: 'รายงานผลกรณีงบลงทุน',
  //   //   icon: 'bx bx-wallet',
  //   //   link: '/Moniter/ReportInvestment'
  //   // },
  //   {
  //     label: 'รายงานผลตามตัวชี้วัดแผนงาน',
  //     icon: 'bx bx-line-chart',
  //     link: '/Moniter/ReportKPI'
  //   },
  //   {
  //     label: 'ข้อมูลกลาง',
  //     isTitle: true
  //   },
  //   {
  //     label: 'ระดับบุคลากร',
  //     icon: 'bx bx-id-card',
  //     link: '/MasterData/MasBusinessLevel'
  //   },
  //   {
  //     label: 'ค่าที่พักตามระดับ',
  //     icon: 'bx bx-hotel',
  //     link: '/MasterData/MasExpenseDetail'
  //   },
  //   {
  //     label: 'ความสอดคล้องโครงการ',
  //     icon: 'bx bx-check-shield',
  //     link: '/MasterData/MasProjectPlan'
  //   },
  // ];
  menuItems: MenuItem[] = [
    {
      "id": 25,
      "label": "หน้าหลัก",
      "icon": "bx bx-home-alt",
      "link": "/Dashboard",
      "subItems": [],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    },
    {
      "id": 26,
      "label": "ระบบวางแผน",
      "icon": "bx bx-task",
      "link": null,
      "subItems": [
        {
          "id": 22,
          "label": "วางแผนโครงการ (Planning)",
          "icon": "bx bx-task",
          "link": "/Planing",
          "subItems": [],
          "parentId": 26,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 23,
          "label": "Sign off โครงการ (ผู้อำนวยการกอง)",
          "icon": "bx bx-check-circle",
          "link": "/singOff",
          "subItems": [],
          "parentId": 26,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 37,
          "label": "ยืนยันข้อมูลโครงการ (หน่วยงาน)",
          "icon": "bx bx-check-circle",
          "link": "/Confirm",
          "subItems": [],
          "parentId": 26,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 38,
          "label": "ยืนยันข้อมูลโครงการ (กยผ)",
          "icon": "bx bx-check-circle",
          "link": "/ConfirmSuperDept",
          "subItems": [],
          "parentId": 26,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 39,
          "label": "Sign off โครงการ (กยผ)",
          "icon": "bx bx-check-circle",
          "link": "/singOffSuperDept",
          "subItems": [],
          "parentId": 26,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 40,
          "label": "Sign off โครงการ (ปปท)",
          "icon": "bx bx-check-circle",
          "link": "/singOffMinistry",
          "subItems": [],
          "parentId": 26,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        }
      ],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    },
    {
      "id": 27,
      "label": "ระบบจัดทำคำของบประมาณ",
      "icon": "bx bx-file",
      "link": null,
      "subItems": [
        {
          "id": 24,
          "label": "จัดทำคำของบประมาณ",
          "icon": "bx bx-file",
          "link": "/ProjectBudgetProposal/Personnel",
          "subItems": [],
          "parentId": 27,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 25,
          "label": "Sign off คำของบประมาณ (ผู้อำนวยการกอง)",
          "icon": "bx bx-check-shield",
          "link": "/singOffBudgetProposal",
          "subItems": [],
          "parentId": 27,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 41,
          "label": "ยืนยันข้อมูลคำของบประมาณ (หน่วยงาน)",
          "icon": "bx bx-check-circle",
          "link": "/ConfirmBudgetProposal",
          "subItems": [],
          "parentId": 27,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 42,
          "label": "ยืนยันข้อมูลคำของบประมาณ (กยผ)",
          "icon": "bx bx-check-circle",
          "link": "/ConfirmSuperDeptBudgetProposal",
          "subItems": [],
          "parentId": 27,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 43,
          "label": "Sign off คำของบประมาณ (กยผ)",
          "icon": "bx bx-check-circle",
          "link": "/singOffSuperDeptBudgetProposal",
          "subItems": [],
          "parentId": 27,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 44,
          "label": "Sign off คำของบประมาณ (ปปท)",
          "icon": "bx bx-check-circle",
          "link": "/singOffMinistryBudgetProposal",
          "subItems": [],
          "parentId": 27,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        }
      ],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    },
    {
      "id": 28,
      "label": "ระบบจัดสรรงบประมาณ",
      "icon": "bx bx-wallet",
      "link": null,
      "subItems": [
        {
          "id": 26,
          "label": "จัดสรรงบประมาณ",
          "icon": "bx bx-wallet",
          "link": "/Allocation",
          "subItems": [],
          "parentId": 28,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 27,
          "label": "งบประมาณที่ได้รับจัดสรร",
          "icon": "bx bx-money",
          "link": "/PlanManagement/examine",
          "subItems": [],
          "parentId": 28,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        }
      ],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    },
    {
      "id": 29,
      "label": "ระบบจัดทำแผนที่ปฎิบัติการ",
      "icon": "bx bx-money",
      "link": null,
      "subItems": [
        {
          "id": 28,
          "label": "จัดทำแผนปฎิบัติการ",
          "icon": "bx bx-edit-alt",
          "link": "/PlanManagement",
          "subItems": [],
          "parentId": 29,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 29,
          "label": "Sign off แผนปฎิบัติการ (ผู้อำนวยการกอง)",
          "icon": "bx bx-check-double",
          "link": "/singOffAction",
          "subItems": [],
          "parentId": 29,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 45,
          "label": "ยืนยันข้อมูลแผนปฎิบัติการ (หน่วยงาน)",
          "icon": "bx bx-check-double",
          "link": "/ConfirmAction",
          "subItems": [],
          "parentId": 29,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 46,
          "label": "ยืนยันข้อมูลแผนปฎิบัติการ (กยผ)",
          "icon": "bx bx-check-double",
          "link": "/ConfirmSuperDeptAction",
          "subItems": [],
          "parentId": 29,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 47,
          "label": "Sign off แผนปฎิบัติการ (กยผ)",
          "icon": "bx bx-check-double",
          "link": "/singOffSuperDeptAction",
          "subItems": [],
          "parentId": 29,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 48,
          "label": "Sign off แผนปฎิบัติการ (ปปท)",
          "icon": "bx bx-check-double",
          "link": "/singOffMinistryAction",
          "subItems": [],
          "parentId": 29,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        }
      ],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    },
    {
      "id": 30,
      "label": "โอนเปลี่ยนแปลงงบประมาณ",
      "icon": "bx bx-transfer",
      "link": null,
      "subItems": [
        {
          "id": 30,
          "label": "โอนเปลี่ยนแปลงงบประมาณ",
          "icon": "bx bx-transfer",
          "link": "/Transfer",
          "subItems": [],
          "parentId": 30,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        }
      ],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    },
    {
      "id": 31,
      "label": "ระบบติดตามการดำเนินงาน",
      "icon": "bx bx-target-lock",
      "link": null,
      "subItems": [
        {
          "id": 31,
          "label": "เมนูกำหนดเป้าหมาย",
          "icon": "bx bx-target-lock",
          "link": "/Moniter/BudgetTarget",
          "subItems": [],
          "parentId": 31,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 32,
          "label": "เมนูรายงานผล",
          "icon": "bx bx-bar-chart-alt-2",
          "link": "/Moniter/ReportResult",
          "subItems": [],
          "parentId": 31,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 33,
          "label": "รายงานผลตามตัวชี้วัดแผนงาน",
          "icon": "bx bx-line-chart",
          "link": "/Moniter/ReportKPI",
          "subItems": [],
          "parentId": 31,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        }
      ],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    },
    {
      "id": 32,
      "label": "ข้อมูลกลาง",
      "icon": "bx bx-id-card",
      "link": null,
      "subItems": [
        {
          "id": 34,
          "label": "ระดับบุคลากร",
          "icon": "bx bx-id-card",
          "link": "/MasterData/MasBusinessLevel",
          "subItems": [],
          "parentId": 32,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 35,
          "label": "ค่าที่พักตามระดับ",
          "icon": "bx bx-hotel",
          "link": "/MasterData/MasExpenseDetail",
          "subItems": [],
          "parentId": 32,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        },
        {
          "id": 36,
          "label": "ความสอดคล้องโครงการ",
          "icon": "bx bx-check-shield",
          "link": "/MasterData/MasProjectPlan",
          "subItems": [],
          "parentId": 32,
          "isTitle": false,
          "isCollapsed": false,
          "isLayout": false
        }
      ],
      "isTitle": false,
      "isCollapsed": true,
      "isLayout": false
    }
  ]

  // menuItems : MenuItem[]  = [];
  environment = environment; // เพิ่ม environment property
  @ViewChild('sideMenu') sideMenu!: ElementRef;
  @Output() mobileMenuButtonClicked = new EventEmitter();
  select_year: any;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    public translate: TranslateService,
    private userService: UserProfileService,
    private menuService: MenuService,
    private sessionService: SessionService,
    private eventService: EventService
  ) {
    translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    // ตรวจสอบ session expiration ก่อน
    // this.checkSessionExpiration();

    // Initialize with default year (will be updated by topbar event)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() + 543; // แปลงจาก ค.ศ. เป็น พ.ศ.
    const currentMonth = currentDate.getMonth() + 1; // getMonth() เริ่มจาก 0

    if (currentMonth > 9) {
      this.select_year = currentYear + 1;
    } else {
      this.select_year = currentYear;
    }

    // Subscribe to year change event from topbar
    const yearSubscription = this.eventService.subscribe('yearChanged', (year: number) => {
      if (year) {
        this.select_year = year;
      }
    });
    this.subscriptions.push(yearSubscription);

    // โหลด menu จาก session ก่อน
    this.loadMenuFromSession();

    // Debug: แสดงข้อมูล menu ที่โหลด
    console.log('Sidebar ngOnInit - Current menuItems:', this.menuItems);

    // ใช้ combineLatest เพื่อรอทั้ง user และ menu
    combineLatest([
      this.userService.currentUser,
      this.menuService.menuItems
    ]).pipe(
      map(([user, menuItems]) => ({ user, menuItems }))
    ).subscribe(({ user, menuItems }) => {
      // ถ้าไม่มี menu ใน session ให้ใช้จาก menuService
      if (!this.menuItems || this.menuItems.length === 0) {
        console.log('No menu from session, using menuService items:', menuItems);
        this.menuItems = menuItems;
      } else {
        console.log('Using menu from session, ignoring menuService items');
      }
    });

    // โหลด menu จาก API เมื่อมีข้อมูลผู้ใช้และไม่มี menu ใน session
    this.userService.currentUser.subscribe(user => {
      if (user && (!this.menuItems || this.menuItems.length === 0)) {
        console.log('Loading menu from API for user:', user);
        this.loadMenuFromAPI(user.permission || 1);
      }
    });

    this.router.events.subscribe((event) => {
      if (document.documentElement.getAttribute('data-layout') != "twocolumn") {
        if (event instanceof NavigationEnd) {
          this.initActiveMenu();
        }
      }
    });
  }

  /**
   * โหลด menu จาก session
   */
  private loadMenuFromSession(): void {
    // ตรวจสอบว่ามี session ที่ถูกต้องหรือไม่
    if (this.sessionService.hasValidSession()) {
      const session = this.sessionService.getUserSession();
      if (session && session.menuData && session.menuData.length > 0) {
        console.log('Loading menu from session:', session.menuData);
        this.menuItems = session.menuData;
        // อัปเดต menuService ด้วย
        this.menuService.updateMenuItems(session.menuData);
        return;
      }
    }

    // ถ้าไม่มี menu ใน session ให้ใช้ menu เริ่มต้นจากไฟล์ MENU
    console.log('No valid menu in session, using default MENU');
    // this.menuItems = MENU;
    // this.menuService.updateMenuItems(MENU);
  }

  /**
   * โหลด menu จาก API
   */
  private loadMenuFromAPI(permission: number) {
    this.menuService.loadMenuByPermission(permission).subscribe({
      next: (response) => {
        if (response && response.menuItems) {
          this.menuService.updateMenuItems(response.menuItems);
          this.menuItems = response.menuItems;
        }
      },
      error: (error) => {
        console.error('Error loading menu from API:', error);
        // Fallback ไปใช้ menu จากไฟล์ local
        console.log('API error, using default MENU as fallback');
        // this.menuItems = MENU;
        // this.menuService.updateMenuItems(MENU);
      }
    });
  }
  private convertToMenuStructure(menuData: MenuDataResponse): MenuItem[] {
    const menuItems: MenuItem[] = [];
    const groupMap = new Map<number, MenuItem>();

    // 1. สร้าง Groups (ระดับสูงสุด) - เรียงตาม sort_index
    const sortedGroups = menuData.List_tb_group_menu
      .filter((group: any) => group.Activefact)
      .sort((a: any, b: any) => (a.sort_index || 0) - (b.sort_index || 0));

    sortedGroups.forEach((group: any) => {
      const groupItem: MenuItem = {
        id: group.IDA,
        label: group.GROUP_NAME,
        icon: group.menu_group_icon || 'bx bx-menu',
        link: group.menu_group_actionname, // Group ไม่มี link โดยตรง
        subItems: [],
        isTitle: group.isTitle || false,
        isCollapsed: group.isCollapsed || false,
        isLayout: false
      };
      groupMap.set(group.IDA, groupItem);
      menuItems.push(groupItem);
    });

    // 2. เพิ่ม Menus ให้กับ Groups - เรียงตาม sort_index
    const sortedMenus = menuData.List_menu
      .filter((menu: any) => menu.menu_active)
      .sort((a: any, b: any) => (a.sort_index || 0) - (b.sort_index || 0));

    sortedMenus.forEach((menu: any) => {
      const menuItem: MenuItem = {
        id: menu.IDA,
        label: menu.menu_name,
        icon: menu.menu_icon || 'bx bx-menu',
        link: menu.menu_actionname,
        subItems: [],
        parentId: parseInt(menu.menu_group), // ระบุ parent group
        isTitle: false,
        isCollapsed: menu.isCollapsed || false,
        isLayout: false,
        sort_index: menu.sort_index
      };

      // หา parent group และเพิ่ม menu
      const parentGroup = groupMap.get(parseInt(menu.menu_group));
      if (parentGroup) {
        if (!parentGroup.subItems) {
          parentGroup.subItems = [];
        }
        parentGroup.subItems.push(menuItem);
      }
    });

    // 3. เพิ่ม Submenus ให้กับ Menus - เรียงตาม sort_index
    const sortedSubmenus = menuData.List_submenu
      .filter((submenu: any) => submenu.submenu_active)
      .sort((a: any, b: any) => (a.sort_index || 0) - (b.sort_index || 0));

    sortedSubmenus.forEach((submenu: any) => {
      const submenuItem: MenuItem = {
        id: submenu.IDA,
        label: submenu.submenu_name,
        icon: submenu.submenu_icon || 'bx bx-menu',
        link: submenu.submenu_actionname,
        parentId: submenu.menu_id, // ระบุ parent menu
        isTitle: false,
        isLayout: false
      };

      // หา parent menu และเพิ่ม submenu
      if (submenu.menu_id) {
        const parentMenu = this.findParentMenuInGroups(menuItems, submenu.menu_id);
        if (parentMenu) {
          if (!parentMenu.subItems) {
            parentMenu.subItems = [];
          }
          parentMenu.subItems.push(submenuItem);
        }
      }
    });

    // 4. เรียงลำดับ subItems ในแต่ละ level ตาม sort_index
    this.sortMenuItems(menuItems);

    return menuItems;
  }
  private findParentMenuInGroups(groups: MenuItem[], parentId: number): MenuItem | null {
    for (const group of groups) {
      if (group.subItems) {
        for (const menu of group.subItems) {
          if (menu.id === parentId) {
            return menu;
          }
          // ตรวจสอบ submenu ในระดับลึก
          if (menu.subItems) {
            const found = this.findMenuInSubItems(menu.subItems, parentId);
            if (found) return found;
          }
        }
      }
    }
    return null;
  }
  private findMenuInSubItems(subItems: MenuItem[], parentId: number): MenuItem | null {
    for (const item of subItems) {
      if (item.id === parentId) {
        return item;
      }
      if (item.subItems) {
        const found = this.findMenuInSubItems(item.subItems, parentId);
        if (found) return found;
      }
    }
    return null;
  }
  private sortMenuItems(menuItems: MenuItem[]): void {
    menuItems.forEach(item => {
      if (item.subItems && item.subItems.length > 0) {
        // เรียงลำดับ subItems ตาม id (ซึ่งควรจะสอดคล้องกับ sort_index)
        item.subItems.sort((a: MenuItem, b: MenuItem) => (a.sort_index || 0) - (b.sort_index || 0));

        // เรียกใช้ฟังก์ชันซ้ำสำหรับ subItems
        this.sortMenuItems(item.subItems);
      }
    });
  }
  /**
   * Refresh menu จาก session
   */
  refreshMenuFromSession(): void {
    console.log('Refreshing menu from session...');
    this.loadMenuFromSession();
  }

  /**
   * ตรวจสอบและจัดการ session expiration
   */
  private checkSessionExpiration(): void {
    if (!this.sessionService.hasValidSession()) {
      console.log('Session expired, clearing session and redirecting to login');
      this.sessionService.clearSession();
      this.router.navigate(['/account/signin']);
    }
  }

  /**
   * อัปเดต menu ใน session
   */
  updateMenuInSession(menuItems: MenuItem[]): void {
    this.sessionService.updateSession({ menuData: menuItems });
    this.menuItems = menuItems;
    this.menuService.updateMenuItems(menuItems);
  }

  /**
   * Debug function - แสดงข้อมูล session
   */
  debugSession(): void {
    console.log('=== Session Debug Info ===');
    console.log('Has valid session:', this.sessionService.hasValidSession());
    console.log('Has menu data:', this.sessionService.hasMenuData());
    console.log('Has permission data:', this.sessionService.hasPermissionData());
    console.log('Has token:', this.sessionService.hasToken());

    const session = this.sessionService.getUserSession();
    if (session) {
      console.log('Session data:', session);
      console.log('Menu items count:', session.menuData ? session.menuData.length : 0);
    } else {
      console.log('No session found');
    }
    console.log('Current menu items:', this.menuItems);
    console.log('========================');
  }

  /**
   * Force refresh menu จาก session
   */
  forceRefreshMenu(): void {
    console.log('Force refreshing menu from session...');
    this.menuService.refreshMenuFromSession();
    this.loadMenuFromSession();
  }

  /**
   * Clear session และ reload menu
   */
  clearSessionAndReload(): void {
    console.log('Clearing session and reloading menu...');
    this.sessionService.clearSession();
    this.loadMenuFromSession();
    console.log('Session cleared, menuItems:', this.menuItems);
  }

  /**
   * Test function - สร้าง test menu data
   */
  createTestMenuData(): void {
    const testMenuItems: MenuItem[] = [
      {
        id: 1,
        label: 'Test Menu 1',
        icon: 'bx bx-home-alt',
        link: '/test1',
        isTitle: false,
        isLayout: false
      },
      {
        id: 2,
        label: 'Test Menu 2',
        icon: 'bx bx-menu',
        link: '/test2',
        isTitle: false,
        isLayout: false
      }
    ];

    console.log('Creating test menu data:', testMenuItems);
    this.updateMenuInSession(testMenuItems);
  }

  /**
   * Test function - ใช้ default MENU
   */
  useDefaultMenu(): void {
    // console.log('Using default MENU:', MENU);
    // this.menuItems = MENU;
    // this.menuService.updateMenuItems(MENU);
  }

  /**
   * Test function - ตรวจสอบ sidebar state
   */
  checkSidebarState(): void {
    console.log('=== Sidebar State Check ===');
    console.log('menuItems length:', this.menuItems.length);
    console.log('menuItems:', this.menuItems);
    console.log('Has session:', this.sessionService.hasValidSession());
    console.log('Session data:', this.sessionService.getUserSession());
    console.log('Current URL:', window.location.pathname);
    console.log('========================');
  }

  /**
   * Test function - ตรวจสอบ session storage
   */
  checkSessionStorage(): void {
    console.log('=== Session Storage Check ===');
    console.log('userSession:', sessionStorage.getItem('userSession'));
    console.log('sidebarMenu:', sessionStorage.getItem('sidebarMenu'));
    console.log('selectedPermission:', sessionStorage.getItem('selectedPermission'));
    console.log('authToken:', sessionStorage.getItem('authToken'));
    console.log('========================');
  }

  /**
   * Test function - ตรวจสอบ menu service
   */
  checkMenuService(): void {
    console.log('=== Menu Service Check ===');
    console.log('Menu service menuItems:', this.menuService.getCurrentMenuItems());
    console.log('Has menu in session:', this.menuService.hasMenuInSession());
    console.log('========================');
  }
  /***
   * Activate droup down set
   */
  ngAfterViewInit() {
    setTimeout(() => {
      this.initActiveMenu();
    }, 0);
  }


  removeActivation(items: any) {
    items.forEach((item: any) => {
      item.classList.remove("active");
    });
  }


  toggleItem(item: any) {

    this.menuItems.forEach((menuItem: any) => {

      if (menuItem == item) {
        menuItem.isCollapsed = !menuItem.isCollapsed
      } else {
        menuItem.isCollapsed = true
      }
      if (menuItem.subItems) {
        menuItem.subItems.forEach((subItem: any) => {

          if (subItem == item) {
            menuItem.isCollapsed = !menuItem.isCollapsed
            subItem.isCollapsed = !subItem.isCollapsed
          } else {
            subItem.isCollapsed = true
          }
          if (subItem.subItems) {
            subItem.subItems.forEach((childitem: any) => {

              if (childitem == item) {
                childitem.isCollapsed = !childitem.isCollapsed
                subItem.isCollapsed = !subItem.isCollapsed
                menuItem.isCollapsed = !menuItem.isCollapsed
              } else {
                childitem.isCollapsed = true
              }
              if (childitem.subItems) {
                childitem.subItems.forEach((childrenitem: any) => {

                  if (childrenitem == item) {
                    childrenitem.isCollapsed = false
                    childitem.isCollapsed = false
                    subItem.isCollapsed = false
                    menuItem.isCollapsed = false
                  } else {
                    childrenitem.isCollapsed = true
                  }
                })
              }
            })
          }
        })
      }
    });
  }


  // remove active items of two-column-menu
  activateParentDropdown(item: any) {
    item.classList.add("active");
    let parentCollapseDiv = item.closest(".collapse.menu-dropdown");

    if (parentCollapseDiv) {
      // to set aria expand true remaining
      parentCollapseDiv.classList.add("show");
      parentCollapseDiv.parentElement.children[0].classList.add("active");
      parentCollapseDiv.parentElement.children[0].setAttribute("aria-expanded", "true");
      if (parentCollapseDiv.parentElement.closest(".collapse.menu-dropdown")) {
        parentCollapseDiv.parentElement.closest(".collapse").classList.add("show");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling)
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.classList.add("active");
        if (parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse")) {
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").classList.add("show");
          parentCollapseDiv.parentElement.closest(".collapse").previousElementSibling.closest(".collapse").previousElementSibling.classList.add("active");
        }
      }
      return false;
    }
    return false;
  }

  updateActive(event: any) {
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      this.removeActivation(items);
    }
    this.activateParentDropdown(event.target);
  }

  initActiveMenu() {
    let pathName = window.location.pathname;
    // Check if the application is running in production
    if (environment.production) {
      // Modify pathName for production build
      pathName = pathName.replace('/velzon/angular/modern', '');
    }

    const active = this.findMenuItem(pathName, this.menuItems)
    this.toggleItem(active)
    const ul = document.getElementById("navbar-nav");
    if (ul) {
      const items = Array.from(ul.querySelectorAll("a.nav-link"));
      let activeItems = items.filter((x: any) => x.classList.contains("active"));
      this.removeActivation(activeItems);

      let matchingMenuItem = items.find((x: any) => {
        if (environment.production) {
          let path = x.pathname
          path = path.replace('/velzon/angular/modern', '');
          return path === pathName;
        } else {
          return x.pathname === pathName;
        }

      });
      if (matchingMenuItem) {
        this.activateParentDropdown(matchingMenuItem);
      }
    }
  }
  private findMenuItem(pathname: string, menuItems: any[]): any {
    for (const menuItem of menuItems) {
      if (menuItem.link && menuItem.link === pathname) {
        return menuItem;
      }

      if (menuItem.subItems) {
        const foundItem = this.findMenuItem(pathname, menuItem.subItems);
        if (foundItem) {
          return foundItem;
        }
      }
    }

    return null;
  }

  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * ตรวจสอบว่าลิงก์เป็น external link (http:// หรือ https://) หรือไม่
   * @param link URL string
   * @returns true ถ้าเป็น external link
   */
  isExternalLink(link: string | undefined): boolean {
    if (!link) return false;
    return link.startsWith('http://') || link.startsWith('https://');
  }

  /**
   * ต่อ select_year ต่อท้าย URL สำหรับ external link
   * @param link URL string
   * @returns URL ที่ต่อ select_year แล้ว (ถ้าเป็น external link)
   */
  getExternalLinkWithYear(link: string | undefined): string {
    if (!link) return '';
    if (!this.isExternalLink(link)) return link;

    // ตรวจสอบว่า URL มี query string หรือไม่
    // const separator = link.includes('?') ? '-' : '?';
    return `${link}${this.select_year}`;
  }

  ngOnDestroy(): void {
    // Unsubscribe จากทุก subscription เพื่อป้องกัน memory leak
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }

  /**
   * Toggle the menu bar when having mobile screen
   */
  toggleMobileMenu(event: any) {
    var sidebarsize = document.documentElement.getAttribute("data-sidebar-size");
    if (sidebarsize == 'sm-hover-active') {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover')
    } else {
      document.documentElement.setAttribute("data-sidebar-size", 'sm-hover-active')
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    document.body.classList.remove('vertical-sidebar-enable');
  }

}
