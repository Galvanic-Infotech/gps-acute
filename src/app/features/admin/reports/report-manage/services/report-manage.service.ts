import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constant/API-CONSTANTS';

const EXCEL_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Injectable({
  providedIn: 'root'
})
export class ReportManageService {

  constructor(private apiService: ApiService) { }
  allReportTypeDynamically(payload: any,reportType : any): Observable<any> {    
    let url = reportType
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  postFullUrl(url: string, payload: any): Observable<any> {
    return this.apiService
      .postFullUrl(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  allDeviceReport(pageNumber: number, pageSize: number): Observable<any> {
    return this.apiService
      .get(this.allDeviceReportUrl(pageNumber, pageSize))
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  // server builds the xlsx itself when asked for it via Accept, unpaged
  allDeviceReportExcel(): Observable<any> {
    return this.apiService
      .getBlob(API_CONSTANTS.offlineReport, { Accept: EXCEL_MIME })
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  private allDeviceReportUrl(pageNumber: number, pageSize: number): string {
    return `${API_CONSTANTS.offlineReport}?pageNumber=${pageNumber}&pageSize=${pageSize}`;
  }
}
