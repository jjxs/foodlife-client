import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Observable, Subscription } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { AppSettings } from '../settings';
import { Util } from '../utils/util';
import { JsonService } from '../http/json.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  // サブスクリプション
  subs = new Subscription();

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  get IsDebug(): boolean {
    const model = localStorage.getItem('__debug_model__');
    if (Util.isEmpty(model)) {
      return false;
    }
    return model === 'true';
  }


  //　認証済み（ユーザID、パスワード存在する）予約可能
  public is_authenticated: boolean = false;
  get IsAuthenticated(): boolean {
    return this.is_authenticated;
  }

  //ユーザ利用可能
  public is_active: boolean = false;
  get IsActive(): boolean {
    return this.is_active;
  }

  get JwtToken(): string {
    return localStorage.getItem('__JwtToken');
  }
  set JwtToken(token: string) {
    localStorage.setItem('__JwtToken', token);
  }

  //　言語コード
  // private __language: string = "J";
  get Language(): string {
    const value = localStorage.getItem('__language');
    return value || 'J';
  }
  set Language(langulage: string) {

    // 静的なクラスの言語設定
    AppSettings.init(langulage);

    localStorage.setItem('__language', langulage);
  }

  //　言語毎の日付けフォーマット
  private __dateFormatDef = {};
  get DateFormatDef(): object {
    return this.__dateFormatDef;
  }
  set DateFormatDef(def: object) {
    this.__dateFormatDef = def;
  }
  




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

  logout(event?: LoginEvent) {
    localStorage.removeItem('__JwtToken');
    this.is_authenticated = false;
    this.is_active = false;
    this.loginOutSource.next(event);
  }

  /* ※※※※※※※※※※※※※ 認証 JwtToken検証(ログイン済み画面初期、またはログイン直後)※※※※※※※※※※※※※*/
  private initSuccessedSource = new Subject<InitResult>()
  initSuccessed$ = this.initSuccessedSource.asObservable();

  private initFailedSource = new Subject<any>()
  initFailed$ = this.initFailedSource.asObservable();

  init() {
    if (!Util.isEmpty(this.JwtToken)) {
      const jsonInit$ = this.jsonSrv.get('master/init').subscribe((response) => {
        if (!Util.isEmpty(response["data"]) && response["result"] === true) {
          this.is_authenticated = true;
          if (response['data'].role) {
          }
          this.initSuccessedSource.next(response['data']);
        } else {
          this.initFailedSource.next(null);
        }
      });
      this.subs.add(jsonInit$);
    } else {
      this.initFailedSource.next(null);
    }
  }

  // isRole(role) {
  //   return role === this.role;
  // }

  connect() {
    const jsonConnect$ = this.jsonSrv.get('test/', {}).subscribe((response) => {
      this.connectSuccess();
    });
    this.subs.add(jsonConnect$);
  }

  /* ※※※※※※※※※※※※※ 認証 Login※※※※※※※※※※※※※*/
  authenticate(params) {
    console.log("認証", params)
    params["language"] = this.Language;
    const jsonAuth$ = this.jsonSrv.post('api-token-auth/', params).subscribe((response) => {
      let result = new AuthenticatedEvent(false);
      if (!Util.isEmpty(response['token'])) {
        //成功した場合
        result.result = true;
        this.is_authenticated = true;
        this.JwtToken = 'JWT ' + response['token'];
      }
      this.authenticated(result);
    });
    this.subs.add(jsonAuth$);
  }

  resetJwt(jwt) {
    this.JwtToken = 'JWT ' + jwt;
  }

  // /**
  //  * パスワード修正後再度認証"
  //  */
  // reAuthenticate(params) {
  //   console.log("パスワード修正後再度認証", params)
  //   params["language"] = this.Language;
  //   this.jsonSrv.post('api-token-auth/', params).subscribe((response) => {
  //     if (!Util.isEmpty(response["token"])) {
  //       //成功した場合
  //       this.is_authenticated = true;
  //       this.is_active = true;
  //       this.JwtToken = 'JWT ' + response["token"];
  //     }
  //   });
  // }

  active(value) {
    this.is_active = value;
  }

  /* ※※※※※※※※※※※※※ Login 後 ※※※※※※※※※※※※※*/
  private AuthenticatedSource = new Subject<AuthenticatedEvent>()
  Authenticated$ = this.AuthenticatedSource.asObservable();
  public authenticated(event: AuthenticatedEvent) {
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