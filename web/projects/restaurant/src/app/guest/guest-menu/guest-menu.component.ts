import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { StaffMenuComponent } from "../../staff/staff-menu/staff-menu.component";
import { MenuService, OrderEvent } from "../../menu/menu.service";
import {
  trigger,
  state,
  transition,
  style,
  animate,
  keyframes,
} from "@angular/animations";
import { AuthenticationService, JsonService, Util, JsonResult } from "ami";
import { MatDialog } from "@angular/material";
import { SeatService } from "../../seats/seat.service";
// import { MasterGroup } from 'projects/guest/src/app/shared/master.interface';
import { CmpService } from "../../cmp/cmp.service";
import { StaffService } from "../../staff/staff.service";
import { CounterService } from "../../counter/counter.service";
import { Router, ActivatedRoute } from "@angular/router";
import { MenuUtil } from "../../menu/menu.util";
import { GuestMenuViewComponent } from "../guest-menu-view/guest-menu-view.component";
import { AppService } from "../../app.service";
import { MasterGroup, Menu, MenuCategory } from "../../menu/menu.interface";
import { StaffMenu } from "../../staff/staff.interface";
import { SeatOrderComponent } from "../../seats/seat-order/seat-order.component";

export interface Section {
  name: string;
  updated: Date;
}

