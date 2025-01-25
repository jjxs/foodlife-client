import { Component, OnInit, Inject, Input, OnDestroy } from '@angular/core';
import { OrderHistoryComponent } from '../../order/order-history/order-history.component';
import { OrderDetail, Order } from '../../order/order.interface';

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'restaurant-guest-order-history',
  templateUrl: './guest-order-history.component.html',
  styleUrls: ['./guest-order-history.component.css']
})
export class GuestOrderHistoryComponent extends OrderHistoryComponent implements OnInit, OnDestroy {
  myInnerHeight;
  
  ngOnInit() {
    this.orders = {};
    this.menu_list = {};
    this.countPrice = 0;
    this.getOrderData();
    this.myInnerHeight = window.innerHeight;
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
}
