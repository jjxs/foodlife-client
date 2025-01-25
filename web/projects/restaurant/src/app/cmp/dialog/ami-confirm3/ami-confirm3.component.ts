import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'ami-confirm',
  templateUrl: './ami-confirm3.component.html',
  styleUrls: ['./ami-confirm3.component.css']
})
export class AmiConfirm3 {
  password = '';
  constructor(
    public dialogRef: MatDialogRef<AmiConfirm3>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ok() {
    this.dialogRef.close( {status: 'yes', data: this.password});
   }

  close(): void {
    this.dialogRef.close( {status: 'no'});
  }

}
