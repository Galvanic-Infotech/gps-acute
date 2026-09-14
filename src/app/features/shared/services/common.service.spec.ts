import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { CommonService } from './common.service';

const GEOCODING_URL = 'https://api.baliniot.in/api/Geocoding';

describe('CommonService', () => {
  let service: CommonService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(CommonService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('uses the cached address and never calls ola maps', () => {
    let result: any = null;
    service.getAddressValue({ Lat: 21.123606, Lng: 79.043961 }).subscribe(r => (result = r));

    httpMock.expectOne(`${GEOCODING_URL}/21.123606/79.043961`)
      .flush({ result: true, data: 'Paradise Nursery, Nagpur' });

    expect(result).toBe('Paradise Nursery, Nagpur');
    httpMock.expectNone(req => req.url.includes('olamaps.io'));
  });

  it('falls back to ola maps on empty data and posts the address back', () => {
    let result: any = null;
    service.getAddressValue({ Lat: 21.1, Lng: 79.0 }).subscribe(r => (result = r));

    httpMock.expectOne(`${GEOCODING_URL}/21.1/79.0`).flush({ result: true, data: '' });
    httpMock.expectOne(req => req.url.includes('olamaps.io'))
      .flush({ results: [{ formatted_address: 'Ola Address, Nagpur' }] });

    expect(result).toBe('Ola Address, Nagpur');
    const post = httpMock.expectOne(req => req.method === 'POST' && req.url === `${GEOCODING_URL}/token`);
    expect(post.request.body).toEqual({ address: 'Ola Address, Nagpur', latitude: 21.1, longitude: 79.0 });
    post.flush({});
  });

  it('falls back to ola maps on a 404', () => {
    let result: any = null;
    service.getAddressValue({ Lat: 1, Lng: 2 }).subscribe(r => (result = r));

    httpMock.expectOne(`${GEOCODING_URL}/1/2`)
      .flush('not found', { status: 404, statusText: 'Not Found' });
    httpMock.expectOne(req => req.url.includes('olamaps.io'))
      .flush({ results: [{ formatted_address: 'Fallback Address' }] });

    expect(result).toBe('Fallback Address');
    httpMock.expectOne(req => req.method === 'POST' && req.url === `${GEOCODING_URL}/token`).flush({});
  });
});
