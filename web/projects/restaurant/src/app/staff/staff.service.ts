import { JsonService, Util, AuthenticationService } from "ami";
// import { Subject } from "rxjs";
import { environment } from '../../environments/environment';
import { Injectable } from "@angular/core";
import { NavigationEnd, Router, NavigationStart } from "@angular/router";
import { CallingSeat, StaffMenu } from "./staff.interface";
import { CmpService } from "../cmp/cmp.service";
import { MenuCategory, MasterGroup } from "../menu/menu.interface";
import { Subject, forkJoin } from "rxjs"
import { MenuService, OrderEvent } from "../menu/menu.service";

@Injectable({
    providedIn: 'root'
})
export class StaffService {

    connecting: WebSocket;
    seats: Array<CallingSeat> = [];
    activeButton = "top";
    audio: any;
    isShowFooter = true;

    carts = [];
    playList = [
        "001.mp3",
        "123我爱你.mp3",
        "C哩C哩舞Panama.mp3",
        "Despacito.mp3",
        "iPhone铃声.mp3",
        "New York City.mp3",
        "No Excuses.mp3",
        "Something Just Like This.mp3",
        "The Edge of Glory.mp3",
        "刚好遇见你.mp3",
        "带你去旅行.mp3",
        "我们不一样.mp3",
        "海草舞.mp3",
        "空空如也.mp3",
        "英文来电.mp3",
        "起风了.mp3",
        "追光者.mp3",
        "Ring_Classic_02.ogg"
    ]

    // 店員呼び出し
    private callSource = new Subject<any>();
    call$ = this.callSource.asObservable();

    constructor(
        private cmp: CmpService,
        private router: Router,
        private menuSrv: MenuService,
        private jsonSrv: JsonService,
        private authSrv: AuthenticationService
    ) {
        // Router　変更時
        this.router.events.subscribe((val) => {
            if (val instanceof NavigationEnd) {
                switch (val.url) {
                    case "/staff":
                    case "/staff/top":
                        this.activeButton = "top";
                        break;
                    case "/staff/menu":
                        this.activeButton = "menu";
                        break;
                    case "/staff/order":
                        this.activeButton = "order";
                        break;
                    case "/staff/counter":
                        this.activeButton = "counter";
                        break;
                    case "/staff/setting":
                        this.activeButton = "setting";
                        break;
                }
            }

            if (val instanceof NavigationStart) {
                this.stop();
            }
        });

        // アラーム音初期化
        if (!Util.isEmpty(this.PlayItem)) {
            //this.cmp.pop(this.PlayItem);
            this.audio = new Audio('/assets/audio/' + this.PlayItem);
            this.audio.load();
        }

        this.getMenuData();
    }

    // ################################ メニューデータ取得#################
    public menuMasterGroup = new Array<MasterGroup>();
    public menuData = new Array<MenuCategory>();
    public categoryMenus = {};
    public noMenus = {}; //管理用、各部分でメニューデータを利用するため、共通のオブジェクトにまとめ
    getMenuData(force=false) {

        if (!Util.isEmptyArray(this.menuData) && !force) {
            return;
        }
        this.menuMasterGroup = new Array<MasterGroup>();
        this.menuData = new Array<MenuCategory>();
        this.categoryMenus = {};
        this.noMenus = {};
        // this.cmp.loading("データ読み取り中......");

        // メニュー大分類取得
        let get1 = this.jsonSrv.get('master/master/?domain__in=menu_category', {});

        // メニューカテゴリー取得
        let get2 = this.jsonSrv.get('restaurant/menu/menucategory/');

        forkJoin([get1, get2])
            .subscribe((results: Array<any>) => {
                this.menuMasterGroup = results[0];
                this.menuData = results[1];
                // console.log("メニューカテゴリー取得", this.menuMasterGroup);
                // console.log("メニューカテゴリー取得", this.menuData);

                this.createMenuList();

                // this.cmp.unloading();
            });
    }


    createMenuList() {
        this.categoryMenus = {};
        this.noMenus = {};
        this.menuData.forEach((data: MenuCategory) => {

            if (Util.isEmpty(this.categoryMenus[data.category]))
                this.categoryMenus[data.category] = [];

            if (Util.isEmpty(this.noMenus[data.menu_no])) {
                this.noMenus[data.menu_no] = new StaffMenu(data);
            }

            this.categoryMenus[data.category].push(this.noMenus[data.menu_no]);
        });

        //console.log("categoryMenus", this.categoryMenus);

    }

