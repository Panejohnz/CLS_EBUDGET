import { Component, OnInit, OnDestroy, Input, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { loginSuccess } from '../../store/Authentication/authentication.actions';
// Login Auth
import { environment } from '../../../environments/environment';
import { AuthenticationService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { SessionService } from '../../core/services/session.service';
import { LoadingService } from '../../core/services/loading.service';
import { timeout, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { MenuItem } from '../../layouts/sidebar/menu.model';
import { Location } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Store } from '@ngrx/store';
interface PersonalGroupPermission {
  Personal_Id: string;
  Group_Id: string;
  Group_Name: string;
  Department_id: string;
  Department_Name: string;
  System_id?: string;
  System_Code?: string;
  System_Name?: string;
  Sytem_URL?: string;
  In_System?: number;
  ACTIVEFACT: boolean;
  CREATE_DATE: string;
  CREATE_BY: string;
  UPDATE_DATE: string;
  UPDATE_BY: string;
}

// Interface สำหรับข้อมูลจาก backend
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
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})

/**
 * Permission Component
 */
export class PermissionComponent implements OnInit, OnDestroy {
  @Input() compact = false;
  token: string = '';
  permissions: PersonalGroupPermission[] = [];
  selectedGroup: PersonalGroupPermission | null = null;
  selectedDepartmentId: string | null = null;
  selectedGroupId: string | null = null;
  error: string = '';
  navigator = navigator; // For template access

  private onlineHandler = () => {
    if (this.error.includes('ไม่มีการเชื่อมต่ออินเทอร์เน็ต')) {
      this.error = '';
      this.checkTokenAndAuthenticate();
    }
  };

  private offlineHandler = () => {
    this.error = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง';
  };
  authen: any;
  List_tb_group_menu: TbGroup[] = [];
  List_menu: TbMenu[] = [];
  List_submenu: TbSubmenu[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthenticationService,
    private menuService: MenuService,
    private sessionService: SessionService,
    private http: HttpClient,
    private location: Location,
    private loadingService: LoadingService,
    private store: Store,
    @Optional() private activeModal: NgbActiveModal
  ) {
    console.log('PermissionComponent constructor called');
  }

  ngOnInit(): void {
    console.log('PermissionComponent ngOnInit called');

    // Check if we're online before proceeding
    if (!navigator.onLine) {
      this.error = 'ไม่มีการเชื่อมต่ออินเทอร์เน็ต กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง';
      return;
    }

    // Add network event listeners
    window.addEventListener('online', this.onlineHandler);
    window.addEventListener('offline', this.offlineHandler);

    this.checkTokenAndAuthenticate();
  }

  ngOnDestroy(): void {
    // Remove network event listeners
    window.removeEventListener('online', this.onlineHandler);
    window.removeEventListener('offline', this.offlineHandler);
  }

  private checkTokenAndAuthenticate(): void {
    // Get token from query parameters
    this.route.queryParams.subscribe(params => {
      this.token = params['Token'] || this.authService.getStoredToken() || '';


      if (!this.token) {
        // No token provided, redirect to FDA website
        window.location.href = 'https://bfast.pacc.go.th/cls_erp_management_front/';
        return;
      }

      // console.log('Token received:', this.token);
      // ลบ query param ออกจาก URL (ไม่ reload หน้า)
      this.location.replaceState(this.router.url.split('?')[0]);
      // Call GET_AUTHEN API with token
      this.callGetAuthen();
    });
  }

  private async callGetAuthen(): Promise<void> {
    this.loadingService.show('กำลังตรวจสอบสิทธิ์...');
    this.error = '';
    try {
      const response: any = await this.authService.validateToken(this.token);
      console.log('response', response);

      if (response?.RESULT == null) {
        this.authen = response.USER_LOGIN;
        this.permissions = response.List_Personal_Group_User || [];
        console.log('permissions', this.permissions);
      } else {
        this.error = response?.RESULT || 'ไม่สามารถตรวจสอบสิทธิ์ได้';
      }
    } catch (error) {
      console.error('Validate token failed:', error);
      this.error = 'ไม่สามารถเชื่อมต่อเพื่อตรวจสอบสิทธิ์ได้';
    } finally {
      this.loadingService.hide();
    }
  }

