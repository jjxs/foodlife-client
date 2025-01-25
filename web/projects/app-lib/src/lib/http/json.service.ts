import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';


import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Util } from '../utils/util';

// TODO: service, modelのパッケージを要検討


@Injectable({
    providedIn: 'root'
})
export class JsonService {
    private url = `/`;
    private headers = new HttpHeaders().set('content-type', 'application/json');
    constructor(
        private http: HttpClient,
    ) { }

    // TODO: パラメータを後で修正。
    get(url: String, params?: any): Observable<Object> {

        //console.log(" get(url: String, params?: any): Observable<Object> {")
        const get_url = this.url + url;
        let httpParams = new HttpParams();
        if (params) {
            Object.keys(params).forEach(function (key) {
                httpParams = httpParams.append(key, params[key] || '');
            });
        }

        return this.http.get(get_url, { params: httpParams }
        ).pipe(
            map(response => {
                return response;
            }),
            // catchError(this.handleError<Object>(`JsonService.get`))
        );
    }

    post(url: String, params?: any): Observable<Object> {
        const get_url = this.url + url;
        return this.http.post(get_url, params, {
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
                //console.log(response);
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
        const httpParams = new HttpParams(params || {});

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

    downLoadFile(data: any, filename: string) {
        //console.log(data.body)
        let blob = new Blob([data.body], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        let url = window.URL.createObjectURL(blob);

        const link: HTMLAnchorElement = document.querySelector('#csv-download') as HTMLAnchorElement;

        link.href = url;
        link.download = filename;
        link.click();

    }

    downLoadCsvFile(data: any, filename: string, type="text/csv") {
        //console.log(data.body)
        let blob = new Blob([data.body], { type: type });
        let url = window.URL.createObjectURL(blob);

        const link: HTMLAnchorElement = document.querySelector('#csv-download') as HTMLAnchorElement;

        link.href = url;
        link.download = filename;
        link.click();

    }

    convertBase64ToBlobData(base64Data: string, contentType: string = 'image/png', sliceSize = 512) {
        const byteCharacters = atob(base64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    downloadImgFile(base64Data: string, filename: string) {
        const blobData = this.convertBase64ToBlobData(base64Data);

        const link: HTMLAnchorElement = document.querySelector('#csv-download') as HTMLAnchorElement;

        if (window.navigator && window.navigator.msSaveOrOpenBlob) { //IE
            window.navigator.msSaveOrOpenBlob(blobData, filename);
        } else { // chrome
            const blob = new Blob([blobData], { type: 'image/png' });
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            link.download = filename;
            link.click();
        }
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
