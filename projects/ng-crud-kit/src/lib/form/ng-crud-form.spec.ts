import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { NgCrudFormComponent } from './ng-crud-form';
import { provideRouter, ActivatedRoute, convertToParamMap, Router } from '@angular/router';

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
    
    // Setup for scenarios where an ID is present in the route
    beforeEach(() => {
      // OVERRIDE PROVIDER MUST COME BEFORE TestBed.createComponent()
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRouteWithId });
      
      fixture = TestBed.createComponent(NgCrudFormComponent);
      component = fixture.componentInstance;
      httpTestingController = TestBed.inject(HttpTestingController);
      router = TestBed.inject(Router);
      
      fixture.componentRef.setInput('fields', [
        { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
      ]);
      // Detect changes to trigger ngOnInit
      fixture.detectChanges();
    });
    
    afterEach(() => {
      httpTestingController.verify();
    });
    
    describe('successful API cases', () => {
      beforeEach(() => {
        // Mock the initial GET request that happens in ngOnInit
        const initialGetReq = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(initialGetReq.request.method).toBe('GET');
        initialGetReq.flush({ data: { id: 1, name: 'Test Item' } });
      });

      it('should create', () => {
        expect(component).toBeTruthy();
      });

      it('should load form data on init', () => { 
        expect(component.form.get('name')?.value).toEqual('Test Item');
        expect(component.isLoading()).toBeFalse();
      });

      it('should update a record and show a snackbar', () => {
        const mockResponse = { data: { id: 1, name: 'Updated Item' } };

        spyOn(component['snack'], 'open');
        
        component.form.setValue({ name: 'Updated Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush(mockResponse);

        expect(component['snack'].open).toHaveBeenCalledWith('Record updated!', 'Ok', jasmine.any(Object));
        expect(component.form.get('name')?.value).toEqual(mockResponse.data.name);
        expect(component.isSaving()).toBeFalse();
      });
    });

    describe('failure API cases', () => {
      it('should show a snackbar on failed load', () => {
        spyOn(component['snack'], 'open');

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(req.request.method).toBe('GET');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });

        expect(component['snack'].open).toHaveBeenCalledWith('Error loading data!', 'Ok', jasmine.any(Object));
        expect(component.isLoading()).toBeFalse();
      });

      it('should show a snackbar on failed save', () => {
        const initialGetReq = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        initialGetReq.flush({ data: { id: 1, name: 'Test Item' } });
        
        spyOn(component['snack'], 'open');
        
        component.form.setValue({ name: 'Updated Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}/1`);
        expect(req.request.method).toBe('PUT');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });
        
        expect(component['snack'].open).toHaveBeenCalledWith('Error updating record!', 'Ok', jasmine.any(Object));
        expect(component.isSaving()).toBeFalse();
      });
    });

  });

  describe('auto mode - new record (no ID in route)', () => {
    let router: Router;

    beforeEach(() => {
      TestBed.overrideProvider(ActivatedRoute, { useValue: mockActivatedRouteWithoutId });

      fixture = TestBed.createComponent(NgCrudFormComponent);
      component = fixture.componentInstance;
      httpTestingController = TestBed.inject(HttpTestingController);
      router = TestBed.inject(Router);

      fixture.componentRef.setInput('fields', [
        { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
      ]);
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
    
    describe('successful API cases', () => {
      it('should add a record and show a snackbar', () => {
        const mockResponse = { data: { id: 2, name: 'New Item' } };
        const navigateSpy = spyOn(router, 'navigate');
        
        spyOn(component['snack'], 'open');
        
        component.form.patchValue({ name: 'New Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
        
        expect(component['snack'].open).toHaveBeenCalledWith('Record added!', 'Ok', jasmine.any(Object));
        expect(navigateSpy).toHaveBeenCalledWith([`${component.redirectOnSaveUrl()}/2`]);
        expect(component.isSaving()).toBeFalse();
      });
    });

    describe('failure API cases', () => {
      it('should show a snackbar on failed save', () => {
        const mockResponse = { data: { id: 2, name: 'New Item' } };
        const navigateSpy = spyOn(router, 'navigate');
        
        spyOn(component['snack'], 'open');
        
        component.form.patchValue({ name: 'New Item' });
        component.save(); 

        const req = httpTestingController.expectOne(`${apiUrl}${endpoint}`);
        expect(req.request.method).toBe('POST');
        req.flush('Server Error', { status: 500, statusText: 'Server Error' });
        
        expect(component['snack'].open).toHaveBeenCalledWith('Error adding record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      });
    });
  });

  describe('manual mode', () => {
      beforeEach(() => {
        fixture = TestBed.createComponent(NgCrudFormComponent);
        component = fixture.componentInstance;
        httpTestingController = TestBed.inject(HttpTestingController);
  
        fixture.componentRef.setInput('fields', [
          { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
        ]);
        fixture.componentRef.setInput('mode', 'manual');
        fixture.componentRef.setInput('formData', { id: 1, name: 'Test Item' });
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