import { Component, OnInit, Inject } from '@angular/core';
import { AuthenticationService, JsonService, Util, JsonResult } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CmpService } from '../../cmp/cmp.service';
import { Subject, forkJoin } from "rxjs"

@Component({
  selector: 'restaurant-seat-order',
  templateUrl: './seat-order.component.html',
  styleUrls: ['./seat-order.component.css']
})
export class SeatOrderComponent implements OnInit {

  order_number = 0;
  guest_number = 0;
  current_orders = 0;
  menu_id = -1;
  key = "";
  utype = "1";
  utypes = [
    { id: "1" , name: '初回' },
    { id: "2" , name: 'リピート' },
    { id: "3" , name: '常連' },
    { id: "4" , name: '不明' },
  ];

  constructor(
    private authSvr: AuthenticationService,
    private jsonSvr: JsonService,
    private cmp: CmpService,
    public dialogRef: MatDialogRef<SeatOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    //console.log(this.data);
    this.jsonSvr.get("restaurant/seat/get_seat_info/", { seat_id: this.data.value.id }).subscribe((response: JsonResult) => {
      //console.log(response)
      if (!Util.isEmpty(response) && response.result) {
        this.current_orders = response.data.current_orders;
        this.guest_number = response.data.current_number;
        this.menu_id = response.data.menu_id;
        this.key = response.data.key;
        this.utype = response.data["utype"];
      }
    });
  }

  clear() { }

  close() {

  }

  ok() {

    const number_params = {
      seat_id: this.data.value.id,
      number: this.guest_number,
      utype: this.utype,
      key: this.key
    };
    let update_number = this.jsonSvr.post("restaurant/seat/update_number/", number_params);

    const orders = []
    orders.push({
      count: this.order_number,
      menu: {
        id: this.menu_id,
        menu_options: {}
      },
      free: false
    });

    const order_params = {
      'orders': orders,
      'key': this.key
    }
    let updata_order = this.jsonSvr.post("restaurant/order/order/", order_params);

    let json_list = [update_number];
    if (this.order_number > 0) {
      json_list.push(updata_order);
    }

    forkJoin(json_list)
      .subscribe((results: Array<any>) => {
        const result_number: JsonResult = results[0];
        let result_order: JsonResult = null;
        if (results.length <= 1) {
          result_order = {
            result: true,
            message: null,
            data: null
          }
        } else {
          result_order = results[1];
        }


        let message = "";
        if (!Util.isEmpty(result_number.message)) {
          message += result_number["message"] + "　　"
        }

        if (!Util.isEmpty(result_order.message)) {
          message += result_order["message"] + "　　"
        }

        if (!Util.isEmpty(message)) {
          this.cmp.pop(message, 2000)
        }

        if (result_number.result && result_order.result) {
          this.dialogRef.close();
        }

      });
  }

}
