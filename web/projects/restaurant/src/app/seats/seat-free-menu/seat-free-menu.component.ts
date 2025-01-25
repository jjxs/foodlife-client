import { Component, OnInit, Inject } from '@angular/core';
import { AuthenticationService, JsonService, Util, JsonResult } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CmpService } from '../../cmp/cmp.service';
import { Subject, forkJoin } from "rxjs"
import { SeatStatus } from '../seat.interface';

@Component({
  selector: 'restaurant-seat-free-menu',
  templateUrl: './seat-free-menu.component.html',
  styleUrls: ['./seat-free-menu.component.css']
})
export class SeatFreeMenuComponent implements OnInit {

  menu_id = 0
  menuFreeData = []
  order_number = 0
  current_orders = 0
  security_key = ''

  constructor(
    private authSvr: AuthenticationService,
    private jsonSvr: JsonService,
    private cmp: CmpService,
    public dialogRef: MatDialogRef<SeatFreeMenuComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    //console.log(this.data);
    let params = {}
    this.jsonSvr.post('restaurant/menu/free/', params).subscribe((response: any) => {
      if (Util.isEmpty(response) || Util.isEmpty(response[0])) {
        return;
      }
      this.menuFreeData = response
    });
    this.getSeatStatus()
    this.getMenuFree()
  }
  getSeatStatus() {
    this.jsonSvr.get('master/seatstatus/', { seat: this.data.value.id }).subscribe((response?: Array<SeatStatus>) => {

      if (response && response[0]) {
        this.security_key = response[0].security_key;

        //食べ放題取得　＝＞　取得後 noMenusを再設定
        //this.getMenuFreeData();
      }
    })
  }

  // 放題情報取得　（
  getMenuFree() {
    this.jsonSvr.get('restaurant/menu/menufree_order_detail/', { seat_id: this.data.value.id })
      .subscribe((response: any) => {
      });
  }

  clear() { }

  close() {

  }

  ok() {
    let data = [];
    let menu = {};
    for(let i in this.menuFreeData) {
      if (this.menuFreeData[i]['menu_id']===this.menu_id) {
        menu = this.menuFreeData[i]['menu'];
        break;
      }
    }
    console.info(menu);
    data.push({
        count: this.order_number,
        free: 0,
        menu: menu
    });
    let params = {
        'orders': data,
        'key': this.security_key,
        'start_menu_free' : true
    }

    this.jsonSvr.post('restaurant/order/order/', params).subscribe((response?) => {

        if (response && response["message"]) {
            let dialog = this.cmp.confirm2(response["message"]);
            dialog.afterClosed().subscribe(result => {
              if (result === "yes") {
                this.dialogRef.close();
              }
            });
        }
    });
  }

}
