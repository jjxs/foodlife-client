import { Injectable } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { Subject } from 'rxjs';

@Injectable()
export class CmpWindowService {
    window: MatDialogRef<any>;

    parameters: any = {}

    constructor(private win: MatDialogRef<any>) {
        this.window = win;
    }

    setParameters(params: any) {
        this.parameters = params || {};
    }

    private closeSource = new Subject<any>()
    close$ = this.closeSource.asObservable();

    close(data?: any) {

        this.window.close(data)
    }

    send() {
        if (this.closeSource.observers.length === 0) {
            this.window.close()
        } else {
            this.closeSource.next();
        }
    }

    destroy() {
        this.closeSource.unsubscribe();
    }
}