    setMenuFreeData(ids: Array<number>) {
        const keys = Object.keys(this.noMenus);
        keys.forEach((no) => {
            const menu: StaffMenu = this.noMenus[no];
            menu.is_free = ids.indexOf(menu.id) >= 0;
        });
        //console.log("this.noMenus", ids, this.noMenus);
    }

    clearOrderEventArray() {
        const keys = Object.keys(this.noMenus);
        keys.forEach((no) => {
            this.noMenus[no].count = 0;
        });
        this.carts = [];
    }

    getOrderEventArray(): Array<OrderEvent> {
        let array = new Array<OrderEvent>();
        this.carts.forEach((menu: StaffMenu) => {
            if (menu.count > 0) {
                if (menu.menu_options==undefined) {
                    menu.menu_options = [];
                }
                // コースの場合
                if (menu.level == 1) {
                    menu.course.map(item => {item["selected"] = true})
                }
                array.push({
                    menu: {
                        id: menu.id,
                        name: menu.name,
                        no: menu.no,
                        price: menu.price,
                        ori_price: 0,
                        tax_in: menu.tax_in,
                        stock_status: null,
                        usable: null,
                        image: menu.image,
                        note: menu.note,
                        introduction: menu.introduction,
                        is_free: menu.is_free,
                        menu_options: menu.menu_options,
                        course: menu.course,
                        option: {},
                        level: menu.level,
                    },
                    count: menu.count,
                    isFromOrderButton: false,
                });
            }
        });
        //console.log("getOrderEventArray", array)
        // export interface OrderEvent {
        //     menu: Menu;
        //     count: number;
        // }

        // export interface Menu {
        //     //model id
        //     id: number;
        //     name: string;
        //     no: number;
        //     price: string;
        //     stock_status: number;
        //     usable: boolean;

        //     //extend item
        //     is_free: boolean;
        // }

        return array;
    }

    // ################################ 監視開始#################
    startWebsocket() {
        let ws_host = environment.socket_ip;
        ws_host = ws_host.replace('{{saas}}', Util.getSaasID());
        this.connecting = new WebSocket(
            'wss://' + ws_host +
            '/ws/staff/');

        this.connecting.onmessage = ((result) => {

            //console.log("[data]", result);
            if (!Util.isEmpty(result) && !Util.isEmpty(result["data"])) {

                const data = Util.decode(result["data"]);

                if (data.type === "call") {
                    this.appendSeat(data);
                    this.callSource.next(data);
                }

                if (data.type === "end_call") {
                    this.removeSeatById(data.id);
                }

            }
        });

        this.connecting.onclose = ((e) => {
            console.error('Chat socket closed unexpectedly');
        });

    }

    //seat_using_stop
    restartWebsocket(seatId) {
        try {
            this.connecting.close();
        } catch  {

        }
        this.startWebsocket();
    }


    // ################################ Top画面　#################
    appendSeat(data: CallingSeat) {
        const index = this.seats.findIndex((seat: CallingSeat) => {
            return seat.id === data.id;
        });

        if (index < 0) {
            data.count = 1
            this.seats.push(data);
            this.play();
        } else {
            this.seats[index].count += 1;
        }
    }

    removeSeat(index) {
        this.seats.splice(index, 1);
    }

    removeSeatById(id) {
        const index = this.seats.findIndex((seat: CallingSeat) => {
            return seat.id === id;
        });
        if (index < 0) {
            return;
        }
        this.removeSeat(index);
        this.stop();
    }

    removeAllSeat() {
        this.seats = [];
    }

    // ################################ 音楽共通　#################
    setPlayItem(name) {
        localStorage.setItem("__audio_file__", name);
        this.audio = new Audio('/assets/audio/' + name);
        this.audio.load();
    }

    get PlayItem(): String {
        const item = localStorage.getItem("__audio_file__");
        if (Util.isEmpty(item)) {
            return undefined;
        }
        return item;
    }

    play() {

        if (Util.isEmpty(this.audio))
            return;
        this.audio.play();
    }

    stop() {
        if (Util.isEmpty(this.audio))
            return;

        this.audio.pause();
        this.audio.currentTime = 0;
    }

    showFooter(isShow) {
        const me = this;
        setTimeout(() => {
            me.isShowFooter = isShow;
        }, 200);
    }

}

