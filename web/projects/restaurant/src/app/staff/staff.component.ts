import { Component, OnInit } from '@angular/core';
import { HomeService } from '../home/home.service';
import { environment } from '../../environments/environment';
import { Util, AuthenticationService } from 'ami';
import { StaffService } from './staff.service';
import { Router, NavigationEnd } from '@angular/router';
import { ThemeService } from '../cmp/ami-theme-select/theme.service';

@Component({
  selector: 'restaurant-staff',
  templateUrl: './staff.component.html',
  styleUrls: ['./staff.component.css']
})
export class StaffComponent implements OnInit {

  connecting: WebSocket;

  constructor(
    public authSrv: AuthenticationService,
    public staffSrv: StaffService,
    private themeSvr: ThemeService,
    private router: Router,
    private homeSrv: HomeService) {


  }

  ngOnInit() {
    this.themeSvr.change("indigo-pink");
    this.homeSrv.showHeader(false);
    this.staffSrv.startWebsocket();
    this.router.navigate(['/staff/menu']);
  }

  onCall(event) {

  }

}
