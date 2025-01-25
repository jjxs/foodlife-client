import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-table-empty-message',
  templateUrl: './table-empty-message.component.html',
  styleUrls: ['./table-empty-message.component.css']
})
export class TableEmptyMessageComponent implements OnInit, OnDestroy {


  @Input() dataSource: MatTableDataSource<any>;
  @Input() refreshFlg: boolean;
  nodata: any;
  timer = null;
  timer$: any;

  constructor() {
    this.refreshFlg = true;
  }

  ngOnInit() {
    this.timer = timer(3000);
    this.timer$ = this.timer.subscribe(() => {
      this.nodata = this.dataSource.connect().pipe(
        map(data => data.length === 0)
      );
    });
  }

  ngOnDestroy(): void {
    this.timer$.unsubscribe();
  }

}
