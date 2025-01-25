import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CmpService } from '../../cmp/cmp.service';
import { JsonService, Util, AuthenticationService } from 'ami';
import { MenuService } from '../menu.service';
import { MasterGroup, GroupChange } from '../menu.interface';
import { HomeComponent } from '../../home/home.component';
import { MatDialog } from '@angular/material';
import { GuestSettingComponent } from '../guest-setting/guest-setting.component';
import _ from 'lodash';

@Component({
  selector: 'restaurant-menu-group',
  templateUrl: './menu-group.component.html',
  styleUrls: ['./menu-group.component.css']
})
export class MenuGroupComponent implements OnInit {
  public toolbardisplay = '';
  groups = [];
  groupChanged$;
  hour = new Date().getHours()

  constructor(
    private cmp: CmpService,
    public authSrv: AuthenticationService,
    private jsonSrv: JsonService,
    private dialog: MatDialog,
    public homeComponent: HomeComponent,
    // private menuComponent: MenuComponent,
    private menuSrv: MenuService) {
      // ツールバー文字
      this.toolbardisplay = homeComponent.toolbardisplay;

      this.groupChanged$ = this.menuSrv.groupChanged$.subscribe((groupChange: GroupChange) => {
        let group = groupChange.masterGroup;
        this.groups.forEach((element: MasterGroup) => {
          element.selected = (element.id === group.id);
        });
      });

    }

  ngOnInit() {

    this.jsonSrv.get('master/master/?domain__in=menu_category', {}).subscribe((response?: any[]) => {
      if (!Util.isEmpty(response) && response[0]) {

        const hour = new Date().getHours();
        // console.log(hour, response);
        response.forEach((group: any) => {
          if (group.option && !Util.isEmpty(group.option.display) && !group.option.display) {
            return true;
          }
          group["isDisabledGroup"] = false

          if (group.option) {
            if ((!Util.isEmpty(group.option.start) && hour < group.option.start)
              || (!Util.isEmpty(group.option.end) && hour > group.option.end)) {
              return true;
            }
          }
          if (group.name != 'menu_category_standard' && group.option) {
            if (!group.option['show_time']) {
              group["isDisabledGroup"] = false
            } else if (group.option['show_time'] instanceof Array) {
              if (group.option['show_time'].length != 2) {
                group["isDisabledGroup"] = false
              } else {
                if (
                  hour < group.option['show_time'][0] || hour >= group.option['show_time'][1]
                ) {
                group["isDisabledGroup"] = true
                }
              }
            }
            group.selected = false;
            this.groups.push(group);
          }
        });
        this.groups[0].selected = true;
        // event　を発火する
        this.changeGroup(this.groups[0])
      }
    });
  }

  onSelect(group) {
    let currentHour = new Date().getHours()
    this.groups.forEach((element) => {
      element.selected = (element === group);
      if (element.option['show_time'] &&
        element.option['show_time'] instanceof Array &&
        element.option['show_time'].length == 2 &&
        (currentHour < element.option['show_time'][0] || currentHour >= element.option['show_time'][1])) {
        element.isDisabledGroup = true;
      } else {
        element.isDisabledGroup = false;
      }
    });
    if (!group.option['show_time'] ||
        group.option['show_time'].length != 2 ||
        (currentHour >= group.option['show_time'][0] && currentHour < group.option['show_time'][1])) {
      this.changeGroup(group)
    }
  }

  changeGroup(group: MasterGroup) {
    // event　を発火する
    this.menuSrv.changeGroup({
      masterGroup: group,
      categoryId: -1.
    });
  }

  logout() {
    const dialog = this.cmp.confirm('ログアウトしますか？');
    dialog.afterClosed().subscribe(result => {
      if (result === 'yes') {
        this.authSrv.logout();
        this.authSrv.init();
      }
    });
  }
  changeSeat() {
    const dialog = this.cmp.confirm3('', '席を替える');
    dialog.afterClosed().subscribe(result => {
      if (result['status'] === 'yes') {
        const params = {
          password: result['data']
        };
        this.jsonSrv.post('restaurant/master/check_pass/', params).subscribe((response?) => {
        });
      }
    });
  }

  showSetting() {
    const dialogMenuFree = this.dialog.open(GuestSettingComponent, {
      width: '300px',
      height: '200px',
      disableClose: true
    });
    dialogMenuFree.afterClosed().subscribe((response) => {
    });
  }

}
