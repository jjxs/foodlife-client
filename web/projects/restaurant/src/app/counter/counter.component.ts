import {
  Component,
  OnInit,
  ViewChild,
  ViewChildren,
  SimpleChanges,
  SimpleChange,
  Input,
} from "@angular/core";
import { MatTableDataSource, MatTable, MatDialog } from "@angular/material";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { SeatListComponent } from "../seats/seat-list.component";
import { Util, JsonResult } from "ami";
import { JsonService } from "ami";
import { Seat } from "../seats/seat.interface";
import {
  CounterDetailOrder,
  CounterDetail,
  Counter,
} from "./counter.interface";
import { CounterService } from "./counter.service";
import { CmpService } from "../cmp/cmp.service";

import { CounterSplitPanelComponent } from "./counter-split-panel/counter-split-panel.component";
import { CounterDetailsComponent } from "./counter-details/counter-details.component";
import { NumberInputComponent } from "../cmp/number-input/number-input.component";
import { CounterPanelComponent } from "./counter-panel/counter-panel.component";
import { CounterOrdersDetailPanelComponent } from "./counter-orders-detail-panel/counter-orders-detail-panel.component";
import { count } from "rxjs/operators";
import { CounterSearchComponent } from "./counter-search/counter-search.component";
import { ThemeService } from "../cmp/ami-theme-select/theme.service";
import { HomeService } from "../home/home.service";
import { AppService } from "../app.service";
import { environment } from "projects/restaurant/src/environments/environment";

@Component({
  selector: "app-counter",
  templateUrl: "./counter.component.html",
  styleUrls: ["./counter.component.css"],
})
export class CounterComponent implements OnInit {
  @Input() showHeader = true;
  @Input() showCounterSearch = true;
  @Input() showHistory = true;
  @Input() inputSeat = null;

  // 金額計算用Model
  money = {
    total: 0, //計算金額（税抜き
    balance: 0, // 残額
  };

  @ViewChild(CounterOrdersDetailPanelComponent, { static: false })
  counterOrdersDetailPanel: CounterOrdersDetailPanelComponent;
  @ViewChild(CounterSplitPanelComponent, { static: false })
  counterSplitPanel: CounterSplitPanelComponent;
  @ViewChild(CounterPanelComponent, { static: false })
  counterPanel: CounterPanelComponent;

  //グリッド編集可能を指示する。
  edit_model = false;

  // 账单信息(分割结帐中已经完成的结帐信息))
  counter_detail: Array<CounterDetail> = [];

  // 前画面传递来的所餐桌ID
  select_ids = [];
  // 当前结帐所有餐桌信息
  select_seats = [];

  // 注文明细（一览表示用）
  orders_detail = [];

  // 分割注文明细（支払い下部グリッド）
  split_detail = [];

  // 平均注文明细（支払い下部グリッド）
  average_detail = [];

  // 手動注文明细（支払い下部グリッド）
  input_detail = [];

  // 支払タイプ
  payType = "pay";

  // 会計ID
  counterId = -1;

  // 明細部総額（税抜き
  orderDetailTotal = 0;
  orderDetailTotalTaxIn = 0;

  // 分割金額
  splitTotal = 0;
  splitTotalTaxIn = 0;

  // 支払総額（税抜き
  moneyTotal = 0;

  // 支払残額（税抜き
  moneyBalance = 0;

  // 現在支払い明細Index（平均分割、手動分割用）
  current_index = -1;

  afterCounter$;

  payTypeTitle = "支払";
  arrPayTypeTitle = {
    pay: "支払",
    split: "分割",
  };

  reserveConnecting: WebSocket;
  isReserveConnecting = false;
  retry = true;

