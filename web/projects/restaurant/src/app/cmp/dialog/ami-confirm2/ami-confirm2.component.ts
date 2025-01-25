import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'ami-confirm',
  templateUrl: './ami-confirm2.component.html',
  styleUrls: ['./ami-confirm2.component.css']
})
export class AmiConfirm2 {

  constructor(
    public dialogRef: MatDialogRef<AmiConfirm2>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ok() {
    this.dialogRef.close("yes");
   }

  close(): void {
    this.dialogRef.close("no");
  }

}
