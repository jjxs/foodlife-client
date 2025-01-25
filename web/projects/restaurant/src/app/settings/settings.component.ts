import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SeatListComponent } from '../seats/seat-list.component';
import { Util, JsonService } from 'ami';
import { SeatService } from '../seats/seat.service';
import { AuthenticationService } from 'ami';
import { Seat } from '../seats/seat.interface';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';
import { AppService } from '../app.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  debugModel = false;
  fullModel = true;
  showCallStaff = false;
  
  seatData: Seat = new Seat()

  constructor(
    public authSrv: AuthenticationService,
    private homeSvr: HomeService,
    private dialog: MatDialog,
    private router: Router,
    private jsonSrv: JsonService,
    private seatSrv: SeatService,
    private appService: AppService
  ) { }

  ngOnInit() {
    this.showCallStaff = this.appService.showCallStaff()
    this.homeSvr.showHeader(true);
    localStorage.setItem("__top_url__", "menu");
    //シート情報設定

    if (!Util.isEmpty(this.seatSrv.SeatId)) {
      this.jsonSrv.get('master/seat/' + this.seatSrv.SeatId + '/', {}).subscribe((response?: Seat) => {
        this.seatData = response;
        //console.log(response)
      });
    }
    this.debugModel = this.authSrv.IsDebug;
  }

  selectSeat(event) {
    const dialog = this.dialog.open(SeatListComponent, {
      width: '650px',
      data: { multiSelecte: false, selected: [this.seatData.id], takeout: '0' , enabled_takeout: false}
    });
    dialog.afterClosed().subscribe(result => {
      // console.log("after selectSeat", result)
      // this.seatData = new Seat();
      // this.seatSrv.removeSeatId()
      if (!Util.isEmpty(result)) {
        this.seatData = result;

        this.seatSrv.setSeatId(result.id);
      }
    });

  }
  changeFullModel(event) {
    localStorage.setItem("__full_model__", event.checked)
  }
  changePanel(event) {
    localStorage.setItem("__debug_model__", event.checked)
  }


  goStaff() {
    this.router.navigate(['/staff/top', {}]);
    localStorage.setItem("__top_url__", "staff/top")
  }

  goMonitor() {

    this.router.navigate(['/monitor', {}]);
    localStorage.setItem("__top_url__", "monitor")
  }

  goTable() {
    this.router.navigate(['/menu', {}]);
    localStorage.setItem("__top_url__", "menu")
    this.homeSvr.showHeader(true);
  }

  goCustomerCall() {
    this.router.navigate(['/customer-call', {}]);
    localStorage.setItem("__top_url__", "customer-call")
  }
}

