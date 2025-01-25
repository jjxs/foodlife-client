import { Component, OnInit, Input, Output, SimpleChange, OnChanges } from '@angular/core';
import { Menu, MenuCategory } from '../menu.interface';
import { CounterService } from '../../counter/counter.service';
import { JsonService, Util, AuthenticationService } from 'ami';
import { MatDialog } from '@angular/material';
import { MenuService } from '../menu.service';
import { MenuUtil } from '../menu.util';

@Component({
  selector: 'restaurant-theme-menu-top-ranking',
  templateUrl: './theme-menu-top-ranking.component.html',
  styleUrls: ['./theme-menu-top-ranking.component.css']
})
export class ThemeMenuTopRankingComponent implements OnInit, OnChanges {
  @Input() enableOrder = true;

  @Input() reload = false;

  menuData: Array<Menu> = [];

  // すべてのメニューデータ
  orign_menus = null;
  lang;

  constructor(
    public menuSrv: MenuService,
    public counterSrv: CounterService,
    private menuUtil: MenuUtil,
    private jsonSrv: JsonService,
    private dialog: MatDialog
    ) {
    }

  ngOnInit() {
    this.initData();
  }

  initData() {
    this.jsonSrv.get('restaurant/menu/ranking/', { }).subscribe((response?: Array<MenuCategory>) => {
      if (Util.isEmpty(response) || Util.isEmpty(response[0])) {
        // this.cmp.unloading(500);
        return;
      }
      this.menuData = [];
      if (!Util.isEmpty(response) && response[0]) {
        response.forEach((row: any) => {
          this.menuData.push(row);
        });
      }
    });
    this.orign_menus = this.menuSrv.getMenuList();
  }

  refresh() {
    this.initData();
  }
  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if ( !Util.isEmpty(changes['reload']) ) {
      if ( changes['reload']['currentValue'] ) {
        this.initData();
      }
    }
  }

  onClick(event, id) {
    event.stopPropagation();
    let menu: Menu;
    const menu_id = this.menuData[id]['menu_id'];
    menu = this.orign_menus[menu_id];
    menu['option'] = {};
    menu['menu_options'] = this.menuData[id]['menu_options'];
    menu['name'] = this.menuData[id]['menu_name'];
    menu['image'] = this.menuData[id]['image'];
    menu['ori_price'] = this.menuData[id]['menu_ori_price'];
    menu['price'] = this.menuData[id]['menu_price'];
    menu['course'] = this.menuData[id]['course'];
    menu['introduction'] = this.menuData[id]['introduction'];
    menu['note'] = this.menuData[id]['note']

    if (this.menuUtil.isCourse(menu)) {
      this.menuUtil.showCourse(menu, this.enableOrder, true);
    } else {
      this.menuUtil.showView(menu, this.enableOrder, true);
    }
  }


}
