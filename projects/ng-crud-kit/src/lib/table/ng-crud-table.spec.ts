import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { NgCrudTableComponent } from './ng-crud-table';
import { provideRouter, Router } from '@angular/router';


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
      fixture = TestBed.createComponent(NgCrudTableComponent);
      component = fixture.componentInstance;
      httpTestingController = TestBed.inject(HttpTestingController);
      router = TestBed.inject(Router);

      fixture.componentRef.setInput('displayedColumns', []);
      fixture.componentRef.setInput('editUrl', 'items');

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
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(component.dataSource.data).toEqual(mockResponse.data);
        expect(component.isLoading()).toBeFalse();
      });

      it('should edit a record and redirect to edit page', () => {
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
        expect(req.request.method).toBe('DELETE');
        req.flush(mockResponse);

        expect(component['snack'].open).toHaveBeenCalled();
        expect(component.dataSource.data).toEqual(mockResponse.data);
        expect(component.removingId()).toBe('');
      });
    });

    describe('API failure cases', () => {   
      it('should show snackbar on initial data load API failure', () => {
        spyOn(component['snack'], 'open');

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        expect(req.request.method).toBe('GET');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });
        
        expect(component['snack'].open).toHaveBeenCalledWith('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        expect(component.isLoading()).toBeFalse();
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
        expect(req.request.method).toBe('DELETE');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(component['snack'].open).toHaveBeenCalledWith('Error removing record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        expect(component.removingId()).toBe('');
      });
    });
  });

  describe('manual mode', () => {
      beforeEach(() => {
        // Create a fresh component instance for manual mode tests
        fixture = TestBed.createComponent(NgCrudTableComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
  
        fixture.componentRef.setInput('columns', [{ db_name: 'character', title: 'Character' }]);
        fixture.componentRef.setInput('displayedColumns', ['character']);      
        fixture.componentRef.setInput('mode', 'manual');
        fixture.componentRef.setInput('tableData', [{ id: 1, name: 'Test Item' }]);
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
        spyOn(component.editRecord, 'emit');
  
        component.edit('123');
  
        expect(component.editRecord.emit).toHaveBeenCalledWith('123');
      });
  
      it('should emit removeRecord when removing a record', () => {
        spyOn(component.removeRecord, 'emit');
  
        component.remove('99');
  
        spyOn(component['deleteDialog'], 'open').and.returnValue({
          afterClosed: () => ({
            subscribe: (cb: any) => cb(true)
          })
        } as any);
  
        component.remove('99');
  
        expect(component.removeRecord.emit).toHaveBeenCalledWith('99');
      });
    });
});