import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

import { catchError, Observable, throwError } from 'rxjs';

import { NgCrudHttResponse } from '../models/crud-http-response.model';
import { buildUrl } from '../utils/url.utils';

@Injectable({
  providedIn: 'root'
})
export class CrudRequestService {
  private http = inject(HttpClient);
  
  public isLoading = signal(true);
  public isSaving = signal(false);
  public removingId = signal('');
  public savingId = signal('');
  public tableData = signal<any[]>([]);

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => new Error(error.error?.message || 'Something unexpected happened; please try again later.'));
  }

  public getTable(apiUrl: string, urlEndpoint: string): Observable<NgCrudHttResponse> {
    this.isLoading.set(true);
    return this.http.get<NgCrudHttResponse>(`${apiUrl}${urlEndpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  public getRecord(apiUrl: string, urlEndpoint: string, id: string): Observable<NgCrudHttResponse> {
    this.savingId.set(id);
    return this.http.get<NgCrudHttResponse>(`${buildUrl(apiUrl, urlEndpoint, id)}`).pipe(
      catchError(this.handleError)
    );
  }
  
  public addRecord(apiUrl: string, urlEndpoint: string, data: any): Observable<NgCrudHttResponse> {
    this.isSaving.set(true);
    return this.http.post<NgCrudHttResponse>(`${buildUrl(apiUrl, urlEndpoint)}`, data).pipe(
      catchError(this.handleError)
    );
  }

  public updateRecord(apiUrl: string, urlEndpoint: string, id: string, data: any): Observable<NgCrudHttResponse> {
    this.isSaving.set(true);
    return this.http.put<NgCrudHttResponse>(`${buildUrl(apiUrl, urlEndpoint, id)}`, data).pipe(
      catchError(this.handleError)
    );
  }

  public removeRecord(apiUrl: string, urlEndpoint: string, id: string): Observable<NgCrudHttResponse> {
    this.removingId.set(id);
    return this.http.delete<NgCrudHttResponse>(`${buildUrl(apiUrl, urlEndpoint, id)}`).pipe(
      catchError(this.handleError)
    );
  }
}