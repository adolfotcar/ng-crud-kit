/*
auto mode - new record (no ID in route)
  rendering - all API cases
    should create
  API success cases
    should add a record and show a snackbar
  API failure cases
    should show a snackbar on failed save
auto mode - existing record (with ID in route)
  API success cases
    should update a record and show a snackbar
    should create
    should load form data on init
  API failure cases
    should show a snackbar on failed load
    should show a snackbar on failed save
    should create
manual mode
  should emit saveRecord when updating a record
  should load form data on init
  should emit saveRecord when saving a new record
  should create
*/
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatCheckbox } from '@angular/material/checkbox';

import { NgCrudFormComponent } from './ng-crud-form';

const mockActivatedRouteWithId = {
  snapshot: {
    paramMap: convertToParamMap({ id: '1' })
  }
};

const mockActivatedRouteWithoutId = {
  snapshot: {
    paramMap: convertToParamMap({})
  }
};


describe('NgCrudFormComponent', () => {
  let component: NgCrudFormComponent;
  let fixture: ComponentFixture<NgCrudFormComponent>;
  let httpTestingController: HttpTestingController;

  const apiUrl = 'http://localhost:4200/api/';
  const endpoint = 'items';

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NgCrudFormComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).compileComponents();
  });

  describe('auto mode - existing record (with ID in route)', () => {
    let router: Router;
    const mockRouteId = mockActivatedRouteWithId.snapshot.paramMap.get('id');
    
    beforeEach(() => {
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRouteWithId });
      httpTestingController = TestBed.inject(HttpTestingController);
      
      fixture = TestBed.createComponent(NgCrudFormComponent);
      fixture.componentRef.setInput('apiUrl', apiUrl);
      fixture.componentRef.setInput('apiEndpoint', endpoint);
      fixture.componentRef.setInput('fields', [
        { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true },
        { name: 'happy', type: 'select', label: 'Happy', required: false, options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
        { name: 'terms', type: 'checkbox', label: 'Terms and Conditions', required: false }
      ]);
      
      component = fixture.componentInstance;
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });
    
    afterEach(() => {
      httpTestingController.verify();
    });    
    
    describe('API success cases', () => {
      beforeEach(() => {
        const initialGetReq = httpTestingController.expectOne(`${apiUrl}${endpoint}/${mockRouteId}`);
        initialGetReq.flush({ data: { id: 1, name: 'Test Item' } });
        expect(initialGetReq.request.method).toBe('GET');
      });

      it('should create', () => {
        const nameInput = fixture.debugElement.query(By.directive(MatInput));
        const happySelect = fixture.debugElement.query(By.directive(MatSelect));
        const termsCheck = fixture.debugElement.query(By.directive(MatCheckbox));
        expect(component).toBeTruthy();
        expect(nameInput).toBeTruthy();        
        expect(happySelect).toBeTruthy();
        expect(termsCheck).toBeTruthy();
      });

      it('should load form data on init', () => { 
        expect(component.form.get('name')!.value).toEqual('Test Item');
        expect(component.isLoading()).toBeFalse();
      });

      it('should update a record and show a snackbar', () => {
        const mockResponse = { data: { id: 1, name: 'Updated Item', happy: 'yes', terms: true } };
        spyOn(component['snack'], 'open');

        component.form.setValue({ name: 'Updated Item', happy: 'no', terms: false });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${mockRouteId}`);
        req.flush(mockResponse);

        expect(req.request.method).toBe('PUT');
        expect(component.form.get('name')!.value).toEqual(mockResponse.data.name);
        expect(component.isSaving()).toBeFalse();
        expect(component['snack'].open).toHaveBeenCalledWith('Record updated!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
    });

    describe('API failure cases', () => {
      it('should create', () => {
        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${mockRouteId}`);
        req.flush({});
        expect(component).toBeTruthy();
      });

      it('should show a snackbar on failed load', () => {
        spyOn(component['snack'], 'open');

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${mockRouteId}`);        
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('GET');
        expect(component.isLoading()).toBeFalse();
        expect(component['snack'].open).toHaveBeenCalledWith('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });

      it('should show a snackbar on failed save', () => {
        const mockData = { data: { id: 1, name: 'Test Item' } };
        const initialGetReq = httpTestingController.expectOne(`${apiUrl}${endpoint}/${mockRouteId}`);

        initialGetReq.flush(mockData);
        spyOn(component['snack'], 'open');

        component.form.setValue({ name: 'Updated Item', happy: 'no', terms: true });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/${mockData.data.id}`);        
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('PUT');
        expect(component.isSaving()).toBeFalse();
        expect(component['snack'].open).toHaveBeenCalledWith('Error updating record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
    });

  });

  describe('auto mode - new record (no ID in route)', () => {
    let router: Router;

    beforeEach(() => {
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRouteWithoutId });
      httpTestingController = TestBed.inject(HttpTestingController);

      fixture = TestBed.createComponent(NgCrudFormComponent);
      fixture.componentRef.setInput('apiUrl', apiUrl);
      fixture.componentRef.setInput('apiEndpoint', endpoint);
      fixture.componentRef.setInput('fields', [
        { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
      ]);

      component = fixture.componentInstance;      
      router = TestBed.inject(Router);
      fixture.detectChanges();
    });

    afterEach(() => {
      httpTestingController.verify();
    });

    describe('rendering - all API cases', () => {
      it('should create', () => {
        expect(component).toBeTruthy();
      });
    });
    
    describe('API success cases', () => {
      it('should add a record and show a snackbar', () => {
        const mockResponse = { data: { id: 2, name: 'New Item' } };
        const navigateSpy = spyOn(router, 'navigate');

        spyOn(component['snack'], 'open');

        component.form.patchValue({ name: 'New Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        req.flush(mockResponse);

        expect(req.request.method).toBe('POST');
        expect(navigateSpy).toHaveBeenCalledWith([`${component.redirectOnSaveUrl()}/${mockResponse.data.id}`]);
        expect(component.isSaving()).toBeFalse();
        expect(component['snack'].open).toHaveBeenCalledWith('Record added!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
    });

    describe('API failure cases', () => {
      it('should show a snackbar on failed save', () => {
        const mockResponse = { data: { id: 2, name: 'New Item' } };
        const navigateSpy = spyOn(router, 'navigate');

        spyOn(component['snack'], 'open');

        component.form.patchValue({ name: 'New Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(req.request.method).toBe('POST');
        expect(component['snack'].open).toHaveBeenCalledWith('Error adding record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
    });
  });

  describe('manual mode', () => {
      beforeEach(() => {
        httpTestingController = TestBed.inject(HttpTestingController);

        fixture = TestBed.createComponent(NgCrudFormComponent);        
        fixture.componentRef.setInput('fields', [
          { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
        ]);
        fixture.componentRef.setInput('mode', 'manual');
        fixture.componentRef.setInput('formData', { id: 1, name: 'Test Item' });

        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  
      it('should create', () => {
        expect(component).toBeTruthy();
      });
  
      it('should load form data on init', () => { 
        expect(component.formData()).toEqual({ id: 1, name: 'Test Item' });
        expect(component.isLoading()).toBeFalse();
      });
  
      it('should emit saveRecord when saving a new record', () => {
        spyOn(component.saveRecord, 'emit');

        component.form.patchValue({ name: 'Manual Add' });
        component.save();
  
        expect(component.saveRecord.emit).toHaveBeenCalledWith({ name: 'Manual Add' });
      });
  
      it('should emit saveRecord when updating a record', () => {
        spyOn(component.saveRecord, 'emit');

        component.form.patchValue({ name: 'Manual Update' });
        component.save();
  
        expect(component.saveRecord.emit).toHaveBeenCalledWith({ name: 'Manual Update' });
      });

    });
});