import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, AuthenticationService } from 'ami';
import { MasterGroup, Menufree, Master, MenufreeOrderDetail } from '../menu.interface';
import { resolve } from 'q';
import { MenuService } from '../menu.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Util } from 'ami';
import { CmpService } from '../../cmp/cmp.service';
import { SeatService } from '../../seats/seat.service';

@Component({
  templateUrl: './menufree.component.html',
  styleUrls: ['./menufree.component.css']
})
export class MenufreeComponent implements OnInit {

  list = []

  constructor(
    public menuSrv: MenuService,
    private cmp: CmpService,
    private jsonSrv: JsonService,
    private authSrv: AuthenticationService,
    //public seatSrv: SeatService,
    public dialogRef: MatDialogRef<MenufreeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.getFreeType();

    this.menuSrv.afterMenufreeOrder$.subscribe((result: boolean) => {

      this.cmp.unloading(1000);
      if (result === true)
        this.getFreeType();
    });
  }

  getFreeType() {
    this.jsonSrv.get('master/master/', { name: 'free_type' }).subscribe((listGroup: Array<MasterGroup>) => {

      // free_type 放題種別取得（同じ種別内に1種類しか注文できない）
      if (listGroup && listGroup[0]) {
        this.getFreeDetail(listGroup[0])
      }
    });
  }

  getFreeDetail(free_type: MasterGroup) {
    this.list = [];
    // 放題明細
    this.jsonSrv.get('master/menufree/', {}).subscribe((listMenufree: Array<Menufree>) => {
      if (listMenufree && listMenufree[0]) {
        free_type.master_data["value"] = "";
        free_type.master_data.forEach((master: Master) => {
          let data = {
            id: master.id,
            name: master.name,
            list: []
          }
          listMenufree.forEach((menufree: Menufree) => {
            menufree["count"] = 0;
            menufree["count_over"] = 0;
            menufree["selected"] = false;
            if (menufree.free_type === master.id) {
              data.list.push(menufree);
            }
          });
          this.list.push(data);
        });
        this.getFreeMenuOrderDetail();
      }
    });
  }

  getFreeMenuOrderDetail() {
    // 既に注文したメニューを確認し、すでに注文がある場合、同種類のみ注文が可能になる処理
    this.jsonSrv.get('restaurant/menu/menufree_order_detail/', { seat_id: this.data.seatId })
      .subscribe((response: Array<MenufreeOrderDetail>) => {

        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          response.forEach((orderdetail: MenufreeOrderDetail) => {
            let index = this.list.findIndex((item, i) => {
              return item["id"] === orderdetail.free_type_id;
            });
            if (index >= 0) {
              const data = this.list[index];
              data["hasOrder"] = true;
              index = data.list.findIndex((item: Menufree, i) => {
                return item.menu === orderdetail.menu_id;
              });

              if (index >= 0) {
                data.list[index]["count_over"] += orderdetail.count;
              }
            }
          });
          return;
        }

        if (response instanceof Array) {
          //　データなし
        } else {
          this.cmp.pop("データ取得エラー", 5000);
        }
      });


  }


  //注文する場合
  order(event, data: Menufree) {
    // console.log("sendMenufreeOrder", data);
    this.cmp.loading("注文送信中。。。。")
    this.menuSrv.sendMenufreeOrder(data);

  }



  onClose(): void {
    this.dialogRef.close("no");
  }
}