@Component({
  selector: "restaurant-guest-menu",
  templateUrl: "./guest-menu.component.html",
  styleUrls: ["./guest-menu.component.css"],
  animations: [
    trigger("changecount", [
      transition("* => *", [
        animate(
          100,
          keyframes([
            style({
              "font-size": "200%",
              "font-weight": "900",
              color: "white",
              offset: 0.2,
            }),
            style({
              "font-size": "140%",
              "font-weight": "500",
              color: "black",
              offset: 1.0,
            }),
          ])
        ),
      ]),
    ]),
    trigger("animationStatus", [
      state("left", style({})),
      state("right", style({})),
      transition("* => right", [
        animate(
          400,
          keyframes([
            style({ opacity: 0, transform: "translateX(100%)", offset: 0 }),
            style({ opacity: 1, transform: "translateX(0)", offset: 1.0 }),
          ])
        ),
      ]),
      transition("* => left", [
        animate(
          400,
          keyframes([
            style({ opacity: 0, transform: "translateX(-100%)", offset: 0 }),
            style({ opacity: 1, transform: "translateX(0)", offset: 1.0 }),
          ])
        ),
      ]),
      transition("* => end", [
        animate(
          800,
          keyframes([
            style({ opacity: 0, transform: "translateX(100%)", offset: 0 }),
            style({ opacity: 1, transform: "translateX(-100px)", offset: 0.4 }),
            style({ opacity: 1, transform: "translateX(0)", offset: 1.0 }),
          ])
        ),
      ]),
      transition("* => front", [
        animate(
          800,
          keyframes([
            style({ opacity: 0, transform: "translateX(-100%)", offset: 0 }),
            style({ opacity: 1, transform: "translateX(100px)", offset: 0.4 }),
            style({ opacity: 1, transform: "translateX(0)", offset: 1.0 }),
          ])
        ),
      ]),
    ]),
  ],
})
export class GuestMenuComponent
  extends StaffMenuComponent
  implements OnInit, OnChanges
{
  @Input() seat;
  @Input() autoStartSeat;
  is_staff = false;
  show_call_staff: boolean = false;

  no_store = 30;
  show_menu = true;
  show_cart = false;
  show_history = false;
  show_ranking = false;
  orign_menus = null;
  icon = "shopping_cart";
  menu_free = false;
  qrThemeId = "theme3";
  rankMenuData = [];
  myInnerHeight;
  constructor(
    protected authSrv: AuthenticationService,
    protected dialog: MatDialog,
    public staffSrv: StaffService,
    protected counterSrv: CounterService,
    protected jsonSrv: JsonService,
    protected menuSrv: MenuService,
    protected cmp: CmpService,
    protected menuUtil: MenuUtil,
    protected route: ActivatedRoute,
    protected appService: AppService,
    protected seatSrv: SeatService
  ) {
    super(
      authSrv,
      dialog,
      staffSrv,
      counterSrv,
      jsonSrv,
      menuSrv,
      cmp,
      menuUtil,
      route,
      appService,
      seatSrv
    );

    this.myInnerHeight = window.innerHeight;
    this.site_image_host = this.menuSrv.appService.SiteImageHost + "/";
    this.canOrder = false;
    this.qrThemeId = this.appService.getQrThemeId();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (
      !Util.isEmpty(changes["seat"]) &&
      !Util.isEmpty(changes["seat"]["currentValue"])
    ) {
      this.selectedSeat = this.seat;
      this.startSeat();
    }
  }

  ngOnInit() {
    // 支払総額（税抜き
    this.moneyTotal = 0;
    // 会計ID
    this.counterId = -1;
    this.refreashTime = new Date().toTimeString();

    this.staffSrv.showFooter(true);
    // 注文後
    this.menuSrv.afterOrder$.subscribe((result: boolean) => {
      if (result === true) {
        this.clearSeat();
        this.showCart();
      } else {
        this.cmp.pop("注文異常しました", 1500);
        location.reload();
      }
    });
    this.getRankingMenus();
    // this.getSeatList();
    this.show_call_staff = this.appService.showCallStaff();
  }

  getRankingMenus() {
    this.jsonSrv
      .get("restaurant/menu/ranking/", {})
      .subscribe((response?: Array<MenuCategory>) => {
        if (Util.isEmpty(response) || Util.isEmpty(response[0])) {
          // this.cmp.unloading(500);
          return;
        }
        this.rankMenuData = [];
        if (!Util.isEmpty(response) && response[0]) {
          response.forEach((row: any) => {
            this.rankMenuData.push(row);
            if (this.rankMenuData.length > 0) {
              this.rankMenuData.forEach((da) => {
                da["id"] = da["menu_id"];
                da["count"] = 0;
                da["name"] = da["menu_name"];
                da["price"] = da["menu_price"];
                da["usable"] = da["menu_usable"];
                da["no"] = da["menu_no"];
              });
            }
          });
        }
      });
  }

  seatSet() {
    const dialog = this.dialog.open(SeatOrderComponent, {
      ariaDescribedBy: "_SeatOrderComponent_",
      disableClose: true,
      data: { value: this.selectedSeat, isFromGuest: true },
    });
    dialog.afterClosed().subscribe((result) => {
      // this.getListData();
    });
  }

  startSeat(item = null) {
    let seatid = this.selectedSeat.id;
    if (!Util.isEmpty(item) && !Util.isEmpty(item["id"])) {
      seatid = item["id"];
    }
    this.jsonSrv
      .post("restaurant/seat_status", { id: seatid })
      .subscribe((response?: JsonResult) => {
        this.selectedSeatStatus = true;
        this.selectSeat(this.selectedSeat);
        if (response.result != false) {
          this.seatSet();
        }
      });
  }

  remove(menu) {
    menu.count = 0;
    // tslint:disable-next-line: forin
    for (const i in this.staffSrv.carts) {
      const m = this.staffSrv.carts[i];
      if (m["id"] == menu.id) {
        m["count"] = 0;
      }
    }
  }
  clearSeat() {}

  openMenuView(menu) {
    return this.dialog.open(GuestMenuViewComponent, {
      width: "100vw",
      maxWidth: "100vw",
      height: "70vh",
      maxHeight: "70vh",
      panelClass: "guest-menu-view",
      data: {
        menu: menu,
        enableOrder: true,
      },
    });
  }

  cartCount() {
    let count = 0;
    // tslint:disable-next-line: forin
    for (const i in this.staffSrv.carts) {
      count += this.staffSrv.carts[i]["count"];
    }
    return count;
  }

  preClick(event) {
    const hour = new Date().getHours();
    let temp = [];
    temp = this.staffSrv.menuMasterGroup.filter((e) => {
      return (
        Util.isEmpty(e["option"]["show_time"]) ||
        (e["option"]["show_time"] instanceof Array &&
          e["option"]["show_time"].length != 2) ||
        (e["option"]["show_time"][0] <= hour &&
          hour < e["option"]["show_time"][1])
      );
    });

    for (const i in temp) {
      if (temp[i] === this.select_group) {
        if (parseInt(i) > 1) {
          let index = parseInt(i) - 1;
          while (index >= 0) {
            if (temp[index]["name"] != "menu_category_standard") {
              break;
            }
            index = index - 1;
          }
          this.cCategory(temp[index]);
          break;
        }
      }
    }
  }
  nextClick(event) {
    const hour = new Date().getHours();
    let go = false;
    let temp = [];
    temp = this.staffSrv.menuMasterGroup.filter((e) => {
      return (
        Util.isEmpty(e["option"]["show_time"]) ||
        (e["option"]["show_time"] instanceof Array &&
          e["option"]["show_time"].length != 2) ||
        (e["option"]["show_time"][0] <= hour &&
          hour < e["option"]["show_time"][1])
      );
    });
    for (const i in temp) {
      if (go && temp[i]["name"] != "menu_category_standard") {
        this.cCategory(temp[i]);
        break;
      } else if (temp[i] === this.select_group) {
        go = true;
      }
    }
  }

  toAddCart(menu, showView = false) {
    if (Util.isEmpty(menu.usable) || menu.stock_status == this.no_store) {
      return;
    }
    this.addCart(menu, showView);
  }

  getBtnTitle() {
    if (this.show_cart) {
      return "履歴";
    }
    if (this.show_menu == true) {
      return "履歴";
    } else {
      return "注文";
    }
  }

  canShow(group) {
    if (group.name == "menu_category_standard") {
      return false;
    }
    if (!Util.isEmpty(group.option)) {
      if (!Util.isEmpty(group.option["show_time"])) {
        const hour = new Date().getHours();
        if (group.option["show_time"] instanceof Array) {
          if (group.option["show_time"].length != 2) {
            return true;
          } else {
            if (
              hour < group.option["show_time"][0] ||
              hour >= group.option["show_time"][1]
            ) {
              return false;
            }
          }
        } else {
          switch (group.option["show_time"]) {
            case "lunch":
              if (hour >= 17) {
                return false;
              }
              break;
            case "dinner":
              if (hour < 17) {
                return false;
              }
              break;
          }
        }
      }
    }
    return true;
  }
  changeView() {
    if (this.show_history == false) {
      this.show_menu = false;
      this.show_history = true;
      this.show_cart = false;
      this.show_ranking = false;
    } else {
      this.show_menu = true;
      this.show_history = false;
      this.show_cart = false;
      this.show_ranking = false;
    }
  }

  showMenu() {
    this.show_menu = true;
    this.show_history = false;
    this.show_cart = false;
    this.show_ranking = false;
  }

  showHistory() {
    this.show_menu = false;
    this.show_history = true;
    this.show_cart = false;
    this.show_ranking = false;
    this.refreashTime = new Date().toTimeString();
  }
  showRanking() {
    this.show_menu = false;
    this.show_history = false;
    this.show_cart = false;
    this.show_ranking = true;
  }
  onClickRank(menu, showView) {
    // if (Util.isEmpty(menu.usable) || menu.stock_status == this.no_store) {
    //   return
    // }
    this.addCart(menu, showView);
  }

  showCart() {
    if (this.show_cart == false) {
      this.show_cart = true;
      this.icon = "shopping_cart";
      this.show_menu = false;
      this.show_history = false;
      this.show_ranking = false;
    } else {
      this.show_cart = false;
      this.icon = "shopping_cart";
      this.show_menu = true;
      this.show_history = false;
      this.show_ranking = false;
    }
  }

  onClick(event, id) {
    //console.log(event, id)
  }

  cCategory(group: MasterGroup) {
    this.getFreeMenu(group);
    this.clickCategory(group);
  }

  getFreeMenu(group: MasterGroup) {
    this.menu_free = false;
    this.jsonSrv
      .get("restaurant/menu/menucategory/", {
        seat_id: this.selectedSeat["id"],
        category_group: group.id,
      })
      .subscribe((response: Array<any>) => {
        console.info(response);
        let arr = {};
        response.forEach((item) => {
          if (item["is_free"]) {
            arr[item["menu_id"]] = item["is_free"];
          }
        });
        if (Object.values(arr).length > 0) {
          this.menu_free = true;
          for (let i in this.staffSrv.categoryMenus) {
            this.staffSrv.categoryMenus[i].forEach((element: StaffMenu) => {
              if (!Util.isEmpty(arr[element.id])) {
                element.is_free = arr[element.id] == 1 ? true : false;
              }
            });
          }
          console.info(this.staffSrv.categoryMenus);
        }
      });
  }

  canShowMenu(menu: StaffMenu) {
    if (menu.level == 0) {
      return false;
    } else if (!menu.usable) {
      return false;
    } else if (this.menu_free && !menu.is_free) {
      return false;
    }
    return true;
  }

  callStaff() {
    this.jsonSrv
      .post("restaurant/menu/call_staff/", {
        seat_no: this.seat["seat_no"],
        seat_name: this.seat["name"],
      })
      .subscribe((response) => {});
  }
}