  private getPersonalGroupPermissions(): void {
    this.loadingService.show('กำลังโหลดข้อมูลสิทธิ์...');
    // console.log('Calling getPersonalGroupPermissions with token:', this.token);

    this.authService.getPersonalGroupPermissions(this.token).pipe(
      timeout(15000), // 15 second timeout
      catchError((error: any) => {
        // console.error('Permission loading error:', error);
        this.loadingService.hide();
        this.error = 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง';
        return of(null);
      })
    ).subscribe({
      next: (response: any) => {
        // console.log('Permissions response:', response);
        this.loadingService.hide();

        if (response && response.RESULT) {
          this.permissions = response.RESULT;
          // console.log('Loaded permissions:', this.permissions);

          // If only one permission, auto-select it
          if (this.permissions.length === 1) {
            this.selectPermission(this.permissions[0]);
          }
        } else {
          this.error = 'ไม่พบสิทธิ์การเข้าถึง กรุณาติดต่อผู้ดูแลระบบ';
        }
      },
      error: (error: any) => {
        this.loadingService.hide();
        this.error = 'ไม่สามารถโหลดข้อมูลสิทธิ์ได้ กรุณาลองใหม่อีกครั้ง';
        // console.error('Permission loading error:', error);
      }
    });
  }

  selectPermission(permission: PersonalGroupPermission): void {
    this.selectedGroup = permission;
    this.loadingService.show('กำลังโหลดเมนู...');
    this.error = '';
    this.authService.storeSelectedPermission(permission, this.token, this.authen);
    this.authService.persistLoginToken(this.token);
    this.authService.persistCurrentUser(this.authen || {});
    localStorage.setItem('toast', 'true');
    this.store.dispatch(loginSuccess({
      user: {
        ...this.authen,
        token: this.token
      } as any
    }));
    console.log('Selecting permission:', permission);
    console.log('Token:', this.token);

    this.http.post<MenuDataResponse>(environment.CLS_MANAGEMENT + 'GET_DATA/GetMenu', {
      token: this.token,
      permission_id: permission.Group_Id,
      System_Id: permission.System_id
    }).pipe(
      timeout(15000), // 15 second timeout
      catchError((error: any) => {
        // console.error('Menu loading error:', error);
        this.loadingService.hide();
        this.error = 'ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง';
        return of({ List_tb_group_menu: [], List_menu: [], List_submenu: [] });
      })
    ).subscribe({
      next: (menuData: MenuDataResponse) => {
        // console.log('Menu data loaded:', menuData);
        this.loadingService.hide();
debugger
        if (menuData && menuData.List_tb_group_menu && menuData.List_tb_group_menu.length > 0) {

          this.List_tb_group_menu = menuData.List_tb_group_menu;
          this.List_menu = menuData.List_menu;
          this.List_submenu = menuData.List_submenu;
          const menuItems = this.convertToMenuStructure(menuData);
          this.sessionService.createNewSession(
            this.token,
            permission.Group_Id,
            permission,
            this.authen,
            menuItems
          );
          // localStorage.setItem('SESSION_KEY', JSON.stringify(menuItems));
          if (permission.In_System == 1) {
            this.activeModal?.close();
            this.redirectToTrustedSystem(permission.Sytem_URL || environment.MANAGEMENT_FRONT);
          } else {
            const updateSession = localStorage.getItem("userSession");
            this.http.post<any>(environment.UPDATE_SESSION, {
              token: this.token,
              updateSession: updateSession,
            }).subscribe({
              next: (response: any) => {
                if (response.RESULT == null) {
                  const targetUrl = this.createTrustedSystemUrl(permission.Sytem_URL || '');
                  this.loadingService.hide();

                  if (!targetUrl) {
                    this.error = 'ไม่พบ URL ของระบบที่เลือก กรุณาติดต่อผู้ดูแลระบบ';
                    return;
                  }

                  if (targetUrl) {
                    this.activeModal?.close();
                    window.location.assign(targetUrl);
                    return;
                  }
                }
              },
              error: (error: any) => {
                console.error('Menu loading error:', error);
                this.error = 'ไม่สามารถไปยัง URL ที่กำหนดได้';
              }
            });




          }
        } else {
          this.error = 'ไม่พบเมนูสำหรับสิทธิ์นี้ กรุณาติดต่อผู้ดูแลระบบ';
        }
      },
      error: (error: any) => {
        this.loadingService.hide();
        this.error = 'ไม่สามารถโหลดเมนูได้ กรุณาลองใหม่อีกครั้ง';
        // console.error('Menu loading error:', error);
      }
    });

    // เรียก API เพื่อดึง menu ตาม permission ก่อน

  }

  private redirectToTrustedSystem(baseUrl: string): void {
    const targetUrl = this.createTrustedSystemUrl(baseUrl);
    if (!targetUrl) {
      this.loadingService.hide();
      this.error = 'ไม่พบ URL ของระบบที่เลือก หรือ URL ไม่ได้รับอนุญาต';
      return;
    }

    this.loadingService.hide();
    window.location.assign(targetUrl);
  }

