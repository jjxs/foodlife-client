import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, Util } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MenuService } from '../menu.service';
import { Menu } from '../menu.interface';
import { CounterService } from '../../counter/counter.service';
import { CmpService } from '../../cmp/cmp.service';
import { AppService } from '../../app.service';
import _ from 'lodash';

@Component({
  selector: 'restaurant-menu-view',
  templateUrl: './menu-view.component.html',
  styleUrls: ['./menu-view.component.css']
})
export class MenuViewComponent implements OnInit {

  count = 1;
  menu: Menu;
  onOrder: 0;
  no_store = 30
  enableOrder = true;
  menu_options = [];
  site_image_host = '';
  price = 0;
  constructor(
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    public dialogRef: MatDialogRef<MenuViewComponent>,
    private cmp: CmpService,
    public appService: AppService,
    public menuSrv: MenuService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.site_image_host = this.menuSrv.appService.SiteImageHost + '/';
      this.menu = data.menu;
      this.count=data.isOrder ? 1 : data.menu.mincount
      let add_price = 0;

      let default_spec = false;
      // tslint:disable-next-line: forin
      for ( const i in this.menu.menu_options ) {
        this.menu_options.push(this.menu.menu_options[i]);
        delete(this.menu.menu_options[i]['select_id']);
        delete(this.menu.menu_options[i]['select_name']);
        delete(this.menu.menu_options[i]['select_price']);

        this.menu_options.forEach((sort) => {
          sort.items = _.sortBy(sort.items, function (o) {
            return o.display_order
          })
        })
        if ( !Util.isEmpty(this.menu.menu_options[i]['select_price']) ) {
          add_price = add_price + this.menu.menu_options[i]['select_price'];
        } else {
          default_spec = true;
          this.menu.menu_options[i]['items'][0]['on'] = 0;
          this.onSpec(this.menu.menu_options[i]['items'][0], this.menu.menu_options[i]);
        }
      }
      this.onOrder = data.onOrder;
      this.enableOrder = data.enableOrder;
      if ( !default_spec ) {
        this.price = this.counterSrv.checkTax(this.menu) + add_price;
      }
    }

  ngOnInit() {
  }

  order() {
    const list = [];
    list.push({
      count: this.count,
      menu:  this.menu
    });
    this.menuSrv.sendOrder(list);
    this.dialogRef.close({});
  }

  ok() {
    for ( const i in this.menu.menu_options ) {
      if ( Util.isEmpty(this.menu.menu_options[i]['select_name']) || this.menu.menu_options[i]['select_name']==false ) {
        this.cmp.pop(this.menu.menu_options[i]['group_name'] + 'を選択してください');
        return;
      }
    }
    this.menuSrv.addOrder(this.menu, this.count);
    this.dialogRef.close({});
  }

  close(): void {
    this.dialogRef.close(null);
  }


  onSpec(item, group) {
    // tslint:disable-next-line: forin
    for ( const i in group['items'] ) {
      if ( group['items'][i]['on'] === undefined
        || group['items'][i]['id'] !== item['id']) {
        group['items'][i]['on'] = 0;
      }
    }
    if ( item['on'] === 0 ) {
      item['on'] = 1;
      group['select_name'] = item['display_name'];
      group['select_id'] = item['id'];
      group['select_price'] = item['price'];
    } else {
      // item['on'] = 0;
      // group['select_name'] = false;
      // group['select_id'] = null;
      // group['select_price'] = 0;
    }

    let add_price = 0;
    for( const i in this.menu_options ) {
      if ( !Util.isEmpty(this.menu_options[i]['select_price']) ) {
        add_price = add_price + this.menu_options[i]['select_price'];
      }
    }
    this.price = this.counterSrv.checkTax(this.menu) + add_price;
  }

  srcError(event) {
    try {
      const src = '/assets/images/menu/' + this.menu.no + '.jpg';
      if ( event.srcElement.src != src ) {
        this.menu.image = src;
        this.site_image_host = '';
      }
    } catch (e) {

    }
  }

  showCnTitle(menu) {
    const note = menu.note;
    if (!Util.isEmpty(note)) {
      return note;
    }
    const value = menu.name;
    const t = this.appService.language( value, 'zh' );
    if ( t!=value ) {
      return t;
    } else {
      return '';
    }
  }


}
