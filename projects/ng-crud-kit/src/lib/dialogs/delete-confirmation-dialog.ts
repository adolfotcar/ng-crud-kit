import { Component } from '@angular/core';

import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'delete-confimation-dialog',
  standalone: true,
  imports: [ MatDialogModule, MatButtonModule ],
  template: '<h2 mat-dialog-title>Confirm Delete?</h2>\
              <mat-dialog-content>\
                <p>Are you sure you would like to remove this record?</p>\
              </mat-dialog-content>\
              <mat-dialog-actions>\
                <button matButton="tonal" (click)="onNoClick()" color="accent">No, cancel</button>\
                <button matButton="filled" [mat-dialog-close]="true" color="warn">Yes, proceed</button>\
              </mat-dialog-actions>'
})
export class DeleteConfirmationDialog {

  constructor(public dialogRef: MatDialogRef<DeleteConfirmationDialog>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}