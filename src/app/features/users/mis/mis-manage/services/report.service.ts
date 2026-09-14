

import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ApiService } from 'src/app/features/http-services/api.service';
import { API_CONSTANTS } from 'src/app/features/shared/constant/API-CONSTANTS';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(private apiService: ApiService,
    private http: HttpClient
  ) { }
  allReportTypeDynamically(payload: any,reportType : any): Observable<any> {    
    let url = reportType === 'Distance' ? 'Distance/distanceReport' : reportType;
    return this.apiService
      .post(url, payload)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getAddress(lat:any, lng:any) {
    // let url = `https://gpssoftware.in/web_api/api/geocode/Geocode/miracle/miracle/${lat}/${lng}`
    // let url = `http://103.89.44.154/devicecheckapi/WeatherForecast/GetAddress?lat=${lat}&lng=${lng}`
let url = `https://gpssoftware.in/web_api/api/Geocode/Geocode/123456/aisgps/${lat}/${lng}`
    return this.http.get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  // jainath jha api
  getAddressDetail(latitude:any, longitude:any){
    let payload = {
      lat:latitude,
      lng:longitude
    }
    let params = new HttpParams();
    params = params.appendAll(payload);
    let url = 'https://gpsvts.in:20005/WeatherForecast/GetAddress'
    return this.http.get(url,{ params: params })
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  getAddressInfo(lat:any, lng:any) {
    let url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat}%2C${lng}&api_key=9MAk06zIPpvbF93yY24NqZar6IWCCfl3Ujqe09mN`
    return this.http.get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  // baliniot address cache: GET returns { result, data }, data '' means not cached yet
  private geocodingUrl = 'https://api.baliniot.in/api/Geocoding';

  getCachedAddress(lat: any, lng: any) {
    return this.http.get<any>(`${this.geocodingUrl}/${lat}/${lng}`)
      .pipe(catchError(() => of(null)));
  }

  // POST goes to /Geocoding/token: no JWT needed, and the '/token' suffix keeps
  // HttpInterceptorsService from attaching one (and from logging the user out on a 401)
  updateAddress(address: string, latitude: number, longitude: number) {
    return this.http.post(`${this.geocodingUrl}/token`, { address, latitude, longitude })
      .pipe(catchError(() => of(null)));
  }

  getAddressInfo2(lat:any, lng:any) {
    let url = `https://api.olamaps.io/places/v1/reverse-geocode?latlng=${lat}%2C${lng}&api_key=9MAk06zIPpvbF93yY24NqZar6IWCCfl3Ujqe09mN`
    return this.http.get(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }

  alertReport(payload:any): Observable<any> {
    let url = API_CONSTANTS.alert
    return this.apiService
    .postData(url, payload)
    .pipe(catchError((error: HttpErrorResponse) => of(error)));
  } 



  alertType(): Observable<any> {
    let url = API_CONSTANTS.alertType
    return this.apiService
      .getData(url)
      .pipe(catchError((error: HttpErrorResponse) => of(error)));
  }
  

  
}
