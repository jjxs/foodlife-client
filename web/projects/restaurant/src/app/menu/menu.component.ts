import { Component, OnInit, ViewChild } from '@angular/core';
import { HomeService } from '../home/home.service';
import { CmpService } from '../cmp/cmp.service';
import { JsonService, Util, JsonResult, InitResult, AuthenticatedEvent, AuthenticationService } from 'ami';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MenuService, OrderEvent } from './menu.service';
import { MatDialog } from '@angular/material';
import { MenufreeComponent } from './menufree/menufree.component';
import { Seat, SeatStatus } from '../seats/seat.interface';
import { OrderHistoryComponent } from '../order/order-history/order-history.component';
import { MenuListComponent } from './menu-list/menu-list.component';
import { ThemeMenuTopRankingComponent } from './theme-menu-top-ranking/theme-menu-top-ranking.component';
import { SeatService, MenufreeConfirmResult } from '../seats/seat.service';
import { trigger, state, transition, style, animate, keyframes } from '@angular/animations';
import { MenufreeTimeInfo } from './menu.interface';
import { resource } from 'selenium-webdriver/http';
import { ThemeService } from '../cmp/ami-theme-select/theme.service';
import { MenuHistoryComponent } from './menu-history/menu-history.component';
import { AppService } from '../app.service';



// （TODO:　所属料理、注文可能品ない場合、該当タブ非表示にする）<br>
// （TODO: 持ち帰りから遷移可能、３モードが必要＝＞席モード、放題モード、持ち帰りモード）

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
  providers: [
    MenuListComponent
  ]
})
export class MenuComponent implements OnInit {

  enableOrder = false;

  seat: any = {};

  seatStatus: any = {}

  menufreeName = "";

  menufreeTime = "";

  //　注文リスト
  list = [];

  message: string = "";

  showMenu = "top";
  top_theme = 'top1';


  @ViewChild("menuList", {static: false}) menuList: MenuListComponent;
  authenticated;
  constructor(
    private authSrv: AuthenticationService,
    private fb: FormBuilder,
    private cmp: CmpService,
    private jsonSrv: JsonService,
    private homeSvr: HomeService,
    private menuSrv: MenuService,
    public seatSrv: SeatService,
    private themeSvr: ThemeService,
    public appService: AppService,
    private dialog: MatDialog
  ) {

    this.menuSrv.menuChanged$.subscribe((menu: string) => {
      this.showMenu = menu;
    });


    // 該当テーブル利用できる際に
    this.seatSrv.usable$.subscribe((result) => {
      this.init();
    })

    // 該当テーブル利用できない際に
    this.seatSrv.unusable$.subscribe((resullt) => {
      this.clearSeatInfo();
    });

    //　ログアウトする際に、
    this.authSrv.loginOut$.subscribe((result) => {
      this.clearSeatInfo();
    });

    this.authenticated = this.authSrv.Authenticated$.subscribe((event: AuthenticatedEvent) => {
      if (event.result === true) {
        this.init();
      }
      this.authenticated.unsubscribe();
    });

    this.authSrv.initSuccessed$.subscribe((event) => {
      if (!Util.isEmpty(event)) {
        this.init();
      }
    });



    this.seatSrv.afterMenufreeConfirm$.subscribe((result: MenufreeConfirmResult) => {
      if (result.result === true) {
        this.goCheckAndStartMenufreeTime();
      }
    });

    // this.appService.languageChanged$.subscribe((event: boolean) => {
    //   this.init();
    // });

  }



  ngOnInit() {
    this.themeSvr.change("deeppurple-amber");
    this.init();
    // this.homeSvr.showHeader(false);

    // this.service.changeToolbar("テーブルA");
    // this.cmp.pop("また利用不可です、スタッフに声掛けてください。", 3000);

    // console.log("login MenuComponent ngOnInit")

  }

  clearSeatInfo() {
    this.seat = {};
    this.seatStatus = {};
    this.enableOrder = false;
    this.menuSrv.security_key = null;
  }

  init() {

    //console.log("menu")
    this.top_theme = 'top1';

    this.getTopConfig();
    // Websocket監視開始
/*  */    this.seatSrv.startWebsocket();

    // テーブル選択済み
    if (this.authSrv.Authenticated && !Util.isEmpty(this.seatSrv.SeatId)) {

      //席情報確認する
      this.jsonSrv.get('master/seat/' + this.seatSrv.SeatId + '/', {}).subscribe((response?: Seat) => {

        if (!Util.isEmpty(response)) {
          this.seat = response;
          // this.homeSvr.changeToolbar(this.seat.seat_no + "・" + this.seat.name);
          this.homeSvr.changeToolbar(this.seat.seat_no);
          console.log('menu component->'+this.seat.seat_no)
          this.getSeatStatus();
        }
      });
    }

    this.showMenu = 'top';

    // TODO 放題の注文の残り時間を監視開始する。
    this.goCheckAndStartMenufreeTime();
  }

  getTopConfig() {
    this.jsonSrv.get('restaurant/master/config/', {'key': 'top'}).subscribe((response?: any[]) => {
      let array = [];
      if (!Util.isEmpty(response) && response['config']) {
        this.top_theme = response['config']['value'];
      }
      if (Util.isEmpty(this.top_theme)) {
        this.top_theme = 'top1';
      }

    });
  }


  //チェック　そして放題の注文の残り時間を監視開始する。
  goCheckAndStartMenufreeTime() {

    this.jsonSrv.get('restaurant/menu/menufree_time/', { seat_id: this.seatSrv.SeatId })
      .subscribe((response: Array<MenufreeTimeInfo>) => {

        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          // console.log("goCheckAndStartMenufreeTime", response);
        }
      });
  }

  getSeatStatus() {
    let seat = this.seat;
    // テーブル利用状況取得
    console.log(seat)
    this.jsonSrv.get('master/seatstatus/', { seat: this.seat.id }).subscribe((response?: Array<SeatStatus>) => {
      // console.log(response)
      if (response && response[0]) {
        this.seatStatus = response[0];
        this.enableOrder = true;
        this.menuSrv.security_key = this.seatStatus.security_key;
      } else {
        this.clearSeatInfo();
        this.seat = seat;
      }
    });
  }

  refresh() {
    // this.getSeatStatus();
    this.init();
  }

  onScan(event: JsonResult) {
    this.cmp.pop(event, 2000);
    if (event.result) {
      this.seatSrv.setSeatId(event.data);
      this.init();
    } else {
      this.cmp.pop("読み取りできません、ご確認ください。")
    }
  }


  logout() {
    const dialog = this.cmp.confirm( this.menuSrv.language('ログアウトしますか？') );
    dialog.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.authSrv.logout();
        this.authSrv.init();
      }
    });


  }

  // //　食べ飲み放題画面開く
  // openMenufree(event) {
  //   const dialogMenuFree = this.dialog.open(MenufreeComponent, {
  //     width: '70%',
  //     height: '70%',
  //     data: { seatId: this.seatSrv.SeatId }
  //   });
  //   dialogMenuFree.afterClosed().subscribe(result => {
  //     // console.log(result);
  //   });
  // }

  // openOrderHistory(event) {

  //   const dialogMenuFree = this.dialog.open(MenuHistoryComponent, {
  //     width: '80%',
  //     height: '70%',
  //     data: { seatId: this.seatSrv.SeatId }
  //   });
  // }


}
