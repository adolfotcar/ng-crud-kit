/*
TODO: review, created with chat just had a 5min interaction with it
*/

import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CrudRequestService } from './ng-crud-request.service';
import { NgCrudHttResponse } from '../models/crud-http-response.model';
import { provideHttpClient } from '@angular/common/http';

describe('CrudRequestService', () => {
  let service: CrudRequestService;
  let httpMock: HttpTestingController;
  const apiUrl = 'api';
  const endpoint = 'test';
  const mockResponse: NgCrudHttResponse = { status: "success", data: [{ id: 1, name: 'test' }] };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [CrudRequestService, provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(CrudRequestService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getTable should call GET and set isLoading', () => {
    expect(service.isLoading()).toBeTrue();

    service.getTable(apiUrl, endpoint).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);

    expect(service.isLoading()).toBeTrue(); 
  });

  it('getRecord should call GET and set savingId', () => {
    const id = '123';
    service.getRecord(apiUrl, endpoint, id).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    expect(service.savingId()).toBe(id);

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('addRecord should call POST and set isSaving', () => {
    const payload = { name: 'new' };

    service.addRecord(apiUrl, endpoint, payload).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    expect(service.isSaving()).toBeTrue();

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('updateRecord should call PUT and set isSaving', () => {
    const id = '1';
    const payload = { name: 'updated' };

    service.updateRecord(apiUrl, endpoint, id, payload).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    expect(service.isSaving()).toBeTrue();

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}/${id}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush(mockResponse);
  });

  it('removeRecord should call DELETE and set removingId', () => {
    const id = '99';

    service.removeRecord(apiUrl, endpoint, id).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    expect(service.removingId()).toBe(id);

    const req = httpMock.expectOne(`${apiUrl}/${endpoint}/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(mockResponse);
  });

  it('should handle errors with handleError', () => {
    let errorMessage = '';
    service.getTable(apiUrl, endpoint).subscribe({
      error: (error: Error) => {
        errorMessage = error.message;
      }
    });

    const req = httpMock.expectOne(`${apiUrl}${endpoint}`);
    req.flush({ message: 'Test error' }, { status: 500, statusText: 'Server Error' });

    expect(errorMessage).toBe('Test error');
  });
});