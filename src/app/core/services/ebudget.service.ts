import { Injectable } from '@angular/core';
import { getFirebaseBackend } from '../../authUtils';
import { User } from 'src/app/store/Authentication/auth.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, finalize } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { GlobalComponent } from "../../global-component";
import { Store } from '@ngrx/store';
import { environment } from 'src/environments/environment';
import { LoadingService } from './loading.service';

const EMO_API = environment.EMO_API;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  

@Injectable({ providedIn: 'root' })

export class EbudgetService {

    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;
    constructor(
        private http: HttpClient, 
        private store: Store,
        private loadingService: LoadingService
    ) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('authen')!));
        // this.currentUser = this.currentUserSubject.asObservable();
     }

     GatewayGetData(model: any) {
        this.loadingService.show('กำลังดึงข้อมูล...');
  
        // if (!this.currentUserSubject || !this.currentUserSubject.value) {
           
        //     window.location.href = 'https://privus.fda.moph.go.th/';
        //     return of(null);
        // }
        
       
        
        return this.http.post(EMO_API + 'GATE_WAY/GATEWAY_EXCHANGE', {
            MODEL: JSON.stringify(model)
          }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }

     GatewayGetData_NODATE(model: any) {
        this.loadingService.show('กำลังดึงข้อมูล...');
  
        if (!this.currentUserSubject || !this.currentUserSubject.value) {
           
            window.location.href = 'https://privus.fda.moph.go.th/';
            return of(null);
        }
        
       
        
        return this.http.post(EMO_API + 'GATE_WAY/GATEWAY_EXCHANGE_NO_CDATE', {
            MODEL: JSON.stringify(model)
          }).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }

     UploadData(model: FormData) {
        this.loadingService.show('กำลังอัปโหลดข้อมูล...');
        
        return this.http.post(EMO_API + 'GATE_WAY/ProcessRequest', model).pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }

     GetSetFullModel(){
        this.loadingService.show('กำลังโหลดข้อมูลโมเดล...');
        
        return this.http.get(EMO_API + 'GET_DATA/SET_FULL_MODEL').pipe(
            map((response: any) => {
                return response;
            }),
            catchError((error: any) => {
                const errorMessage = error; // Customize the error message as needed
                return throwError(errorMessage);
            }),
            finalize(() => {
                this.loadingService.hide();
            })
        );
     }


}