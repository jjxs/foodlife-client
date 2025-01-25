import { Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material';

export interface IWindowResult {
    close: boolean;
    data: any;
}

export interface IWindowComponent {
    cmpWindow: MatDialogRef<any>;
    cmpParameters: any;
    cmpOnWindowClose?(): IWindowResult | boolean | Subscription;
}
