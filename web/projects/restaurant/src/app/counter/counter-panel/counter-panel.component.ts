import { Component, OnInit, Output, EventEmitter, Input, SimpleChange } from '@angular/core';
import { Util, JsonService } from 'ami';
import { CounterService } from '../counter.service';
import { MasterGroup, Master } from '../../menu/menu.interface';
import { CmpService } from '../../cmp/cmp.service';
import { CounterDetailOrder } from '../counter.interface';
import { CounterDetailsConfirmComponent } from '../counter-details-confirm/counter-details-confirm.component';
import { MatDialog } from '@angular/material';
import { AppService } from '../../app.service';

@Component({
  selector: 'restaurant-counter-panel',
  templateUrl: './counter-panel.component.html',
  styleUrls: ['./counter-panel.component.css']
})
export class CounterPanelComponent implements OnInit {

  details: Array<CounterDetailOrder> = [];
  // 金額計算用Model
  money = {
    //税額 total * tax
    tax_value: 0,

    // 支払価格(税抜)　計算した価格（税込メニュー除く
    total: 0,

    //
    eatin: 0,

    // 持ち帰り（税抜き）計算した価格（税込メニュー除く
    takeout: 0,

    // 支払金額（税込み total + tax_value　（税込メニュー除く
    price: 0,

    // 税込み金額（税込メニュー金額
    price_tax_in: 0,

    // 应付金额（price + price_tax_in
    amounts_payable: 0,

    // 实际支付金额（price + price_tax_in - cut_value - reduce
    amounts_actually: 0,

    // 預り(入金
    pay: 0,

    // 割引額(割引値、例：10%)
    cut: 0,

    // 割引額(金額、例：500円) => 明細用
    cut_value: 0,

    // 減額
    reduce: 0,

    //お釣り
    change: 0
  };

  // 入力モード（割引、減額、預り）
  inputModel = "";

  // 支払手段
  payMethod = 'money';
  payMethodMaster: Array<Master> = [];
  payMethodImage = null;

  @Output() pay = new EventEmitter<any>();

  @Output() action = new EventEmitter<string>();

  @Input() total = 0; //支払べき金額

  @Input() counterId = -1;

  isStart = false;

  site_image_host = "";

  constructor(
    private cmp: CmpService,
    private jsonSrv: JsonService,
    private dialog: MatDialog,
    public counterSrv: CounterService,
    public appService: AppService) {
    this.site_image_host = this.appService.SiteImageHost + '/';
  }

  ngOnInit() {
    this.jsonSrv.get('master/master/', { name: 'pay_method' }).subscribe((group: Array<MasterGroup>) => {
      if (group && group[0]) {
        this.payMethodMaster = group[0].master_data;
        this.payMethodImage = {};
        this.payMethodMaster.forEach((master) => {
          if (master.option != null) {
            this.payMethodImage[master.name] = master.option['img'];
          }
        });
      }
    });
  }


  // ngOnChanges(changes: { [propKey: string]: SimpleChange }) {

  //   for (let propName in changes) {
  //     if (propName === 'total') {

  //       const total = changes[propName].currentValue;

  //     }
  //   }
  // }

  public startPay(total, takeoutTotal, priceTaxIn, details: Array<CounterDetailOrder>) {
    this.details = details;
    this.payMethod = 'money';
    this.inputModel = 'pay';
    this.money.total = total + takeoutTotal;
    this.money.takeout = takeoutTotal;
    this.money.eatin = total;
    this.money.price_tax_in = priceTaxIn;
    // console.log("ngOnChanges .moneyTotal", total);
    this.clearMoney();
    // 支払金額再計算
    this.countPrice();
    this.isStart = true;
  }

  public clearPay() {
    this.details = [];
    this.inputModel = "";
    this.money.total = 0;
    this.money.price_tax_in = 0;
    this.money.eatin = 0;
    this.money.takeout = 0;
    this.clearMoney();
    this.isStart = false;
  }

  clickAction(name) {

    // this.jsonSrv.post('restaurant/counter/counter_pay/',
    //   {
    //     "type": "over",
    //     "faxprice": this.money.price,
    //     "price": this.money.total
    //   })
    //   .subscribe((response?) => { });
    this.action.emit(name);
  }

  showDetail() {
    const master = this.payMethodMaster.find((m) => { return m.name === this.payMethod });
    const dialog = this.dialog.open(CounterDetailsConfirmComponent, {
      width: '90%',
      height: '70%',
      data: {
        details: this.details,
        money: this.money,
        pay_method: master.display_name,
      }
    });
    dialog.afterClosed().subscribe(result => {

    });
  }

