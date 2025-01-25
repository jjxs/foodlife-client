import { JsonService, Util, AuthenticationService } from 'ami';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Injectable, OnDestroy } from '@angular/core';
import { SeatStatus } from '../seats/seat.interface';
import { MenuService } from '../menu/menu.service';


@Injectable({
    providedIn: 'root'
})
export class SeatService implements OnDestroy {

    connecting: WebSocket;
    isConnecting = false;
    retry = true;

    //（Websocketイベント）　テーブル利用可能になる際に発火する
    private usableSource = new Subject<any>();
    usable$ = this.usableSource.asObservable();

    //（Websocketイベント）　テーブル利用可能になる際に発火する
    private unusableSource = new Subject<any>();
    unusable$ = this.unusableSource.asObservable();

    //（Websocketイベント）　食べ放題、など注文確認完了すす場合
    private afterMenufreeConfirmSource = new Subject<MenufreeConfirmResult>();
    afterMenufreeConfirm$ = this.afterMenufreeConfirmSource.asObservable();

    constructor(
        private jsonSrv: JsonService,
        private menuSrv: MenuService,
        private authSrv: AuthenticationService
    ) {
        this.retry = true;
    }

    ngOnDestroy() {
        this.retry = false;
    }

    removeSeatId() {
        localStorage.removeItem('__seat_id__');
    }

    setSeatId(seatId) {
        if (Util.isEmpty(seatId)) {
            this.removeSeatId();
            return;
        }

        localStorage.setItem('__seat_id__', seatId.toString());

        this.restartWebsocket(seatId);
    }

    get SeatId(): number {
        const id = localStorage.getItem('__seat_id__');
        if (Util.isEmpty(id)) {
            return undefined;
        }
        return parseInt(id, 10);
    }

    // 監視開始
    startWebsocket() {
        if ( this.isConnecting || !this.authSrv.Authenticated ) {
            return;
        }


        this.isConnecting = false;
        let ws_host = environment.socket_ip;
        ws_host = ws_host.replace('{{saas}}', Util.getSaasID());
        this.connecting = new WebSocket(
            'ws://' + ws_host +
            '/ws/seat/' + this.SeatId + '/');
        this.isConnecting = true;

        // reload secret key
        this.getSeatKey();

        this.connecting.onmessage = ((result) => {
            if (!Util.isEmpty(result) && !Util.isEmpty(result['data'])) {
                const data = Util.decode(result['data']);

                // 席利用可能にする場合
                if (data.type === 'seat_using_start') {
                    this.usableSource.next({});
                }

                // 席利用可能に中止となる場合
                if (data.type === 'seat_using_stop') {
                    this.unusableSource.next({});
                }

                // 放題メニュー確認完了
                if (data.type === 'freemenu_order_confirm') {
                    const result = new MenufreeConfirmResult();
                    result.list = data.freemenu_list;
                    result.result = data.result;
                    this.afterMenufreeConfirmSource.next(result);

                }
                // console.log(data);
                // console.log(data.freemenu_list);
            }
        });

        this.connecting.onclose = ((e) => {
            console.error('Chat socket closed unexpectedly');
            this.isConnecting = false;
            const me = this;
            if ( me.retry ) {
                setTimeout(function() {
                    me.startWebsocket();
                }, 10000);
            }
        });

    }

    getSeatKey() {
        // tslint:disable-next-line: deprecation
        this.jsonSrv.get('master/seatstatus/', { seat: this.SeatId }).subscribe((response?: Array<SeatStatus>) => {
            if (response && response[0]) {
              this.menuSrv.security_key = response[0].security_key;
            }
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


}

export class MenufreeConfirmResult {
    result: boolean;
    list: Array<number>;
}
