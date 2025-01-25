import { Component, OnInit } from '@angular/core';
import { Menufree } from '../menu/menu.interface';
import { Order, OrderDetail, OrderSeatInfo } from './order.interface';
import { SeatStatus } from '../seats/seat.interface';
import { CmpService } from '../cmp/cmp.service';
import { SeatService } from '../seats/seat.service';
import { environment } from '../../environments/environment';
import { JsonService, Util, JsonResult } from 'ami';
import { ThemeService } from '../cmp/ami-theme-select/theme.service';
import { HomeService } from '../home/home.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {

  /* {
    seatID: OrderSeatInfo
  }
  */
  seats = [];
  public connecting: WebSocket;
  constructor(
    private jsonSrv: JsonService,
    private homeSvr: HomeService,
    private seatSrv: SeatService,
    private themeSvr: ThemeService,
    private cmp: CmpService,
    private router: Router,
  ) { }

  ngOnInit() {

    this.jsonSrv.post('s/setsubi_api/get_mac_data', {}).subscribe((response: JsonResult) => {
      if (response['data'] == '1') {
      } else {
        this.router.navigateByUrl('/store/setsubi-error');
        return;
      }
    });

    this.homeSvr.showHeader(true);
    this.themeSvr.change('indigo-pink');
    this.jsonSrv.get('master/seatstatus/', {}).subscribe((list: Array<SeatStatus>) => {
      if (list && list[0]) {
        //console.log(list)
        this.seats = list;
      }
    });
    // this.startWebsocket();

  }

  displayTitle(seat: SeatStatus) {
    return 'No.' + seat.seat_no + ' ' + seat.seat_name
  }


  ///
  getSeatData() {
    this.jsonSrv.get('master/seatstatus/', {}).subscribe((list: Array<SeatStatus>) => {
      if (list && list[0]) {
        // console.log('### OrderComponent.getSeatData', list);
        this.getOrderData(list);
      }
    });
  }

  /**
    * テーブル利用状況取得、利用中のみ
    * @param seats
    */
  getOrderData(seats: Array<SeatStatus>) {


    this.jsonSrv.get('restaurant/order_list/get_order/', {}).subscribe((list: Array<Order>) => {
      if (list && list[0]) {
        // console.log('### OrderComponent.getOrderData', list);
        this.getOrderDetailData(seats, list);
      }
    });
  }


  /**
    * 放題注文が取得
    * @param seats
    * @param orders
    */
  getOrderDetailData(seats: Array<SeatStatus>, orders: Array<Order>) {

    this.jsonSrv.get('restaurant/order_list/get_order_detail/', {}).subscribe((list: Array<OrderDetail>) => {
      if (list && list[0]) {
        // console.log('### OrderComponent.getOrderDetailData', list);
        this.createDate(seats, orders, list);
      }
    });
  }

  /**
    * データを整理する
    * @param seats
    * @param orders
    * @param frees
    */
  createDate(seatStatus: Array<SeatStatus>, orders: Array<Order>, details: Array<OrderDetail>) {

    this.seats = [];
    seatStatus.forEach( (seatStatus) => {
      this.seats[seatStatus.seat] = new OrderSeatInfo(seatStatus);
    });

    orders.forEach((order: Order) => {
      order.details = [];

      this.seats[order.seat_id].orders[order.id] = order;
      if (!Util.isEmpty(order.menu_free_usable)) {
        if (order.menu_free_usable === false) {
          this.seats[order.seat_id].hasWaitData = true;
        }
      }
    });

    details.forEach((detail: OrderDetail) => {
      const order = this.seats[detail.seat_id].orders[detail.order_id];
      order.details.push(detail);
    });

    // console.log(this.seats);


  }


}
