import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
@Component({
    selector: 'ami-loading',
    templateUrl: './ami-loading.component.html',
    styleUrls: ['./ami-loading.component.css']
})
export class AmiLoading {

    constructor(
        public dialogRef: MatDialogRef<AmiLoading>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    onNoClick(): void {
        this.dialogRef.close();
    }
}