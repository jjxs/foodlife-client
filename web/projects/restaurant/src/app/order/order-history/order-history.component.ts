import { Component, OnInit, Inject, Input, OnDestroy } from '@angular/core';
import { Order, OrderDetail, OrderSeatInfo } from '../order.interface';
import { AuthenticationService, JsonService, Util, JsonResult } from 'ami';
import { MenuService } from '../../menu/menu.service';
import { Menu } from '../../menu/menu.interface';
import { CounterService } from '../../counter/counter.service';
import { MatDialog } from '@angular/material';
import { ITaskData, TaskData } from '../../kitchen/kitchen.interface';
import { CmpService } from '../../cmp/cmp.service';
import { MenuUtil } from '../../menu/menu.util';
import { AppService } from '../../app.service';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'restaurant-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {

  @Input() show: true;

  @Input() isGuest: false;

  @Input() title = '注文履歴';
  // { order.id : Order}
  orders = {};

  countPrice = 0;

  @Input() display_model = 'list';

  menu_list = {};
  orign_menus = [];

  @Input() seatId = -1;
  @Input() seat;
  @Input() refreashTime;
  afterOrder$;
  menuChanged$;

  constructor(
    private authSrv: AuthenticationService,
    public counterSrv: CounterService,
    private menuSrv: MenuService,
    private dialog: MatDialog,
    private cmp: CmpService,
    private appService: AppService,
    private menuUtil: MenuUtil,
    private jsonSrv: JsonService
  ) {
    this.afterOrder$ = this.menuSrv.afterOrder$.subscribe((ok: boolean) => {
      this.getOrderData();
    });

    this.orign_menus = this.menuSrv.getMenuList();

    this.menuChanged$ = this.menuSrv.menuChanged$.subscribe((menu: string) => {
      // tslint:disable-next-line: triple-equals
      if ( menu == 'history' || menu == 'accouting' ) {
        this.counterSrv.countPriceChanged(0);
        this.ngOnInit();
      }
    });

  }

  ngOnInit() {
    this.orders = {};
    this.menu_list = {};
    this.countPrice = 0;
    this.getOrderData();
  }

  ngOnDestroy() {
    this.afterOrder$.unsubscribe();
    this.menuChanged$.unsubscribe();
  }

  // tslint:disable-next-line: use-life-cycle-interface
  ngOnChanges(event) {
    if ( event['seatId'] ) {
      // tslint:disable-next-line: triple-equals
      if (event['seatId'].previousValue != undefined) {
        this.ngOnInit();
      }
    } else if (event['refreashTime']) {
      this.ngOnInit();
    }
  }

  /**
    * テーブル利用状況取得、利用中のみ
    * @param seatss
    */
  getOrderData() {
    this.jsonSrv.get('restaurant/order_list/get_order/', { 'seat_id': this.seatId }).subscribe((list: Array<Order>) => {
      if (list && list[0]) {
        //console.log('### OrderComponent.getOrderData', list);
        list.forEach((order) => {
          order.details = [];
          order.over = true;
          this.orders[order.id] = order;

        });

        //console.log('### this.orders', this.orders);
        this.getOrderDetailData();
      }
    });
  }


  /**
    * 放題注文が取得
    * @param seats
    * @param orders
    */
  getOrderDetailData() {
    this.menu_list = {};
    this.jsonSrv.get('restaurant/order_list/get_order_detail/', { 'seat_id': this.seatId }).subscribe((list: Array<OrderDetail>) => {
      if (list && list[0]) {
        let countPrice = 0;
        let countPriceTaxIn = 0;
        list.forEach((detail: OrderDetail) => {
          if (Util.isEmpty(this.menu_list[detail.menu_id])) {
            this.menu_list[detail.menu_id] = {
              name: detail.menu_name,
              no: detail.menu_no,
              price: detail.price,
              tax_in: detail.menu_tax_in,
              over: 0,
              wait: 0
            };
          }
          this.orders[detail.order_id].details.push(detail);

          if (detail.status_code !== -1) {
            if (detail.menu_tax_in) {
              countPriceTaxIn += detail.price * detail.count;
            } else {
              countPrice += detail.price * detail.count;
            }
          }

          if (detail.status_code !== 999 && detail.status_code !== -1) {
            // 出来上がりと取消以外はすべて未完了として判定
            this.orders[detail.order_id].over = false;

            this.menu_list[detail.menu_id]['wait'] += detail.count;
          }

          if (detail.status_code === 999) {
            this.menu_list[detail.menu_id]['over'] += detail.count;
          }

        });
        this.countPrice = countPriceTaxIn + this.counterSrv.tax(countPrice);
        this.counterSrv.countPriceChanged(this.countPrice);
      }
    });

  }

  reOrder(event, menu_id) {
    let menu: Menu;
    // let menu_id = this.menuData[id]['menu_id'];
    menu = this.orign_menus[menu_id];
    if (this.menuUtil.isCourse(menu) && menu.level !== 1) {
      this.menuUtil.showCourse(menu, true, true);
    } else {
      // this.menuSrv.sendOrderByMenuId(menu_id, 1);
      menu.course.map(item => {item["selected"] = true})
      event.stopPropagation();
      this.menuUtil.showView(menu, true, true);
    }
  }



  gotoNext(detail: OrderDetail, code, order: Order) {
    const task = this.getTask(detail, order);
    const params = {
      detail_id: detail.id,
      detail_status_id: detail.status_id,
      current_status_code: detail.status_code,
      next_status_code: code,
      menu_id: detail.menu_id,
      task: task
    };
    this.jsonSrv.post('restaurant/kitchen/goto_next/', params).subscribe((response: JsonResult) => {

      if (Util.isEmpty(response)) {
        return;
      }

      if (!Util.isEmpty(response.message)) {
        this.cmp.pop(response['message']);
      }
      this.ngOnInit();
    });
  }

  onDelete(detail: OrderDetail, order: Order) {
    const task = this.getTask(detail, order);
    this.jsonSrv.post('restaurant/kitchen/remove_task/', {
      detail_id: task.detail_id,
      order_id: task.order_id
    }).subscribe((response: JsonResult) => {

      if (Util.isEmpty(response)) {
        return;
      }

      if (!Util.isEmpty(response.message)) {
        this.cmp.pop(response['message']);
      }
      this.ngOnInit();
    });
  }

  getTask (detail: OrderDetail, order: Order): TaskData {
    let iTaskData: ITaskData;
    iTaskData = {
      order_id: detail.order_id,
      order_time: order.order_time,
      detail_id: detail.id,
      count: detail.count,
      menu_id: detail.menu_id,
      menu_no: detail.menu_no,
      menu_name: detail.menu_name,
      menu_note: detail.menu_name,
      menu_option: detail.menu_option,
      option: detail.option,
      seat_id: detail.seat_id,
      seat_no: this.seat.seat_no,
      seat_name: this.seat.name,
      detail_status_id: detail.status_id,
      status_code: detail.status_code,
      status_username: 'admin',
      menu_image: detail.menu_image,
      ship_addr: '',
      ship_name: '',
      ship_tel: '',
      ship_time: '',
      price: detail.price,
    };
    return new TaskData(iTaskData);
  }


}
