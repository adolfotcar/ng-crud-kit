import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  describe('auto mode', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

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

    it('should add a record and reset form if table mode', () => {
      const mockResponse = { data: [{ id: 1, name: 'New Item' }] };

      // flush initial GET request so we start clean
      httpTestingController.expectOne(`${apiUrl}${endpoint}`).flush({ data: [] });

      // mock form input
      component.form.patchValue({ name: 'New Item' });
      component.save(); // since savingId = 0, should call add()

      const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);

      expect(component.tableSrc()).toEqual(mockResponse.data);
      expect(component.isSaving()).toBeFalse();
      expect(component.savingId()).toBe('');
    });

    it('should update a record and reset form if table mode', () => {
      const mockResponse = { data: [{ id: 1, name: 'Updated Item' }] };

      component.savingId.set('1');
      component.form.setValue({ name: 'Updated Item' });
      component.save(); // should call update()

      const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse);

      expect(component.tableSrc()).toEqual(mockResponse.data);
      expect(component.isSaving()).toBeFalse();
      expect(component.savingId()).toBe(''); // reset after update
    });

    it('should remove a record after confirmation', () => {
      const mockResponse = { data: [] };

      // Spy on dialog to auto-confirm deletion
      spyOn(component['deleteDialog'], 'open').and.returnValue({
        afterClosed: () => ({
          subscribe: (cb: any) => cb(true) // simulate confirmation
        })
      } as any);

      component.remove('1');

      const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);

      expect(component.tableSrc()).toEqual(mockResponse.data);
      expect(component.removingId()).toBe('');
    });
  });

  describe('manual mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('mode', 'manual');
      fixture.detectChanges();
    });

    it('should emit dataLoaded when editing a record', () => {
      spyOn(component.dataLoaded, 'emit');

      component.edit('123');

      expect(component.dataLoaded.emit).toHaveBeenCalledWith('123');
    });

    it('should emit recordSaved when saving a new record', () => {
      spyOn(component.recordSaved, 'emit');
      component.form.patchValue({ name: 'Manual Add' });

      component.save(); // savingId = 0 → add

      expect(component.recordSaved.emit).toHaveBeenCalledWith({ name: 'Manual Add' });
    });

    it('should emit recordSaved when updating a record', () => {
      spyOn(component.recordSaved, 'emit');
      component.savingId.set('5');
      component.form.patchValue({ name: 'Manual Update' });

      component.save(); // savingId != 0 → update

      expect(component.recordSaved.emit).toHaveBeenCalledWith({ name: 'Manual Update' });
    });

    it('should emit recordRemoved when removing a record', () => {
      spyOn(component.recordRemoved, 'emit');

      // Fake confirm dialog → just call emit directly
      component.remove('99');

      // Simulate dialog auto-confirm
      spyOn(component['deleteDialog'], 'open').and.returnValue({
        afterClosed: () => ({
          subscribe: (cb: any) => cb(true)
        })
      } as any);

      component.remove('99');

      expect(component.recordRemoved.emit).toHaveBeenCalledWith('99');
    });
  });
});