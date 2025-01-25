import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, Util } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MenuService } from '../menu.service';
import { Menu } from '../menu.interface';
import { CounterService } from '../../counter/counter.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'restaurant-menu-kosu',
  templateUrl: './menu-kosu.component.html',
  styleUrls: ['./menu-kosu.component.css']
})
export class MenuKosuComponent implements OnInit {

  count = 1;
  menu: Menu;
  no_store = 30
  onOrder: 0;
  enableOrder = true;
  menu_options = [];
  price = 0;
  course = {};
  courseIndex = 1;
  currentCourse = [];
  selectedList = [];
  site_image_host = '';
  constructor(
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    public dialogRef: MatDialogRef<MenuKosuComponent>,
    public menuSrv: MenuService,
    public appService: AppService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.site_image_host = this.menuSrv.appService.SiteImageHost + '/';
      this.menu = data.menu;
      let add_price = 0;

      let default_spec = false;
      // tslint:disable-next-line: forin
      for ( const i in this.menu.menu_options ) {
        this.menu_options.push(this.menu.menu_options[i]);

        delete(this.menu.menu_options[i]['select_id']);
        delete(this.menu.menu_options[i]['select_name']);
        delete(this.menu.menu_options[i]['select_price']);
        if ( !Util.isEmpty(this.menu.menu_options[i]['select_price']) ) {
          add_price = add_price + this.menu.menu_options[i]['select_price'];
        } else {
          default_spec = true;
          this.menu.menu_options[i]['items'][0]['on'] = 0;
          this.onSpec(this.menu.menu_options[i]['items'][0], this.menu.menu_options[i]);
        }
      }
      if ( !default_spec ) {
        this.price = this.counterSrv.checkTax(this.menu) + add_price;
      }

      // tslint:disable-next-line: forin
      for ( const i in this.menu.course ) {
        let group_id = this.menu.course[i]['group_id'];
        if ( Util.isEmpty(group_id) ) {
          group_id = 1;
        }
        this.menu.course[i]['selected'] = false;
        if (!this.course[group_id]) {
          this.course[group_id] = [];
        }
        this.course[group_id].push(this.menu.course[i]);
      }
      this.processSingleMenu();
      this.initCurrentCourse();
      this.onOrder = data.onOrder;
      this.enableOrder = data.enableOrder;
    }

  ngOnInit() {
  }

  initCurrentCourse() {
    if ( !this.course[this.courseIndex] ) {
      this.currentCourse = [];
    }
    this.currentCourse = this.course[this.courseIndex];
  }

  processSingleMenu() {
    if ( this.course[this.courseIndex].length==1 ) {
      this.selectCourseDetail(this.course[this.courseIndex][0]);
    }
  }

  selectCourseDetail(item) {
    this.currentCourse.forEach( ( menu ) => {
      menu['selected'] = false;
    });
    item['selected'] = true;
    if (this.selectedList.length>=this.courseIndex) {
      this.selectedList = this.selectedList.slice(0, this.courseIndex-1);
    }
    this.selectedList.push(item);
  }

  pre() {
    if(this.courseIndex>1) {
      this.courseIndex = this.courseIndex - 1;
    }
    const selectedItem = this.selectedList[(this.courseIndex-1)];
    this.selectedList = this.selectedList.slice(0, this.courseIndex - 1);
    this.initCurrentCourse();
    this.currentCourse.forEach( ( menu ) => {
      menu['selected'] = false;
    });
    this.selectCourseDetail(selectedItem);
  }

  next() {
    this.courseIndex = this.courseIndex + 1;
    this.initCurrentCourse();
    this.currentCourse.forEach( ( menu ) => {
      menu['selected'] = false;
    });
    this.processSingleMenu();
  }


  ok() {
    const menu_name = this.preOrder();
    this.menuSrv.addOrder(this.menu, this.count);
    this.menu.name = menu_name;
    this.close();
  }


  order() {
    const menu_name = this.preOrder();
    const list = [];
    list.push({
      count: this.count,
      menu:  this.menu
    });
    this.menuSrv.sendOrder(list);
    this.menu.name = menu_name;
    this.close();
  }

  preOrder() {
    const course_detail = [];
    const menu_name = this.menu.name;
    for (const i in this.menu.course) {
      if ( this.menu.course[i]['selected'] ) {
        course_detail.push(this.menu.course[i]['name']);
      }
    }
    if　(course_detail.length>0) {
      this.menu.name = this.menu.name + '「' + course_detail.join('、') + '」';
    }
    return menu_name;
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


  zekomi(price, tax_in) {
    return this.appService.zekomi(price, tax_in);
  }

}
