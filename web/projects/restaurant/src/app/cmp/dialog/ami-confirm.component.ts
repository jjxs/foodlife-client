import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'ami-confirm',
  templateUrl: './ami-confirm.component.html',
  styleUrls: ['./ami-confirm.component.css']
})
export class AmiConfirm {

  constructor(
    public dialogRef: MatDialogRef<AmiConfirm>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ok() {
    this.dialogRef.close("yes");
   }

  close(): void {
    this.dialogRef.close("no");
  }

}
