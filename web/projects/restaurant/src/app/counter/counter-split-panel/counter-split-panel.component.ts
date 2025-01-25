import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewChild } from '@angular/core';
import { CounterService } from '../counter.service';
import { CounterDetailOrder } from '../counter.interface';
import { Util } from 'ami';
import { MatTableDataSource, MatTable } from '@angular/material';

@Component({
  selector: 'restaurant-counter-split-panel',
  templateUrl: './counter-split-panel.component.html',
  styleUrls: ['./counter-split-panel.component.css']
})
export class CounterSplitPanelComponent implements OnInit {


displayedColumns = ['index', 'menu_no', 'count', 'price', 'is_takeout', 'up'];
  dataSource = new MatTableDataSource<CounterDetailOrder>();

  // @Input() action: string;
  @Input() details: Array<CounterDetailOrder>;
  @Output() change = new EventEmitter<CounterDetailOrder>();
  @Output() goup = new EventEmitter<CounterDetailOrder>();
  @ViewChild('table', {static: false}) table: MatTable<any>;

  constructor(
    public counterSrv: CounterService) { }

  ngOnInit() { }

  renderRows() {
    this.table.renderRows();
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let log: string[] = [];
    for (let propName in changes) {
      if (propName === 'details') {
        let changedProp = changes[propName];
        this.dataSource = new MatTableDataSource(changedProp.currentValue);
        // this.table.renderRows();
      }
    }
  }

  showStatus(element: CounterDetailOrder) {
    if (Util.isEmpty(element.detail_free_id)) {
      return element.status_name;
      // return element.status_code + ':' + element.status_name;
    } else {
      return element.detail_free_usable ? '' : '確認待ち';
    }
  }

  onUp(element: CounterDetailOrder) {
    this.goup.emit(element);
    // // console.log(row);
    // const index: number = this.dataSource2.data.indexOf(row);
    // if (index !== -1) {
    //   this.dataSource2.data.splice(index, 1);
    //   this.table2.renderRows();

    //   // this.dataSource.data.push({
    //   //   position: row.position,
    //   //   name: row.name,
    //   //   weight: row.weight,
    //   //   symbol: row.symbol
    //   // });

    //   this.table1.renderRows();
    // }
  }
  setTakeout(element, event) {
    element.is_takeout = event.checked;
    this.change.emit(element);
  }
}
