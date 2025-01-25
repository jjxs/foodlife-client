import { Injectable } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material';
import { MatSnackBar } from '@angular/material';

import { AmiLoading } from './dialog/ami-loading.component';
import { AmiConfirm } from './dialog/ami-confirm.component';
import { AmiConfirm2 } from './dialog/ami-confirm2/ami-confirm2.component';
import { AmiConfirm3 } from './dialog/ami-confirm3/ami-confirm3.component';
import { AmiInput } from './dialog/ami-input/ami-input.component';
import { AmiPop } from './dialog/ami-pop.component';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { AmiSelecter } from './dialog/ami-selecter.component';

@Injectable({
    providedIn: 'root',
})
export class CmpService {

    loadingDialogRef: any;

    constructor(
        private dialog: MatDialog, private snackBar: MatSnackBar) {

    }


    confirm(msg, title?) {
        const dialogRef = this.dialog.open(AmiConfirm, {
            width: '350px',
            data: { title: title, msg: msg }
        });

        return dialogRef;
    }

    confirm2(msg, title?) {
        const dialogRef = this.dialog.open(AmiConfirm2, {
            width: '350px',
            data: { title: title, msg: msg }
        });

        return dialogRef;
    }

    confirm3(msg, title?) {
        const dialogRef = this.dialog.open(AmiConfirm3, {
            width: '350px',
            data: { title: title, msg: msg }
        });

        return dialogRef;
    }

    input(msg, title?) {
        const dialogRef = this.dialog.open(AmiInput, {
            width: '350px',
            data: { title: title, msg: msg }
        });

        return dialogRef;
    }


    loading(message?, model?) {
        // if (this.loadingDialogRef && this.loadingDialogRef.close)
        //     this.loadingDialogRef.close();

        this.loadingDialogRef = this.dialog.open(AmiLoading, {
            width: '80%',
            disableClose: true,
            data: { title: message, model: model }
        });

        return this.loadingDialogRef;
    }

    unloading(timeout?) {
        const me = this;

        if (this.loadingDialogRef && this.loadingDialogRef.close) {

            if (timeout) {
                setTimeout(() => {
                    me.loadingDialogRef.close();
                    this.loadingDialogRef = null;
                }, timeout);
            } else {
                this.loadingDialogRef.close();
                this.loadingDialogRef = null;
            }
        }

    }

    pop(msg, duration_time?) {
        this.snackBar.openFromComponent(AmiPop, {
            duration: duration_time || 1500,
            data: { msg: msg }
        });
    }

    select(option) {
        const dialogRef = this.dialog.open(AmiSelecter, {
            width: '350px',
            data: option
        });

        return dialogRef;
    }

}