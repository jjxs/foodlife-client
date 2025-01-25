import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';

// import { HttpParamsOptions } from '@angular/common/http/src/params';

import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

// TODO: service, modelのパッケージを要検討


@Injectable({
    providedIn: 'root'
})
export class JsonService {
    private url = `/`;
    private headers = new HttpHeaders().set('content-type', 'application/json');
    constructor(
        private http: HttpClient
    ) { }

    // TODO: パラメータを後で修正。
    get(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;
        // const paramsOptions = <HttpParamsOptions>{ fromObject: params || {} };
        // const httpParams = new HttpParams(paramsOptions);
        let httpParams = new HttpParams();
        if (!params) {
            params = {};
        }
        params['__mac'] = this.get_mac();
        if (params) {
            Object.keys(params).forEach(function (key) {
                httpParams = httpParams.append(key, params[key] || '');
            });
        }

        return this.http.get(get_url, {
            params: httpParams,
            headers: this.headers
        }
        ).pipe(
            map(response => {
                return response;
            }),
            // catchError(this.handleError<Object>(`JsonService.get`))
        );
    }

    post(url: String, params?: any): Observable<Object> {
        if (!params) {
            params = {};
        }
        params['__mac'] = this.get_mac();
        const get_url = this.url + url;
        let httpParams = new HttpParams();
        httpParams = httpParams.append('__mac', this.get_mac());
        return this.http.post(get_url, params, {
            params: httpParams,
            headers: this.headers
        })
            .pipe(
                map(response => {
                    // console.log(response);
                    return response;
                }),
                // catchError(this.handleError<Object>(`JsonService.post`))
            );
    }

    upload(url: String, file: File): Observable<Object> {
        const get_url = this.url + url;
        const formData = new FormData();
        formData.append("file", file, file.name);
        return this.http.post(get_url, formData)
            .pipe(
                map(response => {
                    // console.log(response);
                    return response;
                }),
                // catchError(this.handleError<Object>(`JsonService.post`))
            );
    }

    download(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;

        return this.http.post(get_url, params, {
            observe: 'response',
            responseType: 'blob',
            headers: this.headers
        }).pipe(
            map(response => {
                // console.log('###################### download(url: String, params?: any): Observable<Object> ##################');
                // console.log(response);
                return response;
            }),
            // catchError(this.handleError<Object>(`JsonService.post`))
        );
    }
    //{ responseType: ResponseContentType.Blob }

    create(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;
        return this.http.post(get_url, params, {
            observe: 'response',
            headers: this.headers
        })
            .pipe(
                map(response => {
                    // const responseStatus = response['status'] || 0;
                    // const responseText = response['statusText'] || "";
                    // if (responseStatus !== 201) {
                    //   this.message.open(MessageComponent, {
                    //     width: '500px',
                    //     data: { title: 'Message', msg: responseText }
                    //   });
                    // }
                    return response.body;

                }),
                // catchError(this.handleError<Object>(`JsonService.post`))
            );
    }

    update(url: String, params: any): Observable<Object> {
        const get_url = this.url + url;
        return this.http.put(get_url, params, {
            observe: 'response',
            headers: this.headers
        })
            .pipe(
                map(response => {
                    // console.log(response);
                    return response.body;
                }),
                // catchError(this.handleError<Object>(`JsonService.post`))
            );
    }

    delete(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;
        // const paramsOptions = <HttpParamsOptions>{ fromObject: params || {} };
        // const httpParams = new HttpParams(paramsOptions);

        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(function (key) {
                httpParams = httpParams.append(key, params[key] || '');
            });
        }

        return this.http.delete(get_url, {
            params: httpParams,
            observe: 'response',
            headers: this.headers
        })
            .pipe(
                map(response => {
                    return response.body;
                }),
                // catchError(this.handleError<Object>(`JsonService.post`))
            );
    }


    /**
     * Handle Http operation that failed.
     * Let the app continue.
     * @param operation - name of the operation that failed
     * @param result - optional value to return as the observable result
     */
    private handleError<T>(operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {

            // TODO: send the error to remote logging infrastructure
            console.error(error); // log to console instead

            // TODO: better job of transforming error for user consumption
            this.log(`${operation} failed: ${error.message}`);

            // Let the app keep running by returning an empty result.
            return of(result as T);
        };
    }

    private log(message: string) {
    }

    
    public get_mac() {
        if ( typeof amiJs === 'undefined' ) {
            return "";
        }
        return amiJs.getMac();
    }

}


declare module amiJs {
    export function counter_print(data): any;
    export function detail_print(data): any;
    export function open_cash_box(): any;
    export function accounting_day_print(data): any;
    export function getMac(): any;
}
