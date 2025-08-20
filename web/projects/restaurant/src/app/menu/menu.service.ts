import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Menu, Menufree, MasterGroup, CategoryChangedEvent, GroupChange, Master } from './menu.interface';
import { CmpService } from '../cmp/cmp.service';
import { Util } from 'ami';
import { JsonService } from 'ami';
import { Order } from '../order/order.interface';
import { AppService } from '../app.service';
import { MenuKosuComponent } from './menu-kosu/menu-kosu.component';
import { MatDialog } from '@angular/material';


/**
 *
*/
@Injectable({
    providedIn: 'root'
})
export class MenuService {

    lang;

    // 注文用セキュリティーキー
    public security_key = '';

    // すべてのメニューデータ
    public orign_menus = null;

    public theme_list = ['menu-top', 'menu-top2', 'default', 'kosu', 'double', 'third', 'twocolumn'];
    public show_order_theme_list = ['default', 'kosu', 'double', 'third', 'twocolumn'];
    public show_ranking_theme_list = [];
    public disabled_tab_theme_list = ['menu-top', 'menu-top2'];
    public currentGroup: GroupChange
    // Toolbar 表示内容変更
    private orderSource = new Subject<OrderEvent>();
    order$ = this.orderSource.asObservable();

    // 注文が返事ができる
    private afterOrderSource = new Subject<boolean>();
    afterOrder$ = this.afterOrderSource.asObservable();
    // 放題メニュー注文が返事ができる
    private afterMenufreeOrderSource = new Subject<boolean>();
    afterMenufreeOrder$ = this.afterMenufreeOrderSource.asObservable();


    private showPanelSource = new Subject<boolean>();
    showPanel$ = this.showPanelSource.asObservable();

    // メニューの表示内容が変化する際に発火する
    private viewChangedSource = new Subject<ViewChangedEvent>();
    viewChanged$ = this.viewChangedSource.asObservable();

    // themeが変化する際に発火する
    private themeChangedSource = new Subject<String>();
    themeChanged$ = this.themeChangedSource.asObservable();


    // themeが変化する際に発火する
    private menuChangedSource = new Subject<String>();
    menuChanged$ = this.menuChangedSource.asObservable();



    // グループが変化する際に発火する
    private groupChangedSource = new Subject<GroupChange>();
    groupChanged$ = this.groupChangedSource.asObservable();

    // categoryが変化する際に発火する
    private categoryChangedSource = new Subject<CategoryChangedEvent>();
    categoryChanged$ = this.categoryChangedSource.asObservable();

    constructor(
        private jsonSrv: JsonService,
        public appService: AppService,
        private dialog: MatDialog,
        private cmp: CmpService
        // private authSrv: AuthenticationService
    ) {
        this.getMenuList();

        this.appService.languageChanged$.subscribe((lang: String) => {
            this.lang = lang;
        });
    }

    language(value: string) {
        this.appService.language(value);
    }

    getMenuList() {
        if (Util.isEmpty(this.orign_menus)) {
            this.orign_menus = {};
            // すべてのメニューデータ取得
            this.jsonSrv.get('restaurant/menu/menu_list/', {}).subscribe((response?: Array<Menu>) => {
                let array = [];
                if (!Util.isEmpty(response) && response[0]) {
                    response.forEach((menu: Menu) => {
                        menu.is_free = false;
                        this.orign_menus[menu.id] = menu;
                    });
                }
            });
        }
        return this.orign_menus;
    }

    // 注文管理画面で、注文の席修正で呼び出し
    changeOrderSeat(order: Order) {
        //TODO: サーバ側処理完了後、Websocket通知が必要です。

        //console.log('changeOrderSeat', order);
    }

