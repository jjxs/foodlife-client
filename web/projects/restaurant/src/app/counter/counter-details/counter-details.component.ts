import { AuthenticationService } from 'ami';
import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { JsonService, Util } from 'ami';
import { Counter, CounterDetail, CounterSeat, CounterDetailOrder } from '../counter.interface';
import { CmpService } from '../../cmp/cmp.service';
import { CounterDetailsConfirmComponent } from '../counter-details-confirm/counter-details-confirm.component';
import { CounterService } from '../counter.service';

// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';

const moment =  _moment;
import {FormControl} from '@angular/forms';
import { AppService } from '../../app.service';
import _ from 'lodash';

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM/DD',
  },
  display: {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'restaurant-counter-details',
  templateUrl: './counter-details.component.html',
  styleUrls: ['./counter-details.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class CounterDetailsComponent implements OnInit {

  onlyToday = true;
  counters: Array<Counter> = [];
  current_counter = {};
  current_detail = {};

  date = new FormControl('');
  constructor(
    private auth: AuthenticationService,
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    private cmp: CmpService,
    private dialog: MatDialog,
    public appService: AppService,
    public dialogRef: MatDialogRef<CounterDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    console.log(this.auth.UserName)
    if (this.appService.onlySeeTodayCounter() && this.auth.nickname !== "財 務") {
      this.date.reset({ value: moment(), disabled: true });
    } else {
      this.date.reset({ value: moment(), disabled: false });
    }
    this.getDetails(new Date());
  }

  getDetails(d) {
    // console.log("######################### ", checked)
    let params = {};
    if (!Util.isEmpty(this.data.counter_id)) {
      params['counter_id'] = this.data.counter_id;
    } else {
      params['year'] = d.getFullYear();
      params['month'] = d.getMonth() +1;
      params['day'] = d.getDate();
    }
    // 注文明細を取得
    this.jsonSrv.post('restaurant/counter/counter_detail/', params).subscribe((response?) => {

      //console.log(response);

      if (response && !Util.isEmpty(response["data"])) {
        const data = Util.formatDateObject(response["data"]);
        this.createCounterData(data);
        if (this.data.counter_id && this.data.detail_id) {
          const counter = this.counters.find((item) => { return item.id === this.data.counter_id });
          const detail = counter.details.find((item) => { return item.id = this.data.detail_id });
          //console.log(counter, detail);
          //this.printDetail(counter, detail);
        }

      }

    });
  }

  createCounterData(data: any) {
    const counters: Array<Counter> = data['counters'];
    const counter_details: Array<CounterDetail> = data['counter_details'];
    const counter_seats: Array<CounterSeat> = data['counter_seats'];

    const array = {}
    counters.forEach((element: Counter) => {
      element.details = [];
      element.seats = [];

      array[element.id] = element;
    });
    counter_details.forEach((element: CounterDetail) => {
      const counter: Counter = array[element.counter_id];
      counter.details.push(element);
    });
    counter_seats.forEach((element: CounterSeat) => {
      const counter: Counter = array[element.counter_id];
      counter.seats.push(element);
    });
    this.counters = counters;
    //console.log(this.counters);
  }

  payname(counter: Counter) {
    if (counter.is_pay)
      return "支払"

    if (counter.is_split)
      return "分割"

    if (counter.is_average)
      return "平均"

    if (counter.is_input)
      return "手動"
  }

  // totalprice(counter: Counter) {
  //   let price = 0;
  //   counter.details.forEach((element: CounterDetail) => {
  //     price += element.price
  //   });
  //   return price;
  // }


  printDetail(counter, detail) {

    // console.log(counter)
    // console.log(detail)
    // //this.cmp.loading()
    // // 注文明細を取得
    // const params = {
    //   "counter_id": counter.id,
    //   "detail_id": detail.id
    // };
    // this.jsonSrv.post('restaurant/counter/print_details/', params).subscribe((response) => {

    //   // console.log("☆", response)

    //   //this.cmp.unloading();

    //   if (!Util.isEmpty(response) && !Util.isEmptyArray(response["details"])) {

    //     const frame = window.document.getElementById("iframe_details");
    //     frame["contentWindow"].printdetails(response)

    //   }

    // });
    this.cmp.loading()
    // 注文明細を取得
    // tslint:disable-next-line: max-line-length
    const params = {
      'counter_id': counter.id
    };
    if ( counter.is_split ) {
      params['counter_detail_id'] = detail.id;
    }
    this.jsonSrv.post('restaurant/counter/get_detail/', params).subscribe((response?: Array<CounterDetailOrder>) => {


      this.cmp.unloading();

      if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          let me = this
          const dialog = this.dialog.open(CounterDetailsConfirmComponent, {
            width: '90%',
            height: '70%',
            data: {
              details: response,
              money: detail,
              pay_method: detail.display_name
            }
          });
      }

    });


  }

  printCounter(counter, detail) {
    console.info(counter, detail);
    const shopInfo = _.cloneDeep(this.counterSrv.getShopInfo())
    detail['shopInfo'] = shopInfo;

    detail['shopInfo'].tel = detail['shopInfo'].no ? detail['shopInfo'].tel + '　' + detail['shopInfo'].no : detail['shopInfo'].tel
    detail['eatin_tax'] = detail.eatin? this.counterSrv.tax_value(detail.eatin, this.appService.Fax) : 0
    detail['takeout_tax'] = detail.takeout? this.counterSrv.tax_value(detail.takeout, this.appService.TakeoutFax) : 0

    if( !this.counterSrv.counter_print(detail) ) {
      const frame = window.document.getElementById("iframe_receipt");
      frame["contentWindow"].printdetails(counter, detail)
    }
  }

  closeEmpty() {
    this.dialogRef.close({});
  }

  delete(action, counter, detail?) {
    this.cmp.confirm("削除しますか？").afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.close(action,  counter, detail);
      }
    });
  }

  close(action, counter, detail)  {
    this.dialogRef.close({
      action: action,
      counter: counter,
      detail: detail
    });
  }

  alert_message = '';

  // 支払編集可否の判定
  checkEdit(counter: Counter) {

    this.alert_message = '';

    // 分割、平均の場合、判定必要がありません。
    if (counter.is_average) {
      return true;
    } else if (counter.is_split && counter.is_completed) {
      return false;
    }

    // 手動の場合、残額あるがを判定必要ある
    if (counter.is_input && counter.is_completed) {
      // 支払い済みのため、1件取消してから編集が可能
      this.alert_message = '支払い済みのため、1件取消してから編集';
      return false;
    }

    // キャンセル以外の明細存在する場合、編集不可（取消してから）
    if (counter.is_pay && counter.details.findIndex((detail: CounterDetail) => { return !detail.canceled }) >= 0) {
      // 取消してから編集が可能
      this.alert_message = '取消してから編集する';
      return false;
    }

    return true;
  }

  checkAllCancel(counter: Counter) {

    return !counter.is_pay && counter.details.findIndex((detail: CounterDetail) => { return !detail.canceled }) >= 0
  }

  change(event) {
    let d = new Date(event.value);
    this.getDetails(d);
  }
}
