import { Component, OnInit, Input, SimpleChange, SimpleChanges } from '@angular/core';
import { OrderDetail, Order } from '../order.interface';
import { Util, JsonService, JsonResult, AuthenticationService } from 'ami';
import { SeatService } from '../../seats/seat.service';
import { CmpService } from '../../cmp/cmp.service';
import { MenuService } from '../../menu/menu.service';
import { CounterService } from '../../counter/counter.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'restaurant-order-card',
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.css']
})
export class OrderCardComponent implements OnInit {

  @Input() public order: Order;

  @Input() public isGuest;

  @Input() public parent;

  constructor(
    private jsonSrv: JsonService,
    public authSrv: AuthenticationService,
    public counterSrv: CounterService,
    public appService: AppService,
    public menuSrv: MenuService,
    private cmp: CmpService
  ) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes)
    // if (changes['order']) {
    //   const order: Order = changes['order'].currentValue;
    //   order.over = true;

    // }

    // for (let propName in changes) {
    //   console.log(propName);
    //   let changedProp = changes[propName];
    //   console.log(changedProp.currentValue);

    // }
  }

  isOver(order: Order) {
    // order.over = true;
    // order.details.forEach((detail: OrderDetail) => {
    //   // 該当注文のすべてのメニューが完了することを判断
    //   if (detail.status_code !== 999 && detail.status_code !== -1) {
    //     // 出来上がりと取消以外はすべて未完了として判定
    //     order.over = false;
    //   }

    //   if (!order.over && order.order_time) {
    //     // 完了していない注文は、待ち時間算出
    //     const now = new Date();
    //     if (!(order.order_time instanceof Date)) {
    //       order.order_time = new Date(order.order_time);
    //     }
    //     const diff: any = now.getTime() - order.order_time.getTime();
    //     order.wait_minutes = Math.floor(diff / 1000 / 60)
    //   }

    // });
    // return order.over;
  }

  countDetail(detail: OrderDetail) {
    if (detail.status_code === -1) {
      return 0;
    }
    if (detail.menu_tax_in) {
      return detail.price * detail.count;
    } else {

      return this.counterSrv.tax(detail.price * detail.count);
    }
  }
  /*　
      ■ 操作説明: 
      客のメニューで、注文後ステータス＝＞【0:確認待ち】【100:受付】の注文は取消可能だが、
      如何しても取消欲しい場合,確認の上ここで取消できるようにする
    */
  cancel(event, detail: OrderDetail) {
    this.send(detail, -1);
  }
  ok(event, detail: OrderDetail) {
    this.send(detail, 999);
  }
  delete(event, detail: OrderDetail) {
    this.parent.onDelete(detail, this.order);
  }

  // サーバ側送信、かつ更新
  send(detail: OrderDetail, code) {
    this.parent.gotoNext(detail, code, this.order);
  }
  reOrder(event, detail: OrderDetail) {
    this.parent.reOrder(event, detail.menu_id);
  }

}