    // 注文送信
    sendOrder(orders: Array<OrderEvent>) {
        // console.log(orders)
        const data = [];
        orders.forEach((order) => {
            if (order.count > 0) {
                data.push({
                    count: order.count,
                    free: order.menu.is_free,
                    menu: order.menu
                });
            }
        });
        const params = {
            'orders': data,
            'key': this.security_key
        };

        this.jsonSrv.post('restaurant/order/order/', params).subscribe((response?) => {

            if (response && response['message']) {
                this.cmp.confirm2(response['message']);
            // } else if(!Util.isEmpty(response['status']) && response['status']==500) {
            //     window.location.reload();
            }

            this.afterOrderSource.next(!Util.isEmpty(response) && response['result'] === true);
        });

    }

    // 注文送信
    sendOrderBar(orders: Array<OrderEvent>) {
        const data = [];
        orders.forEach((order) => {
            if (order.count > 0) {
                data.push({
                    count: order.count,
                    free: order.menu.is_free,
                    menu: order.menu
                });
            }
        });
        const params = {
            'orders': data,
            'key': this.security_key
        };

        this.jsonSrv.post('restaurant/order/order/', params).subscribe((response?) => {
            if (response && response['message']) {
                this.cmp.confirm2(response['message']);
            }
        });

    }

    sendOrderByMenuId(menu_id, count) {
        const list = [];
        list.push({
            count: count,
            menu: this.orign_menus[menu_id]
        });
        this.sendOrder(list);
    }

    sendMenufreeOrder(menufree: Menufree) {
        const data = {};
        const params = {
            'menu_id': menufree.menu,
            'menu_free_id': menufree.id,
            'count': menufree.count,
            'key': this.security_key
        };

        this.jsonSrv.post('restaurant/order/order_menufree/', params).subscribe((response?) => {
            if (response && response['message']) {
                this.cmp.pop(response['message']);
            }

            this.afterMenufreeOrderSource.next(!Util.isEmpty(response) && response['result'] === true);
        });
    }

    callStaff() { }

    // 注文追加（リストへ追加する）
    addOrder(menu, count?, isFromOrderButton?) {
        if (Util.isEmpty(this.security_key)) {
            this.cmp.pop(this.language('該当テーブル現在利用でいまません、確かめてください！'));
            return;
        }

        this.orderSource.next({
            menu: menu,
            isFromOrderButton: isFromOrderButton,
            count: count || menu.mincount
        });
    }


    showPanel(shown: boolean) {
        this.showPanelSource.next(shown);
    }

    viewChanged(event: ViewChangedEvent) {
        this.viewChangedSource.next(event);
    }

    themeChanged(theme_id: string) {
        this.themeChangedSource.next(theme_id);
    }


    menuChanged(menu: string) {
        this.menuChangedSource.next(menu);
    }
    menuChangeToHistory() {
        this.menuChanged('history');
    }


    // startOrderConfirmSocket(seat_id) {
    //     var me = this;
    //     // if (this.orderConfirmSocket) {
    //     //     this.orderConfirmSocket.close();
    //     // }
    //     let orderConfirmSocket = new WebSocket(
    //         'wss://' + environment.socket_ip +
    //         '/ws/orderconfirm/' + seat_id + '/');

    //     orderConfirmSocket.onmessage = ((result) => {
    //         if (result && result['data']) {
    //             const data = Util.decode(result['data']);
    //             me.orderConfirmSuccessSource.next(data);
    //         }
    //         orderConfirmSocket.close();
    //     });

    //     orderConfirmSocket.onclose = ((e) => {
    //         // console.error('Chat socket closed unexpectedly');
    //     });
    // }

    changeGroup(group: GroupChange) {
        this.groupChangedSource.next(group);
        this.currentGroup = group
    }

    changeCategory(category: CategoryChangedEvent) {
        this.categoryChangedSource.next(category);
    }

}

export interface ViewChangedEvent {
    current_page: number;
    view_data: Array<Menu>;
    max_page: number;
    category: Master;
}


export interface OrderEvent {
    menu: Menu;
    count: number;
    isFromOrderButton: boolean;
}