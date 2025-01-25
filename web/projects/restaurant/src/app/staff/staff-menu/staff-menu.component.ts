import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService, JsonService, Util, JsonResult} from 'ami';
import { MatDialog } from '@angular/material';
import { SeatService } from '../../seats/seat.service';
// import { MasterGroup } from 'projects/guest/src/app/shared/master.interface';
import { Master, MasterGroup } from '../../menu/menu.interface';
import { StaffMenu } from '../staff.interface';
import { MenuService, OrderEvent } from '../../menu/menu.service';
import { SeatListData, Seat, SeatStatus } from '../../seats/seat.interface';
import { CmpService } from '../../cmp/cmp.service';
import { MenufreeComponent } from '../../menu/menufree/menufree.component';
import { StaffService } from '../staff.service';
import { CounterService, } from '../../counter/counter.service';
import { CounterDetailOrder } from '../../counter/counter.interface';
import { CounterPanelComponent } from '../../counter/counter-panel/counter-panel.component';
import { OrderHistoryComponent } from '../../order/order-history/order-history.component';
import { CounterDetailsComponent } from '../../counter/counter-details/counter-details.component';
import { style, trigger, state, transition, animate, keyframes } from '@angular/animations';
import { StaffChangeSeatComponent } from '../staff-change-seat/staff-change-seat.component';
import { Router, ActivatedRoute } from '@angular/router';
import { SeatOrderComponent } from '../../seats/seat-order/seat-order.component';
import { SeatFreeMenuComponent } from '../../seats/seat-free-menu/seat-free-menu.component';
import { MenuUtil } from '../../menu/menu.util';
import { StaffMenuViewComponent } from '../staff-menu-view/staff-menu-view.component';
import { MenuLanguageComponent } from '../../menu/menu-language/menu-language.component';
import { AppService } from '../../app.service';

export interface Section {
  name: string;
  updated: Date;
}

@Component({
  selector: 'restaurant-staff-menu',
  templateUrl: './staff-menu.component.html',
  styleUrls: ['./staff-menu.component.css']
})
export class StaffMenuComponent implements OnInit {

  @ViewChild(CounterPanelComponent, {static: false}) counterPanel: CounterPanelComponent;
  @ViewChild(OrderHistoryComponent, {static: false}) orderHistory: OrderHistoryComponent;
  no_store = 30 // 売り切れ、31売り切れなし
  canSaleOffFlg=false;
  is_staff = true;
  tabIndex = 0;
  input_no = 0;
  input_count = 0;
  input_menu: StaffMenu = new StaffMenu();
  // input_name = '';
  // input_price = 0;

  select_group: MasterGroup;
  select_master: Master;
  select_menus: Array<StaffMenu>;


  objectKeys = Object.keys;

  seatList: Array<SeatListData> = [];
  protected selectedSeat: any;
  orders_detail;
  moneyTotal;
  counterId;
  selectedSeatStatus = true;
  canOrder = false;
  refreashTime;

  afterCounter$;

  show_master = [];
  seatFreeStatus = {};
  isFree = false;

  staffmenu = true;
  seatmap = false;
  staffcounter = false;
  staffsetting = false;
  show_btn_list = false;

  site_image_host = '';

  // magicBtn = 'exposure';
  // enableCounter = true;

  magicBtn = 'settings';
  enableCounter = false;

