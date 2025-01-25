import { JsonService, Util, JsonResult } from 'ami';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { CounterDetailOrder } from './counter.interface';
import { CmpService } from '../cmp/cmp.service';
import { AppService } from '../app.service';
import { Menu } from '../menu/menu.interface';


@Injectable({
    providedIn: 'root'
})


export class CounterService {



    isConnecting: boolean = false;

    public connecting: WebSocket;

    // 会計完了
    private afterCounterSource = new Subject<any>();
    afterCounter$ = this.afterCounterSource.asObservable();

    // 合計金額
    private countPriceChangedSource = new Subject<number>();
    countPriceChanged$ = this.countPriceChangedSource.asObservable();


    constructor(
        private jsonSrv: JsonService,
        private app: AppService,
        private cmp: CmpService
        // private authSrv: AuthenticationService
    ) {
    }

    counter(params) {
        // this.cmp.loading();
        // 注文明細を取得
        this.jsonSrv.post('restaurant/counter/counter/', params).subscribe((response?: JsonResult) => {

            // console.log('this.afterCounterSource', response)
            if (!Util.isEmpty(response)) {
                this.afterCounterSource.next(response);
                // this.cmp.unloading();
            }
        })
    }


    isPriceFree(element: CounterDetailOrder) {
        if (element.is_delete) {
            return true;
        }

        if (!element.is_ready) {
            return true;
        }

        if (element.price === 0) {
            return true;
        }
        return false;
    }

    tax(total) {
        return Math.floor(total * (1 + this.app.Fax / 100));
    }
    getShopInfo() {
        return this.app.ShopInfo;
    }

    get_fax() {
        return this.app.Fax;
    }

    // 税抜きから税金算出
    tax_value(total, fax=0) {
        if (fax === 0) {
            fax = this.app.Fax;
        }
        return Math.floor(total * fax / 100);
    }

    // // 税込から税金算出
    // tax_in_value(total) {
    //     return total - Math.floor(total / (1 + this.app.Fax / 100))
    // }
    // ※誤差が大きいのため、サーバ側計算する

    checkTax(menu: Menu) {
        if (menu.tax_in) {
            // return this.tax(menu.price);
            return menu.price;
        }



        return menu.price;
    }

    countPriceTaxIn(element: CounterDetailOrder) {
        if (!element.tax_in) {
            return 0;
        }

        if (this.isPriceFree(element)) {
            return 0;
        }

        // return this.tax(element.price) * element.count;
        return element.price * element.count;

    }

    countPrice(element: CounterDetailOrder) {
        if (element.tax_in) {
            return 0;
        }

        if (this.isPriceFree(element)) {
            return 0;
        }

        return element.price * element.count;
    }

    sendMonitor(type, money) {
        this.jsonSrv.post('restaurant/counter/notice_monitor/',
            {
                'type': type,
                'faxprice': money.amounts_actually,
                'price': money.total,
                'pay': money.pay,
                'change': money.change,
            })
            .subscribe((response?) => { });
    }

    countPriceChanged(countPrice: number) {
        this.countPriceChangedSource.next(countPrice);
    }

    public isPad() {
        // return true;
        if ( typeof amiJs === 'undefined' ) {
            return false;
        } else {
            return true;
        }
    }

    postPrintCount(data) {
        this.jsonSrv.post('restaurant/counter/print_count/',
            {
                'id': data['id'],
            })
            .subscribe((response?) => { });
    }

    public counter_print(data) {
        this.postPrintCount(data);
        if ( typeof amiJs === 'undefined' ) {
            return false;
        }
        amiJs.counter_print(JSON.stringify(data));
        return true;
    }