  clearMoney(event?) {
    this.money.pay = 0;
    this.money.cut = 0;
    this.money.cut_value = 0;
    this.money.reduce = 0;
    this.money.change = 0;
    this.money.tax_value = 0;
    this.money.price = 0;
    this.money.amounts_payable = 0;
    this.money.amounts_actually = 0;
    this.countPrice();
  }

  private clearMonitor() {

    this.counterSrv.sendMonitor("clear", this.money);
  }

  private countPrice() {

    // tslint:disable-next-line: max-line-length
    this.money.tax_value = this.counterSrv.tax_value(this.money.eatin, this.appService.Fax) + this.counterSrv.tax_value(this.money.takeout, this.appService.TakeoutFax);
    this.money.cut_value = 0;
    this.money.price = this.money.total + this.money.tax_value;
    this.money.amounts_payable = this.money.price + this.money.price_tax_in;
    this.money.amounts_actually = this.money.price + this.money.price_tax_in;

    if (!Util.isEmpty(this.money.cut) && this.money.cut > 0) {
      this.money.cut_value = Math.floor(this.money.amounts_payable * this.money.cut / 100)
      this.money.amounts_actually = this.money.amounts_actually - this.money.cut_value;
    }

    if (!Util.isEmpty(this.money.reduce) && this.money.reduce > 0) {
      this.money.amounts_actually = this.money.amounts_actually - this.money.reduce;
    }

    this.money.change = (this.money.pay === 0) ? 0 : (this.money.pay - this.money.amounts_actually);

    if (this.money.change >= 0) {
      // 預りした場合、通知送信
      this.counterSrv.sendMonitor("pay", this.money);
    }
  }

  // ボタンコントロール
  shiftInput(model) {
    // console.log(this.inputModel);

    if (!this.isStart) {
      return;
    }

    if (!Util.isEmpty(this.inputModel) && this.inputModel === model)
      return;

    if (model === 'pay' && this.payMethod !== 'money') {
      this.inputModel = "";
      return;
    }

    this.inputModel = model;
  }

  onInput(event: String) {
    switch (this.inputModel) {
      case "cut":
        const cut = Number(this.money.cut.toString() + event);
        if (!isNaN(cut) && cut <= 99) {
          this.money.cut = cut;
        }
        break;
      case "reduce":
        const reduce = Number(this.money.reduce.toString() + event);
        if (!isNaN(reduce) && reduce <= 99999) {
          this.money.reduce = reduce;
        }
        break;
      case "pay":
        const pay = Number(this.money.pay.toString() + event);
        if (!isNaN(pay) && pay <= 9999999) {
          this.money.pay = pay;
        }
        break;
    }

    // 支払金額再計算
    this.countPrice();
  }

  clearInput() {
    console.info(this.inputModel, this.money);
    switch (this.inputModel) {
      case "cut":
        this.money.cut = 0;
        break;
      case "reduce":
        this.money.reduce = 0;
        break;
      case "pay":
        this.money.pay = 0;
        break;
    }
    console.info(this.inputModel, this.money);
    // 支払金額再計算
    this.countPrice();
  }

  onPayMethodChange(event) {

    this.inputModel = ""
    this.money.pay = 0;
    if (this.payMethod !== 'money')
      this.money.pay = this.money.amounts_actually;
    // 支払金額再計算
    this.countPrice();

  }

  backspaceInput() {
    let val = this.money[this.inputModel].toString();
    if (val.length > 0) {
      val = val.substr(0, val.length - 1);
      this.money[this.inputModel] = Number(val);
    }

    console.info(this.inputModel, this.money);
    // 支払金額再計算
    this.countPrice();
  }


  openCashBox() {
    this.counterSrv.open_cash_box();
  }

  onPay() {

    const dialog = this.cmp.confirm('会計処理行います、よろしいでしょうか？');
    dialog.afterClosed().subscribe(result => {
      if (result === "yes") {

        // open cash box
        if ( this.payMethod=='money' ) {
          this.openCashBox();
        }

        //支払い方法を設定する
        let params = Util.copy(this.money);
        const master = this.payMethodMaster.find((m) => { return m.name === this.payMethod });
        params["pay_method_id"] = master.id;

        this.pay.emit(params);
      } else {

      }
    });


  }

  // 確定押下可能か如何かチェック
  checkOkDisabled() {
    if (!this.isStart)
      return true

    if (this.payMethod !== 'money') {
      return this.money.pay !== this.money.amounts_actually
    }

    return (this.money.pay === 0 || this.money.change < 0)
  }

  isPad() {
    return this.counterSrv.isPad();
  }
}
