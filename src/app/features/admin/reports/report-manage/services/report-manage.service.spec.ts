import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { ReportManageService } from './report-manage.service';

describe('ReportManageService', () => {
  let service: ReportManageService;
  let http: HttpTestingController;
  const base = 'https://api.gpsvts.in/api/Offline/Report';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
    });
    service = TestBed.inject(ReportManageService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('requests the asked page of the all device report', () => {
    service.allDeviceReport(2, 10).subscribe();
    const req = http.expectOne(`${base}?pageNumber=2&pageSize=10`);
    expect(req.request.method).toBe('GET');
    req.flush({ totalCount: 34, data: [] });
  });

  it('asks the server for the unpaged xlsx via the Accept header', () => {
    service.allDeviceReportExcel().subscribe();
    const req = http.expectOne(base);
    expect(req.request.headers.get('Accept')).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob());
  });
});
