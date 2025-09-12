import { ComponentFixture, TestBed, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { NgCrudAioComponent } from './ng-crud-aio';
import { provideRouter } from '@angular/router';


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
      fixture = TestBed.createComponent(NgCrudAioComponent);
      component = fixture.componentInstance;
      httpTestingController = TestBed.inject(HttpTestingController);

      fixture.componentRef.setInput('fields', [
          { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
      ]);
      fixture.componentRef.setInput('displayedColumns', ['character', 'production', 'director', 'company', 'year']);

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

        expect(component.tableSrc()).toEqual(mockResponse.data);
        expect(component.isLoading()).toBeFalse();
      });

      it('should edit a record and patch form values', () => {
        const mockResponse = { data: { id: 1, name: 'Edited Item' } };

        component.edit('1');

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(req.request.method).toBe('GET');
        req.flush(mockResponse);

        expect(component.form.value).toEqual({ name: 'Edited Item' });
        expect(component.savingId()).toBe('1');
      });

      it('should add a record, reset form if in table mode and show a snackbar', () => {
        const mockResponse = { data: [{ id: 1, name: 'New Item' }] };

        spyOn(component['snack'], 'open');

        httpTestingController.expectOne(`${apiUrl}${endpoint}`).flush({ data: [] });

        component.form.patchValue({ name: 'New Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);

        expect(component['snack'].open).toHaveBeenCalled();
        expect(component.tableSrc()).toEqual(mockResponse.data);
        expect(component.isSaving()).toBeFalse();
        expect(component.savingId()).toBe('');
      });

      it('should update a record, reset form if table mode and show a snackbar', () => {
        const mockResponse = { data: [{ id: 1, name: 'Updated Item' }] };

        spyOn(component['snack'], 'open');

        component.savingId.set('1');
        component.form.setValue({ name: 'Updated Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockResponse);

        expect(component['snack'].open).toHaveBeenCalled();
        expect(component.tableSrc()).toEqual(mockResponse.data);
        expect(component.isSaving()).toBeFalse();
        expect(component.savingId()).toBe('');
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
        expect(component.tableSrc()).toEqual(mockResponse.data);
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
      
      it('should show snackbar on add record API failure', () => {
        spyOn(component['snack'], 'open');
        httpTestingController.expectOne(`${apiUrl}${endpoint}`).flush({ data: [] });
        component.form.patchValue({ name: 'Failed Add' });
        component.save();

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        expect(req.request.method).toBe('POST');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });
        
        expect(component['snack'].open).toHaveBeenCalledWith('Error adding record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        expect(component.isSaving()).toBeFalse();
      });

      it('should show snackbar on update record API failure', () => {
        spyOn(component['snack'], 'open');
        component.savingId.set('1');
        component.form.setValue({ name: 'Failed Update' });
        component.save();

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });
        
        expect(component['snack'].open).toHaveBeenCalledWith('Error updating record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        expect(component.isSaving()).toBeFalse();
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
    beforeEach(() => {
      // Create a fresh component instance for manual mode tests
      fixture = TestBed.createComponent(NgCrudAioComponent);
      component = fixture.componentInstance;
      httpTestingController = TestBed.inject(HttpTestingController);

      fixture.componentRef.setInput('fields', [
        { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
      ]);
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

    it('should emit saveRecord when saving a new record', () => {
      spyOn(component.saveRecord, 'emit');
      component.form.patchValue({ name: 'Manual Add' });

      component.save();

      expect(component.saveRecord.emit).toHaveBeenCalledWith({ name: 'Manual Add' });
    });

    it('should emit saveRecord when updating a record', () => {
      spyOn(component.saveRecord, 'emit');
      component.savingId.set('5');
      component.form.patchValue({ name: 'Manual Update' });

      component.save();

      expect(component.saveRecord.emit).toHaveBeenCalledWith({ name: 'Manual Update' });
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