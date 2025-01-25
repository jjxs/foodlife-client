import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  QueryList,
  ViewChildren,
  AfterViewInit,
  Renderer2,
  OnChanges,
  SimpleChanges,
  Input,
  Output
} from '@angular/core';

import {
  MatPaginator,
  MatTableDataSource,
  MatSort,
  MatTab,
  MatSortHeader,
  MatHeaderCell
} from '@angular/material';

import { Observable, fromEvent } from 'rxjs';

import { AmiHeaderMoveEvent } from './ami-header.directive';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'ami-table',
  templateUrl: './ami-table.component.html',
  styleUrls: ['./ami-table.component.css']
})
export class AmiTableComponent implements OnInit, AfterViewInit, OnChanges {

  displayedColumns = ['id', 'name', 'progress', 'color'];
  dataSource: MatTableDataSource<object>;
  search$: any;
  clicks$: any;
  observer: any;

  @ViewChild(MatPaginator, {static: false}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: false}) sort: MatSort;
  @ViewChildren(MatSortHeader, { read: ElementRef }) headerEls: QueryList<ElementRef>;
  @ViewChildren(MatHeaderCell) headers: QueryList<MatHeaderCell>;

  @Output('data') data: any;

  constructor(
    private elRef: ElementRef,
    private render: Renderer2
  ) {

    // Create 100 users
    const users: UserData[] = [];
    for (let i = 1; i <= 100; i++) { users.push(createNewUser(i)); }
    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);

  }

  ngAfterViewInit() {
    // console.log(this.headers);
    // console.log(this.headerEls);

    // this.observer = new MutationObserver(mutations => {
    //   mutations.forEach(function (mutation) {
    //     console.log('observer');
    //     console.log(mutation.type);
    //   });
    // });
    // const config = { attributes: true, childList: true, characterData: true };

    // const someone = this.observer.observe(this.elRef.nativeElement, config);
    // someone.subscribe(e => {
    //   this.headerEls.forEach((header) => {
    //     this.render.listen(header.nativeElement, 'click', (event) => {
    //       const b = this.displayedColumns.shift();
    //       this.displayedColumns.push(b);
    //       this.dataSource.data.push(createNewUser(555));
    //     });
    //   });
    // });


    // this.headerEls.forEach((header) => {
    //   this.render.listen(header.nativeElement, 'click', (event) => {
    //     const b = this.displayedColumns.shift();
    //     this.displayedColumns.push(b);
    //     this.dataSource.data.push(createNewUser(555));
    //   });
    //   // this.clicks$ = fromEvent(header.nativeElement, 'click');
    //   // const subscription = this.clicks$
    //   //   .subscribe(e => {
    //   //     console.log('Clicked', e);
    //   //     const b = this.displayedColumns.shift();
    //   //     this.displayedColumns.push(b);
    //   //     this.dataSource.data.push(createNewUser(555));
    //   //   });
    // });
  }

  onAmiHeaderMove(evnet: AmiHeaderMoveEvent) {
    //console.log('onAmiHeaderMove', evnet);
    let index = this.displayedColumns.indexOf(evnet.fromId);
    this.displayedColumns.splice(index, 1);
    index = this.displayedColumns.indexOf(evnet.toId);
    this.displayedColumns.splice(index + 1, 0, evnet.fromId);
  }

  ngOnChanges(changes: SimpleChanges) {
    // tslint:disable-next-line:forin
    for (const propName in changes) {
      const chng = changes[propName];
      const cur = JSON.stringify(chng.currentValue);
      const prev = JSON.stringify(chng.previousValue);
      //console.log(`${propName}: currentValue = ${cur}, previousValue = ${prev}`);
    }
  }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // search$ = Observable.fromEvent(input, 'input');

    // const observable = Observable.create(function (observer) {
    //   console.log('Observable Exe');
    //   let i = 0;
    //   const waiter = setInterval(() => {
    //     console.log('create ', i);
    //     observer.next(i);
    //     i += 1;
    //     if (i >= 20) {
    //       observer.complete();
    //       clearInterval(waiter);
    //     }
    //   }, 1000);
    //   // setTimeout(() => {
    //   //   observer.complete();
    //   // });
    // });

    // console.log('just before subscribe');
    // const subscrption1 = observable.subscribe({
    //   next: x => console.log('got value 1: ' + x),
    //   error: err => console.error('something wrong occurred: ' + err),
    //   complete: () => console.log('done 1.')
    // });
    // setTimeout(() => {
    //   subscrption1.unsubscribe();
    // }, 5000);

    // setTimeout(() => {
    //   const subscrption2 = observable.subscribe({
    //     next: x => console.log('got value 2: ' + x),
    //     error: err => console.error('something wrong occurred: ' + err),
    //     complete: () => console.log('done 2.')
    //   });

    // }, 5000);

    // console.log('just after subscribe');
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}


/** Builds and returns a new User. */
function createNewUser(id: number): UserData {
  const name =
    NAMES[Math.round(Math.random() * (NAMES.length - 1))] + ' ' +
    NAMES[Math.round(Math.random() * (NAMES.length - 1))].charAt(0) + '.';

  return {
    id: id.toString(),
    name: name,
    progress: Math.round(Math.random() * 100).toString(),
    color: COLORS[Math.round(Math.random() * (COLORS.length - 1))]
  };
}


/** Constants used to fill up our data base. */
const COLORS = ['maroon', 'red', 'orange', 'yellow', 'olive', 'green', 'purple',
  'fuchsia', 'lime', 'teal', 'aqua', 'blue', 'navy', 'black', 'gray'];
const NAMES = ['Maia', 'Asher', 'Olivia', 'Atticus', 'Amelia', 'Jack',
  'Charlotte', 'Theodore', 'Isla', 'Oliver', 'Isabella', 'Jasper',
  'Cora', 'Levi', 'Violet', 'Arthur', 'Mia', 'Thomas', 'Elizabeth'];

export interface UserData {
  id: string;
  name: string;
  progress: string;
  color: string;
}
