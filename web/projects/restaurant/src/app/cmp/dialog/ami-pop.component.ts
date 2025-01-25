import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material';
@Component({
    selector: 'ami-pop',
    templateUrl: './ami-pop.component.html',
    styleUrls: ['./ami-pop.component.css']
})
export class AmiPop {

    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }

}