import { Component, OnInit, Inject } from '@angular/core';
import { MenuService } from '../../menu/menu.service';
import { CmpService } from '../../cmp/cmp.service';
import { AppService } from '../../app.service';
import { AuthenticationService, AuthenticatedEvent, Util, JsonService } from 'ami';
import { environment } from 'projects/restaurant/src/environments/environment';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { StaffService } from '../../staff/staff.service';

@Component({
  selector: 'restaurant-guest-qr',
  templateUrl: './guest-qr.component.html',
  styleUrls: ['./guest-qr.component.css']
})
export class GuestQRComponent implements OnInit {
  seat_id = null;
  selectedSeat;
  autoStartSeat = false;
  check_result = 0;

  authenticated;
  constructor(
    private cmp: CmpService,
    private authSrv: AuthenticationService,
    public appService: AppService,
    private route: ActivatedRoute,
    public staffSrv: StaffService,
    private jsonSrv: JsonService,
    public menuSrv: MenuService) {
    }

  ngOnInit() {
    localStorage.setItem("__full_model__", 'false');
    Util.setSaasID(this.route.snapshot.params['sid'].trim());
    if (!Util.getSaasID()) {
      const sid = this.route.snapshot.params['sid'];
      const seat = this.route.snapshot.params['seat'];
      const sign = this.route.snapshot.params['sign'];
      if ( Util.isEmpty(sid) || Util.isEmpty(seat) || Util.isEmpty(sign) ) {
        this.cmp.confirm2('システムエラー、コードをもう一度スキャンしてください。');
        return;
      } else {
        location.href = '/?s=' + sid + '&seat=' + seat + '&sign=' + sign;
      }
    }
    
    this.seat_id = this.route.snapshot.params['seat'];
    if( this.checkSign() ) {
      this.authenticated = this.authSrv.Authenticated$.subscribe((event: AuthenticatedEvent) => {
        if (event.result === true) {
          if ( this.staffSrv.menuMasterGroup.length===0 ) {
            this.staffSrv.getMenuData();
          }
          this.getSeatList();
        } else {
          location.reload();
        }
        this.authenticated.unsubscribe();
      });
      if ( !this.authSrv.Authenticated ) {
        this.authSrv.authenticate(environment.guest_login_info);
      }
      
    }
  }

  canQrCode() {
    if ( !this.checkSign() ) {
      return false;
    }
    return this.appService.canQrCode();
  }

  checkSign() {
    const saas_id = Util.getSaasID();
    if (this.check_result===0) {
      if (this.route.snapshot.params['sign']==this.to36code(saas_id + this.seat_id)) {
        this.check_result = 1;
      } else {
        this.check_result = -1;
      }
    }
    return this.check_result>0;
  }

  to36code(signstr) {
    const l = 'd9sqbr6jmcehgwx1t8kni7puf24oa503ylvz';
    let code = 0;
    // tslint:disable-next-line: forin
    for (const i in signstr) {
      code += (parseInt(signstr[i].charCodeAt()) * Math.pow(parseInt(i)+1, 2))
    }
    // console.info(code)
    let sign = '';
    while (true) {
      const m = code % 36;
      sign = sign + l[m];
      code = Math.floor(code / 36);
      if ( code < 36 ) {
        sign = sign + l[code];
        break;
      }
    }
    return sign;
  }

  getSeatList() {
    const condition = {
        seat_group: [],
        seat_type: [],
        seat_smoke_type: [],
        seat_number: [],
        seat_usable: '0',
        takeout_type: 0
      };
    this.jsonSrv.post('restaurant/seat_list/', condition ).subscribe((response?: any) => {
      if (!Util.isEmpty(response['data']) && response['data'][0]) {
          for( var i in response['data'] ) {
            if (response['data'][i].id == this.seat_id ) {
              this.selectedSeat = response['data'][i];
              break;
            }
          }
      }
    });
  }



}