  private createTrustedSystemUrl(baseUrl: string): string {
    const value = baseUrl.trim();
    if (!value) {
      return '';
    }

    try {
      const url = new URL(value, window.location.origin);
      const trustedHosts = new Set([
        window.location.hostname,
        '172.10.101.38',
        'bfast.pacc.go.th',
        'app.celestsoft.com',
        'localhost'
      ]);
      if (!trustedHosts.has(url.hostname)) {
        return '';
      }

      // ใช้ host เดียวกับระบบปัจจุบันเสมอ เพื่อให้ userSession เดิมถูกอ่านได้
      // รองรับค่่า Sytem_URL เก่าที่เคยเก็บเป็น app.celestsoft.com หรือ bfast.pacc.go.th
      if (url.hostname !== window.location.hostname) {
        url.protocol = window.location.protocol;
        url.host = window.location.host;
      }

      // Never expose tokens in a URL (including a stale token already present in Sytem_URL).
      url.searchParams.delete('Token');
      url.searchParams.delete('token');
      return url.toString();
    } catch {
      return '';
    }
  }

  getUniqueGroups(): PersonalGroupPermission[] {
    const uniqueGroups = new Map<string, PersonalGroupPermission>();

    this.permissions.forEach(permission => {
      const key = `${permission.Group_Id}_${permission.Department_id}`;
      if (!uniqueGroups.has(key)) {
        uniqueGroups.set(key, permission);
      }
    });

    return Array.from(uniqueGroups.values());
  }

  getUniqueDepartments(): PersonalGroupPermission[] {
    const departments = new Map<string, PersonalGroupPermission>();

    this.permissions.forEach(permission => {
      if (permission.Department_id && !departments.has(permission.Department_id)) {
        departments.set(permission.Department_id, permission);
      }
    });

    return Array.from(departments.values());
  }

  getGroupsForSelectedDepartment(): PersonalGroupPermission[] {
    if (!this.selectedDepartmentId) {
      return [];
    }

    const groups = new Map<string, PersonalGroupPermission>();
    this.permissions
      .filter(permission => permission.Department_id === this.selectedDepartmentId)
      .forEach(permission => {
        if (permission.Group_Id && !groups.has(permission.Group_Id)) {
          groups.set(permission.Group_Id, permission);
        }
      });

    return Array.from(groups.values());
  }

  getSystemsForSelection(): PersonalGroupPermission[] {
    if (!this.selectedDepartmentId || !this.selectedGroupId) {
      return [];
    }

    const systems = new Map<string, PersonalGroupPermission>();
    this.permissions
      .filter(permission =>
        permission.Department_id === this.selectedDepartmentId &&
        permission.Group_Id === this.selectedGroupId
      )
      .forEach(permission => {
        const key = permission.System_id || permission.System_Code || permission.System_Name || permission.Group_Id;
        if (!systems.has(key)) {
          systems.set(key, permission);
        }
      });

    return Array.from(systems.values());
  }

  onDepartmentChange(departmentId: string | null): void {
    this.selectedDepartmentId = departmentId;
    this.selectedGroupId = null;
    this.selectedGroup = null;
  }

  onGroupChange(groupId: string | null): void {
    this.selectedGroupId = groupId;
    this.selectedGroup = null;
  }

  enterSelectedPermission(): void {
    const permission = this.getSystemsForSelection()[0];
    if (permission) {
      this.selectPermission(permission);
    }
  }


  // Add retry method
  retry(): void {
    this.error = '';
    this.checkTokenAndAuthenticate();
  }

  private convertToMenuStructure(menuData: MenuDataResponse): MenuItem[] {
    const menuItems: MenuItem[] = [];
    const groupMap = new Map<number, MenuItem>();

    // 1. สร้าง Groups (ระดับสูงสุด) - เรียงตาม sort_index
    const sortedGroups = menuData.List_tb_group_menu
      .filter(group => group.Activefact)
      .sort((a, b) => (a.sort_index || 0) - (b.sort_index || 0));

    sortedGroups.forEach(group => {
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
      .filter(menu => menu.menu_active)
      .sort((a, b) => (a.sort_index || 0) - (b.sort_index || 0));

    sortedMenus.forEach(menu => {
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
      .filter(submenu => submenu.submenu_active)
      .sort((a, b) => (a.sort_index || 0) - (b.sort_index || 0));

    sortedSubmenus.forEach(submenu => {
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
   * สร้าง link สำหรับ menu
   */
  private buildMenuLink(controller: string, action: string): string {
    if (!controller || !action) return '#';
    return `/${controller}/${action}`;
  }

  /**
   * หา parent menu ในโครงสร้าง groups
   */
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

  /**
   * หา menu ใน subItems
   */
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
}
