import { Injectable } from '@angular/core';
import { getFirebaseBackend } from '../../authUtils';
import { User } from '../../store/Authentication/auth.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { GlobalComponent } from "../../global-component";
import { Store } from '@ngrx/store';
import { RegisterSuccess, loginFailure, loginSuccess, logout, logoutSuccess } from '../../store/Authentication/authentication.actions';
import { environment } from '../../../environments/environment';
import { locale } from 'moment';
import { firstValueFrom } from 'rxjs';
const AUTH_API = GlobalComponent.AUTH_API;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const LS_TOKEN = 'token';
const LS_TOKEN_LEGACY = 'Token';
const LS_CURRENT_USER = 'currentUser';
const SS_USER_TOKEN = 'userToken';
const SS_AUTH_TOKEN = 'authToken';
const SS_TOKEN_REST = 'token';
const SS_CURRENT_USER = 'currentUser';
const SS_AUTHEN = 'authen';
const SS_SELECTED_PERMISSION = 'selectedPermission';
const SS_USER_SESSION = 'userSession';
const SS_SIDEBAR_MENU = 'sidebarMenu';
@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {

  user!: User;
  currentUserValue: any;

  private currentUserSubject: BehaviorSubject<User>;
  // public currentUser: Observable<User>;

  constructor(private http: HttpClient, private store: Store) {
    this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')!));
    // this.currentUser = this.currentUserSubject.asObservable();
  }

  /**
   * Performs the register
   * @param email email
   * @param password password
   */
  register(email: string, first_name: string, password: string) {
    // return getFirebaseBackend()!.registerUser(email, password).then((response: any) => {
    //     const user = response;
    //     return user;
    // });

    // Register Api
    return this.http.post(AUTH_API + 'signup', {
      email,
      first_name,
      password,
    }, httpOptions).pipe(
      map((response: any) => {
        const user = response;
        return user;
      }),
      catchError((error: any) => {
        const errorMessage = 'Login failed'; // Customize the error message as needed
        this.store.dispatch(loginFailure({ error: errorMessage }));
        return throwError(errorMessage);
      })
    );
  }

  /**
   * Performs the auth
   * @param email email of user
   * @param password password of user
   */
  login(email: string, password: string) {
    // return getFirebaseBackend()!.loginUser(email, password).then((response: any) => {
    //     const user = response;
    //     return user;
    // });

    return this.http.post(AUTH_API + 'signin', {
      email,
      password
    }, httpOptions).pipe(
      map((response: any) => {
        const user = response;
        return user;
      }),
      catchError((error: any) => {
        const errorMessage = 'Login failed'; // Customize the error message as needed
        return throwError(errorMessage);
      })
    );
  }

  /**
   * Returns the current user
   */
  public currentUser(): any {
    return getFirebaseBackend()!.getAuthenticatedUser();
  }

  /**
   * Logout the user
   */
  logout() {
    this.store.dispatch(logout());
    // logout the user
    // return getFirebaseBackend()!.logout();
    localStorage.removeItem('selectedPermission');
    localStorage.removeItem('userToken');
    localStorage.removeItem('authen');
    this.currentUserSubject.next(null!);

    return of(undefined).pipe(

    );

  }

  /**
   * Reset password
   * @param email email
   */
  resetPassword(email: string) {
    return getFirebaseBackend()!.forgetPassword(email).then((response: any) => {
      const message = response.data;
      return message;
    });
  }

  /**
   * Validate token and get authentication status
   */
  async validateToken(token: string) {
    // const authModel = {
    //   ACTION: 'GET_AUTHEN',
    //   TOKEN: token
    // };

    // Use the correct endpoint from environment
    // return this.http.post(environment.CLS_MANAGEMENT + 'GET_DATA/', {
    //   TOKEN: token
    // }).pipe(
    //   map((response: any) => {
    //     // console.log('ValidateToken response:', response);
    //     return response;
    //   }),
    //   catchError((error: any) => {
    //     // console.error('ValidateToken API error:', error);
    //     return throwError(() => error);
    //   })
    // );
    const response: any = await firstValueFrom(
      this.http.post(
        environment.CLS_MANAGEMENT + 'GET_DATA/GET_AUTHEN',
        {
          token: token
        }
      )
    );

    // เช็ค response
    if (response) {
      return response;
    }

  }

  /**
   * Get personal group permissions
   */
  getPersonalGroupPermissions(token: string): Observable<any> {
    const permissionModel = {
      ACTION: 'List_Personal_Group_Permission',
      TOKEN: token
    };

    // Use the correct endpoint from environment
    return this.http.post(environment.EMO_API + 'GATE_WAY/GATEWAY_EXCHANGE', {
      MODEL: JSON.stringify(permissionModel)
    }).pipe(
      map((response: any) => {
        // console.log('GetPersonalGroupPermissions response:', response);
        return response;
      }),
      catchError((error: any) => {
        // console.error('GetPersonalGroupPermissions API error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Store selected permission in session storage
   */
  storeSelectedPermission(permission: any, token: string, authen: any): void {
    localStorage.setItem('selectedPermission', JSON.stringify(permission));
    localStorage.setItem('userToken', token);
    localStorage.setItem('authen', JSON.stringify(authen));
  }
  persistLoginToken(token: string): void {
    if (!token) return;
    localStorage.setItem(LS_TOKEN, token);
    localStorage.setItem(LS_TOKEN_LEGACY, token);
    // sessionStorage.setItem(SS_USER_TOKEN, token);
    // sessionStorage.setItem(SS_AUTH_TOKEN, token);
    // sessionStorage.setItem(SS_TOKEN_REST, token);
  }
  persistCurrentUser(user: unknown): void {
    const json = JSON.stringify(user ?? {});
    localStorage.setItem(LS_CURRENT_USER, json);
    // sessionStorage.setItem(SS_CURRENT_USER, json);
    try {
      this.currentUserSubject.next(JSON.parse(json) as User);
    } catch {
      this.currentUserSubject.next(null!);
    }
  }
  getAuthen(): any {
    const authen = localStorage.getItem('authen');
    return authen ? JSON.parse(authen) : null;
  }

  /**
   * Get stored permission from session storage
   */
  getStoredPermission(): any {
    const permission = localStorage.getItem('selectedPermission');
    return permission ? JSON.parse(permission) : null;
  }

  /**
   * Get stored token from session storage
   */
  getStoredToken(): string | null {
    return localStorage.getItem('userToken');
  }

  /**
   * Clear stored authentication data
   */
  clearStoredAuth(): void {
    localStorage.removeItem('selectedPermission');
    localStorage.removeItem('userToken');
  }

}

