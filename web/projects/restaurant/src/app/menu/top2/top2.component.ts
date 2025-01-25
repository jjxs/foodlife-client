import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Menu, CategoryChangedEvent, MenuTop } from '../menu.interface';
import { JsonService, Util, AuthenticationService } from 'ami';
import { MenuService, ViewChangedEvent } from '../menu.service';
import { MatDialog } from '@angular/material';
import { ThemeDialogImageComponent } from '../theme-dialog-image/theme-dialog-image.component';
import { AppService } from '../../../../../restaurant/src/app/app.service';


@Component({
  selector: 'restaurant-top2',
  templateUrl: './top2.component.html',
  styleUrls: ['./top2.component.css'],
  animations: [
  ]
})
export class Top2Component implements OnInit, OnChanges {
  @Input() show: true

  @Input() editMode: false

  groups = [];
  reload_ranking = false;

  menu_top_data = {};

  @Output() categoryChanged = new EventEmitter<CategoryChangedEvent>()

  site_image_host = "";

  constructor(
    private jsonSrv: JsonService,
    private dialog: MatDialog,
    private menuSrv: MenuService,
    public appService: AppService,
  ) {
    this.site_image_host = this.appService.SiteImageHost + '/';
  }

  ngOnDestroy() {
  }

  ngOnInit() {
    for (var i = 100; i <= 109; i++) {
      this.menu_top_data[i] = {
        'image': ''
      };
    }

    this.jsonSrv.get('master/master/?domain__in=menu_category', {}).subscribe((response?: any[]) => {
      if (!Util.isEmpty(response) && response[0]) {

        const hour = new Date().getHours();
        response.forEach((group: any) => {
          if (group.option && !Util.isEmpty(group.option.display) && !group.option.display) {
            return true;
          }

          if (group.option) {
            if ((!Util.isEmpty(group.option.start) && hour < group.option.start)
              || (!Util.isEmpty(group.option.end) && hour > group.option.end)) {
              return true;
            }
          }

          group.selected = false;
          this.groups.push(group);
        });
      }
    });

    this.getTopData();
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    if ( !Util.isEmpty(changes['show']) ) {
      if ( changes['show']['currentValue'] ) {
        this.reload_ranking = true;
        this.getTopData();
      } else {
        this.reload_ranking = false;
      }
    }
  }

  getTopData() {
    this.jsonSrv.get('restaurant/menu/menu_top/', {}).subscribe((response?: any[]) => {
      if (!Util.isEmpty(response) && response[0]) {
        response.forEach((data: MenuTop) => {
          let id = data['id'];
          this.menu_top_data[id] = data;
        });
      }
    });
  }

  btnClick(id) {
    this.process(id);
  }

  getItem(id) {
    let item: MenuTop;
    for (var i in this.menu_top_data) {
      if (id == this.menu_top_data[i]['id']) {
        item = this.menu_top_data[i];
        break;
      }
    }
    return item;
  }
  process(id) {
    let item = this.getItem(id);
    if (!item) return;

    if (item['target_type'] == 'link') {
      this.goto(item);
    } else if (item['target_type'] == 'image') {
      return;
    } else if (item['target_type'] == 'dialog-image') {
      this.openDialog(item);
    }
  }

  openDialog(item) {
    const dialog = this.dialog.open(ThemeDialogImageComponent, {
      width: 'calc(100vw)',
      height: 'calc(100vh)',
      data: {
        'item': item
      }
    });
  }

  goto(item) {
    let arr = item.link.split(':');
    if (arr.length < 2) return;
    let group_id = parseInt(arr[0]);
    let category_id = parseInt(arr[1]);
    // tslint:disable-next-line: forin
    for (var i in this.groups) {
      let group = this.groups[i];
      if (group.id == group_id) {
        this.menuSrv.changeGroup({
          masterGroup: group,
          categoryId: category_id
        });
        break;
      }
    }

    this.menuSrv.menuChanged('menu');
  }
}
