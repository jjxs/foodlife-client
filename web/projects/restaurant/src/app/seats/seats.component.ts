import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort, MatTableDataSource, MatDialog } from '@angular/material';
import { SelectionModel, SelectionChange } from '@angular/cdk/collections';
import { JsonService, Util, JsonResult } from 'ami';
import { HomeService } from '../home/home.service';
import { group } from '@angular/animations';
import { CmpService } from '../cmp/cmp.service';
import { Router } from '@angular/router';
import { OrderHistoryComponent } from '../order/order-history/order-history.component';
import { ThemeService } from '../cmp/ami-theme-select/theme.service';
import { SeatOrderComponent } from './seat-order/seat-order.component';
import { SeatFreeMenuComponent } from './seat-free-menu/seat-free-menu.component';

@Component({
  selector: 'app-seats',
  templateUrl: './seats.component.html',
  styleUrls: ['./seats.component.css']
})
export class SeatsComponent implements OnInit {
  select_mode = false;

  displayedColumnsWithSelect = ['select', 'btn_start', 'no', 'name', 'guest_number', 'btn_set', 'type', 'tobacco', 'counts', 'btn_pay', 'btn_reservation'];

  dataSource: MatTableDataSource<SeatListData>;

  selection = new SelectionModel<SeatListData>(true, []);

  dynamicsearch = true;
  seat_group_list = [];
  seat_type_list = [];
  seat_smoke_type_list = [];
  seat_number_list = [
    { checked: false, display_name: '1-2', value: '1-2' },
    { checked: false, display_name: '3-4', value: '3-4' },
    { checked: false, display_name: '7-9', value: '7-9' },
    { checked: false, display_name: '10人以上', value: '10' }
  ];

  seat_usable = "0";
  selections_table = "";
  seatFreeStatus = {}

  constructor(
    private jsonSrv: JsonService,
    private homeSvr: HomeService,
    private cmp: CmpService,
    private router: Router,
    private themeSvr: ThemeService,
    private dialog: MatDialog
  ) { }

  @ViewChild(MatSort, { static: false }) sort: MatSort;

  ngOnInit() {

    this.jsonSrv.post('s/setsubi_api/get_mac_data', {}).subscribe((response: JsonResult) => {
      if (response['data'] == '1') {
      } else {
        this.router.navigateByUrl('/store/setsubi-error');
        return;
      }
    });
    this.homeSvr.showHeader(true);
    this.themeSvr.change("indigo-pink");
    this.getListData();

    this.selection.onChange.subscribe((event: SelectionChange<SeatListData>) => {
      event.removed.forEach((data) => { data.selected = false });
      event.added.forEach((data) => { data.selected = true });

      this.selections_table = "";
      this.selection.selected.forEach((data) => {
        this.selections_table += data.seat_no + "(" + data.name + ")" + ","
      });
    });

    // 検索条件と取得
    this.jsonSrv.get('master/master/', { name__in: 'seat_type,seat_smoke_type' })
      .subscribe((response) => {
        if (response instanceof Array) {
          response.forEach((group: any, index: number, array: Array<any>) => {
            if (group.name === 'seat_type') {
              group.master_data.forEach((data: any, i: number) => {
                data.checked = false;
              });
              this.seat_type_list = group.master_data;
            }
            if (group.name === 'seat_smoke_type') {
              group.master_data.forEach((data: any, i: number) => {
                data.checked = false;
              });
              this.seat_smoke_type_list = group.master_data;
            }
          })
        }
      });

    this.jsonSrv.get('master/seatgroup/', { name__in: 'seat_type,seat_smoke_type' })
      .subscribe((response) => {
        if (response instanceof Array) {
          response.forEach((group: any, index: number, array: Array<any>) => {
            group.checked = false;
          });
          this.seat_group_list = response;
        }
      });
  }

  createCondition() {
    // dynamicsearch = true;
    // seat_type_list = [];
    // seat_smoke_type_list = [];
    // seat_number_list = [
    //   { checked: false, display_name: '1-2', value: 2 },
    //   { checked: false, display_name: '3-4', value: 4 },
    //   { checked: false, display_name: '5-6', value: 6 },
    //   { checked: false, display_name: '7-10', value: 10 },
    //   { checked: false, display_name: '10人以上', value: 50 }
    // ];
    var condition = {
      seat_group: [],
      seat_type: [],
      seat_smoke_type: [],
      seat_number: [],
      seat_usable: this.seat_usable,
      takeout_type: 0,
    };

    this.seat_group_list.forEach((data: any, i: number) => {
      if (data["checked"] === true) {
        condition.seat_group.push(data["id"])
      }
    });

    this.seat_type_list.forEach((data: any, i: number) => {
      if (data["checked"] === true) {
        condition.seat_type.push(data["id"])
      }
    });

    this.seat_smoke_type_list.forEach((data: any, i: number) => {
      if (data["checked"] === true) {
        condition.seat_smoke_type.push(data["id"])
      }
    });


    this.seat_number_list.forEach((data: any, i: number) => {
      if (data["checked"] === true) {
        condition.seat_number.push(data["value"])
      }
    });

    return condition;

  }

  getListData() {
    this.getFreeStatus()
    this.jsonSrv.post('restaurant/seat_list/', this.createCondition()).subscribe((response) => {

      if (!Util.isEmpty(response["data"]) && response["data"][0]) {
        this.dataSource = new MatTableDataSource(response["data"]);
      } else {
        this.dataSource = new MatTableDataSource([]);
      }
    });
  }


