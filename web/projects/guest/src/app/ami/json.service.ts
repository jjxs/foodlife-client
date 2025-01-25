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
    constructor(
        private http: HttpClient
    ) { }

    // TODO: パラメータを後で修正。
    get(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;
        // const paramsOptions = <HttpParamsOptions>{ fromObject: params || {} };
        // const httpParams = new HttpParams(paramsOptions);
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(function (key) {
                httpParams = httpParams.append(key, params[key] || '');
            });
        }


        return this.http.get(get_url, {
            params: httpParams
        }
        ).pipe(
            map(response => {
                // console.log(response);
                return response;
            }),
            // catchError(this.handleError<Object>(`JsonService.get`))
        );
    }

    post(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;
        return this.http.post(get_url, params)
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
            responseType: 'blob'
        }).pipe(
            map(response => {
                return response;
            }),
            // catchError(this.handleError<Object>(`JsonService.post`))
        );
    }
    //{ responseType: ResponseContentType.Blob }

    put(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;
        return this.http.put(get_url, params)
            .pipe(
                map(response => {
                    // console.log(response);
                    return response;
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

}
