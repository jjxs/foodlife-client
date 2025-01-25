
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';


/** 
 *  
*/
@Injectable({
    providedIn: 'root'
})
export class ThemeService {

    init_theme = 'indigo-pink';

    // Toolbar 表示内容変更
    private themeChangedSource = new Subject<any>();
    themeChanged$ = this.themeChangedSource.asObservable();

    constructor(
        // private authSrv: AuthenticationService
    ) {
    }

    themeChange(theme: any) {
        this.init_theme = theme.new;
        this.themeChangedSource.next(theme);
    }


    private changeSource = new Subject<any>();
    change$ = this.changeSource.asObservable();

    change(theme: string) {
        this.changeSource.next(theme);
    }

}