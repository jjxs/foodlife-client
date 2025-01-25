import { Injectable, TemplateRef } from '@angular/core';

import { MatDialog, MatDialogRef, MatSnackBarVerticalPosition, MatSnackBarHorizontalPosition, MatDialogConfig } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { PopComponent } from './pop/pop.component';
import { ComponentType } from '@angular/cdk/portal';
import { Util } from '../utils/util';
import { WindowComponent } from './window/window.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { TreeSelectComponent } from './tree-select/tree-select.component';
import { JsonService } from '../http/json.service';
import { LoadingComponent } from './loading/loading.component';

@Injectable()
export class CmpService {

    constructor(
        private dialog: MatDialog,
        private snackBar: MatSnackBar) {

    }

    pop(msg, duration_time?) {
        if (!Util.isEmpty(msg)) {
            this.snackBar.openFromComponent(PopComponent, {
                // verticalPosition:MatSnackBarVerticalPosition.
                duration: duration_time || 3000,
                data: { msg: msg }
            });
        }
    }

    open<T, D = any, R = any>(componentOrTemplateRef: ComponentType<T> | TemplateRef<T>, data: Object, config?: MatDialogConfig<D>): MatDialogRef<WindowComponent, R> {

        const openData = Util.appendIf(data, {
            "__component": componentOrTemplateRef
        });

        if (!config)
            config = {};

        const openConfig = Util.appendIf(config, {
            width: '50vw',
            height: '85vh',
            hasBackdrop: false,
            disableClose: true,
            data: openData
        })
        //console.log(openConfig)

        return this.dialog.open(WindowComponent, openConfig);
    }

    confirm(msg, title?) {
        const dialogRef = this.dialog.open(ConfirmComponent, {
            width: '30vw',
            data: { title: title, msg: msg }
        });
        dialogRef.afterClosed()
        return dialogRef;
    }

    select<T, D = any, R = any>(params?: Object, config?: MatDialogConfig<D>): MatDialogRef<TreeSelectComponent, R> {

        if (!config)
            config = {};

        const openConfig = Util.appendIf(config, {
            width: '35vw',
            height: '65vh',
            hasBackdrop: false,
            disableClose: true,
            autoFocus: true,
            data: params
        })

        return this.dialog.open(TreeSelectComponent, openConfig);
    }

    loading(message?, model?) {
        // if (this.loadingDialogRef && this.loadingDialogRef.close)
        //     this.loadingDialogRef.close();

        const loadingDialogRef = this.dialog.open(LoadingComponent, {
            width: '80%',
            disableClose: true,
            data: { title: message, model: model }
        });



        return loadingDialogRef;
    }


}
