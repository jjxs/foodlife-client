import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

import { JsonService } from '../http/json.service';
import { Util } from '../common/util';
import { resource } from 'selenium-webdriver/http';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  get IsDebug(): boolean {
    const model = localStorage.getItem('__debug_model__');
    if (Util.isEmpty(model)) {
      return false;
    }
    return model === 'true';
  }

  // ==>> SeatServiceに移動
  // get SeatId(): number {
  //   const id = localStorage.getItem('__seat_id__');
  //   if (Util.isEmpty(id)) {
  //     return undefined;
  //   }
  //   return parseInt(id, 10);
  // }

  get JwtToken(): string {
    return localStorage.getItem('JwtToken');
  }
  set JwtToken(token: string) {
    localStorage.setItem('JwtToken', token);
  }

  guest_no: number = -1;

  counter_no: string = '';

  nickname: string = '';

  role: string = '';
  role_name: string = '';
  isSuperuser = false;
  auth_menu = [];

  //　ニックネーム存在すると（メーニュー利用可能）テーブル選択とニックネーム設定すると注文可能
  public Usable: boolean = false;

  //　認証済み（ユーザID、パスワード存在する）予約可能
  public Authenticated: boolean = false;
  public showMenu: boolean = true;


  public UserName: string = '';

  constructor(
    private jsonSrv: JsonService
  ) { }

  /* ※※※※※※※※※※※※※ Login ※※※※※※※※※※※※※*/
  private loginSource = new Subject<LoginEvent>()
  login$ = this.loginSource.asObservable();
  login(data: LoginEvent) {
    this.loginSource.next(data);
  }
  private loginOutSource = new Subject<any>()
  loginOut$ = this.loginOutSource.asObservable();

  logout(event?) {
    localStorage.removeItem('JwtToken');
    this.Authenticated = false;
    this.showMenu = true;
    this.Usable = false;
    this.nickname = '';
    this.guest_no = -1;
    this.role = '';
    this.role_name = '';
    this.auth_menu = [];
    this.loginOutSource.next(event);
    this.isSuperuser = false;
  }

  /* ※※※※※※※※※※※※※ 認証 JwtToken検証(ログイン済み画面初期、またはログイン直後)※※※※※※※※※※※※※*/
  private initSuccessedSource = new Subject<InitResult>()
  initSuccessed$ = this.initSuccessedSource.asObservable();

  private initFailedSource = new Subject<any>()
  initFailed$ = this.initFailedSource.asObservable();

  init() {
    if (!Util.isEmpty(this.JwtToken)) {
      this.jsonSrv.get('master/init').subscribe((response) => {
        if (!Util.isEmpty(response['data']) && response['result'] === true) {
          this.nickname = response['data'].nickname;
          this.guest_no = response['data'].no;
          this.Authenticated = true;
          this.showMenu = true;
          if (response['data'].role) {
            this.isSuperuser = response['data'].role.is_superuser;
            this.role_name = response['data'].role.display_name;
            if (response['data'].role['guest']) {
              this.showMenu = false;
            }
          }
          if (response['data'].auth_menu) {
            this.auth_menu = response['data'].auth_menu;
          }
          this.initSuccessedSource.next(response['data']);
        } else {
          this.initFailedSource.next(null);
        }
      });
    } else {
      this.initFailedSource.next(null);
    }
  }

  isRole(role) {
    return role === this.role;
  }

  isShow(path) {
    if (this.isSuperuser) {
      return true;
    }
    const newstr1 = [];
    for (var i = 0; i < this.auth_menu.length; ++i) {
      newstr1[this.auth_menu[i].menu_path] = this.auth_menu[i].menu_path;
    }
    if (path in newstr1) {
      return true;
    } else {
      return false;
    }
  }

  connect() {
    this.jsonSrv.get('test/', {}).subscribe((response) => {
      this.connectSuccess();
    });
  }

  /* ※※※※※※※※※※※※※ 認証 Login※※※※※※※※※※※※※*/
  authenticate(params) {
    this.jsonSrv.post('login', params).subscribe((response) => {
      let result = new AuthenticatedEvent(false);
      if (!Util.isEmpty(response['token'])) {
        result.token = response['token'];
        result.result = true;
        this.Authenticated = true;
        this.showMenu = true;
        this.JwtToken = 'JWT ' + response['token'];
      }
      this.authenticated(result);
    });
  }

  /* ※※※※※※※※※※※※※ Login 後 ※※※※※※※※※※※※※*/
  private AuthenticatedSource = new Subject<AuthenticatedEvent>()
  Authenticated$ = this.AuthenticatedSource.asObservable();
  public authenticated(event: AuthenticatedEvent) {
    this.init();
    this.AuthenticatedSource.next(event);
  }

  /* ※※※※※※※※※※※※※ Quick in ※※※※※※※※※※※※※*/
  private scanSource = new Subject<ScanEvent>()
  scan$ = this.scanSource.asObservable();
  public scan(data: ScanEvent) {
    this.scanSource.next(data);
  }

  /* ※※※※※※※※※※※※※ Quick in 後 ※※※※※※※※※※※※※*/
  private scanAfterSource = new Subject<ScanAfterEvent>()
  scanAfter$ = this.scanAfterSource.asObservable();
  public scanAfter(data: ScanAfterEvent) {
    this.scanAfterSource.next(data);
  }

  /* ※※※※※※※※※※※※※ 通信エラー ※※※※※※※※※※※※※*/
  private connectErrorSource = new Subject<HttpErrorResponse>()
  connectError$ = this.connectErrorSource.asObservable();
  public connectError(error: HttpErrorResponse) {
    this.connectErrorSource.next(error);
  }

  /* ※※※※※※※※※※※※※ 通信正常 ※※※※※※※※※※※※※*/
  private connectSuccessSource = new Subject<any>()
  connectSuccess$ = this.connectSuccessSource.asObservable();
  public connectSuccess() {
    this.connectSuccessSource.next();
  }
}


export class LoginEvent {

}

export class AuthenticatedEvent {
  result = false;
  token = '';
  constructor(result) {
    this.result = result;
  }
}

export class ScanEvent {

}

export class ScanAfterEvent {

}

export class InitResult {
  no: number;
  nickname: string;
  is_temporary: boolean;
}