import { Component, OnInit, Input, SimpleChange, Output, EventEmitter, ViewChild } from '@angular/core';
import { CounterService } from '../counter.service';
import { CounterDetailOrder } from '../counter.interface';
import { Util } from 'ami';
import { MatTableDataSource, MatTable, MatDialog } from '@angular/material';
import { NumberInputComponent } from '../../cmp/number-input/number-input.component';

@Component({
  selector: 'restaurant-counter-orders-detail-panel',
  templateUrl: './counter-orders-detail-panel.component.html',
  styleUrls: ['./counter-orders-detail-panel.component.css']
})
export class CounterOrdersDetailPanelComponent implements OnInit {



  editModelColumns = ['clear', 'index', 'seat_name', 'menu_no', 'count', 'status_code', 'price', 'tax_in', 'is_takeout', 'btn'];
  viewModelColumns = ['index', 'seat_name', 'menu_no', 'count', 'status_code', 'price', 'tax_in', 'is_takeout', 'btn'];
  displayedColumns = [];
  dataSource = new MatTableDataSource<CounterDetailOrder>();
  @ViewChild("table", {static: false}) table: MatTable<any>;

  @Input() action: string;
  @Input() model: boolean;
  @Input() details: Array<CounterDetailOrder> = [];

  @Output() godown = new EventEmitter<CounterDetailOrder>();

  @Output() change = new EventEmitter<CounterDetailOrder>();

  @Output() splited = new EventEmitter<CounterDetailOrder>();

  @Output() completed = new EventEmitter<CounterDetailOrder>();


  constructor(
    private dialog: MatDialog,
    public counterSrv: CounterService) { 
      this.displayedColumns = this.viewModelColumns;
    }

  ngOnInit() {
  }

  getPriceClass(element: CounterDetailOrder) {
    return {
      'price': true,
      'del-line': !element.is_ready || element.is_delete,
      'bgcolor-primary': element.price === 0,
      'bgcolor-accent': element.is_delete,
      'red-color': !element.is_ready

    }
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    let log: string[] = [];
    // tslint:disable-next-line: forin
    for (let propName in changes) {
      let changedProp = changes[propName];
      if (propName === "details") {
        this.dataSource = new MatTableDataSource(changedProp.currentValue);
      }

      if (propName === "model") {
        this.model = changedProp.currentValue;
        if ( this.model ) {
          this.displayedColumns = this.editModelColumns;
        } else {
          this.displayedColumns = this.viewModelColumns;
        }
      }

    }
  }

  delete(element: CounterDetailOrder) {
    element.is_delete = true;
    this.change.emit(element);
  }

  return(element: CounterDetailOrder) {
    element.is_delete = false;
    this.change.emit(element);
  }

  // init(details: Array<CounterDetailOrder>) {
  //   // if (Util.isEmptyArray(details)) {
  //   //   this.dataSource.data = [];
  //   //   return;
  //   // }

  //   // console.log(details);
  //   // details.forEach((detail) => {
  //   //   this.dataSource.data.push(detail);
  //   // });
  //   this.dataSource = new MatTableDataSource<CounterDetailOrder>(details);
  //   // this.table.renderRows();
  // }

  split(element) {
    this.splited.emit(element);
  }

  renderRows() {
    this.table.renderRows();
  }

  showStatus(element: CounterDetailOrder) {
    if (Util.isEmpty(element.detail_free_id)) {
      return element.status_name;
      // return element.status_code + ":" + element.status_name;
    } else {
      return element.detail_free_usable ? "" : "確認待ち";
    }
  }



  onDown(element: CounterDetailOrder) {

    this.godown.emit(element);
    // // console.log(row);
    // const index: number = this.dataSource.data.indexOf(row);
    // if (index !== -1) {
    //   this.dataSource.data.splice(index, 1);
    //   this.table1.renderRows();
    //   this.dataSource2.data.push({
    //     position: row.position,
    //     name: row.name,
    //     weight: row.weight,
    //     symbol: row.symbol
    //   });

    //   this.table2.renderRows();
    // }
  }

  complete(element: CounterDetailOrder) {

    element.is_ready = true;
    this.completed.emit(element);
  }

  changeCount(element: CounterDetailOrder) {
    const dialog = this.dialog.open(NumberInputComponent, {
      ariaDescribedBy: "_NumberInputComponent_",
      disableClose: false,
      width: '450px',
      data: { value: element.count }
    });
    dialog.afterClosed().subscribe(result => {
      if (result != undefined && result !== element.count ) {
        element.count = result;
        this.completed.emit(element);
      }
    });
  }

  changePrice(element: CounterDetailOrder) {
    const dialog = this.dialog.open(NumberInputComponent, {
      ariaDescribedBy: "_NumberInputComponent_",
      disableClose: false,
      width: '450px',
      data: { value: element.price }
    });
    dialog.afterClosed().subscribe(result => {
      if (result !== element.price) {
        element.price = result;
        this.completed.emit(element);
      }
    });
  }

  setTakeout(element, event) {
    element.is_takeout = event.checked;
    this.change.emit(element);
  }
}
