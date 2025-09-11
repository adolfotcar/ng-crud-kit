import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { NgCrudTableComponent } from './ng-crud-table';
import { provideRouter } from '@angular/router';


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

  beforeEach(() => {
    fixture = TestBed.createComponent(NgCrudTableComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);

    fixture.componentRef.setInput('displayedColumns', []);

    fixture.detectChanges();

  });

  describe('auto mode', () => {

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });
});