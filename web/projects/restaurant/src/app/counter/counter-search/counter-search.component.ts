import { Component, OnInit, Inject } from '@angular/core';
import { Util, JsonService, AuthenticationService } from 'ami';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { CmpService } from '../../cmp/cmp.service';
import {FormControl} from '@angular/forms';
import { AppService } from '../../app.service';
// the `default as` syntax.
import * as _moment from 'moment';
// tslint:disable-next-line:no-duplicate-imports
import { Moment} from 'moment';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { CounterService } from '../counter.service';

import { CounterDailyComponent } from '../counter-daily/counter-daily.component';

const moment =  _moment;


export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM',
  },
  display: {
    dateInput: 'YYYY/MM',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'restaurant-counter-search',
  templateUrl: './counter-search.component.html',
  styleUrls: ['./counter-search.component.css'],
  providers: [
    // `MomentDateAdapter` can be automatically provided by importing `MomentDateModule` in your
    // application's root module. We provide it at the component level here, due to limitations of
    // our example generation script.
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE]},

    {provide: MAT_DATE_FORMATS, useValue: MY_FORMATS},
  ],
})
export class CounterSearchComponent implements OnInit {

  days: any;
  month_amounts_actually = 0;
  constructor(
    private auth: AuthenticationService,
    private jsonSrv: JsonService,
    private cmp: CmpService,
    public appService: AppService,
    public dialogRef: MatDialogRef<CounterSearchComponent>,
    private dialog: MatDialog,
    public counterSrv: CounterService,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.appService.onlySeeTodayCounter() && this.auth.nickname !== "財 務") {
      this.date.reset({ value: moment(), disabled: true });
    } else {
      this.date.reset({ value: moment(), disabled: false });
    }
    this.getDetails();
  }
  getDetails() {
    let params = {};
    this.month_amounts_actually = 0;
    params['year'] = this.date.value.year();
    params['month'] = this.date.value.month() + 1;
    let details: any = []
    this.jsonSrv.post('restaurant/counter/sale_count/', params).subscribe((response) => {

      //console.log("☆", response)
      //console.log("☆☆☆☆☆☆",moment(moment()).format('YYYY-MM-DD HH:mm:ss'))

      if (!Util.isEmpty(response) && !Util.isEmpty(response["data"])) {
        let today = moment(moment()).format('YYYY-MM-DD')
        if (this.appService.onlySeeTodayCounter() && this.auth.nickname !== "財 務") {
          // only can see today counter
          this.days = response["data"]["days"].filter(e => {return e["day"]==today});
          details = response["data"]["details"].filter(f => {return f["day"]==today});
        } else {
          this.days = response["data"]["days"];
          details = response["data"]["details"];
        }
        const dict = {}
        const dictNumber = {}
        this.days.forEach(element => {
          element.number = 0;

          dict[element.day] = [];
          dictNumber[element.day] = 0;
        });
        details.forEach(element => {
          dict[element.day].push(element);
          dictNumber[element.day] +=  element["number"];
        });


        this.days.forEach(element => {
          element["details"] = dict[element.day]
          element.number += dictNumber[element.day];
          this.month_amounts_actually += element['amounts_actually'];
        });

        console.info(this.month_amounts_actually);
        //console.log(this.days);
      }

    });
  }

  date = new FormControl(moment());

  chosenYearHandler(normalizedYear) {
    const ctrlValue = this.date.value;
    // ctrlValue.year(normalizedYear.year());
    ctrlValue.year((new Date(normalizedYear)).getFullYear());
    this.date.setValue(ctrlValue);
  }

  chosenMonthHandler(normalizedMonth, datepicker) {
    const ctrlValue = this.date.value;
    // ctrlValue.month(normalizedMonth.month());
    ctrlValue.month((new Date(normalizedMonth)).getMonth());
    this.date.setValue(ctrlValue);
    datepicker.close();
    this.getDetails();
  }
  printAccountingDay(day) {
    const date = new Date(day['day']);
    let data = {
      'shopInfo': this.counterSrv.getShopInfo(),
      'time': day['day'],
      'amounts_actually': day['amounts_actually'],
      'accounting':  day['pays'],
      'day': day,
      'date': date.getFullYear() + '年' + (date.getMonth() + 1) + '月' + (date.getDate()) + '日'
    };
    this.counterSrv.accounting_day_print(data);
  }

  printAccountingMonth() {
    const data = {
      'shopInfo': this.counterSrv.getShopInfo(),
      'date': this.date.value.year() + '年' + (this.date.value.month() + 1) + '月',
      'data': this.days
    };
    this.counterSrv.accounting_month_print(data);
  }

  daily() {
    const dialog = this.dialog.open(CounterDailyComponent, {
      width: '100%',
      height: '100%',
      maxHeight: '100%',
      maxWidth: '100%',
    });
    dialog.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  showCounterReport() {
    return this.appService.canCounterReport();
  }
}
