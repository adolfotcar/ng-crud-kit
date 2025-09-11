import { AfterViewInit, Component, inject, input, output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortHeader, MatSortModule } from '@angular/material/sort';

import { NgCrudTableColumns } from '../models/crud-table-columns.model';
import { CrudRequestService } from '../services/ng-crud-request.service';
import { DeleteConfirmationDialog } from '../dialogs/delete-confirmation-dialog';
import { buildUrl } from '../utils/url.utils';

@Component({
  selector: 'ng-crud-table',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTableModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortHeader,
    MatSortModule,
],
  templateUrl: './ng-crud-table.html',
  styleUrl: './ng-crud-table.scss'
})
export class NgCrudTableComponent implements AfterViewInit {
  private crudSvc = inject(CrudRequestService);
  private deleteDialog = inject(MatDialog); 
  private snack = inject(MatSnackBar);
  private router = inject(Router);

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator) paginator = new MatPaginator();
  @ViewChild(MatSort) sort = new MatSort();

  //to be emitted if in manual mode
  readonly editRecord = output<any>();
  readonly removeRecord = output<any>();

  //auto handles API calls internally and will require full API parameters to be passed
  //manual will emit events for the parent component to handle API calls and the table data should come from the parent
  readonly mode = input<'auto' | 'manual'>('auto');

  //table data should be passed if in manual mode
  readonly tableData = input<any[]>([]);

  //link, text and icon to the top button
  readonly returnBtnUrl = input('/');
  readonly returnBtnText = input('Return to Home');
  readonly returnBtnIcon = input('');

  //when clicking add button which URL it should follow
  readonly addBtnUrl = input('/items');

  //base url to the backend
  readonly apiUrl = input('http://localhost:4200/api/');
  
  //api endpoint
  readonly apiEndpoint = input('items');

  //label to be displayed on the Filter field
  readonly filterLabel = input('Filter');

  //columns to be displayed in the table
  readonly displayedColumns = input<string[]>([]);
  
  //details of the column, like title, content, etc
  readonly columns = input<NgCrudTableColumns[]>([]);    

  //when clicking in redirect it will navigate to this url plus the id of the record
  readonly editUrl = input('/items');

  //indicates the name of the field to be treated as ID
  //it can be uuid, id, regno, etc
  //expected to be present in the table
  readonly idField = input('id')

  //contains the id of the record being removed
  //if 0 then nothing is being removed 
  //also used to hide the remove button on the record being removed
  public removingId = this.crudSvc.removingId;

  //used to show spinner while loading
  public isLoading = this.crudSvc.isLoading;

  constructor(){
    
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    if (this.mode() === 'manual') {
      this.dataSource.data = this.tableData();
      this.isLoading.set(false);
      return;
    }    
    
    this.crudSvc.getTable(this.apiUrl(), this.apiEndpoint())
    .subscribe({
      next: res => {
        this.dataSource.data = res.data;
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

  public edit(id: string){
    if (this.mode() === 'manual') {
      this.editRecord.emit(id);
      return;
    }
    
    this.router.navigate([`${buildUrl(this.editUrl(), id)}`]);
  }

  public remove(id: string){
    const dialogRef = this.deleteDialog.open(DeleteConfirmationDialog);
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {       
        if (this.mode() === 'manual') {
          this.removeRecord.emit(id);
          this.removingId.set('');
          return;
        }
        
        this.crudSvc.removeRecord(this.apiUrl(), this.apiEndpoint(), id)
        .subscribe({
          next: res => {
            this.dataSource.data = res.data;
            this.removingId.set('');
            this.snack.open('Record removed!', 'Ok', { verticalPosition: 'top', duration: 3000 });
          },
          error: err => {
            this.snack.open('Error removing record!', 'Ok', { verticalPosition: 'top', duration: 3000 });
            this.removingId.set('');
            console.error('NgCrudAioComponent: Error removing record from API', err);
          }
        });
      }
    });
  }

  public applyFilter(event: Event){
    const filterValue = (event.target as HTMLInputElement).value;

    this.dataSource.filter = filterValue.trim().toLowerCase();
  
  }
}