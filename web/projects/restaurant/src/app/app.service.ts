import { JsonService, Util } from 'ami';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Router, NavigationEnd } from '@angular/router';


@Injectable({
    providedIn: 'root'
})
export class AppService {

    private system_name = '';
    private __tax = 10;
    private __takeout_tax = 8;
    private version = '';
    private shopInfo = null;
    private siteImageHost = 'https://foodlife.s3-ap-northeast-1.amazonaws.com';
    private kitchenPrinter = false;
    private takeoutPrinter = false;
    private qrcode = false;
    private whitelist = false;
    private counterReport = false;
    private onlyTodayCounter = false; // レジ画面の「会計履歴」と「売上集計」画面の日期変更できない
    private callStaff = false; // 店員呼び出し
    private reserve = false;

    private unknow_language = {};
    private __lindex = {};
    private __language = {
        'ja' : [],
        'zh' : [],
        'en' : []
    };
    private __qrtheme;

    public shopinfo_config_key = 'shopinfo';
    get SystemName(): string {
        return this.system_name;
    }

    get Fax(): number {
        return this.__tax;
    }

    get TakeoutFax(): number {
        return this.__takeout_tax;
    }

    get ShopInfo() {
        return this.shopInfo;
    }

    get SiteImageHost() {
        return this.siteImageHost;
    }
    get Version(): string {
        return this.version;
    }

    private versionSource = new Subject<boolean>();
    version$ = this.versionSource.asObservable();

    private languageChangedSource = new Subject<String>();
    languageChanged$ = this.languageChangedSource.asObservable();

    constructor(
        private router: Router,
        private http: HttpClient,
        private jsonSrv: JsonService
    ) { }

    init() {
        this.initLanguageData();
        this.jsonSrv.get('master/app').subscribe((response) => {
            if (!Util.isEmpty(response['data'])) {
                this.system_name = response['data']['system_name'];
                document.title = this.system_name;
                this.__tax = response['data']['fax'];
                if ( !Util.isEmpty(response['data']['takeout_tax']) ) {
                    this.__takeout_tax = response['data']['takeout_tax'];
                }

                if ( !Util.isEmpty(response['data']['qrtheme']) ) {
                    this.__qrtheme = response['data']['qrtheme'];
                }

                this.version = response['data']['version'];
                this.versionSource.next(this.version === environment.version);
                this.siteImageHost = response['data']['siteImageHost'];
                this.whitelist = response['data']['whitelist'];
                const plugin = response['data']['plugin'];
                if ( !Util.isEmpty(plugin) ) {
                    // tslint:disable-next-line: forin
                    for ( const i in plugin ) {
                        if ( plugin[i]['plugin_name'] === 'kitchprinter' ) {
                            this.kitchenPrinter = true;
                        } else if ( plugin[i]['plugin_name'] === 'takeout' ) {
                            this.takeoutPrinter = true;
                        } else if ( plugin[i]['plugin_name'] === 'qrcode' ) {
                            this.qrcode = true;
                        } else if ( plugin[i]['plugin_name'] === 'counter_report') {
                            this.counterReport = true;
                        } else if ( plugin[i]['plugin_name'] === 'only_today_counter') {
                            this.onlyTodayCounter = true;
                        }else if ( plugin[i]['plugin_name'] === 'call_staff') {
                            this.callStaff = true;
                        }else if ( plugin[i]['plugin_name'] === 'reserve') {
                            this.reserve = true;
                        }
                    }
                }
                //console.log(this.version, environment.version);
            }
        });
        console.info('init app');
        this.initShopInfo();
        this.postLanguage();
    }

    canKitchenPrinter() {
        return this.kitchenPrinter;
    }

    canTakeoutPrinter() {
        return this.takeoutPrinter;
    }

    canQrCode() {
        if ( !this.qrcode ) {
            return false;
        } else if (!this.whitelist) {
            return false;
        }
        return true;
    }

    canCounterReport() {
        return this.counterReport;
    }

    onlySeeTodayCounter() {
        return this.onlyTodayCounter;
    }

    showCallStaff(){
        return this.callStaff;
    }

    showReserve(){
        return this.reserve;
    }

  zekomi(price, tax_in) {
      if ( tax_in ) {
          return price;
      } else {
          return Math.floor(price * ( 1 + (this.Fax/100) ));
      }
  }
  getQrThemeId() {
      return this.__qrtheme;
  }

    initShopInfo() {
        this.jsonSrv.get('restaurant/master/config/', {'key': this.shopinfo_config_key}).subscribe((response?: any[]) => {
            if (!Util.isEmpty(response) && response['config'] && !Util.isEmpty(response['config']['value'])) {
                this.shopInfo = response['config']['value'];
            } else {
                this.shopInfo = {
                    'no': '',
                    'name': '',
                    'post': '',
                    'tel' : '',
                    'addr1': '',
                    'addr2': '',
                    'time1': '',
                    'time2': '',
                    'charset': 'Shift_JIS'
                };
            }
        });
    }

    postLanguage() {
        setTimeout(() => {
            if ( Object.keys(this.unknow_language).length > 0 ) {
                this.jsonSrv.post('restaurant/master/post_language/', {'key': this.unknow_language}).subscribe((response) => {
                    this.unknow_language = {};
                    this.initLanguageData();
                });
            }
            this.postLanguage();
          }, 30000);
    }
    initLanguageData() {
        this.jsonSrv.get('restaurant/master/language/', {}).subscribe((response: any) => {
            if (!Util.isEmpty(response) && response[0]) {
                response.forEach((element: any) => {
                    if ( Util.isEmpty(this.__lindex[element['ja']]) ) {
                        this.__lindex[element['ja']] = this.__language['ja'].length;
                        this.__language['ja'].push(element['ja']);
                        this.__language['en'].push(element['en']);
                        this.__language['zh'].push(element['zh']);
                    } else {
                        const index = this.__lindex[element['ja']];
                        this.__language['ja'][index] = element['ja'];
                        this.__language['en'][index] = element['en'];
                        this.__language['zh'][index] = element['zh'];
                    }
                });
            }
        });
    }

    setLanguage(language) {
        localStorage.setItem('__language__', language );
        this.languageChangedSource.next(language);
    }
    getLanguage() {
        return localStorage.getItem('__language__');
    }

    language(key, lang=null) {
        let language = this.getLanguage();
        if (!Util.isEmpty(lang)) {
            language = lang;
        }
        let tk = 'ja';
        if ( language === 'en' ) {
            tk = 'en';
        } else if ( language === 'zh' ) {
            tk = 'zh';
        }

        if ( this.__lindex[key] != undefined ) {
            const index = this.__lindex[key];
            const val = this.__language[tk][index];
            if ( !Util.isEmpty(val) ) {
                return val;
            }
        } else {
            this.unknow_language[key] = 1;
        }
        return key;
    }

    public get_mac() {
        if ( typeof amiJs === 'undefined' ) {
            return '';
        }
        return amiJs.getMac();
    }

    public print_kitchen_task(data) {
        if ( typeof amiJs === 'undefined' ) {
            return '';
        }
        return amiJs.print_kitchen_task(JSON.stringify(data));
    }

    public print_takeout(data) {
        if ( typeof amiJs === 'undefined' ) {
            return '';
        }
        return amiJs.print_takeout(JSON.stringify(data));
    }

}

declare module amiJs {
    export function counter_print(data): any;
    export function detail_print(data): any;
    export function open_cash_box(): any;
    export function accounting_day_print(data): any;
    export function getMac(): any;
    export function print_takeout(data): any;
    export function print_kitchen_task(data): any;
}
