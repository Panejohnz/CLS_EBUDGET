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
        debugger
        // Allow local development without requiring a Management session.
        // if (this.isLocalDevelopmentHost()) {
        //     return true;
        // }

        const routeToken = route.queryParams['token'] || route.queryParams['Token'];

        // เปิดหน้าภายในได้เฉพาะเมื่อมี session ที่ระบบสร้างไว้และยังไม่หมดอายุ
        if (!routeToken) {
            try {
                const response: any = await firstValueFrom(
                    this.http.post(
                        environment.CLS_MANAGEMENT + 'GET_DATA/GetUserSession',
                        { token: routeToken }
                    )
                );

                // Token หมดอายุ หรือไม่ถูกต้อง
                if (!response || response.success !== true) {
                    console.warn('Invalid session:', response?.message);

                    localStorage.removeItem('token');
                    localStorage.removeItem('userToken');
                    localStorage.removeItem('userSession');
                    localStorage.removeItem('selectedPermission');
                    localStorage.removeItem('authen');

                    this.redirectToLogin();
                    return false;
                }

                // Token ถูกต้อง
                const rawSession = response.result;

                const session = typeof rawSession === 'string'
                    ? JSON.parse(rawSession)
                    : rawSession;

                if (!session || typeof session !== 'object' || Array.isArray(session)) {
                    this.redirectToLogin();
                    return false;
                }

                const sessionToken = session?.token || routeToken;

                localStorage.setItem('token', sessionToken);
                localStorage.setItem('userToken', sessionToken);
                localStorage.setItem('userSession', JSON.stringify(session));

                if (session?.permissionData) {
                    localStorage.setItem(
                        'selectedPermission',
                        JSON.stringify(session.permissionData)
                    );
                }

                if (session?.authenData) {
                    localStorage.setItem(
                        'authen',
                        JSON.stringify(session.authenData)
                    );
                }

                return true;

            } catch (error) {
                console.error('GetUserSession request failed:', error);

                this.redirectToLogin();
                return false;
            }

            // this.redirectToLogin();
            // return false;
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
                    { token: token }
                )
            );

            // Token หมดอายุ หรือไม่ถูกต้อง
            if (!response || response.success !== true) {
                console.warn('Invalid session:', response?.message);

                localStorage.removeItem('token');
                localStorage.removeItem('userToken');
                localStorage.removeItem('userSession');
                localStorage.removeItem('selectedPermission');
                localStorage.removeItem('authen');

                this.redirectToLogin();
                return false;
            }

            // Token ถูกต้อง
            const rawSession = response.result;

            const session = typeof rawSession === 'string'
                ? JSON.parse(rawSession)
                : rawSession;

            if (!session || typeof session !== 'object' || Array.isArray(session)) {
                this.redirectToLogin();
                return false;
            }

            const sessionToken = session?.token || token;

            localStorage.setItem('token', sessionToken);
            localStorage.setItem('userToken', sessionToken);
            localStorage.setItem('userSession', JSON.stringify(session));

            if (session?.permissionData) {
                localStorage.setItem(
                    'selectedPermission',
                    JSON.stringify(session.permissionData)
                );
            }

            if (session?.authenData) {
                localStorage.setItem(
                    'authen',
                    JSON.stringify(session.authenData)
                );
            }

            return true;

        } catch (error) {
            console.error('GetUserSession request failed:', error);

            this.redirectToLogin();
            return false;
        }
    }

    private redirectToLogin(): void {
        this.router.navigate(['/auth/access-required']);
    }

    private isLocalDevelopmentHost(): boolean {
        const hostname = window.location.hostname.toLowerCase();
        return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
    }
}