    public detail_print(data) {
        if ( typeof amiJs === 'undefined' ) {
            return false;
        }

        const printData = [];
        // 待打印文字 字体大小[1:最小...] 是否強調印字[0:否 1:是] 对齐方式[0:left 1:center 2:right]
        let fontSize = 5;
        const fontLen = data['shopInfo']['name'].length;
        if ( fontLen>7 ) {
            fontSize = 1;
        } else if ( fontSize>4 ) {
            fontSize = 3;
        }
        printData.push([data['shopInfo']['name'], fontSize, 1, 1]);
        // printData.push([' ', 1, 0, 1]);
        printData.push(['営業時間：' + data['shopInfo']['time1'], 1, 0, 0]);
        printData.push(['　　　　　' + data['shopInfo']['time2'], 1, 0, 0]);
        printData.push(['テーブル：' + data['seat_name'], 1, 0, 0]);
        printData.push([data['shopInfo']['post'], 1, 0, 0]);
        printData.push([data['shopInfo']['addr1'], 1, 0, 0]);
        printData.push([data['shopInfo']['addr2'], 1, 0, 0]);
        printData.push(['TEL： ' + data['shopInfo']['tel'], 1, 0, 0]);
        printData.push(['登録番号： ' + data['shopInfo']['no'], 1, 0, 0]);
        printData.push(['------------------------------', 1, 0, 1]);
        // printData.push(['領 収 書', 1, 0, 1]);

        const formatter = new Intl.NumberFormat('ja-JP');

        // 税抜きメユー
        if ( Object.values(data['details']).length>0 ) {
            let eatin = 0;
            let takeout = 0;
            // tslint:disable-next-line: forin
            for ( const i in data['details'] ) {
                const item = data['details'][i];
                let str = '';
                if ( item['tax']==this.app.TakeoutFax ) {
                    str = item['menu_no'] + ' ※ ' + item['menu_name'];
                    takeout += item['total'];
                } else {
                    str = item['menu_no'] + ' ' + item['menu_name'];
                    eatin += item['total'];
                }
                printData.push([str, 1, 0, 0]);

                str = item['count'] + 'コ  X ' + item['price'] + ' ￥' + formatter.format(item['total']);
                printData.push([str, 1, 0, 2]);
            }
            printData.push(['小計(税抜)', 1, 0, 0]);
            printData.push(['￥' + formatter.format(data['money']['total']), 1, 0, 2]);
            if ( eatin>0 ) {
                printData.push(['(外'  + this.app.Fax + '%　対象　　　　￥' + formatter.format(eatin) + ')', 1, 0, 0]);
                // tslint:disable-next-line: max-line-length
                printData.push(['外' + this.app.Fax + '%' + ('￥' + formatter.format(this.tax_value(eatin, this.app.Fax))).padStart(20, ' '), 1, 0, 2]);
            }
            if ( takeout>0 ) {
                printData.push(['(外'  + this.app.TakeoutFax + '%　 対象　　　　￥' + formatter.format(takeout) + ')', 1, 0, 0]);
                // tslint:disable-next-line: max-line-length
                printData.push(['外' + this.app.TakeoutFax + '%' + ('￥' + formatter.format(this.tax_value(takeout, this.app.TakeoutFax))).padStart(20, ' '), 1, 0, 2]);
            }
            // printData.push(['税合計 　　　　　　￥' + formatter.format(data['money']['tax_value']), 1, 0, 2]);
            printData.push([' ', 1, 0, 1]);
        }
        // 税込メユー
        if ( Object.values(data['taxDetails']).length>0 ) {
            printData.push(['-- 税込メニュー', 1, 0, 0]);

            // tslint:disable-next-line: forin
            for ( const i in data['taxDetails'] ) {
                const item = data['taxDetails'][i];
                let str = item['menu_no'] + ' ' + item['menu_name'];
                printData.push([str, 1, 0, 0]);

                str = item['count'] + 'コ  X ' + item['price'] + ' ￥' + formatter.format(item['total']);
                printData.push([str, 1, 0, 2]);
            }
            printData.push(['小計(税込)', 1, 0, 0]);
            printData.push(['￥' + formatter.format(data['money']['price_tax_in']), 1, 0, 2]);
            printData.push([' ', 1, 0, 1]);
        }
        if ( data['money']['cut']>0 ) {
            const cut_value = '-￥' + formatter.format(data['money']['cut_value'])
            printData.push(['割引(' + data['money']['cut'] + '%)' + cut_value.padStart(20, ' '), 1, 0, 2]);
        }

        if ( data['money']['reduce']>0 ) {
            const reduce = '-￥' + data['money']['reduce'];
            printData.push(['減額' + reduce.padStart(25, ' '), 1, 0, 2]);
        }

        const amounts_actually = '￥' + formatter.format(data['money']['amounts_actually']);
        printData.push(['合計' + amounts_actually.padStart(25, ' '), 1, 0, 2]);
        printData.push(['[' + data['pay_name'] + ']', 1, 0, 2]);
        const pay = '￥' +formatter.format(data['money']['pay']);
        printData.push(['お預り' + pay.padStart(23, ' '), 1, 0, 2]);
        const change = '￥' + formatter.format(data['money']['change']);
        printData.push(['お釣り' + change.padStart(23, ' '), 1, 0, 2]);
        printData.push(['------------------------------', 1, 0, 1]);
        printData.push(['※ 8%対象は軽減税率対象品です', 1, 0, 0]);
        printData.push(['毎度ありがとうございます', 1, 0, 0]);
        printData.push(['まだご来店をお待ちしております', 1, 0, 0]);
        printData.push([this.dateFormat(new Date()), 1, 0, 0]);
        data['printData'] = printData;
        data['hasStream'] = 1;
        amiJs.detail_print(JSON.stringify(data));
        return true;
    }
    dateFormat(date) {
        return date.getFullYear()
            + '年' + ('0' + (date.getMonth() + 1)).slice(-2)
            + '月' + ('0' + date.getDate()).slice(-2)
            + '日 ' + ('0' + date.getHours()).slice(-2)
            + '時' + ('0' + date.getMinutes()).slice(-2)
            + '分';
    }

