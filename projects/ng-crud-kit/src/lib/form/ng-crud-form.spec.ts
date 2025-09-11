import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { NgCrudFormComponent } from './ng-crud-form';
import { provideRouter } from '@angular/router';


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

  beforeEach(() => {
    fixture = TestBed.createComponent(NgCrudFormComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);

    fixture.componentRef.setInput('fields', [
        { name: 'name', type: 'input', label: 'Character', placeholder: 'Enter character name', required: true }
    ]);

    fixture.detectChanges();

  });

  describe('auto mode', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });

  });
});