  getFreeStatus() {
    this.jsonSrv.post('restaurant/seat/free_status/', {}).subscribe((response) => {
      if (!Util.isEmpty(response["data"])) {
        this.seatFreeStatus = {}
        for (var i in response['data']) {
          let seat_id = response['data'][i]['seat_id']
          if (Util.isEmpty(this.seatFreeStatus[seat_id])) {
            this.seatFreeStatus[seat_id] = []
          }
          this.seatFreeStatus[seat_id].push(response['data'][i])
        }
      }
    });
  }

  isFreeStart(item) {
    return !Util.isEmpty(this.seatFreeStatus[item.id])
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  isUsing(row: SeatListData): boolean {
    if (Util.isEmpty(row.use_start))
      return false;

    return true;
  }

  selectModelChange() {
    if (this.select_mode === false)
      this.selection.clear();
  }

  rowClick(row) {
    if (this.select_mode === true) {
      this.selection.toggle(row);
    }
  }

  show(row) {
    // console.log(row)
  }

  stop(event, row?: SeatListData) {
    event.stopPropagation();
    this.jsonSrv.delete('restaurant/seat_status', { id: row.id }).subscribe((response?: JsonResult) => {
      //console.log(response)
      if (!Util.isEmpty(response.message)) {
        this.cmp.pop(response["message"]);
      }
      if (!Util.isEmpty(response) && response.result) {
        // 成功した場合、リフレッシュ
        this.getListData();
      }
    });
  }

  start(event, row?: SeatListData) {
    event.stopPropagation()

    this.jsonSrv.post('restaurant/seat_status', { id: row.id }).subscribe((response?: JsonResult) => {
      if (!Util.isEmpty(response.message)) {
        this.cmp.pop(response["message"])
      }

      if (!Util.isEmpty(response) && response.result) {
        // 成功した場合、リフレッシュ
        this.getListData();
      }
    });
  }

  startFreeMenu(event, element?: SeatListData) {
    const dialog = this.dialog.open(SeatFreeMenuComponent, {
      ariaDescribedBy: "_SeatFreeMenuComponentt_",
      // disableClose: false,
      width: '500px',
      // height: '60%',
      data: { value: element }
    });
    dialog.afterClosed().subscribe(result => {
      this.getListData();
    });
  }

  stopFreeMenu(event, element?: SeatListData) {
    const dialog = this.cmp.confirm('中止しますか？');
    dialog.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.jsonSrv.post('restaurant/seat/free_stop/', { seat_id: element.id }).subscribe((response?: JsonResult) => {
          if (!Util.isEmpty(response.message)) {
            this.cmp.pop(response["message"])
          }

          if (!Util.isEmpty(response) && response.result) {
            // 成功した場合、リフレッシュ
            this.getListData();
          }
        });
      }
    });
  }

  reservation(event, row?: SeatListData) {
    event.stopPropagation()
    // console.log(row)
  }

  pay(event, row?: SeatListData) {
    //console.log(row);
    event.stopPropagation();
    const params = Util.encode([row.id]);
    this.router.navigate(['/counter', { ids: params }]);
  }


  payMulti(event) {

    if (!Util.isEmptyArray(this.selection.selected)) {
      const seats = [];
      this.selection.selected.forEach((seat) => {
        seats.push(seat.id);
      });

      const params = Util.encode(seats);
      this.router.navigate(['/counter', { ids: params }]);

    }

  }

  refresh(event) {
    event.stopPropagation();
    this.getListData()
  }

  showselection() {
    this.getListData();
  }

  conditionChange(event) {
    if (this.dynamicsearch === true) {
      this.getListData()
    }
  }

  openHistory(data) {

    const dialogMenuFree = this.dialog.open(OrderHistoryComponent, {
      width: '60%',
      data: { seatId: data.id }
    });
  }

  seatSet(event, element) {
    const dialog = this.dialog.open(SeatOrderComponent, {
      ariaDescribedBy: "_SeatOrderComponent_",
      // disableClose: false,
      width: '500px',
      // height: '60%',
      data: { value: element }
    });
    dialog.afterClosed().subscribe(result => {
      this.getListData();
    });
  }

  startCheck(element: SeatListData) {
  }

  goto(link) {
    if (link === 'counter') {
      this.router.navigate(['/counter']);
    }
  }

}

interface SeatListData {
  id: number
  seat_no: string
  name: string
  guest_number: number,
  start: Date
  usable: boolean
  number: number
  seat_type: string
  seat_smoke_type: string
  group_no: string
  group_name: string
  selected: boolean
  use_start: Date
}


// const ELEMENT_DATA: PeriodicElement[] = [
//   { no: 1, group_name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
//   { no: 2, group_name: 'Helium', weight: 4.0026, symbol: 'He' },
//   { no: 3, group_name: 'Lithium', weight: 6.941, symbol: 'Li' },
//   { no: 4, group_name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
//   { no: 5, group_name: 'Boron', weight: 10.811, symbol: 'B' },
//   { no: 6, group_name: 'Carbon', weight: 12.0107, symbol: 'C' },
//   { no: 7, group_name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
//   { no: 8, group_name: 'Oxygen', weight: 15.9994, symbol: 'O' },
//   { no: 9, group_name: 'Fluorine', weight: 18.9984, symbol: 'F' },
//   { no: 10, group_name: 'Neon', weight: 20.1797, symbol: 'Ne' },
//   { no: 4, group_name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
//   { no: 5, group_name: 'Boron', weight: 10.811, symbol: 'B' },
//   { no: 6, group_name: 'Carbon', weight: 12.0107, symbol: 'C' },
//   { no: 7, group_name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
//   { no: 8, group_name: 'Oxygen', weight: 15.9994, symbol: 'O' },
//   { no: 9, group_name: 'Fluorine', weight: 18.9984, symbol: 'F' },
//   { no: 10, group_name: 'Neon', weight: 20.1797, symbol: 'Ne' },
// ];