  show_list = false;

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
    protected seatSrv: SeatService) {
      this.showSeatMap();

      this.site_image_host = this.menuSrv.appService.SiteImageHost + '/';

      this.canOrder = false;

      //　会計完了した場合
      this.afterCounter$ = this.counterSrv.afterCounter$.subscribe((response: JsonResult) => {

        // メッセージあれば、表示する
        if (!Util.isEmpty(response.message)) {
          this.cmp.pop(response.message);
        }

        // Fasleの場合処理中止
        if (!response.result) {
          return;
        }

        // CounterID
        let counterId = response.data['counter'];

        // this.openHistory(counterId, response.data['id']);
        // this.canOrder = false;
        // this.tabIndex = 0;
        // this.refreashTime = (new Date()).toTimeString();
        // this.refreshTask();

        let params = {};
        params['counter_id'] = counterId;
        this.jsonSrv.post('restaurant/counter/counter_detail/', params).subscribe((response1?) => {
          //console.log(response1);
          if (response1 && !Util.isEmpty(response1['data'])) {
            if ( response1['data'] && response1['data']['counters'] ) {
              let counters = response1['data']['counters'];
              if ( counters[0]['is_completed'] ) {
                this.canOrder = false;
                this.tabIndex = 0;
                this.refreashTime = (new Date()).toTimeString();
                this.refreshTask();
              }
            }
          }
        });
      });
  }

  ngOnInit() {
    // 支払総額（税抜き
    this.moneyTotal = 0;
    // 会計ID
    this.counterId = -1;
    this.refreashTime = (new Date()).toTimeString();

    this.staffSrv.showFooter(true);
    //　注文後
    this.menuSrv.afterOrder$.subscribe((result: boolean) => {
      if (result === true) {
        this.clearSeat();
      }
      this.showSeatMap();
    });

    this.getSeatList();
    let show_list = localStorage.getItem("show_list");
    this.show_list = !Util.isEmpty(show_list);
  }

  ngOnDestroy() {
    this.afterCounter$.unsubscribe();
    localStorage.setItem("show_list", this.show_list? "1" : "0");
  }

  // 会計履歴
  openHistory(counterId?, detailId?) {

    var data = {};
    if (!Util.isEmpty(counterId)) {
      data['counter_id'] = counterId;
    }

    if (!Util.isEmpty(detailId)) {
      data['detail_id'] = detailId;
    }

    const dialog = this.dialog.open(CounterDetailsComponent, {
      width: '95%',
      height: '70%',
      data: data//: 13
    });
  }

  clearSeat() {
    this.show_btn_list = false;
    // 支払総額（税抜き
    this.moneyTotal = 0;
    // 会計ID
    this.counterId = -1;
    this.input_no = 0;
    this.input_count = 0;
    this.input_menu = new StaffMenu();
    // this.input_name = '';
    // this.input_price = 0;
    // this.selectedSeat = null;
    this.select_group = null;
    this.select_master = null;
    this.select_menus = null;
    // this.menuSrv.security_key = '';
    this.staffSrv.clearOrderEventArray();

    this.isFree = false;
  }


  // ########################### その他の注文 ########################

  doing = false;
  other_list = [];
  other = {
    model: '0',
    menu_id: -1,
    menu_no: -1,
    count: 0,
    price: 0,
    tax: 0
  }

  tabChange(event) {
    this.tabIndex = event;
    if(this.tabIndex===3) {
      // this.pay();
    }　else if (this.tabIndex===2) {
      this.refreashTime = (new Date()).toTimeString();
    }
    return false;
  }

  orderOther(event) {
    // console.log(this.other_list);
    const params = {
      orders: this.other_list,
      key: this.menuSrv.security_key
    }

    this.jsonSrv.post('restaurant/order/order_other/', params).subscribe((response?) => {

      if (response && response['message']) {
        this.cmp.pop(response['message']);
        this.showSeatMap();
      }

      if (!Util.isEmpty(response) && response['result'] === true) {
        this.clearPrice();
        this.other_list = [];
      }
    });

  }

  addOtherMenu() {
    if (this.other.model === '0') {
      this.other.tax = this.counterSrv.tax_value(this.other.price);
    } else {
      this.other.tax = 0;
    }
    this.other_list.push(Util.copy(this.other));
    this.clearPrice();
  }

  removeOtherMenu(index) {
    this.other_list.splice(index, 1);
  }

  onPrice(event: String) {

    const temp = Number(this.other.price.toString() + event);
    if (!isNaN(temp)) {
      this.other.price = temp;
    }
  }

  clearPrice() {
    this.other = {
      model: '0',
      menu_id: -1,
      menu_no: -1,
      count: 0,
      price: 0,
      tax: 0
    }
  }

  backspacePrice() {
    let val = this.other.price.toString();
    if (val.length > 0) {
      val = val.substr(0, val.length - 1);
      this.other.price = Number(val);
    }
  }


  // ########################### 席関連 ########################


  refreshTask() {

    this.clearSeat();
    this.getSeatList();

    this.staffSrv.showFooter(true);
    this.staffSrv.getMenuData(true);
    this.doing = false;


  }

  startSeat(item=null) {
    let seatid = this.selectedSeat.id;
    console.info(item);
    if ( !Util.isEmpty(item) && !Util.isEmpty(item['id']) ) {
      seatid = item['id'];
    }
    this.jsonSrv.post('restaurant/seat_status', { id: seatid }).subscribe((response?: JsonResult) => {
      if (!Util.isEmpty(response.message)) {
        this.cmp.pop(response['message']);
      }

      if (!Util.isEmpty(response) && response.result) {
        this.selectedSeatStatus = true;
        this.selectSeat(this.selectedSeat);
      }
    });
  }

  changeSeat() {
    const dialog = this.dialog.open(StaffChangeSeatComponent, {
      width: '400px',
      height: '240px',
      data: {
        'seatList': this.seatList,
        'selectedSeat': this.selectedSeat
      }
    });
    dialog.afterClosed().subscribe(result => {
      this.onSelectSeat({value: result});
      this.hideBtnList();
    });
  }

  getSeatList() {
    const condition = {
        seat_group: [],
        seat_type: [],
        seat_smoke_type: [],
        seat_number: [],
        seat_usable: '0',
        takeout_type: 0
      };
    this.jsonSrv.post('restaurant/seat_list/', condition ).subscribe((response?: any) => {
      if (!Util.isEmpty(response['data']) && response['data'][0]) {
          this.seatList = response['data'];
        // this.seatList = response;
        if ( this.selectedSeat && this.selectedSeat.id == 0 ) {
          this.selectSeat(this.seatList[0]);
        }
      }

    });
  }

  onSelectSeat(event) {
    for ( var i in this.seatList ) {
      if (this.seatList[i]['id']==event.value) {
        this.selectSeat(this.seatList[i]);
        break;
      }
    }
    this.seatmap = false;
    this.staffmenu = true;
  }
  selectSeat(seat: SeatListData) {
    this.clearSeat();
    this.selectedSeat = seat;

    this.tabIndex = 0;
    //console.log(seat)
    // this.cmp.loading('切り替え中。。。');

    this.staffSrv.showFooter(false);
    this.doing = true;
    this.getFreeStatus();
    if (this.tabIndex === 3) {
      // this.pay();
    }

    // テーブル利用状況取得
    this.jsonSrv.get('master/seatstatus/', { seat: seat.id }).subscribe((response?: Array<SeatStatus>) => {

      this.cmp.unloading();
      if (response && response[0]) {
        this.menuSrv.security_key = response[0].security_key;

        // 食べ放題取得　＝＞　取得後 noMenusを再設定
        // this.getMenuFreeData();
        this.selectedSeatStatus = true;
        this.canOrder = true;
        this.clickCategory(this.staffSrv.menuMasterGroup[0]);
      } else {
        this.cmp.unloading();
        this.cmp.pop('該当テーブルは利用開始してないため、選択できません！', 1500);
        // this.refreshTask();
        this.menuSrv.security_key = '';
        this.selectedSeatStatus = false;
        this.canOrder = false;
      }
    });
  }


  getMenuFreeData() {
    this.jsonSrv.get('restaurant/menu/menufree_menus/', { seat_id: this.selectSeat['id'] })
      .subscribe((response: Array<number>) => {

        if (response && !Util.isEmptyArray(response)) {
          this.staffSrv.setMenuFreeData(response);
        } else {
          this.staffSrv.setMenuFreeData([]);
        }

      });
  }

  // ########################### key Input ########################
  onInput(event: String) {
    if (this.input_no.toString().length > 3)
      return;

    const temp = Number(this.input_no.toString() + event);
    if (!isNaN(temp)) {
      this.input_no = temp;
    }
    this.searchMenu();
  }

  clearInput() {
    this.input_no = 0;
    this.input_count = 0;
    this.input_menu = new StaffMenu();
    // this.input_name = '';
    // this.input_price = 0;
  }

  backspaceInput() {
    let val = this.input_no.toString();
    if (val.length > 0) {
      val = val.substr(0, val.length - 1);
      this.input_no = Number(val);
    }
    this.searchMenu();
  }

  // ########################### 番号で注文 ########################
  searchMenu() {

    const menu: StaffMenu = this.staffSrv.noMenus[this.input_no];

    if (Util.isEmpty(menu)) {
      this.input_count = 0;
      this.input_menu = new StaffMenu();
      // this.input_name = '';
      // this.input_price = 0;
      return;
    }

    this.input_count = 0;
    this.input_menu = menu;
    // this.input_name = menu.name;
    // this.input_price = menu.price;

  }

  append() {
    const menu = this.staffSrv.noMenus[this.input_no];
    menu.count += this.input_count;
    this.staffSrv.noMenus[this.input_no] = menu;
    this.clearInput();
  }

  // ########################### リスト選択で注文 ########################
  //　大分類
  clickCategory(group: MasterGroup) {
    if ( Util.isEmpty(group) ) { return ; }
    // console.log(group);
    this.select_group = group;
    this.select_master = group.master_data[0];
    this.show_master[this.select_master.id] = 1;
    this.select_menus = this.staffSrv.categoryMenus[this.select_master.id];
  }

  //　分類
  clickMaster(master: Master) {
    if ( this.showCategory(master) ) {
      this.show_master[master.id] = 0;
    } else {
      this.show_master[master.id] = 1;
      this.select_master = master;
      this.select_menus = this.staffSrv.categoryMenus[master.id];
      //console.log(this.select_menus);
    }
  }
  showCategory(master: Master) {
    if ( this.show_master[master.id] ) {
      return true;
    } else {
      return false;
    }
  }



  // ########################### 　食べ飲み放題画面開く ########################
  //　食べ飲み放題画面開く
  openMenufree(event) {
    const dialogMenuFree = this.dialog.open(MenufreeComponent, {
      width: '95%',
      height: '60%',
      data: { seatId: this.selectSeat['id'] }
    });
    dialogMenuFree.afterClosed().subscribe(result => {
      // console.log(result);
    });
  }

  // ########################### 注文処理 ########################

  order() {
    if(!this.menuSrv.security_key) {
      this.cmp.pop('該当テーブルは利用開始してください。', 2000);
    }
    const orders: Array<OrderEvent> = this.staffSrv.getOrderEventArray();
    this.menuSrv.sendOrder(orders);
    this.staffSrv.clearOrderEventArray();
  }

  order_bar(data) {
    if(!this.menuSrv.security_key) {
      this.cmp.pop('該当テーブルは利用開始してください。', 2000);
    }
    const orders: Array<OrderEvent> = this.staffSrv.getOrderEventArray();
    if(orders.length == 0){
      return;
    }
    this.menuSrv.sendOrderBar(orders);
    this.staffSrv.clearOrderEventArray();
    const keys = Object.keys(data)
      keys.forEach((no) => {
        data[no].count = 0
    })
  }

  pay() {
    this.countTotal();
  }

  onPay(event) {
    let params = {}
    params['counter_id'] = this.counterId;
    params['money'] = event;
    params['is_pay'] = false;
    params['is_split'] = false;
    params['is_average'] = false;
    params['is_input'] = false;

    // 完了判定
    params['is_over'] = true;

    // //一回目であるか判定
    // let first = (Util.isEmpty(this.counterId) || this.counterId < 0);

    params['is_pay'] = true;
    params['select_ids'] = [this.selectedSeat.id];
    params['orders_detail'] = this.orders_detail;
    params['number'] = 0;

    this.counterSrv.counter(params);

  }

  addCart(menu, showView=false) {
    if( this.menuUtil.isShowView(menu) || showView ) {
      if (menu.id) {
        const dialog = this.openMenuView(menu);
        dialog.afterClosed().subscribe(result => {
            if ( !Util.isEmpty(result) ) {
            const menu_display_name = [];
            const newMenu = Util.copy(result['menu']);
            for (const i in newMenu.menu_options) {
              if ( !Util.isEmpty(newMenu.menu_options[i]['select_name']) ) {
                menu_display_name.push(newMenu.menu_options[i]['select_name']);
              }
            }
            newMenu.count = result['count'];
            if ( menu_display_name.length>0 ) {
                newMenu.name = newMenu.name + '-' + menu_display_name.join('-');
                const index = this.staffSrv.carts.findIndex((data) => {
                  return (data.id === newMenu.id && data.name === newMenu.name);
                });
                menu.count = menu.count + newMenu.count;
                if (index < 0) {
                  this.staffSrv.carts.unshift(newMenu);
                } else {
                  this.staffSrv.carts[index].count = this.staffSrv.carts[index].count + newMenu.count;
                }
            } else {
              const index = this.staffSrv.carts.findIndex((data) => {
                return (data.id === menu.id);
              });
              menu.count += result['count'];
              if (index < 0) {
                this.staffSrv.carts.unshift(menu);
              }
            }
          }
        });
      }
    } else {
      menu.count = menu.count + 1;
      if ( !this.is_staff) {
        if (menu.count<menu.mincount) {
          menu.count = menu.mincount;
        }
      }
      const index = this.staffSrv.carts.findIndex((data) => {
        return (data.id === menu.id);
      });
      if (index < 0) {
        this.staffSrv.carts.unshift(menu);
      }
    }
  }

  openMenuView(menu) {
    return this.dialog.open(StaffMenuViewComponent, {
      width: '550px',
      data: {
        menu: menu,
        enableOrder: true
      }
    });
  }
  removeCart(menu) {
    let isok = false;
    // tslint:disable-next-line: forin
    for ( const i in this.staffSrv.categoryMenus ) {
      if ( isok ) {
        break;
      }
      this.staffSrv.categoryMenus[i].forEach((item)=> {
        if ( item.id == menu.id && !isok) {
          item.count -= menu.count;
          isok = true;
        }
      });
    }
    menu.count = 0;
  }

  preClick(event) {
    if (this.tabIndex > 0) {
      this.tabIndex = this.tabIndex - 1;
    }
  }
  nextClick(event) {
    if( this.tabIndex < 3 ) {
      this.tabIndex = this.tabIndex  + 1;
    }
  }

  // 画面支払タイプなど、変更場合、再計算
  countTotal(price?: number) {

    // this.counterPanel.startPay(0, 0, []);
    // // 注文明細を取得
    // this.jsonSrv.post('restaurant/counter/orders_detail/', { 'seat_ids': [this.selectedSeat.id] }).subscribe((response?: Array<CounterDetailOrder>) => {

    //   if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {

    //     this.orders_detail = response;
    //     //　合計金額算出
    //     this.countDetails();
    //   }

    //   this.cmp.unloading();
    // });
  }
  countDetails() {
    // let count = 0;
    // let countTaxIn = 0;
    // let details = [];
    // let isOk = true;
    // this.orders_detail.forEach((element: CounterDetailOrder) => {
    //   if( (element.status_code !== -1) && (element.status_code !== 999) ) {
    //     isOk = false;
    //   }
    //   count += this.counterSrv.countPrice(element);
    //   countTaxIn += this.counterSrv.countPriceTaxIn(element);

    //   if (!this.counterSrv.isPriceFree(element)) {
    //     details.push(element);
    //   }
    // });
    // this.moneyTotal = count;

    // this.counterPanel.startPay(this.moneyTotal, 0, countTaxIn, details);

    // if(!isOk) {
    //   this.cmp.confirm2('有未完成的菜品');
    //   return false;
    // }
  }


  seatSet() {
    const dialog = this.dialog.open(SeatOrderComponent, {
      ariaDescribedBy: '_SeatOrderComponent_',
      // disableClose: false,
      width: '500px',
      // height: '60%',
      data: { value: this.selectedSeat }
    });
    dialog.afterClosed().subscribe(result => {
      // this.getListData();
    });
  }

  getFreeStatus() {
    this.jsonSrv.post('restaurant/seat/free_status/', {}).subscribe((response) => {
      if (!Util.isEmpty(response['data'])) {
        this.seatFreeStatus = {}
        // tslint:disable-next-line: forin
        for ( var i in response['data'] ) {
          let seat_id = response['data'][i]['seat_id']
          if ( Util.isEmpty(this.seatFreeStatus[seat_id]) ) {
            this.seatFreeStatus[seat_id] = []
            this.isFree = false;
          }
          if ( seat_id==this.selectedSeat.id ) {
            this.isFree = true;
          }
          this.seatFreeStatus[seat_id].push(response['data'][i])
        }
      }
    });
  }

  isFreeStart(item) {
    return this.isFree;
  }

  startFreeMenu(event, element?: SeatListData) {
    const dialog = this.dialog.open(SeatFreeMenuComponent, {
      ariaDescribedBy: '_SeatFreeMenuComponentt_',
      // disableClose: false,
      width: '500px',
      // height: '60%',
      data: { value: element }
    });
    dialog.afterClosed().subscribe(result => {
      this.hideBtnList();
      this.getFreeStatus();
    });
  }

  stopFreeMenu(event, element?: SeatListData) {
    const dialog = this.cmp.confirm('中止しますか？');
    dialog.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.jsonSrv.post('restaurant/seat/free_stop/', { seat_id: element.id }).subscribe((response?: JsonResult) => {
          if (!Util.isEmpty(response.message)) {
            this.cmp.pop(response['message'])
          }

          if (!Util.isEmpty(response) && response.result) {
            // 成功した場合、リフレッシュ
          }
          this.hideBtnList();
          this.getFreeStatus();
        });

      }
    });
  }

  showSeatMap() {
    this.showMenu('seatmap');
  }

  showStaffCounter () {
    this.showMenu('counter');
  }

  // show menu
  showMenu (event) {

    if (!this.enableCounter) {
      if (event=='counter') {
        if (this.staffmenu) {
          event = 'setting';
        } else {
          event = 'menu';
        }
      }
    }
    this.staffcounter = false;
    this.seatmap = false;
    this.staffmenu = false;
    this.staffsetting = false;

    if (event == 'menu') {
      this.staffmenu = true;
    } else if (event == 'setting') {
      this.staffsetting = true;
    } else if ( event == 'counter' ) {
      this.staffcounter = true;
    } else {
      this.seatmap = true;
    }
  }

  showBtnList() {
    this.show_btn_list = true;
  }

  hideBtnList() {
    this.show_btn_list = false;
  }

  showPrice(menu) {
    let add_price = 0;
    // tslint:disable-next-line: forin
    for ( const i in menu.menu_options ) {
      if ( !Util.isEmpty(menu.menu_options[i]['select_price']) ) {
        add_price = add_price + menu.menu_options[i]['select_price'];
      }
    }
    return this.appService.zekomi(this.counterSrv.checkTax(menu) + add_price, menu.tax_in);
  }

  saleOffClick(event, currentSaleOutMenu, stock_status_id) {
    event.stopPropagation();
    this.updateMenuSaleOut(currentSaleOutMenu,stock_status_id);
  }

  updateMenuSaleOut(currentSaleOutMenu, stock_status_id) {
    const param = {"id":currentSaleOutMenu.id, "stock_status_id":stock_status_id}
    this.jsonSrv.post('restaurant/menu/update_sale_out/', param).subscribe((response: JsonResult) => {
      if (!Util.isEmpty(response.message)) {
        this.cmp.pop(response['message'])
      } else {
        currentSaleOutMenu.stock_status = currentSaleOutMenu.stock_status==this.no_store ? 31 : 30
        this.cmp.pop("ステータスが失敗しました、確認してください！！！")
        return
      }
    });
  }


  language() {
    const dialog = this.dialog.open(MenuLanguageComponent, {
      width: '400px',
      height: '240px',
      data: {
      }
    });
    dialog.afterClosed().subscribe(result => {
    });
  }

}
