import { Component, inject, input, OnInit, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input'
import { MatButtonModule } from '@angular/material/button';

import { NgCrudFormItem } from '../models/crud-form-item.model';
import { NgCrudTableColumns } from '../models/crud-table-columns.model';
import { CrudRequestService } from '../services/ng-crud-request.service';
import { DeleteConfirmationDialog } from '../dialogs/delete-confirmation-dialog';

@Component({
  selector: 'ng-crud-aio',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,

    MatDialogModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './ng-crud-aio.html',
  styleUrl: './ng-crud-aio.scss'
})
export class NgCrudAioComponent implements OnInit {
  private crudSvc = inject(CrudRequestService);
  private deleteDialog = inject(MatDialog); 
  private formBuilder = inject(FormBuilder);
  private snack = inject(MatSnackBar);

  //to be emitted if in manual mode
  readonly dataLoaded = output<any>();
  readonly recordSaved = output<any>();
  readonly recordRemoved = output<any>();

  //auto handles API calls internally and will require full API parameters to be passed
  //manual will emit events for the parent component to handle API calls and the table data should come from the parent
  readonly mode = input<'auto' | 'manual'>('auto');

  //table data should be passed if in manual mode
  readonly tableData = input<any[]>([]);

  //title anbd subtitle of the page to be displayed at the top
  //leave subtitle empty if not needed
  readonly title = input('CRUD');
  readonly subtitle = input('');

  //link and text to the top button
  readonly returnBtnUrl = input('/');
  readonly returnBtnText = input('Return to Home');
  readonly returnBtnIcon = input('');

  //base url to the backend
  readonly apiUrl = input('http://localhost:4200/api/');
  
  //api endpoint
  readonly apiEndpoint = input('items');
  
  //form fields to be constructed
  readonly fields = input<NgCrudFormItem[]>([]);
  
  //columns to be displayed in the table
  readonly displayedColumns = input<string[]>([]);
  
  //details of the column, like title, content, etc
  readonly columns = input<NgCrudTableColumns[]>([]);  
  
  //indicates if there is a table or not (if not it's single record editing eg: profile, settings, etc)
  readonly hasTable = input(true);

  //indicates the name of the field to be treated as ID
  //it can be uuid, id, regno, etc
  //expected to be present in the table
  readonly idField = input('id')

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
  
  public tableSrc = this.crudSvc.tableData;

  public form = new UntypedFormGroup({});

  ngOnInit(): void {
    //builds the from from the input parameters
    this.form = new UntypedFormGroup({});
    let formGroup: any = {};
    this.fields().forEach((item: any) => {
      //determining if defaultValue is empty or if something was passed as option
      let val = item.defaultValue ? item.defaultValue : '';
      let validators = item.required ? [Validators.required] : [];
      formGroup[item.name] = [val, validators];
    });
    this.form = this.formBuilder.group(formGroup);

    this.loadData();
  }

  //if no data is passed, makes a http call
  //otherwise patches the table/form with data provided
  private loadData(data?: any){
    if (this.mode() === 'manual') {
      this.isLoading.set(false);
      return;
    }      
    
    this.resetForm();
    if (data) {
      if (this.hasTable()) {
        this.tableSrc.set(data);
      } else {
        this.form.patchValue(data);
      }
      return;
    }
      
    this.crudSvc.getTable(this.apiUrl(), this.apiEndpoint())
    .subscribe({
      next: res => {
        if (this.hasTable()) {
          this.tableSrc.set(res.data);
        } else {
          this.form.patchValue(res.data);
        }
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
    Object.keys(this.form.controls).forEach(controlName => {
      this.form.get(controlName)?.setValue('');
      this.form.get(controlName)?.setErrors(null);
    });
    this.savingId.set('');
  }

  public edit(id: string) {
    if (this.mode() === 'manual') {
      this.dataLoaded.emit(id);
      return;
    }

    this.crudSvc.getRecord(this.apiUrl(), this.apiEndpoint(), id)
    .subscribe({
      next: res => {
        this.form.patchValue(res.data);
        this.savingId.set(id);
      },
      error: err => {
        this.snack.open('Error loading data!', 'Ok', { verticalPosition: 'top', duration: 3000 });
        console.error('NgCrudAioComponent: Error loading data from API', err);
      }
    });
  }

  public remove(id: string) {
    const dialogRef = this.deleteDialog.open(DeleteConfirmationDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        if (this.mode() === 'auto') {
          this.crudSvc.removeRecord(this.apiUrl(), this.apiEndpoint(), id)
            .subscribe({
              next: res => {
                this.tableSrc.set(res.data);
                this.removingId.set('');
                this.snack.open('Record removed!', 'Ok', { verticalPosition: 'top', duration: 3000 });
              },
              error: err => {
                this.snack.open('Error removing record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
                console.error('NgCrudAioComponent: Error removing record from API', err);
                this.removingId.set('');
              }
            });
        } else {
          this.recordRemoved.emit(id);
        }
      }
    });
  }

  public save() {
    if (this.savingId() === '') {
      this.add();
    } else {
      this.update();
    }
  }

  private add() {
    if (this.mode() === 'manual') {
      this.recordSaved.emit(this.form.getRawValue());
      this.isSaving.set(false);
      return;
    }
    
    this.crudSvc.addRecord(this.apiUrl(), this.apiEndpoint(), this.form.getRawValue())
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
    if (this.mode() === 'manual') {
      this.recordSaved.emit(this.form.getRawValue());
      this.isSaving.set(false);
      return;
    }

    this.crudSvc.updateRecord(this.apiUrl(), this.apiEndpoint(), this.savingId(), this.form.getRawValue())
    .subscribe({
      next: res => {
        this.loadData(res.data);
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
}