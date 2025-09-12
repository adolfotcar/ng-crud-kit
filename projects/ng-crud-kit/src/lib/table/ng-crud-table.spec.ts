/*
auto mode
  API failure cases
    should show snackbar on initial data load API failure
    should show snackbar on remove record API failure
  API success cases
    should remove a record after confirmation and show a snackbar
    should load table data on init
    should edit a record and redirect to editing page
  rendering - all API cases
    should create
manual mode
  should create
  should emit editRecord when editing a record
  should load table data on init
  should emit removeRecord when removing a record
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { NgCrudTableComponent } from './ng-crud-table';


describe('NgCrudTableComponent', () => {
  let component: NgCrudTableComponent;
  let fixture: ComponentFixture<NgCrudTableComponent>;
  let httpTestingController: HttpTestingController;

  const apiUrl = 'http://localhost:4200/api/';
  const endpoint = 'items';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgCrudTableComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
  });

  describe('auto mode', () => {
    let router: Router;

    beforeEach(() => {
      httpTestingController = TestBed.inject(HttpTestingController);
      fixture = TestBed.createComponent(NgCrudTableComponent);

      fixture.componentRef.setInput('displayedColumns', []);
      fixture.componentRef.setInput('editUrl', 'items');

      component = fixture.componentInstance;      
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    describe('rendering - all API cases', () => {
      it('should create', () => {
        expect(component).toBeTruthy();
      });
    });

    describe('API success cases', () => {
      it('should load table data on init', () => {
        const mockResponse = { data: [{ id: 1, name: 'Test Item' }] };
        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        
        req.flush(mockResponse);

        expect(req.request.method).toBe('GET');
        expect(component.dataSource.data).toEqual(mockResponse.data);
        expect(component.isLoading()).toBeFalse();
      });

      it('should edit a record and redirect to editing page', () => {
        const recordId = '1';
        const navigateSpy = spyOn(router, 'navigate');

        component.edit(recordId);

        expect(navigateSpy).toHaveBeenCalledWith([`${component.editUrl()}/${recordId}`]);
      });

      it('should remove a record after confirmation and show a snackbar', () => {
        const mockResponse = { data: [] };

        spyOn(component['snack'], 'open');
        spyOn(component['deleteDialog'], 'open').and.returnValue({
          afterClosed: () => ({
            subscribe: (cb: any) => cb(true) // simulate confirmation
          })
        } as any);

        component.remove('1');

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);        
        req.flush(mockResponse);

        expect(req.request.method).toBe('DELETE');        
        expect(component.dataSource.data).toEqual(mockResponse.data);
        expect(component.removingId()).toBe('');
        expect(component['snack'].open).toHaveBeenCalledWith('Record removed!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
    });

    describe('API failure cases', () => {   
      it('should show snackbar on initial data load API failure', () => {
        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        spyOn(component['snack'], 'open');

        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('GET');        
        expect(component.isLoading()).toBeFalse();
        expect(component['snack'].open).toHaveBeenCalledWith('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });

      it('should show snackbar on remove record API failure', () => {
        spyOn(component['snack'], 'open');
        spyOn(component['deleteDialog'], 'open').and.returnValue({
          afterClosed: () => ({
            subscribe: (cb: any) => cb(true)
          })
        } as any);
        
        component.remove('1');

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('DELETE');
        expect(component.removingId()).toBe('');
        expect(component['snack'].open).toHaveBeenCalledWith('Error removing record!', 'Ok', { verticalPosition: 'top', duration: 3000 });        
      });
    });
  });

  describe('manual mode', () => {
      beforeEach(() => {
        httpTestingController = TestBed.inject(HttpTestingController);

        fixture = TestBed.createComponent(NgCrudTableComponent);      
        fixture.componentRef.setInput('columns', [{ db_name: 'character', title: 'Character' }]);
        fixture.componentRef.setInput('displayedColumns', ['character']);      
        fixture.componentRef.setInput('mode', 'manual');
        fixture.componentRef.setInput('tableData', [{ id: 1, name: 'Test Item' }]);

        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  
      it('should create', () => {
        expect(component).toBeTruthy();
      });
  
      it('should load table data on init', () => { 
        expect(component.tableData()).toEqual([{ id: 1, name: 'Test Item' }]);
        expect(component.isLoading()).toBeFalse();
      });
  
      it('should emit editRecord when editing a record', () => {
        const editId = '123';
        spyOn(component.editRecord, 'emit');
  
        component.edit(editId);
  
        expect(component.editRecord.emit).toHaveBeenCalledWith(editId);
      });
  
      it('should emit removeRecord when removing a record', () => {
        const removeId = '99';
        spyOn(component.removeRecord, 'emit');
  
        component.remove(removeId);
  
        spyOn(component['deleteDialog'], 'open').and.returnValue({
          afterClosed: () => ({
            subscribe: (cb: any) => cb(true)
          })
        } as any);
  
        component.remove(removeId);
  
        expect(component.removeRecord.emit).toHaveBeenCalledWith(removeId);
      });
    });
});