    public open_cash_box() {
        if ( typeof amiJs === 'undefined' ) {
            return false;
        }
        amiJs.open_cash_box();
        amiJs.open_cash_box();
        return true;
    }
    public accounting_day_print(data) {
        const formatter = new Intl.NumberFormat('ja-JP');
        const printData = [];
        let fontSize = 5;
        const fontLen = data['shopInfo']['name'].length;
        if ( fontLen>7 ) {
            fontSize = 1;
        } else if ( fontSize>4 ) {
            fontSize = 3;
        }
        printData.push([data['shopInfo']['name'], fontSize, 1, 1]);
        printData.push(['TEL：' + data['shopInfo']['tel'], 1, 0, 2]);
        printData.push([' ', 1, 0, 1]);
        printData.push([data['date'], 3, 0, 1]);
        printData.push(['------------------------------', 1, 0, 1]);
        // printData.push(['明　細', 1, 0, 1]);
        const pay = {};
        const lunch = data['day']['lunch'];
        const dinner = data['day']['dinner'];
        const total_amount = data['day']['amounts_actually'];
        const number = data['day']['number'];
        const amounts_payable = data['day']['amounts_payable'];
        const sale = data['day']['cut_value'] + data['day']['reduce'];

        // tslint:disable-next-line: forin
        for ( const i in data['accounting'] ) {
            printData.push([data['accounting'][i]['display_name'], 1, 0, 0]);
            // tslint:disable-next-line: max-line-length
            printData.push([data['accounting'][i]['count'] + '回' + ('￥' + formatter.format(data['accounting'][i]['amounts_actually'])).padStart(12, ' '), 1, 0, 2]);
        }
        printData.push(['------------------------------', 1, 0, 1]);
        printData.push(['客数' + (number.toString()).padStart(24, ' '), 1, 0, 2]);
        printData.push(['昼売上' + ('￥' + formatter.format(lunch)).padStart(22, ' '), 1, 0, 2]);
        printData.push(['夜売上' + ('￥' + formatter.format(dinner)).padStart(22, ' '), 1, 0, 2]);
        printData.push([' ', 1, 0, 1]);

        printData.push(['計算金額' + ('￥' + formatter.format(amounts_payable)).padStart(20, ' '), 1, 0, 2]);
        printData.push(['減額' + ('￥' + formatter.format(sale)).padStart(24, ' '), 1, 0, 2]);
        printData.push(['------------------------------', 1, 0, 1]);
        printData.push([' ', 1, 0, 1]);

        printData.push(['総売上（税込）' + ('￥' + formatter.format(total_amount)).padStart(15, ' '), 1, 0, 2]);

        const details = data['day']['details'];

        let print_count = 0;
        let print_amounts = 0;
        let in_print_data = {};
        details.forEach((item) => {
            if ( !Util.isEmpty(item['print_count']) && Util.isEmpty(in_print_data[item['detail_no']]) ) {
                print_count += parseInt(item['print_count']);
                print_amounts += parseInt(item['print_count']) * item['amounts_actually'];
            }
            in_print_data[item['detail_no']] = 1;
        });
        printData.push([' ', 1, 0, 1]);
        printData.push(['領収書発行枚数', 1, 0, 0]);
        printData.push([print_count +　'回' + ('￥' + formatter.format(print_amounts)).padStart(15, ' '), 1, 0, 2]);

        const result = {
            'charset': data['shopInfo']['charset'],
            'data': printData,
            'shopInfo': data['shopInfo']
        };

        amiJs.print_stream(JSON.stringify(result));

        this.printDayReport(data);
        return true;
    }

