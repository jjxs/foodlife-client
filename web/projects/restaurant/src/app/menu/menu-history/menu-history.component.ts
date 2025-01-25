import { Component, OnInit, Inject } from '@angular/core';
import { CmpService } from '../../cmp/cmp.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'restaurant-menu-history',
  templateUrl: './menu-history.component.html',
  styleUrls: ['./menu-history.component.css']
})
export class MenuHistoryComponent implements OnInit {

  constructor(    
    private cmp: CmpService,
    private dialogRef: MatDialogRef<MenuHistoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
  }

}
