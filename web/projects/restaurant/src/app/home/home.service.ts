import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { timer } from 'rxjs';
import { environment } from '../../environments/environment';
import { CmpService } from '../cmp/cmp.service';
import { HttpErrorResponse } from '@angular/common/http';
import { JsonService } from '../../../../guest/src/app/ami/json.service';
// import { AuthenticationService } from '../ami/authentication.service';


/** 
 *  
*/
@Injectable({
    providedIn: 'root'
})
export class HomeService {


    private menuSource = new Subject<boolean>();
    menu$ = this.menuSource.asObservable();


    showMenu(isShow: boolean) {
        this.menuSource.next(isShow);
    }

    private headerSource = new Subject<boolean>();
    header$ = this.headerSource.asObservable();


    showHeader(isShow: boolean) {
        const me = this;
        setTimeout(function () {
            me.headerSource.next(isShow);
        }, 500);
    }

    // Toolbar 表示内容変更
    private changeToolbarSource = new Subject<string>();
    changeToolbar$ = this.changeToolbarSource.asObservable();

    constructor(
        private cmp: CmpService,
        private jsonSvr: JsonService
        // private authSrv: AuthenticationService
    ) {
    }

    changeToolbar(content: string) {
        this.changeToolbarSource.next(content);
    }

}