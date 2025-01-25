import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { StaffService } from '../staff.service';
import { Router } from '@angular/router';
import { HomeService } from '../../home/home.service';

@Component({
  selector: 'restaurant-staff-setting',
  templateUrl: './staff-setting.component.html',
  styleUrls: ['./staff-setting.component.css']
})
export class StaffSettingComponent implements OnInit {

  
  @Output() showMenu = new EventEmitter<any>();
  // @ViewChild('audio') audio: ElementRef;

  // src = "";
  constructor(
    private router: Router,
    public staffSrv: StaffService,
    private homeSrv: HomeService
  ) {
  }

  ngOnInit() {
  }



  stop(event) {
    this.staffSrv.stop();
  }

  play(event) {
    this.staffSrv.play();
  }

  onChange(event) {
    this.staffSrv.stop();
    this.staffSrv.setPlayItem(event.value);
  }

  goTable() {
    this.homeSrv.showMenu(true);
    this.homeSrv.showHeader(true);
    this.router.navigate(['/settings', {}]);
    localStorage.setItem("__top_url__", "settings");
  }
  
  gotoCounter() {
    // this.router.navigate(['/staff/counter']);
    this.showMenu.emit('counter');
  }

}
