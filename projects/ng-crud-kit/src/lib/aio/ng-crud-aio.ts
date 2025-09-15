import { Component, effect, inject, input, OnInit, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { NgCrudFormItem } from '../models/crud-form-item.model';
import { NgCrudTableColumns } from '../models/crud-table-columns.model';
import { CrudRequestService } from '../services/ng-crud-request.service';
import { NgCrudFormComponent } from '../form/ng-crud-form';
import { NgCrudTableComponent } from '../table/ng-crud-table';

@Component({
  selector: 'ng-crud-aio',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,

    MatIconModule,
    MatProgressSpinnerModule,
    MatButtonModule,

    NgCrudFormComponent,
    NgCrudTableComponent
  ],
  templateUrl: './ng-crud-aio.html',
  styleUrl: './ng-crud-aio.scss'
})
export class NgCrudAioComponent implements OnInit {
  private crudSvc = inject(CrudRequestService);
  private snack = inject(MatSnackBar);

  //to be emitted if in manual mode
  readonly editRecord = output<any>();
  readonly saveRecord = output<any>();
  readonly removeRecord = output<any>();
  readonly cancelEditing = output<any>();

  //auto handles API calls internally and will require full API parameters to be passed
  //manual will emit events for the parent component to handle API calls and the table data should come from the parent
  readonly mode = input<'auto' | 'manual'>('auto');

  //table data should be passed if in manual mode
  readonly tableData = input<any[]>([]);

  //when in manual mode allows the user to pass values to the form
  readonly formData = input<any>(null);

  //title anbd subtitle of the page to be displayed at the top
  //leave subtitle empty if not needed
  readonly title = input('CRUD');
  readonly subtitle = input('');

  //link and text to the top button
  readonly returnBtnUrl = input('/');
  readonly returnBtnText = input('Return to Home');
  readonly returnBtnIcon = input('');

  //base url to the backend
  readonly apiUrl = input('');
  
  //api endpoint
  readonly apiEndpoint = input('');
  
  //form fields to be constructed
  readonly fields = input<NgCrudFormItem[]>([]);
  
  //columns to be displayed in the table
  readonly displayedColumns = input<string[]>([]);
  
  //details of the column, like title, content, etc
  readonly columns = input<NgCrudTableColumns[]>([]);  

  //used to show spinner while loading
  public isLoading = this.crudSvc.isLoading;
  
  //when saving data hides the save button
  public isSaving = this.crudSvc.isSaving;
  
  //when saving new reocord contains 0
  //when saving exising record contains the id of the record being saved
  //also used to change button's text
  public savingId = this.crudSvc.savingId;
  
  //contains the id of the record being removed
  //if 0 then nothing is being removed 
  //also used to hide the remove button on the record being removed
  public removingId = this.crudSvc.removingId;

  //these will be used as intermediators between the consumer and child attributes
  public childFormData: any = null;
  public childTableData: any = {};

  constructor(){
    effect(() => {
      if (this.mode() === 'manual') {
        this.childFormData = this.formData();
        this.childTableData = this.tableData();
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  //if data is passed then sets it to the table (to avoid making extra http call)
  //else loads it from the API
  //otherwise patches the table/form with data provided
  //it's called oninit and after saving
  private loadData(data?: any){
    if (this.mode() === 'manual') {
      this.childTableData = this.tableData();
      this.isLoading.set(false);
      return;
    }      
    
    this.resetForm();

    if (data) {      
      this.childTableData = data;
      return;
    }
      
    this.crudSvc.getTable(this.apiUrl(), this.apiEndpoint())
    .subscribe({
      next: res => {
        this.childTableData = res.data;
        this.isLoading.set(false);
      },
      error: err => {
        this.snack.open('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        console.error('NgCrudAioComponent: Error loading data from API', err);
        this.isLoading.set(false);
      }
    });
    
  }

  public getDisplayedColumns(): string[] {
    return [...this.displayedColumns(), 'actions'];
  }

  public resetForm() {
    this.childFormData = null;
    if (this.mode() === 'manual') {
      this.cancelEditing.emit(null);
    }
  }

  public edit(id: string) {
    if (this.mode() === 'manual') {
      this.editRecord.emit(id);
      return;
    }

    this.crudSvc.getRecord(this.apiUrl(), this.apiEndpoint(), id)
    .subscribe({
      next: res => {
        this.childFormData = res.data;
        this.savingId.set(id);
      },
      error: err => {
        this.snack.open('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        console.error('NgCrudAioComponent: Error loading data from API', err);
      }
    });
  }

  public remove(id: string) {
    if (this.mode() === 'manual') {
      this.removeRecord.emit(id);
      return;
    }
    this.crudSvc.removeRecord(this.apiUrl(), this.apiEndpoint(), id)
      .subscribe({
        next: res => {
          this.childTableData = res.data;
          this.removingId.set('');
          this.snack.open('Record removed!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        },
        error: err => {
          this.snack.open('Error removing record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
          console.error('NgCrudAioComponent: Error removing record from API', err);
          this.removingId.set('');
        }
      });
  }

  public save(form: any) {
    this.childFormData = form;
    if (this.mode() === 'manual') {
      this.saveRecord.emit(this.childFormData);
      return;
    }

    if (this.savingId() === '') {
      this.add();
    } else {
      this.update();
    }
  }

  private add() {    
    this.crudSvc.addRecord(this.apiUrl(), this.apiEndpoint(), this.childFormData)
    .subscribe({
      next: res => {
        this.loadData(res.data);
        this.isSaving.set(false);
        this.snack.open('Record added!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      },
      error: err => {
        this.snack.open('Error adding record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        console.error('NgCrudAioComponent: Error adding record to API', err);
        this.isSaving.set(false);
      }
    });
  }

  private update() {
    this.crudSvc.updateRecord(this.apiUrl(), this.apiEndpoint(), this.savingId(), this.childFormData)
    .subscribe({
      next: res => {
        this.loadData(res.data);
        this.isSaving.set(false);
        this.savingId.set('');
        this.snack.open('Record updated!', 'Ok', { verticalPosition: 'top', duration: 3000 });
      },
      error: err => {
        this.snack.open('Error updating record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        console.error('NgCrudAioComponent: Error updating record to API', err);
        this.isSaving.set(false);
      }
    });
  }
}