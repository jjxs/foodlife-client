import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HomeService } from '../../home/home.service';
import { Util, AuthenticationService } from 'ami';
import { environment } from 'projects/restaurant/src/environments/environment';

@Component({
  selector: 'restaurant-monitor',
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.css']
})
export class MonitorComponent implements OnInit, OnDestroy {


  faxprice = 0;
  price = 0;
  pay = 0;
  change = 0;

  isOver = false;

  connecting: WebSocket;
  isConnecting = false;
  retry = true;

  constructor(
    private router: Router,
    private authSrv: AuthenticationService,
    private homeSrv: HomeService) {

  }

  ngOnInit() {
    this.retry = true;
    this.homeSrv.showHeader(false);
    this.startWebsocket();
  }

  ngOnDestroy() {
    this.connecting.close();
    this.retry = false;
  }

  startWebsocket() {
    if ( this.isConnecting ) {
      return;
    }
    this.isConnecting = true;
    let ws_host = environment.socket_ip;
    ws_host = ws_host.replace('{{saas}}', Util.getSaasID());
    this.connecting = new WebSocket(
      'wss://' + ws_host +
      '/ws/counter/');

    this.connecting.onmessage = ((result) => {
      if (!Util.isEmpty(result) && !Util.isEmpty(result['data'])) {
        // console.log(result["data"]);
        const data = Util.decode(result["data"]);
        // console.log(data);
        if (data.type === 'pay') {
          this.onPay(data);
        }

        if (data.type === 'over') {
          this.onOver();
        }

        if (data.type === 'clear') {
          this.onClear();
        }

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

  onPay(data) {
    this.isOver = false;
    this.faxprice = data['faxprice'];
    this.price = data['price'];
    this.pay = data['pay'];
    this.change = data['change'];
  }

  onClear() {
    this.isOver = false;
    this.faxprice = 0;
    this.price = 0;
    this.pay = 0;
    this.change = 0;
  }

  onOver() {

    this.isOver = true;
  }

  goSettings() {
    this.homeSrv.showHeader(true);
    this.router.navigate(['/settings', {}]);
    localStorage.setItem('__top_url__', 'settings');
  }
}
