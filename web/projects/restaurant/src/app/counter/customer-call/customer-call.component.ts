import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { HomeService } from "../../home/home.service";
import { Util, AuthenticationService } from "ami";
import {
  trigger,
  state,
  style,
  animate,
  transition,
  group,
} from "@angular/animations";
import { environment } from "projects/restaurant/src/environments/environment";

@Component({
  selector: "restaurant-customer-call",
  templateUrl: "./customer-call.component.html",
  styleUrls: ["./customer-call.component.css"],
  animations: [
    trigger("flyInOut", [
      state(
        "in",
        style({
          width: "*",
          transform: "translateX(0)",
          opacity: 1,
        })
      ),
      transition(":enter", [
        style({ width: 10, transform: "translateX(100px)", opacity: 0 }),
        group([
          animate(
            "0.3s 0.1s ease",
            style({
              transform: "translateX(0)",
              width: "*",
            })
          ),
          animate(
            "0.3s ease",
            style({
              opacity: 1,
            })
          ),
        ]),
      ]),
      transition(":leave", [
        group([
          animate(
            "0.3s ease",
            style({
              // transform: "translateX(-100px)",
              width: 10,
            })
          ),
          animate(
            "0.3s 0.2s ease",
            style({
              width: 0,
              transform: "translateX(-100px)",
              opacity: 0,
            })
          ),
        ]),
      ]),
    ]),
  ],
})
export class CustomerCallComponent implements OnInit, OnDestroy {
  callList: any[] = [];
  seat_no: number;
  seat_name: string;
  callBoxDisplay: boolean = false;
  connecting: WebSocket;
  isConnecting = false;
  retry = true;

  constructor(
    private homeSrv: HomeService,
    private router: Router) {}

  ngOnInit() {
    this.callList = [];
    this.homeSrv.showHeader(false);
    this.retry = true;
    this.startWebsocket();
  }

  ngOnDestroy() {
    this.connecting.close();
    this.retry = false;
  }

  onCallClick() {
    this.callList = this.callList.filter(v=>v["seat_no"] !== this.seat_no)

    if (!this.callList.length){
      this.callBoxDisplay = false;
    }else {
      this.seat_no = this.callList[0]["seat_no"];
      this.seat_name = this.callList[0]["seat_name"];
    }
  }

  onItemClick(index: number){
    this.seat_no = this.callList[index]["seat_no"];
    this.seat_name = this.callList[index]["seat_name"];
  }

  add(seat: any) {
    if(this.callList.filter(v=>v["seat_no"]==seat["seat_no"]).length > 0)
      return
    this.playSound()
    this.callList.push(seat);
    this.seat_no = this.callList[0]["seat_no"];
    this.seat_name = this.callList[0]["seat_name"];
    this.callBoxDisplay = true;
  }

  startWebsocket() {
    if (this.isConnecting) {
      return;
    }
    this.isConnecting = true;
    let ws_host = environment.socket_ip;
    ws_host = ws_host.replace("{{saas}}", Util.getSaasID());
    this.connecting = new WebSocket("wss://" + ws_host + "/ws/staff/");

    this.connecting.onmessage = (result) => {
      if (!Util.isEmpty(result) && !Util.isEmpty(result["data"])) {
        const data = Util.decode(result["data"]);
        if (data.type === "call") {
          this.add(data);
          //
          
        }
      }
    };

    this.connecting.onclose = (e) => {
      console.error("Chat socket closed unexpectedly");
      this.isConnecting = false;
      const me = this;
      if (me.retry) {
        setTimeout(function () {
          me.startWebsocket();
        }, 10000);
      }
    };
  }

  goSettings() {
    this.homeSrv.showHeader(true);
    this.router.navigate(['/settings', {}]);
    localStorage.setItem('__top_url__', 'settings');
  }

  playSound(){
    const audio = new Audio('../../../assets/audio/Ring_Classic_02.ogg')
    audio.play()
  }

}
