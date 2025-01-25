import { Component, OnInit, Inject } from '@angular/core';
import { Util, JsonResult, JsonService } from 'ami';
import { CmpService } from '../../cmp/cmp.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { environment } from '../../../environments/environment';
import { MasterGroup, Master } from '../../menu/menu.interface';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';

@Component({
  selector: 'restaurant-kitchen-setting',
  templateUrl: './kitchen-setting.component.html',
  styleUrls: ['./kitchen-setting.component.css']
})
export class KitchenSettingComponent implements OnInit {

  cols = 1;
  masters: Array<Master> = [];
  chinese = false;
  japan = true;
  takeoutPrinter = false;
  kitchenPrinter = false;

  constructor(
    private jsonSrv: JsonService,
    private cmp: CmpService,
    private router: Router,
    public appService: AppService,
    private dialogRef: MatDialogRef<KitchenSettingComponent>,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.chinese = data['chinese'];
    this.japan = data['japan'];
    this.takeoutPrinter = data['takeoutPrinter'];
    this.kitchenPrinter = data['kitchenPrinter'];
   }

  ngOnInit() {
    this.jsonSrv.get('master/master/', { name: environment.standard_category_for_kichen }).subscribe((mastergroup: Array<MasterGroup>) => {
      if (mastergroup && mastergroup[0]) {
        const group = mastergroup[0];
        // console.log('### KitchenSettingComponent.ngOnInit', mastergroup);
        // console.log(this.data.selections)
        const count = group.master_data.length;
        for (let i = 2; i <= 10; i++) {
          if (i * i > count) {
            this.cols = i;
            break;
          }
        }

        const selections = this.data.selections || [];
        group.master_data.forEach(master => {
          if (selections.indexOf(master.id) >= 0) {
            master['checked'] = true;
          } else {
            master['checked'] = false;
          }

        });
        this.masters = group.master_data;

      }
    });
  }

  onClick(event, master) {
    event.stopPropagation();
    master['checked'] = !master['checked']
  }

  ok() {
    const result = [];
    this.masters.forEach((master) => {
      if (master['checked'] && master['checked'] === true) {
        result.push(master.id);
      }
    });
    if ( Util.isEmptyArray(result) ) {
      this.cmp.pop('設定エラー、種類を選択ください。');
    } else {
      // tslint:disable-next-line: max-line-length
      this.dialogRef.close({'result': result, 'japan': this.japan, 'chinese': this.chinese, 'takeoutPrinter': this.takeoutPrinter, 'kitchenPrinter': this.kitchenPrinter});
    }

  }

  ng() {
    // tslint:disable-next-line: max-line-length
    this.dialogRef.close({'result': this.data.selections, 'japan': this.data.japan, 'chinese': this.data.chinese, 'takeoutPrinter': this.data.takeoutPrinter, 'kitchenPrinter': this.data.kitchenPrinter});
  }

  clear() {
    this.masters.forEach((master) => {
      master['checked'] = false;
    });
  }

  goHome() {
    this.ng();
    this.router.navigate(['/counter', {}]);
  }
}
