import { Component, OnInit, Output, EventEmitter, ViewChild  } from '@angular/core';
import { JsonService, Util, JsonResult } from 'ami';
import { SeatListData, SeatStatus } from '../../seats/seat.interface';
import { CmpService } from '../../cmp/cmp.service';
import { ThemeService } from '../../cmp/ami-theme-select/theme.service';
import { MatTableDataSource, MatTable, MatDialog, } from '@angular/material';
import { CounterSearchComponent } from '../../counter/counter-search/counter-search.component';
import { CounterDetailsComponent } from '../../counter/counter-details/counter-details.component';
import { CounterService } from '../../counter/counter.service';
import { Router, NavigationEnd } from '@angular/router';
import { CounterComponent } from '../../counter/counter.component';

@Component({
  selector: 'restaurant-staff-counter',
  templateUrl: './staff-counter.component.html',
  styleUrls: ['./staff-counter.component.css']
})
export class StaffCounterComponent implements OnInit {


  @Output() showMenu = new EventEmitter<any>();
  @ViewChild(CounterComponent, {static: false}) counterComponent: CounterComponent;
  showButton = true;
  showCounter = false;

  /* {
    seatID: OrderSeatInfo
  }
  */
  seats = [];
  public connecting: WebSocket;
  constructor(
    private jsonSrv: JsonService,
    private themeSvr: ThemeService,
    private dialog: MatDialog,
    private router: Router,
    public counterSrv: CounterService,
    private cmp: CmpService
  ) { }

  ngOnInit() {
  }


  // ##########################　履歴画面より、削除、再編集など処理 ########################## 
  openCounterSearch() {
    // this.counterComponent.openCounterSearch();
    // this.showButton = false;
    // this.showCounter = true;
    const dialog = this.dialog.open(CounterSearchComponent, {
      width: '90%',
      height: '70%'
    });
    dialog.afterClosed().subscribe(result => {
      this.showButton = true;
      this.showCounter = false;
    });

  }


  // 会計履歴
  openHistory(counterId?, detailId?) {
    // this.counterComponent.openHistory(counterId, detailId);
    let data = {};
    if (!Util.isEmpty(counterId)) {
      data['counter_id'] = counterId;
    }

    if (!Util.isEmpty(detailId)) {
      data['detail_id'] = detailId;
    }

    const dialog = this.dialog.open(CounterDetailsComponent, {
      width: '95%',
      height: '70%',
      data: data// : 13
    });

    dialog.afterClosed().subscribe(result => {
      if (result && result['action']=='edit') {
        this.showButton = false;
        this.showCounter = true;
        this.counterComponent.afterCounter(result['action'], result['counter'], result['detail']);
      } else {
      }
    });
  }
  clickPay() {
    this.showButton = false;
    this.showCounter = true;
  }

  gotoMenu() {
      // this.router.navigate(['/staff/menu']);
      this.showMenu.emit('menu');
  }

  gotoSetting() {
    // this.router.navigate(['/staff/setting']);
    this.showMenu.emit('setting');
  }

  gotoCounter() {
    this.showButton = true;
    this.showCounter = false;
    this.showMenu.emit('counter');
  }

}
