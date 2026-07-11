import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constant/API-CONSTANTS';

@Injectable({
  providedIn: 'root'
})
export class ResellerService {

  constructor(
    private apiService: ApiService
  ) { }

  resellerData(): Observable<any> {
    let url = API_CONSTANTS.resellerList
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  reseller(payload:any): Observable<any> {
    let url = API_CONSTANTS.reseller
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getResellerById(id:any): Observable<any> {
    let url = API_CONSTANTS.getResellerById.replace('{id}', id)
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updateReseller(id:any,payload:any): Observable<any> {
    let url = API_CONSTANTS.updateReseller.replace('{id}', id)
    return this.apiService
      .put(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  DebitPoint(payload:any): Observable<any> {
    let url = API_CONSTANTS.DebitPoint
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  CreditPoint(payload:any): Observable<any> {
    let url = API_CONSTANTS.CreditPoint
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  addEmployee(payload:any): Observable<any> {
    let url = API_CONSTANTS.resellerEmployee
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getBillingConfig(dealerId: any): Observable<any> {
    const url = API_CONSTANTS.billingConfigByDealer.replace('{id}', dealerId);
    return this.apiService
      .get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  createBillingConfig(payload: any): Observable<any> {
    return this.apiService
      .post(API_CONSTANTS.billingConfig, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  updateBillingConfig(dealerId: any, payload: any): Observable<any> {
    const url = API_CONSTANTS.billingConfigByDealer.replace('{id}', dealerId);
    return this.apiService
      .patch(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  runBillingSummary(payload: any): Observable<any> {
    return this.apiService
      .post(API_CONSTANTS.runBillingSummary, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  addBillingCredit(payload: any): Observable<any> {
    return this.apiService
      .post(API_CONSTANTS.billingCredit, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getBillingWallet(): Observable<any> {
    return this.apiService
      .get(API_CONSTANTS.billingWallet)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getOutstanding(pageNumber: number, pageSize: number, search: string): Observable<any> {
    const params: any = {
      pageNumber: String(pageNumber),
      pageSize: String(pageSize),
      search: search ?? '',
    };
    return this.apiService
      .get(API_CONSTANTS.billingOutstanding, { params })
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
}
