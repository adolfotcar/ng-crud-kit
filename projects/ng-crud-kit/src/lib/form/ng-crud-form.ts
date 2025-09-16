import { Component, input, output, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox'

import { NgCrudFormItem } from '../models/crud-form-item.model';
import { CrudRequestService } from '../services/ng-crud-request.service';

@Component({
  selector: 'ng-crud-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,    
    MatSelectModule,
    MatCheckboxModule
],
  templateUrl: './ng-crud-form.html',
  styleUrl: './ng-crud-form.scss'
})
export class NgCrudFormComponent implements OnInit {
  private crudSvc = inject(CrudRequestService);
  private formBuilder = inject(FormBuilder);
  private snack = inject(MatSnackBar);
  private router = inject(Router);
  private route = inject(ActivatedRoute)

  readonly saveRecord = output<any>();
  readonly cancelEditing = output<any>();

  //auto handles API calls internally and will require full API parameters to be passed
  //manual will emit events for the parent component to handle API calls and the table data should come from the parent
  readonly mode = input<'auto' | 'manual'>('auto');

  //title anbd subtitle of the page to be displayed at the top
  //leave subtitle empty if not needed
  readonly title = input('CRUD');
  readonly subtitle = input('');

  //link and text to the return button
  readonly returnBtnUrl = input('');
  readonly returnBtnText = input('Return to Home');
  readonly returnBtnIcon = input('clear');

  //base url to the backend
  readonly apiUrl = input('');
  
  //api endpoint
  readonly apiEndpoint = input('');

  //redirect on save base URL
  //if after saving the API responds with ID 99 then it should redirect to items/99
  readonly redirectOnSaveUrl = input('');
  readonly redirectOnSaveIdField = input('id');
  
  //form fields to be constructed
  readonly fields = input<NgCrudFormItem[]>([]);

  //when in manual mode allows the user to pass values to the form
  readonly formData = input<any>(null);

  //used to show spinner while loading
  public isLoading = this.crudSvc.isLoading;
  
  //when saving data hides the save button
  public isSaving = this.crudSvc.isSaving;

  //when editing a record, this will extract it's ID from the URL
  private recordId = this.route.snapshot.paramMap.get('id') || '';

  public form = new FormGroup({});

  constructor(){
    effect(()=>{
      //reseting the form when changes coming from parent
      const formGroup: {[key: string]: FormControl } = {};
      this.fields().forEach((item: any) => {
        let val = item.defaultValue ? item.defaultValue : '';
        let validators = item.required ? [Validators.required] : [];
        formGroup[item.name] = this.formBuilder.control(val, validators);
      });
      this.form = this.formBuilder.group(formGroup);

      if ((this.recordId === '')||(this.mode() === 'manual')) {
        if (this.formData()) {
          this.form.patchValue(this.formData());
        } else {
          this.form.reset();
        }
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    if (this.mode() === 'auto' && this.recordId !== '') {
      this.crudSvc.getRecord(this.apiUrl(), this.apiEndpoint(), this.recordId)
      .subscribe({
        next: res => {
          this.form.patchValue(res.data);
          this.isLoading.set(false);
        },
        error: err => {
          this.snack.open('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
          this.isLoading.set(false);
          console.error('NgCrudAioComponent: Error loading data from API', err);
        }
      });
    }
  
  }

  public save() {
    if (this.mode() === 'manual') {
      this.saveRecord.emit(this.form.getRawValue());
      return;
    }

    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id !== '') {
      this.update();
    } else {
      this.add();
    }
    
  }

  private add() {        
    this.crudSvc.addRecord(this.apiUrl(), this.apiEndpoint(), this.form.getRawValue())
    .subscribe({
      next: res => {
        const newId = res.data[this.redirectOnSaveIdField()];;
        this.isSaving.set(false);
        this.snack.open('Record added!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        this.router.navigate([`${this.redirectOnSaveUrl()}/${newId}`]);
      },
      error: err => {
        this.snack.open('Error adding record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        console.error('NgCrudAioComponent: Error adding record to API', err);
        this.isSaving.set(false);
      }
    });
  }

  private update() {
    this.crudSvc.updateRecord(this.apiUrl(), this.apiEndpoint(), this.recordId, this.form.getRawValue())
    .subscribe({
      next: res => {
        this.form.patchValue(res.data);
        this.isSaving.set(false);
        this.snack.open('Record updated!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      },
      error: err => {
        this.snack.open('Error updating record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        console.error('NgCrudAioComponent: Error updating record to API', err);
        this.isSaving.set(false);
      }
    });
  }

  cancel(){
    if (this.returnBtnUrl() !== '') {
      this.router.navigate([this.returnBtnUrl()]);
      return;    
    }      

    //emits cancelling with form value, just in case it's relevant to the parent
    this.cancelEditing.emit(this.form.getRawValue());
  
  }

}