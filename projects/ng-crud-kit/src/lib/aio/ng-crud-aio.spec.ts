/*
manual mode
  should emit editRecord when editing a record
  should load table data on init
  should emit saveRecord when saving a new record
  should create
  should emit saveRecord when updating a record
  should emit removeRecord when removing a record
auto mode
  rendering - all API cases
    should create
  API success cases
    should update a record, reset form and show a snackbar
    should remove a record after confirmation and show a snackbar
    should load table data on init
    should edit a record and patch form values
    should add a record, reset form and show a snackbar
  API failure cases
    should show snackbar on update record API failure
    should show snackbar on remove record API failure
    should show snackbar on edit record API failure
    should show snackbar on initial data load API failure
    should show snackbar on add record API failure
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';

import { NgCrudAioComponent } from './ng-crud-aio';


describe('NgCrudAioComponent', () => {
  let component: NgCrudAioComponent;
  let fixture: ComponentFixture<NgCrudAioComponent>;
  let httpTestingController: HttpTestingController;

  const apiUrl = 'http://localhost:4200/api/';
  const endpoint = 'items';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgCrudAioComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
  });

  describe('auto mode', () => {
    beforeEach(() => {
      httpTestingController = TestBed.inject(HttpTestingController);

      fixture = TestBed.createComponent(NgCrudAioComponent);      
      fixture.componentRef.setInput('fields', [
          { name: 'name', type: 'input', label: 'Name', placeholder: 'Enter name', required: true }
      ]);
      fixture.componentRef.setInput('displayedColumns', ['character']);
      fixture.componentRef.setInput('columns', [{ db_name: 'character', title: 'Character' }]);
      fixture.componentRef.setInput('mode', 'auto');
      fixture.componentRef.setInput('apiUrl', apiUrl);
      fixture.componentRef.setInput('apiEndpoint', endpoint);

      component = fixture.componentInstance;
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

        expect(component.childTableData).toEqual(mockResponse.data);
        expect(component.isLoading()).toBeFalse();
      });

      it('should edit a record and patch form values', () => {
        const editId = '1';
        const mockResponse = { data: { id: 1, name: 'Edited Item' } };

        component.edit(editId);

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${editId}`);
        req.flush(mockResponse);

        expect(req.request.method).toBe('GET');
        expect(component.childFormData).toEqual(mockResponse.data);
        expect(component.savingId()).toBe(editId);
      });

      it('should add a record, reset form and show a snackbar', () => {
        const mockResponse = { data: [{ id: 1, name: 'New Item' }] };
        spyOn(component['snack'], 'open');

        httpTestingController.expectOne(`${apiUrl}${endpoint}`).flush({ data: [] });
        component.childFormData = { name: 'New Item' };
        component.save(component.childFormData); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        req.flush(mockResponse);

        expect(req.request.method).toBe('POST');
        expect(component.childTableData).toEqual(mockResponse.data);
        expect(component.isSaving()).toBeFalse();
        expect(component.savingId()).toBe('');
        expect(component['snack'].open).toHaveBeenCalledWith('Record added!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });

      it('should update a record, reset form and show a snackbar', () => {
        const updateId = '1';
        const mockResponse = { data: [{ id: 1, name: 'Updated Item' }] };
        spyOn(component['snack'], 'open');

        component.savingId.set(updateId);
        component.childFormData = { name: 'Updated Item' };
        component.save(component.childFormData); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${updateId}`);
        req.flush(mockResponse);

        expect(req.request.method).toBe('PUT');
        expect(component.childTableData).toEqual(mockResponse.data);
        expect(component.isSaving()).toBeFalse();
        expect(component.savingId()).toBe('');
        expect(component['snack'].open).toHaveBeenCalledWith('Record updated!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });

      it('should remove a record after confirmation and show a snackbar', () => {
        const removeId = '1';
        const mockResponse = { data: [] };
        spyOn(component['snack'], 'open');

        component.remove(removeId);

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        req.flush(mockResponse);

        expect(req.request.method).toBe('DELETE');
        expect(component.childTableData).toEqual(mockResponse.data);
        expect(component.removingId()).toBe('');
        expect(component['snack'].open).toHaveBeenCalledWith('Record removed!', 'Ok', { verticalPosition: 'top', duration: 3000 })
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
      
      it('should show snackbar on add record API failure', () => {
        spyOn(component['snack'], 'open');

        httpTestingController.expectOne(`${apiUrl}${endpoint}`).flush({ data: [] });
        component.childFormData = { name: 'Failed Add' };
        component.save(component.childFormData);

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('POST');
        expect(component.isSaving()).toBeFalse();
        expect(component['snack'].open).toHaveBeenCalledWith('Error adding record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });

      it('should show snackbar on update record API failure', () => {
        const updateId = '1';
        spyOn(component['snack'], 'open');

        component.savingId.set(updateId);
        component.childFormData = { name: 'Failed Update' };
        component.save(component.childFormData);

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${updateId}`);
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('PUT');
        expect(component.isSaving()).toBeFalse();
        expect(component['snack'].open).toHaveBeenCalledWith('Error updating record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
      
      it('should show snackbar on remove record API failure', () => {
        const removeId = '1';
        spyOn(component['snack'], 'open');

        component.remove(removeId);

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${removeId}`);
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('DELETE');
        expect(component.removingId()).toBe('');
        expect(component['snack'].open).toHaveBeenCalledWith('Error removing record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
      
      it('should show snackbar on edit record API failure', () => {
        spyOn(component['snack'], 'open');
        component.edit('1');

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(req.request.method).toBe('GET');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(component['snack'].open).toHaveBeenCalledWith('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
    });
    
  });

  describe('manual mode', () => {
    const mockContent = [{ id: 1, name: 'Test Item' }];

    beforeEach(() => {
      httpTestingController = TestBed.inject(HttpTestingController);

      fixture = TestBed.createComponent(NgCrudAioComponent);
      fixture.componentRef.setInput('columns', [{ db_name: 'character', title: 'Character' }]);
      fixture.componentRef.setInput('displayedColumns', ['character']);      
      fixture.componentRef.setInput('mode', 'manual');
      fixture.componentRef.setInput('tableData', mockContent);
      fixture.componentRef.setInput('fields', [
        { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true },
        { name: 'happy', type: 'select', label: 'Happy', required: false, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
        { name: 'terms', type: 'checkbox', label: 'Terms and Conditions', required: false }
      ]);      

      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load table data on init', () => { 
      expect(component.tableData()).toEqual(mockContent);
      expect(component.isLoading()).toBeFalse();
    });

    it('should emit editRecord when editing a record', () => {
      const editId = '123';
      spyOn(component.editRecord, 'emit');

      component.edit(editId);

      expect(component.editRecord.emit).toHaveBeenCalledWith(editId);
    });

    it('should emit saveRecord when saving a new record', () => {
      spyOn(component.saveRecord, 'emit');

      component.childFormData = { name: 'Manual Add', happy: 'yes', terms: true };
      component.save(component.childFormData);

      expect(component.saveRecord.emit).toHaveBeenCalledWith({ name: 'Manual Add', happy: 'yes', terms: true });
    });

    it('should emit saveRecord when updating a record', () => {
      const updateId = '5';
      spyOn(component.saveRecord, 'emit');

      component.savingId.set(updateId);
      component.childFormData = { name: 'Manual Update', happy: 'yes', terms: true };
      component.save(component.childFormData);

      expect(component.saveRecord.emit).toHaveBeenCalledWith({ name: 'Manual Update', happy: 'yes', terms: true });
    });

    it('should emit removeRecord when removing a record', () => {
      const removeId = '99';
      spyOn(component.removeRecord, 'emit');      

      component.remove(removeId);

      expect(component.removeRecord.emit).toHaveBeenCalledWith(removeId);
    });
  });
});