import { Component, ElementRef, OnDestroy, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { JsonService } from '../../../http/json.service';


@Component({
    templateUrl: './date-pop-win.component.html',
    styleUrls: ['./date-pop-win.component.css'],
    host: {}
})
export class DatePopWinComponent implements OnInit, OnDestroy {

    constructor(
        private el: ElementRef,
        private win: MatDialogRef<DatePopWinComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        private json: JsonService) {

    }

    selectedDate: Date;

    ngOnInit() {
        //this.selectedDate = this.data;
    }

    ngOnDestroy(): void {

    }

    onSelect(event, calendar) {
        //console.log(event);
        //console.log(calendar);

        this.win.close(event)
    }


}