  constructor(
    public counterSrv: CounterService,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private jsonSrv: JsonService,
    private themeSvr: ThemeService,
    private cmp: CmpService,
    private homeSvr: HomeService,
    private app: AppService,
    private router: Router
  ) {
    this.app.initShopInfo();

    // 会計完了した場合
    this.afterCounter$ = this.counterSrv.afterCounter$.subscribe(
      (response: JsonResult) => {
        // メッセージあれば、表示する
        if (!Util.isEmpty(response.message)) {
          this.cmp.pop(response.message);
        }

        // Fasleの場合処理中止
        if (!response.result) {
          return;
        }

        // CounterID
        this.counterId = response.data["counter"];

        this.openHistory(this.counterId, response.data["id"]);

        // ※一番前で実行する
        let over = this.checkover();
        if (over) {
          // 明細開く場合
          this.clearCounter();
          return;
        }
        // console.log()

        this.counter_detail.push(response.data);

        switch (this.payType) {
          case "pay":
            this.countDetails();
            break;
          case "split":
            this.split_detail = [];
            this.counterSplitPanel.renderRows();
            this.countDetails();
            break;
          case "average":
            this.average_detail[this.current_index].status = true;
            this.average_detail[this.current_index].detail_id =
              response.data["id"];
            this.countDetails();
            break;
          case "input":
            this.input_detail[this.current_index].status = true;
            this.input_detail[this.current_index].detail_id =
              response.data["id"];
            this.countDetails();
            break;
        }
      }
    );
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if(this.app.showReserve()){
      this.reserveConnecting.close()
    }
    
    this.retry = false;
    this.afterCounter$.unsubscribe();
  }

  startReserveWebsocket() {
    if (this.isReserveConnecting || !this.app.showReserve()) {
      return;
    }
    this.isReserveConnecting = true;
    let ws_host = environment.socket_ip;
    ws_host = ws_host.replace("{{saas}}", Util.getSaasID());
    this.reserveConnecting = new WebSocket("wss://" + ws_host + "/ws/reserve/");

    this.reserveConnecting.onmessage = (result) => {
      if (!Util.isEmpty(result) && !Util.isEmpty(result["data"])) {
        const data = Util.decode(result["data"]);
        this.cmp.pop(data["message"], 4000);
      }
    };

    this.reserveConnecting.onclose = (e) => {
      console.error("Chat socket closed unexpectedly");
      this.isReserveConnecting = false;
      const me = this;
      if (me.retry) {
        setTimeout(function () {
          me.startReserveWebsocket();
        }, 10000);
      }
    };
  }

