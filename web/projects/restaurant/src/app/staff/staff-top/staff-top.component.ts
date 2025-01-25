import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { StaffService } from '../staff.service';
import { CallingSeat } from '../staff.interface';
import { Seat } from '../../seats/seat.interface';
import { JsonService } from 'ami';

@Component({
  selector: 'restaurant-staff-top',
  templateUrl: './staff-top.component.html',
  styleUrls: ['./staff-top.component.css']
})
export class StaffTopComponent implements OnInit {

  @ViewChild('topAudio', {static: false}) topAudio: ElementRef;
  focusout = true;

  src = "";
  constructor(
    private jsonSrv: JsonService,
    public staffSrv: StaffService) {


    window.addEventListener('focus', (event) => {
      this.focusout = true;
    });

  }

  ngOnInit() {
    this.staffSrv.startWebsocket()
  }



  play() {
    this.staffSrv.play();
  }

  callEnd(seat: CallingSeat, index) {
    this.staffSrv.stop();
    this.staffSrv.removeSeat(index);
    this.jsonSrv.post('restaurant/menu/end_call/', { seat: seat }).subscribe((response?) => {
    });
  }

  clearAll() {
    this.staffSrv.removeAllSeat();
  }

  visibility() {
    this.staffSrv.play();
    this.staffSrv.stop();

    this.focusout = false;
  }

}
