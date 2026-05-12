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

        if (storedPermission && storedToken) {
            return true;
        }

        // รับ token จาก query param
        const token = route.queryParams['token'];

        // ถ้าไม่มี token
        if (!token) {
            window.location.href = 'https://app.celestsoft.com/CLS_ERP_MANANGEMENT_FRONT/';
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
            if (response && response.RESULT != null) {

                // เก็บ token
                localStorage.setItem('token', token);

                // เก็บ session
                localStorage.setItem(
                    'userSession',
                    JSON.stringify(response.RESULT)
                );

                return true;
            }

            // response ไม่ถูกต้อง
            window.location.href = 'https://app.celestsoft.com/CLS_ERP_MANANGEMENT_FRONT/';
            return false;

        } catch (error) {

            // error
            window.location.href = 'https://app.celestsoft.com/CLS_ERP_MANANGEMENT_FRONT/';
            return false;
        }
    }
}