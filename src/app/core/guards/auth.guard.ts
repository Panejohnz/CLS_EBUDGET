import { Injectable } from '@angular/core';
import {
    Router,
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
} from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthenticationService } from '../services/auth.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private http: HttpClient
    ) { }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        // เช็ค token และ permission เดิม
        const storedPermission = this.authenticationService.getStoredPermission();
        const storedToken = this.authenticationService.getStoredToken();

        const routeToken = route.queryParams['token'] || route.queryParams['Token'];

        if (!routeToken && storedPermission && storedToken) {
            return true;
        }

        // รับ token จาก query param
        const token = routeToken || storedToken || localStorage.getItem('token');

        // ถ้าไม่มี token
        if (!token) {
            window.location.href = 'http://172.10.101.38/CLS_ERP_MANANGEMENT_FRONT/';
            return false;
        }

        try {

            const response: any = await firstValueFrom(
                this.http.post(
                    environment.CLS_MANAGEMENT + 'GET_DATA/GetUserSession',
                    {
                        token: token
                    }
                )
            );

            // เช็ค response
            if (response ) {

                // เก็บ token
                localStorage.setItem('token', token);

                // เก็บ session
                localStorage.setItem(
                    'userSession',
                    // response.RESULT อันเก่านะ
                    response
                );

                const rawSession = response?.RESULT ?? response;
                const session = typeof rawSession === 'string' ? JSON.parse(rawSession) : rawSession;
                const sessionToken = session?.token || token;

                localStorage.setItem('token', sessionToken);
                localStorage.setItem('userToken', sessionToken);
                localStorage.setItem('userSession', JSON.stringify(session));

                if (session?.permissionData) {
                    localStorage.setItem('selectedPermission', JSON.stringify(session.permissionData));
                }
                if (session?.authenData) {
                    localStorage.setItem('authen', JSON.stringify(session.authenData));
                }

                return true;
            }

            // response ไม่ถูกต้อง
            window.location.href = 'http://172.10.101.38/CLS_ERP_MANANGEMENT_FRONT/';
            return false;

        } catch (error) {
            console.error('GetUserSession request failed:', error);
            window.location.href = 'http://172.10.101.38/CLS_ERP_MANANGEMENT_FRONT/';
            return false;
        }
    }
}
