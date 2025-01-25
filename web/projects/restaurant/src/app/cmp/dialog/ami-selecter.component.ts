import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { SelectionModel, SelectionChange } from '@angular/cdk/collections';
import { JsonService, Util } from 'ami';

@Component({
    selector: 'ami-selecter',
    templateUrl: './ami-selecter.component.html',
    styleUrls: ['./ami-selecter.component.css']
})
export class AmiSelecter implements OnInit {

    displayColumn = "display"

    list = []

    title = "選択"


    constructor(
        private jsonSrv: JsonService,
        public dialogRef: MatDialogRef<AmiSelecter>,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        //console.log(data);
        this.list = data.list || this.list;
        this.title = data.title || this.title;
        this.displayColumn = data.dispalyColumn || this.displayColumn;
    }

    ngOnInit() {

    }

    onselect(event, item) {

        this.dialogRef.close(item);
    }

    close(): void {
        this.dialogRef.close(null);
    }

}
