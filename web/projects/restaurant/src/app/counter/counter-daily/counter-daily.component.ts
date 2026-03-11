import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { AuthenticationService, JsonService, Util } from 'ami';
import { Counter, CounterDetail, CounterSeat, CounterDetailOrder } from '../counter.interface';
import { CmpService } from '../../cmp/cmp.service';
import { CounterDetailsConfirmComponent } from '../counter-details-confirm/counter-details-confirm.component';
import { CounterService } from '../counter.service';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { AppService } from '../../app.service';

const moment =  _moment;

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
  selector: 'restaurant-counter-daily',
  templateUrl: './counter-daily.component.html',
  styleUrls: ['./counter-daily.component.css'],
  providers: [
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},
    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class CounterDailyComponent implements OnInit {
  // 編集フォーム
  editForm: FormGroup;

  orders = [];
  charges = [];
  counter_paylist = [];
  counter_amount = 0;
  supplie = [];

  constructor(
    private auth: AuthenticationService,
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    private cmp: CmpService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CounterDailyComponent>,
    public appService: AppService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.getReport();
  }

  ngOnInit() {
  }

  minDate(){
    const currentDate = new Date();
    let yesterday = new Date();
    if (this.appService.onlySeeTodayCounter() && this.auth.nickname !== "財 務"){
      yesterday.setDate(currentDate.getDate()-1)
    }else{
      yesterday.setDate(currentDate.getDate()-20000)
    }
    return yesterday;
  }

  getReport(date=null) {
    if (date===null) {
      date = new Date();
    }

    this.editForm = this.fb.group({
      m10000: [''],
      m5000: [''],
      m1000: [''],
      m500: [''],
      m100: [''],
      m50: [''],
      m10: [''],
      m5: [''],
      m1: [''],
      pay_amount: [''],
      pay_name: [''],
      charge_amount: [''],
      charge_date: [''],
      in_amount: [''],
      date: [date],
      tax: [''],
    });
    this.orders = [];
    this.charges = [];

    const params = {
      'date': (date.getFullYear() + '-' + ( '0' + (date.getMonth() + 1)  ).slice(-2) + '-' + ('0' + date.getDate()).slice(-2))
    };
    this.jsonSrv.post('restaurant/counter/get_cash_record/', params).subscribe((response) => {
      if ( !Util.isEmpty(response['data']) && Object.values(response['data']).length>0 ) {
        this.editForm.patchValue(response['data']);
        if ( !Util.isEmpty(response['data']['orders']) ) {
          this.orders = response['data']['orders'];
        }
        if ( !Util.isEmpty(response['data']['charges']) ) {
          this.charges = response['data']['charges'];
        }

        if ( !Util.isEmpty(response['data']['supplie']) ) {
          this.supplie = response['data']['supplie'];
        }
      }
      this.getCounterDetail(date);
    });
  }
  getAmount(m) {
    const formatter = new Intl.NumberFormat('ja-JP');
    return '￥' + formatter.format(this.amount(m));
  }

  amount(m) {
    let amount = 0;
    switch (m) {
      case 10000:
        amount = this.editForm.value.m10000 * 10000;
        break;
      case 5000:
        amount = this.editForm.value.m5000 * 5000;
        break;
      case 1000:
        amount = this.editForm.value.m1000 * 1000;
        break;
      case 500:
        amount = this.editForm.value.m500 * 500;
        break;
      case 100:
        amount = this.editForm.value.m100 * 100;
        break;
      case 50:
        amount = this.editForm.value.m50 * 50;
        break;
      case 10:
        amount = this.editForm.value.m10 * 10;
        break;
      case 5:
        amount = this.editForm.value.m5 * 5;
        break;
      case 1:
        amount = this.editForm.value.m1 * 1;
        break;
    }
    return amount;
  }
  getBoxTotalAmount() {
    let amount = 0;
    const arr = [1, 5, 10, 50, 100, 500, 1000, 5000, 10000];
    // tslint:disable-next-line: forin
    for ( const i in arr ) {
      amount += this.amount(arr[i]);
    }

    const formatter = new Intl.NumberFormat('ja-JP');
    return '￥' + formatter.format(amount);
  }

  getBalance() {
    let amount = 0;
    const arr = [1, 5, 10, 50, 100, 500, 1000, 5000, 10000];
    // tslint:disable-next-line: forin
    for ( const i in arr ) {
      amount += this.amount(arr[i]);
    }
    amount = amount - (this.getIn()  + this.getCharge() - this.getOut());

    const formatter = new Intl.NumberFormat('ja-JP');
    return (amount >= 0 ? '' : '-') + '￥' + (formatter.format(amount).replace('-', ''));
  }

  getCounterAmount() {
    const amount = this.getCounter();
    return this.format(amount);
  }

  // 売上
  getCounter() {
    return this.counter_amount;
  }

  // 初期　+　入金　+　現金売上
  getInAmount() {
    const amount = this.getIn();
    return this.format(amount);
  }
  getIn() {
    let amount = 0;
    if ( !Util.isEmpty(this.editForm.value.in_amount) ) {
      amount = this.editForm.value.in_amount;
    }
    // amount += this.getCounter();
    return amount;
  }

  // 入金合計
  getChargeAmount() {
    return this.format(this.getCharge());
  }

  getCharge() {
    let amount = 0;
    // tslint:disable-next-line: forin
    for ( const i in this.charges ) {
      amount += this.charges[i]['amount'];
    }
    return amount;
  }

  // 出金合計
  getOutAmount() {
    const amount = this.getOut();
    return this.format(amount);
  }

  getOut() {
    let amount = 0;
    // tslint:disable-next-line: forin
    for ( const i in this.orders ) {
      amount += this.orders[i]['amount'];
    }
    return amount;
  }

  // in - out
  getTotalAmount () {
    const amount = this.getIn() - this.getOut();
    return this.format(amount);
  }

  format(amount) {
    if (amount===null) {
      return '';
    }
    const formatter = new Intl.NumberFormat('ja-JP');
    return '￥' + formatter.format(amount);
  }

  close(over=0) {
    const params = this.editForm.value;
    params['date'] = this.editForm.controls.date.value
    const date = params['date'];
    if ( typeof date === "string") {
      params['date'] = date.substr(0, 10);
    } else {
      params['date'] = (date.getFullYear() + '-' + ( '0' + (date.getMonth() + 1)  ).slice(-2) + '-' + ('0' + date.getDate()).slice(-2))
    }
    params['orders'] = this.orders;
    params['charges'] = this.charges;
    if ( over ) {
      params['save'] = 1;
      const dialog = this.cmp.confirm('営業終了しますか？');
      dialog.afterClosed().subscribe(result => {
        if (result === 'yes') {
          this.stop_seat(params);
        }
      });
    } else {
      this.jsonSrv.post('restaurant/counter/cash_record/', params).subscribe((response) => {
        // this.dialogRef.close();
        if ( !Util.isEmpty(response)) {
          this.cmp.pop(response['message']);
        }
      });
    }
  }

  stop_seat(params) {
    this.jsonSrv.post('restaurant/seat/stopall/', {}).subscribe((response) => {
      if ( !Util.isEmpty(response)) {
        if ( response['result']==false ) {
          this.cmp.confirm2(response['message']);
        } else {
          this.jsonSrv.post('restaurant/counter/cash_record/', params).subscribe((response) => {
            this.dialogRef.close();
          });
        }
      }
    });
  }

  getCounterDetail(d) {
    const params = {};
    params['year'] = d.getFullYear();
    params['month'] = d.getMonth() +1;
    params['day'] = d.getDate();
    let counter_paylist = {
      '0': {
        'name': 'ランチ',
        'amount': 0,
      },
      '1': {
        'name': 'ディナー',
        'amount': 0,
      },
    };

    // 注文明細を取得
    this.jsonSrv.post('restaurant/counter/counter_detail/', params).subscribe((response?) => {
      let counter_amount = 0;
      if ( !Util.isEmpty(response) ) {
        if ( !Util.isEmpty(response['data']) ) {
          let del_map  = {};
          response['data']['counters'].forEach((item)=>{
            if ( item['delete']==true ) {
              del_map[item['id']] = 1;
            }
          });
          response['data']['counter_details'].forEach((item)=>{
            if ( Util.isEmpty(item['canceled']) && Util.isEmpty(del_map[item['counter_id']]) ) {
              counter_amount += item['amounts_actually'];

              if ( item['lunch']==1 ) {
                counter_paylist['0']['amount'] += item['amounts_actually'];
              } else {
                counter_paylist['1']['amount'] += item['amounts_actually'];
              }
              if ( Util.isEmpty(counter_paylist[item['pay_method_id']]) ) {
                // tslint:disable-next-line: no-unused-expression
                counter_paylist[item['pay_method_id']] = {
                  'name': item['display_name'],
                  'amount': item['amounts_actually']
                };
              } else {
                counter_paylist[item['pay_method_id']]['amount'] += item['amounts_actually'];
              }
            }
          });
        }
      }
      this.counter_paylist = Object.values(counter_paylist);
      if ( this.counter_paylist.length%2==1 ) {
        this.counter_paylist.push({
          'name': '', amount: null
        })
      }
      this.counter_amount = counter_amount;
    });
  }
  back () {
    this.dialogRef.close();
  }

  add() {
    if ( Util.isEmpty(this.editForm.value.pay_name) || Util.isEmpty(this.editForm.value.pay_amount) ) {
      return;
    }

    this.orders.push(
      {
        'name': this.editForm.value.pay_name,
        'amount': this.editForm.value.pay_amount,
        'tax': this.editForm.value.tax
      }
    );
    this.editForm.get('pay_name').setValue('');
    this.editForm.get('pay_amount').setValue('');
    this.editForm.get('tax').setValue('');
  }

  del(key, index) {
    const arr = [];
    let list = [];
    switch(key) {
      case 'charges':
        list = this.charges;break;
      case 'orders':
        list = this.orders; break;
    }
    for ( const i in list ) {
      if ( i == index ) {
        continue;
      } else {
        arr.push(list[i]);
      }
    }

    switch(key) {
      case 'charges':
        this.charges = arr;break;
      case 'orders':
        this.orders = arr; break;
    }
  }

  addCharge() {
    const charge_date = this.editForm.value.charge_date;
    if ( Util.isEmpty(charge_date) || Util.isEmpty(this.editForm.value.charge_amount) ) {
      return;
    }

    this.charges.push(
      {
        'name': (charge_date.getMonth() + 1) + '月' + charge_date.getDate() + '日',
        'amount': this.editForm.value.charge_amount,
        'date': charge_date
      }
    );
    this.editForm.get('charge_amount').setValue('');
  }

  changeChargeDate(event) {
    this.editForm.get('charge_date').setValue(new Date(event.value));
  }
  change(event) {
    let d = new Date(event.value);
      // this.getCounterDetail(d);
    this.getReport(d);
  }

  showInput(code, title) {
    const dialog = this.cmp.input("",  title);
    dialog.afterClosed().subscribe(result => {
      if( Util.isEmpty(result) ) {
        return;
      }
      if ( !Util.isEmpty(result['status']) && result['status'] === 'yes') {
        this.editForm.get(code).setValue(Number(result['data']));
      }
    });
  }
}
