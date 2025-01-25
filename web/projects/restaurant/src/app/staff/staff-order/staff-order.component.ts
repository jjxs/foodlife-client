import { Component, OnInit } from '@angular/core';
import { JsonService, Util } from 'ami';
import { MatTableDataSource } from '@angular/material';
import { SeatListData, SeatStatus } from '../../seats/seat.interface';
import { CmpService } from '../../cmp/cmp.service';
import { ThemeService } from '../../cmp/ami-theme-select/theme.service';

@Component({
  selector: 'restaurant-staff-order',
  templateUrl: './staff-order.component.html',
  styleUrls: ['./staff-order.component.css']
})
export class StaffOrderComponent implements OnInit {


  /* {
    seatID: OrderSeatInfo
  }
  */
  seats = [];
  public connecting: WebSocket;
  constructor(
    private jsonSrv: JsonService,
    private themeSvr: ThemeService,
    private cmp: CmpService
  ) { }

  ngOnInit() {

    this.themeSvr.change("indigo-pink");
    this.jsonSrv.get('master/seatstatus/', {}).subscribe((list: Array<SeatStatus>) => {
      if (list && list[0]) {
        //console.log(list)
        this.seats = list;
      }
    });
    //this.startWebsocket();

  }

  displayTitle(seat: SeatStatus) {
    return "No." + seat.seat_no + " " + seat.seat_name
  }

}
