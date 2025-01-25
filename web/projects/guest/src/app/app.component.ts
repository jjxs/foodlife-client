import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuComponent } from './menu/menu.component';
import { OrderComponent } from './order/order.component';
import { HomeComponent } from './home/home.component';
import { SettingComponent } from './setting/setting.component';
import { ReservationComponent } from './reservation/reservation.component';
import { AuthenticationService, AuthenticatedEvent } from './ami/authentication.service';
import { PopMenuService } from './cmp/pop-menu/pop-menu.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  home_page = HomeComponent;
  menu_page = MenuComponent;
  order_page = OrderComponent;
  reservation_page = ReservationComponent;
  setting_page = SettingComponent;

  title = '123123';

  constructor(
    private authSrv: AuthenticationService,
    private popSrv: PopMenuService) {

  }
  @ViewChild('login') public login;
  @ViewChild('quickin') public quickin;
  @ViewChild('nav') public nav;
  @ViewChild('popover') public popover;

  ngOnInit() {
    this.authSrv.login$.subscribe((data) => {
      this.login.nativeElement.show();
    });

    this.authSrv.Authenticated$.subscribe((event: AuthenticatedEvent) => {
      if (event.result === true) {
        this.login.nativeElement.hide();
      }
    })

    this.authSrv.scan$.subscribe((data) => {
      this.quickin.nativeElement.show();
    });

    this.authSrv.scanAfter$.subscribe((data) => {
      this.quickin.nativeElement.hide();
    });

    this.popSrv.popSource$.subscribe((element) => {
      this.popover.nativeElement.show(element);
    });

    this.authSrv.init();
  }

  onPostchange(event) {
  }

  showLogin() {
    this.popover.nativeElement.hide();
    this.authSrv.login({});
  }
}
