import { Injectable } from "ngx-onsenui";
import { Subject } from "rxjs";
import { JsonService } from "./json.service";
import { Util } from "./util";
import { resource } from "selenium-webdriver/http";

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {


    get JwtToken(): string {
        return localStorage.getItem("JwtToken");
    }
    set JwtToken(token: string) {
        localStorage.setItem("JwtToken", token);
    }

    guest_no: number = -1;

    counter_no: string = "";

    nickname: string = "";

    //　ニックネーム存在すると（メーニュー利用可能）テーブル選択とニックネーム設定すると注文可能
    Usable: boolean = false;

    //　認証済み（ユーザID、パスワード存在する）予約可能
    Authenticated: boolean = false;

    UserName: string = "";

    constructor(
        private jsonSrv: JsonService
    ) { }

    /* ※※※※※※※※※※※※※ Login ※※※※※※※※※※※※※*/
    private loginSource = new Subject<LoginEvent>()
    login$ = this.loginSource.asObservable();
    login(data: LoginEvent) {
        this.loginSource.next(data);
    }

    /* ※※※※※※※※※※※※※ 認証 JwtToken検証(ログイン済み画面初期、またはログイン直後)※※※※※※※※※※※※※*/
    init() {

        if (!Util.isEmpty(this.JwtToken)) {
            this.jsonSrv.get('master/init').subscribe((response) => {

                if (!Util.isEmpty(response["data"])
                    && response["data"][0]) {
                    this.nickname = response["data"][0].nickname;
                    this.guest_no = response["data"][0].no;
                    this.Authenticated = true;
                }
            });
        }
    }

    /* ※※※※※※※※※※※※※ 認証 Login※※※※※※※※※※※※※*/
    authenticate(params) {
        // console.log("params: ", params)
        this.jsonSrv.post('login', params).subscribe((response) => {
            let result = new AuthenticatedEvent(false);
            if (!Util.isEmpty(response["token"])) {
                result.token = response["token"];
                result.result = true;
                this.Authenticated = true;
                this.JwtToken = 'JWT ' + response["token"];
            }
            this.authenticated(result);
        });
    }

    /* ※※※※※※※※※※※※※ Login 後 ※※※※※※※※※※※※※*/
    private AuthenticatedSource = new Subject<AuthenticatedEvent>()
    Authenticated$ = this.AuthenticatedSource.asObservable();
    authenticated(event: AuthenticatedEvent) {
        this.AuthenticatedSource.next(event);
    }

    /* ※※※※※※※※※※※※※ Quick in ※※※※※※※※※※※※※*/
    private scanSource = new Subject<ScanEvent>()
    scan$ = this.scanSource.asObservable();
    scan(data: ScanEvent) {
        this.scanSource.next(data);
    }

    /* ※※※※※※※※※※※※※ Quick in 後 ※※※※※※※※※※※※※*/
    private scanAfterSource = new Subject<ScanAfterEvent>()
    scanAfter$ = this.scanAfterSource.asObservable();
    scanAfter(data: ScanAfterEvent) {
        this.scanAfterSource.next(data);
    }
}


export class LoginEvent {

}

export class AuthenticatedEvent {
    result = false;
    token = "";
    constructor(result) {
        this.result = result;
    }
}

export class ScanEvent {

}

export class ScanAfterEvent {

}