import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, Util, AuthenticationService } from 'ami';
import { CmpService } from '../../cmp/cmp.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { MasterGroup, Master } from '../menu.interface';
import { AppService } from '../../app.service';

@Component({
  selector: 'restaurant-guest-setting',
  templateUrl: './guest-setting.component.html',
  styleUrls: ['./guest-setting.component.css']
})
export class GuestSettingComponent implements OnInit {

  constructor(
    private jsonSrv: JsonService,
    private cmp: CmpService,
    public authSrv: AuthenticationService,
    public appService: AppService,
    private dialogRef: MatDialogRef<GuestSettingComponent>,
  ) {
   }

  ngOnInit() {
  }

  onClick(event, master) {
  }

  logout() {
    const dialog = this.cmp.confirm('ログアウトしますか？');
    dialog.afterClosed().subscribe(result => {
      if (result === "yes") {
        this.authSrv.logout();
        this.authSrv.init();
      }
    });
  }

  ng() {
    // tslint:disable-next-line: max-line-length
    this.dialogRef.close();
  }

}
