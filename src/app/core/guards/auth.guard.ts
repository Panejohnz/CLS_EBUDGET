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
import { SessionService } from '../services/session.service';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })

export class AuthGuard implements CanActivate {

    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private sessionService: SessionService,
        private http: HttpClient
    ) { }

    async canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Promise<boolean> {
        const routeToken = route.queryParams['token'] || route.queryParams['Token'];

        // เปิดหน้าภายในได้เฉพาะเมื่อมี session ที่ระบบสร้างไว้และยังไม่หมดอายุ
        if (!routeToken) {
            try {
                if (this.sessionService.hasValidSession()) {
                    return true;
                }
            } catch {
                // Invalid session data is handled by redirecting below.
            }

            this.redirectToLogin();
            return false;
        }

        // รับ token ที่ระบบกลางส่งมาใน query string เพื่อสร้าง session ใหม่
        const token = routeToken;

        if (!environment.production && sessionStorage.getItem('currentUser')) {
            localStorage.setItem('token', token);
            localStorage.setItem('userToken', token);
            return true;
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
            this.redirectToLogin();
            return false;

        } catch (error) {
            console.error('GetUserSession request failed:', error);
            this.redirectToLogin();
            return false;
        }
    }

    private redirectToLogin(): void {
        this.router.navigate(['/auth/access-required']);
    }
}
