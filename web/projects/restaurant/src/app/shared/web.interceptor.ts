import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthenticationService, Util } from 'ami';
import { catchError } from 'rxjs/operators';
import { CmpService } from '../cmp/cmp.service';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { MatDialog } from '@angular/material';
import { LoginComponent } from '../home/login/login.component';

@Injectable()
export class WebInterceptor implements HttpInterceptor {
    constructor(
        private cmp: CmpService,
        private route: ActivatedRoute,
        private authSrv: AuthenticationService,
        private loginDialog: MatDialog,

    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler) {

        //this.cmp.unloading();

        let headers = request.headers; //.set('content-type', 'application/json');
        // // console.log(request)
        if (!Util.isEmpty(this.authSrv.JwtToken)) {
            headers = headers.set('Authorization', this.authSrv.JwtToken);
        }
        let url = request.url;
        if (request.url.indexOf('?')==-1) {
            url = request.url.endsWith('\/') ? request.url : request.url + '\/';
        }


        let api_host = environment.api_ip;
        let saas_id = 'default';
        if (Util.getSaasID()) {
            saas_id = Util.getSaasID();
        }
        //console.info(saas_id)
        api_host = api_host.replace('{{saas}}', saas_id);
        const req = request.clone({
            url: Util.joinpath(api_host, url),
            headers: headers
        });

        return next.handle(req)
            .pipe(
                catchError((error: any) => {
                    // if (error.status === 401) {
                    //     this.authSrv.logout();
                    //     const openedDialogs = this.loginDialog.openDialogs;
                    //     if (openedDialogs.length === 0) {
                    //         this.loginDialog.open(LoginComponent, {
                    //             width: '400px',
                    //             data: {}
                    //         });
                    //     }
                    //   }
                    if (error instanceof HttpErrorResponse && error.status === 0) {
                        this.authSrv.connectError(error);
                    }
                    return throwError(error);
                })
            )
    }
}

