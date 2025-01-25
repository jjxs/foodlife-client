import { Component, OnInit, Input } from '@angular/core';
import { OrderDetail, Order } from '../order.interface';
import { Util, JsonService, JsonResult, AuthenticationService } from 'ami';
import { SeatService } from '../../seats/seat.service';
import { CmpService } from '../../cmp/cmp.service';
import { MenuService } from '../../menu/menu.service';

@Component({
  selector: 'restaurant-order-card-menufree',
  templateUrl: './order-card-menufree.component.html',
  styleUrls: ['./order-card-menufree.component.css']
})
export class OrderCardMenufreeComponent implements OnInit {

  @Input() order: Order;

  isMenufree: boolean = false;

  constructor(
    private jsonSrv: JsonService,
    public authSrv: AuthenticationService,
    public menuSrv: MenuService,
    private cmp: CmpService
  ) { }

  ngOnInit() {
    // console.log("OrderCardMenufreeComponent.ngOnInit", this.order)
  }


  /*　
      ■ 操作説明: 
      客のメニューで、注文後ステータス＝＞【0:確認待ち】【100:受付】の注文は取消可能だが、
      如何しても取消欲しい場合,確認の上ここで取消できるようにする
    */
  cancel(event, detail: OrderDetail) {

  }

  confirm(event, detail: OrderDetail) {
    const params = {
      detail_free_id: detail.detail_free_id
    }
    const newLocal = this.jsonSrv.post('restaurant/order/confirm/', params).subscribe((response: JsonResult) => {
      if (response && response["message"]) {
        this.cmp.pop(response["message"]);
      }
      if (!Util.isEmpty(response) && response.result === true && !Util.isEmpty(response.data)) {
        // console.log("after confirm", response)
        this.order.details = [];
        this.order.details.push(response.data[0]);
        this.order.menu_free_usable = true
      }
    });
  }
}