    public printDayReport(pData) {
        if ( !this.app.canCounterReport() ) {
            return false;
        }
        const date = pData['time'];
        this.jsonSrv.post('restaurant/counter/get_cash_record/', {'date': date}).subscribe((response) => {
            if ( response && !Util.isEmpty(response['data']) ) {
                const data = response['data'];
                const formatter = new Intl.NumberFormat('ja-JP');
                const printData = [];
                let fontSize = 5;
                const fontLen = pData['shopInfo']['name'].length;
                if ( fontLen>7 ) {
                    fontSize = 1;
                } else if ( fontSize>4 ) {
                    fontSize = 3;
                }
                printData.push([pData['shopInfo']['name'], fontSize, 1, 1]);
                printData.push(['TEL：' + pData['shopInfo']['tel'], 1, 0, 2]);
                printData.push([' ', 1, 0, 1]);
                printData.push([pData['date'], 3, 0, 1]);
                printData.push([' ', 1, 0, 1]);

                let in_amount = 0;
                let out_amount = 0;
                let box_amount = 0;
                printData.push(['入金', 3, 0, 0]);
                printData.push(['レジ開け', 1, 0, 0]);
                printData.push([('￥' + formatter.format(data['in_amount'].toString())), 1, 0, 2]);
                in_amount += data['in_amount'];
                if ( !Util.isEmpty(data['charges']) ) {
                    data['charges'].forEach((item)=>{
                        printData.push([item['name'] + '支払い分', 1, 0, 0]);
                        printData.push(['￥' + formatter.format(item['amount']), 1, 0, 2]);
                        in_amount += item['amount'];
                    });
                }
                // in_amount += data['in_amount'];
                // printData.push(['現金売上' + ('￥' + formatter.format(data['counter_amount'].toString())).padStart(20, ' '), 1, 0, 2]);
                // in_amount += data['counter_amount'];
                printData.push(['------------------------------', 1, 0, 1]);
                printData.push(['合計' + ('￥' + formatter.format(in_amount * 1)).padStart(13, ' '), 1, 0, 2]);
                printData.push([' ', 1, 0, 1]);

                if ( !Util.isEmpty(data['orders']) ) {
                    printData.push(['支払', 3, 0, 0]);
                    data['orders'].forEach((item)=>{
                        printData.push([item['name'], 1, 0, 0]);
                        printData.push(['-￥' + formatter.format(item['amount']), 1, 0, 2]);
                        out_amount += item['amount'];
                    });
                    printData.push(['------------------------------', 1, 0, 1]);
                    printData.push(['合計' + ('-￥' + formatter.format(out_amount * 1)).padStart(13, ' '), 1, 0, 2]);
                    printData.push([' ', 1, 0, 1]);
                }

                printData.push(['レジ', 3, 0, 0]);
                printData.push(['万円札', 1, 0, 0]);
                printData.push(['x' + data['m10000'] + ('    ￥' + formatter.format(data['m10000'] * 10000)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m10000'] * 10000;

                printData.push(['五千円札', 1, 0, 0]);
                printData.push(['x' + data['m5000'] + ('    ￥' + formatter.format(data['m5000'] * 5000)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m5000'] * 5000;

                printData.push(['千円札', 1, 0, 0]);
                printData.push(['x' + data['m1000'] + ('    ￥' + formatter.format(data['m1000'] * 1000)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m1000'] * 1000;

                printData.push(['五百円玉', 1, 0, 0]);
                printData.push(['x' + data['m500'] + ('    ￥' + formatter.format(data['m500'] * 500)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m500'] * 500;

                printData.push(['百円玉', 1, 0, 0]);
                printData.push(['x' + data['m100'] + ('    ￥' + formatter.format(data['m100'] * 100)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m100'] * 100;

                printData.push(['五十円玉', 1, 0, 0]);
                printData.push(['x' + data['m50'] + ('    ￥' + formatter.format(data['m50'] * 50)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m50'] * 50;

                printData.push(['十円玉', 1, 0, 0]);
                printData.push(['x' + data['m10'] + ('    ￥' + formatter.format(data['m10'] * 10)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m10'] * 10;

                printData.push(['五円玉', 1, 0, 0]);
                printData.push(['x' + data['m5'] + ('    ￥' + formatter.format(data['m5'] * 5)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m5'] * 5;

                printData.push(['一円玉', 1, 0, 0]);
                printData.push(['x' + data['m1'] + ('    ￥' + formatter.format(data['m1'] * 1)).padStart(13, ' '), 1, 0, 2]);
                box_amount += data['m1'] * 1;
                printData.push(['------------------------------', 1, 0, 1]);
                printData.push(['実現金残高' + ('￥' + formatter.format(box_amount)).padStart(13, ' '), 1, 0, 2]);

                printData.push([' ', 1, 0, 1]);
                printData.push(['計算現金残高' + ('￥' + formatter.format((in_amount - out_amount))).padStart(13, ' '), 1, 0, 2]);
                printData.push(['過不足金' + ('￥' + formatter.format((box_amount - (in_amount - out_amount)))).padStart(13, ' '), 1, 0, 2]);

                const result = {
                    'charset': pData['shopInfo']['charset'],
                    'data': printData,
                    'shopInfo': pData['shopInfo']
                };
                amiJs.print_stream(JSON.stringify(result));
            }
        });
    }

    public accounting_month_print(data) {
        const formatter = new Intl.NumberFormat('ja-JP');
        const printData = [];
        let fontSize = 5;
        const fontLen = data['shopInfo']['name'].length;
        if ( fontLen>7 ) {
            fontSize = 1;
        } else if ( fontSize>4 ) {
            fontSize = 3;
        }
        printData.push([data['shopInfo']['name'], fontSize, 1, 1]);
        printData.push(['TEL：' + data['shopInfo']['tel'], 1, 0, 2]);
        printData.push([' ', 1, 0, 1]);
        printData.push([data['date'], 3, 0, 1]);
        printData.push(['------------------------------', 1, 0, 1]);
        // printData.push(['明　細', 1, 0, 1]);
        const pay = {};
        let lunch = 0;
        let dinner = 0;
        let total_amount = 0;
        let number = 0;
        let amounts_payable = 0;
        let sale = 0;
        let print_count = 0;
        let print_amounts = 0;
        data['data'].forEach((day) => {
            day['pays'].forEach( (item)=> {
                const key = item['display_name'];
                if ( Util.isEmpty(pay[key]) ) {
                    pay[key] = {
                        'total_amount': 0,
                        'count' : 0
                    };
                }
                pay[key]['total_amount'] += item['amounts_actually'];
                pay[key]['count'] += item['count'];
            });
            lunch += day['lunch'];
            dinner += day['dinner'];
            total_amount += day['amounts_actually'];
            number += day['number'];
            amounts_payable += day['amounts_payable'];
            sale += day['cut_value'] + day['reduce'];

            const details = day['details'];
            let in_print_data = {};
            details.forEach((item) => {
                if ( !Util.isEmpty(item['print_count']) && Util.isEmpty(in_print_data[item['detail_no']]) ) {
                    print_count += parseInt(item['print_count']);
                    print_amounts += parseInt(item['print_count']) * item['amounts_actually'];
                }
                in_print_data[item['detail_no']] = 1;
            });
        });
        // tslint:disable-next-line: forin
        for ( const i in pay ) {
            printData.push([i, 1, 0, 0]);
            printData.push([pay[i]['count'] + '回' + ('￥' + formatter.format(pay[i]['total_amount'])).padStart(12, ' '), 1, 0, 2]);
        }
        printData.push(['------------------------------', 1, 0, 1]);
        printData.push(['客数' + (number.toString()).padStart(24, ' '), 1, 0, 2]);
        printData.push(['昼売上' + ('￥' + formatter.format(lunch)).padStart(22, ' '), 1, 0, 2]);
        printData.push(['夜売上' + ('￥' + formatter.format(dinner)).padStart(22, ' '), 1, 0, 2]);
        printData.push([' ', 1, 0, 1]);

        printData.push(['計算金額' + ('￥' + formatter.format(amounts_payable)).padStart(20, ' '), 1, 0, 2]);
        printData.push(['減額' + ('￥' + formatter.format(sale)).padStart(24, ' '), 1, 0, 2]);
        printData.push(['------------------------------', 1, 0, 1]);
        printData.push([' ', 1, 0, 1]);

        printData.push(['総売上（税込）' + ('￥' + formatter.format(total_amount)).padStart(15, ' '), 1, 0, 2]);

        printData.push([' ', 1, 0, 1]);
        printData.push(['領収書発行枚数', 1, 0, 0]);
        printData.push([print_count +　'回' + ('￥' + formatter.format(print_amounts)).padStart(15, ' '), 1, 0, 2]);
        const result = {
            'charset': data['shopInfo']['charset'],
            'data': printData,
            'shopInfo': data['shopInfo']
        };

        amiJs.print_stream(JSON.stringify(result));
        return true;
    }

}

declare module amiJs {
    export function counter_print(data): any;
    export function detail_print(data): any;
    export function open_cash_box(): any;
    export function accounting_day_print(data): any;
    export function print_stream(data): any;
}