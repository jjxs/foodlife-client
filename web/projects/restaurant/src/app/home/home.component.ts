import { Component, OnInit, LOCALE_ID, Inject, ElementRef, Renderer2, ViewChild } from '@angular/core';


import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable, timer } from 'rxjs';

import { MatDialog, MatSidenav } from '@angular/material';
import { CmpService } from '../cmp/cmp.service';
import { HomeService } from './home.service';
import { AuthenticationService } from 'ami';
import { LoginComponent } from './login/login.component';
import { ThemeService } from '../cmp/ami-theme-select/theme.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Util, InitResult } from 'ami';
import { SeatService } from '../seats/seat.service';
import { environment } from '../../environments/environment';
import { AppService } from '../app.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public toolbardisplay = "";
  headStyle = true;
  showMenuStyle = true;
  isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);

  isConnectError = false;
  timer: any;

  @ViewChild('drawer', {static: false}) drawer: MatSidenav;

  constructor(
    public authSrv: AuthenticationService,
    private loginDialog: MatDialog,
    private themeSrv: ThemeService,
    public service: HomeService,
    private seatSrv: SeatService,
    private router: Router,
    private cmp: CmpService,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    public dialog: MatDialog,
    public app: AppService,
    private breakpointObserver: BreakpointObserver) {
    // 通信エラーが発せ
    this.authSrv.connectError$.subscribe((error: HttpErrorResponse) => {

      if (!this.isConnectError && !this.authSrv.IsDebug) {
        this.isConnectError = true;
        this.cmp.loading("通信エラー、しばらくお待ちください ... ...", "buffer");

        this.timer = timer(5000, 5000).subscribe(val => {
          this.authSrv.connect();
        })
      }
    });

    // 通信エラーが解除する場合
    this.authSrv.connectSuccess$.subscribe(() => {
      // console.log("this.authSrv.connectSuccess$.subscribe(() => {")
      this.isConnectError = false;
      try {
        this.timer.unsubscribe();
      } catch (error) {
      }
      this.cmp.unloading();

      //　セキュリティー上考慮の上、回復する際に画面リロードする
      location.reload();
      // if (!this.authSrv.Authenticated) {
      //   this.authSrv.init();
      // }
    });

    // テーマ変更
    this.themeSrv.themeChanged$.subscribe((theme) => {
      this.renderer.removeClass(this.elementRef.nativeElement, theme.old);
      this.renderer.addClass(this.elementRef.nativeElement, theme.new);
    });

    //　ツールバー文字
    this.service.changeToolbar$.subscribe((content) => {
      this.toolbardisplay = content;
    })

    // Router　変更時
    this.router.events.subscribe((val) => {
      if (val instanceof NavigationStart) {
      }

      if (val instanceof NavigationEnd) {
        this.service.changeToolbar("")
        if (this.drawer && this.drawer.close)
          this.drawer.close();
      }
    });

    // Header, Menu隠す処理
    this.service.header$.subscribe((show) => {
      this.headStyle = show;
    });

    this.service.menu$.subscribe((show) => {
      this.showMenuStyle = show;
    });
  }

  ngOnInit() {

    if (!this.authSrv.authenticated) {
      this.loginDialog.open(LoginComponent, {
        width: '400px',
        data: {}
      });
    }

  }
   
  login() {
    this.loginDialog.open(LoginComponent, {
      width: '400px',
      data: {}
    });
  }

  logout() {
    const dialog = this.cmp.confirm('ログアウトしますか？');
    dialog.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.authSrv.logout();
        this.authSrv.init();
      }
    });


  }

  ngClick() {
  }

  reload() {
    this.router.navigate(['/', {}]);
    // window.location.reload();
  }


}