  ngOnInit() {
    this.retry = true;
    this.startReserveWebsocket();

    this.homeSvr.showHeader(this.showHeader);
    this.themeSvr.change("indigo-pink");
    const params = this.route.snapshot.params["ids"];
    this.select_ids = Util.decode(params);
    if (Util.isEmptyArray(this.select_ids)) {
      if (!Util.isEmpty(this.inputSeat)) {
        this.select_seats = [];
        this.select_ids = [];
        this.select_ids.push(this.inputSeat.id);
        console.info(this.select_ids);
      }
    }
    this.getMacData();
  }
  getMacData() {
    this.jsonSrv
      .post("s/setsubi_api/get_mac_data", {})
      .subscribe((response: JsonResult) => {
        if (response["data"] == "1") {
          if (!Util.isEmptyArray(this.select_ids)) {
            this.getSeatData();
            this.clearCounter();
            this.getCounterDetail();
          }
        } else {
          this.router.navigateByUrl("/store/setsubi-error");
          return;
        }
      });
  }
  getSeatData() {
    // 席情報確認する
    let ids = Util.encode(this.select_ids);
    ids = ids.replace("[", "").replace("]", "");

    this.jsonSrv
      .get("master/seat/", { id__in: ids })
      .subscribe((response?: Array<Seat>) => {
        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          response.forEach((seat: Seat) => {
            this.select_seats.push(seat.seat_no + "." + seat.name);
          });
        }
      });
  }

  // 会計明細を取得
  getCounterDetail() {
    // console.log(this.select_ids);
    this.cmp.loading();
    // 注文明細を取得
    this.jsonSrv
      .post("restaurant/counter/orders_detail/", { seat_ids: this.select_ids })
      .subscribe((response?: Array<CounterDetailOrder>) => {
        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          this.orders_detail = response;
          // 合計金額算出
          this.countDetails();
        }

        this.cmp.unloading();
      });
  }

  // 会計明細を取得(会計ずみの場合、履歴から取得する)
  getCounterDetailfromHistory(counterId) {
    this.cmp.loading();
    // 注文明細を取得
    this.jsonSrv
      .post("restaurant/counter/edit/", { counter_id: counterId })
      .subscribe((response?: Array<CounterDetailOrder>) => {
        // console.log(response)

        this.cmp.unloading();

        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          this.orders_detail = response;

          // 合計金額算出
          this.countDetails();
        }
      });
  }

  // getCounterHistoryDetail() {

  //   this.clearCounter();

  //   this.cmp.loading()
  //   // 注文明細を取得
  //   this.jsonSrv.post('restaurant/counter/orders_detail/', { 'seat_ids': this.select_ids }).subscribe((response?: Array<CounterDetailOrder>) => {

  //     if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {

  //       this.orders_detail = response;
  //       // 合計金額算出
  //       this.countDetails();
  //     }

  //     this.cmp.unloading(200);
  //   })
  // };

  step(val: number) {}

  clearCounter(event?) {
    this.counter_detail = [];
    this.split_detail = [];
    this.orders_detail = [];
    this.input_detail = [];
    this.average_detail = [];

    // 支払タイプ
    this.payType = "pay";
    this.payTypeTitle = this.arrPayTypeTitle[this.payType];

    // 会計ID
    this.counterId = -1;

    // 明細部総額（税抜き
    this.orderDetailTotal = 0;
    this.orderDetailTotalTaxIn = 0;

    // 支払総額（税抜き
    this.moneyTotal = 0;

    this.splitTotal = 0;
    // 明細部総額（税抜き
    this.splitTotalTaxIn = 0;

    // 支払残額（税抜き
    this.moneyBalance = 0;

    this.current_index = -1;

    this.edit_model = false;

    this.counterPanel.clearPay();
  }

  // confirm() {
  //   if (this.counter_detail.length >= 0) {
  //     this.cmp.pop('会計処理の一部はですに完了したため、該当処理はできません。完了或いは取消してから進めてください。')
  //   }
  // }

  // changeEditModel(event) {
  //   this.edit_model = event.checked
  // }
  // 会計対象テーブル選択
  selectSeat(event) {
    // クリア実施
    this.clearCounter(null);

    const dialog = this.dialog.open(SeatListComponent, {
      width: "650px",
      data: {
        multiSelecte: true,
        selected: [],
        using: true,
      },
    });
    dialog.afterClosed().subscribe((result) => {
      this.select_seats = [];
      this.select_ids = [];
      if (!Util.isEmpty(result)) {
        result.forEach((seat: Seat) => {
          this.select_seats.push(seat.seat_no + "." + seat.name);
          this.select_ids.push(seat.id);
        });
        this.clearCounter();
        this.getCounterDetail();
      }
    });
  }

  processTax(array) {
    let noTax = 0;
    let taxIn = 0;
    let count = 0;
    let takeout = 0;
    array.forEach((element: CounterDetailOrder) => {
      count +=
        (this.counterSrv.isPriceFree(element) ? 0 : element.price) *
        element.count;
      const price = this.counterSrv.countPrice(element);
      if (Util.isEmpty(element.is_takeout) || element.is_takeout == false) {
        noTax += price;
      } else {
        takeout += price;
      }
      taxIn += this.counterSrv.countPriceTaxIn(element);
    });
    return {
      count: count,
      no_tax: noTax,
      takeout: takeout,
      tax_in: taxIn,
      total:
        this.counterSrv.tax_value(noTax, this.app.Fax) +
        noTax +
        this.counterSrv.tax_value(takeout, this.app.TakeoutFax) +
        takeout +
        taxIn,
    };
  }

  // 画面支払タイプなど、変更場合、再計算
  countDetails() {
    let count = 0;
    let balance = 0;
    let result;
    switch (this.payType) {
      case "pay":
        result = this.processTax(this.orders_detail);
        this.orderDetailTotal = result["count"];
        this.orderDetailTotalTaxIn = result["total"];
        break;
      case "split":
        result = this.processTax(this.split_detail);
        this.splitTotalTaxIn = result["total"];
        this.splitTotal = result["count"];

        // 残額
        result = this.processTax(this.orders_detail);
        this.orderDetailTotalTaxIn = result["total"];
        this.orderDetailTotal = result["count"];
        break;
      case "average":
        result = this.processTax(this.orders_detail);
        this.orderDetailTotal = result["count"];

        // 残額
        balance = count;
        this.average_detail.forEach((element) => {
          balance -= element.price;
        });
        this.moneyBalance = balance;

        break;
      case "input":
        this.orders_detail.forEach((element: CounterDetailOrder) => {
          let price = 0;
          if (!this.counterSrv.isPriceFree(element)) {
            if (element.tax_in) {
              price = element.price;
            } else {
              price = this.counterSrv.tax(element.price);
            }
          }
          count += price * element.count;
          // count += (this.counterSrv.isPriceFree(element) ? 0 : element.price) * element.count;
        });
        this.orderDetailTotal = count;

        // 残額
        balance = count;
        this.input_detail.forEach((element) => {
          balance -= element.price;
        });
        this.moneyBalance = balance;
        break;
    }
    this.counterPanel.clearPay();
  }

  processCountTotal(array) {
    let count = 0;
    let takeout = 0;
    let countTaxIn = 0;
    const details = [];
    array.forEach((element: CounterDetailOrder) => {
      const menu_price_count = this.counterSrv.countPrice(element);
      if (Util.isEmpty(element.is_takeout) || element.is_takeout == false) {
        count += menu_price_count;
      } else {
        takeout += menu_price_count;
      }
      countTaxIn += this.counterSrv.countPriceTaxIn(element);

      if (!this.counterSrv.isPriceFree(element)) {
        details.push(element);
      }
    });
    return {
      details: details,
      countTaxIn: countTaxIn,
      count: count,
      takeout: takeout,
    };
  }
  // 画面支払タイプなど、変更場合、再計算
  countTotal(price?: number) {
    let count = 0;
    let takeout = 0;
    let countTaxIn = 0;
    let details = [];
    let result;
    switch (this.payType) {
      case "pay":
        result = this.processCountTotal(this.orders_detail);
        details = result["details"];
        countTaxIn = result["countTaxIn"];
        count = result["count"];
        takeout = result["takeout"];
        this.moneyTotal = count + takeout;
        break;
      case "split":
        result = this.processCountTotal(this.split_detail);
        details = result["details"];
        countTaxIn = result["countTaxIn"];
        count = result["count"];
        takeout = result["takeout"];
        this.moneyTotal = count + takeout;
        break;
      case "average":
        this.moneyTotal = price;
        break;
      case "input":
        countTaxIn = price;
        this.moneyTotal = 0;
        break;
    }
    this.edit_model = false;
    this.counterPanel.startPay(count, takeout, countTaxIn, details);
  }

  // ########################## 履歴画面より、削除、再編集など処理 ##########################
  openCounterSearch() {
    const dialog = this.dialog.open(CounterSearchComponent, {
      width: "90%",
      height: "70%",
    });
    dialog.afterClosed().subscribe((result) => {});
  }

  // 会計履歴
  openHistory(counterId?, detailId?) {
    const data = {};
    if (!Util.isEmpty(counterId)) {
      data["counter_id"] = counterId;
    }

    if (!Util.isEmpty(detailId)) {
      data["detail_id"] = detailId;
    }

    const dialog = this.dialog.open(CounterDetailsComponent, {
      width: "100%",
      height: "70%",
      data: data, //: 13
    });
    dialog.afterClosed().subscribe((result) => {
      if (result) {
        this.afterCounter(
          result["action"],
          result["counter"],
          result["detail"]
        );
      }
    });
  }

  onAction(event) {
    // if (event === 'detail') {
    //   // 明細開く場合
    //   this.openHistory(this.counterId);

    //   return;
    // }

    if (event === "cancel") {
      this.actionCancel(this.counterId);
      // 一括取消の場合
      return;
    }
  }

  // 履歴（明細）から処理する場合
  afterCounter(action: string, counter: Counter, detail?: CounterDetail) {
    if (action === "edit") {
      this.actionEdit(counter);
      return;
    }

    if (action === "cancel") {
      this.actionCancel(counter.id, detail ? detail["id"] : undefined);
      return;
    }

    if (action === "delete") {
      this.actionDelete(counter);
      return;
    }

    if (action === "reset") {
      this.actionRest(counter);
      return;
    }
  }

  actionEdit(counter: Counter) {
    this.clearCounter();

    // 会計ID
    this.counterId = counter.id;

    // 会計明細（キャンセル以外の有効データ入れる）
    counter.details.forEach((detail) => {
      if (!detail.canceled) {
        this.counter_detail.push(detail);
      }
    });

    if (counter.is_split) {
      this.payType = "split";
    } else if (counter.is_average) {
      let detail: CounterDetail;
      const values = this.getAverageValue(counter.total_price, counter.number);
      let average = values[0];
      let last = values[1];
      // 明細のキャンセル
      let findLast = false; // 違う金額データが履歴にあるかどうか調べる
      for (let index = 0; index < counter.number; index++) {
        if (this.counter_detail[index]) {
          detail = this.counter_detail[index];
          let price = average;
          if (detail.total === last) {
            findLast = true;
            price = last;
          }
          this.average_detail.push({
            no: index + 1,
            price: price,
            status: true,
            detail_id: detail.id,
          });
        } else {
          this.average_detail.push({
            no: index + 1,
            price: average,
            status: false,
            detail_id: -1,
          });
        }
      }

      if (!findLast) {
        this.average_detail[counter.number - 1].price = last;
      }
      this.payType = "average";
    } else if (counter.is_input) {
      this.counter_detail.forEach((detail: CounterDetail) => {
        this.input_detail.push({
          no: this.input_detail.length + 1,
          // price: detail.total,
          price: detail.amounts_actually,
          status: true,
          detail_id: detail.id,
        });
      });

      this.payType = "input";
    } else {
      this.payType = "pay";
    }

    this.getCounterDetailfromHistory(this.counterId);
  }

  actionCancel(counterId, detailId?) {
    const params = { counter_id: counterId };
    if (detailId) {
      // 明細ID指定しない場合、一括取消
      params["detail_id"] = detailId;
    }
    this.jsonSrv
      .post("restaurant/counter/cancel/", params)
      .subscribe((response?: Counter) => {
        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          this.cmp.pop("取消しましたｌ");

          if (this.counterId >= 0 && this.counterId === response[0].id) {
            // 成功且つ現在編集中の場合、再ロードする
            this.actionEdit(response);
          }
        }
      });
  }

  actionDelete(counter: Counter) {
    const params = { counter_id: counter.id };
    this.jsonSrv
      .post("restaurant/counter/delete/", params)
      .subscribe((response?: Counter) => {
        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          this.cmp.pop("削除しました");

          if (this.counterId >= 0 && this.counterId === response[0].id) {
            // 成功且つ現在編集中の場合、クリアする
            this.clearCounter();
          }
        }
      });
  }

  actionRest(counter: Counter) {
    const params = { counter_id: counter.id };
    this.jsonSrv
      .post("restaurant/counter/reset/", params)
      .subscribe((response?: Counter) => {
        if (!Util.isEmpty(response)) {
          this.cmp.pop("回復しました");
        }
      });
  }

  // 支払押下
  clickPay() {
    const over = this.orders_detail.findIndex((item: CounterDetailOrder) => {
      // 会計対象外のデータ存在しないなら、完了とする
      return !item.is_ready;
    });

    if (over >= 0) {
      const dialog = this.cmp.confirm(
        "未完了のメニュー存在しており、会計しますか？"
      );
      dialog.afterClosed().subscribe((result) => {
        if (result === "yes") {
          this.countTotal();
        }
      });
    } else {
      this.countTotal();
    }
  }

  // ########################## 支払種別 変更処理 ##########################
  payTypeChange(event, payType = null) {
    if (payType == null) {
      payType = this.payType;
    }
    if (this.counterId < 0) {
      // 明細再取得
      this.clearCounter();
      this.payType = payType;
      this.payTypeTitle = this.arrPayTypeTitle[payType];
      this.getCounterDetail();
    } else {
      this.payType = payType;
      this.payTypeTitle = this.arrPayTypeTitle[payType];
      this.getCounterDetailfromHistory(this.counterId);
    }
  }

  // ########################## パネルの削除、戻る処理 ##########################
  onOrdersDetailPanelChange(event) {
    // ★★★★★ 編集の前提として、会計明細は1件もないこと
    // console.log(this.orders_detail);
    switch (this.payType) {
      case "pay": {
        this.countDetails();
        break;
      }
      case "split": {
        this.countDetails();
        break;
      }
      case "average": {
        this.clearAverage();
        break;
      }
      case "input": {
        this.clearInput();
        break;
      }
    }
  }

  onSplited(event: CounterDetailOrder) {
    const index = this.orders_detail.findIndex((data: CounterDetailOrder) => {
      return data.detail_id === event.detail_id;
    });

    if (index >= 0) {
      let detail: CounterDetailOrder = this.orders_detail.splice(index, 1)[0];
      for (let i = 0; i < detail.count; i++) {
        let data: CounterDetailOrder = Util.copy(detail);
        data.count = 1;
        data.is_split = true;
        this.orders_detail.push(data);
      }
    }

    this.counterOrdersDetailPanel.renderRows();
    this.counterSplitPanel.renderRows();
    this.countDetails();
  }

  onCompleted(event: CounterDetailOrder) {
    console.log(event);
    this.countDetails();

    //   const params = {
    //     detail_id: event.detail_id,
    //     detail_status_id: event.detail_status_id,
    //     current_status_code: event.status_code,
    //     next_status_code: 999
    //   };

    //   this.jsonSrv.post('restaurant/kitchen/goto_next/', params).subscribe((response: JsonResult) => {

    //     if (Util.isEmpty(response))
    //       return;

    //     if (!Util.isEmpty(response.message)) {
    //       this.cmp.pop(response['message'])

    //   });
    // }
  }
  // ########################## 分割処理 ##########################

  clearSplit() {
    while (this.split_detail.length > 0) {
      const detail = this.split_detail.pop();
      this.orders_detail.push(detail);
    }
    if (this.split_detail.length > 0) {
      this.split_detail = [];
    }
    this.counterOrdersDetailPanel.renderRows();
    this.counterSplitPanel.renderRows();
  }

  onGoup(detail: CounterDetailOrder) {
    const index = this.split_detail.findIndex((data: CounterDetailOrder) => {
      return data.detail_id === detail.detail_id;
    });
    if (index >= 0) {
      const delArray = this.split_detail.splice(index, 1);
      this.orders_detail.push(delArray[0]);
    }
    this.counterOrdersDetailPanel.renderRows();
    this.counterSplitPanel.renderRows();
    this.countDetails();
  }

  onGodown(detail: CounterDetailOrder) {
    const index = this.orders_detail.findIndex((data: CounterDetailOrder) => {
      return data.detail_id === detail.detail_id;
    });
    if (index >= 0) {
      const delArray = this.orders_detail.splice(index, 1);
      this.split_detail.push(delArray[0]);
    }
    this.counterOrdersDetailPanel.renderRows();
    this.counterSplitPanel.renderRows();
    this.countDetails();
  }

  // ########################## 平均分割処理 ##########################
  onReduce() {
    this.countAveragePrice(this.average_detail.length - 1);
  }

  onPlus() {
    this.countAveragePrice(this.average_detail.length + 1);
  }

  countAveragePrice(count) {
    this.average_detail = [];

    let details_total = 0;
    this.orders_detail.forEach((element: CounterDetailOrder) => {
      details_total += this.counterSrv.isPriceFree(element) ? 0 : element.price;
    });

    const values = this.getAverageValue(details_total, count);
    let average = values[0];
    let last = values[1];

    for (let index = 0; index < count; index++) {
      this.average_detail.push({
        no: this.average_detail.length + 1,
        price: index === count - 1 ? last : average,
        status: false,
        detail_id: -1,
      });
    }
    this.countDetails();
  }

  getAverageValue(total, count) {
    let average = total / count;
    let last = 0;

    if (total % count === 0) {
      last = average;
    } else {
      last = Math.ceil(average);
      average = Math.floor(average);
    }

    return [average, last];
  }

  clearAverage() {
    this.average_detail = [];
    this.current_index = -1;
    this.countDetails();
  }

  onAveragePay(index) {
    this.countTotal(this.average_detail[index].price);
    this.current_index = index;
  }

  // ########################## 手動分割処理 ##########################
  onAddMember() {
    // this.countInputPrice(this.input_detail.length - 1)

    this.input_detail.push({
      no: this.input_detail.length + 1,
      price: this.moneyBalance,
      status: false,
      detail_id: -1,
    });
    this.countDetails();
  }

  onRemoveMember(index) {
    this.input_detail.splice(index, 1);
    this.countDetails();
  }

  onInputPay(index) {
    this.countTotal(this.input_detail[index].price);
    this.current_index = index;
  }

  openInputPrice(item, index) {
    const dialog = this.dialog.open(NumberInputComponent, {
      ariaDescribedBy: "_NumberInputComponent_",
      disableClose: false,
      width: "450px",
      data: { value: item.price },
    });
    dialog.afterClosed().subscribe((result) => {
      if (result !== item.price) {
        item.price = result;
        this.countDetails();
      }
    });
  }

  clearInput() {
    this.input_detail = [];
    this.current_index = -1;
    this.countDetails();
  }

  // ########################## 確定（支払いサーバ処理） ##########################

  // event => 金額計算用Model
  // money = {
  //   total: 0, //計算金額（税抜き
  //   price: 0, //支払金額（税込み
  //   pay: 0, // 預り
  //   cut: 0, // 割引
  //   reduce: 0 // 減額
  //   pay_method_id 支払方法
  // };
  onPay(event) {
    let params = {};
    params["counter_id"] = this.counterId;
    params["money"] = event;
    params["is_pay"] = false;
    params["is_split"] = false;
    params["is_average"] = false;
    params["is_input"] = false;

    // 完了判定
    let over = this.checkover();
    params["is_over"] = over;

    // //一回目であるか判定
    // let first = (Util.isEmpty(this.counterId) || this.counterId < 0);

    switch (this.payType) {
      case "pay": {
        params["is_pay"] = true;
        params["select_ids"] = this.select_ids;
        params["orders_detail"] = this.orders_detail;
        params["number"] = 0;
        break;
      }
      case "split": {
        params["is_split"] = true;
        params["split_detail"] = this.split_detail;
        params["select_ids"] = this.select_ids;
        params["orders_detail"] = this.orders_detail;
        params["number"] = 0;
        break;
      }
      case "average": {
        params["is_average"] = true;
        params["detail"] = this.average_detail[this.current_index];
        params["select_ids"] = this.select_ids;
        params["orders_detail"] = this.orders_detail;
        params["number"] = this.average_detail.length;
        break;
      }
      case "input": {
        params["is_input"] = true;
        params["detail"] = this.input_detail[this.current_index];
        params["select_ids"] = this.select_ids;
        params["orders_detail"] = this.orders_detail;
        params["number"] = this.input_detail.length;
        break;
      }
    }
    this.counterSrv.counter(params);
  }

  checkover() {
    let over = false;
    switch (this.payType) {
      case "pay":
        return true;
      case "split":
        over =
          this.orders_detail.findIndex((item) => {
            // 会計対象外のデータ存在しないなら、完了とする
            return !this.counterSrv.isPriceFree(item);
          }) < 0;
        return over;
      case "average": {
        const detail = this.average_detail[this.current_index];
        over =
          this.average_detail.findIndex((item) => {
            if (item === detail) {
              return false;
            }

            // 今回の支払以外で、未支払いデータ存在しているか
            return Util.isEmpty(item.counter_detail_id);
          }) < 0;
        return over;
      }
      case "input": {
        const detail = this.input_detail[this.current_index];

        // 完了判定
        // console.info(this.input_detail, detail);
        over =
          this.input_detail.findIndex((item) => {
            if (item === detail) {
              return false;
            }

            // 今回の支払以外で、未支払いデータ存在しているか
            return item.detail_id < 0;
          }) < 0;

        if (this.moneyBalance > 0 && over) {
          // 残額又存在している場合、
          over = false;
          this.cmp.pop("又未支払い分存在しています、ご確認してください！");
        }
        return over;
      }
    }
  }

  getTaxIn(element: CounterDetailOrder) {
    let countTaxIn = 0;
    let price = this.counterSrv.isPriceFree(element) ? 0 : element.price;
    if (element.tax_in) {
      countTaxIn = price * element.count;
    } else {
      countTaxIn = this.counterSrv.tax(price) * element.count;
    }
    return countTaxIn;
  }

  goto(link) {
    if (link === "seats") {
      this.router.navigate(["/seats"]);
    }
  }
}
