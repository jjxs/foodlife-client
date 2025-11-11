import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MenuService, OrderEvent } from '../menu.service';
import { MatDialog } from '@angular/material';
import { Menu } from '../menu.interface';
import { CounterService } from '../../counter/counter.service';
import { Util } from 'projects/guest/src/app/ami/util';
import { AppService } from '../../app.service';
import { MenuUtil } from '../menu.util';
import { CmpService } from '../../cmp/cmp.service';
import _ from 'lodash';


@Component({
  selector: 'restaurant-menu-image',
  templateUrl: './menu-image.component.html',
  styleUrls: ['./menu-image.component.css']
})
export class MenuImageComponent implements OnInit {

  imageUrl = '/assets/images/addbutton.png';
  no_store = 30

  @Input() menu: Menu;
  @Input() order_list: Array<OrderEvent>;

  @Input() showIntro = false;

  @Input() enableOrder = true;

  site_image_host = '';

  lang;

  // 割引率で算出した価格
  @Input() newPrice = 0;
  freeClass = {
    'text-decoration': (this.menu && this.menu.is_free) ? 'line-through' : 'none'
  }

  constructor(
    public counterSrv: CounterService,
        private cmp: CmpService,
    public menuSrv: MenuService,
    public appService: AppService,
    private menuUtil: MenuUtil,
    private dialog: MatDialog) {
     this.site_image_host = this.menuSrv.appService.SiteImageHost + '/';
    }

  ngOnInit() {

  }
  zekomi(price, tax_in) {
    return this.appService.zekomi(price, tax_in);
  }
  
  //税抜金額  
  zenuki(price, tax_in) {
    return this.appService.zenuki(price, tax_in);
  }

  onClick(event) {
    if (this.menu.stock_status == this.no_store) {
      return
    }
    let currentHour = Util.getCurrentFractionalHour()
    if (this.menuSrv.currentGroup.masterGroup && this.menuSrv.currentGroup.masterGroup["option"]["show_time"] instanceof Array &&
        this.menuSrv.currentGroup.masterGroup["option"]["show_time"].length == 2) {
      if (currentHour < this.menuSrv.currentGroup.masterGroup["option"]["show_time"][0] || currentHour >= this.menuSrv.currentGroup["masterGroup"]["option"]["show_time"][1]) {
        this.cmp.pop("この料理はすでに販売期間外です。別の料理を注文してください");
      } else {

        if (this.menuUtil.isCourse(this.menu) && this.menu.level !== 1) {
          this.menuUtil.showCourse(this.menu, this.enableOrder);
        }
        else {
          event.stopPropagation();
          const item = this.order_list.find((data) =>
            data.menu['id'] === this.menu['id']
          );
          this.menu.course.map(item => {item["selected"] = true})
          this.menuUtil.showView(this.menu, this.enableOrder, !_.isEmpty(item));
        }
      }
    } else {
        if (this.menuUtil.isCourse(this.menu) && this.menu.level !== 1) {
          this.menuUtil.showCourse(this.menu, this.enableOrder);
        }else {
          event.stopPropagation();
          const item = this.order_list.find((data) =>
            data.menu['id'] === this.menu['id']
          );
          this.menu.course.map(item => {item["selected"] = true})
          this.menuUtil.showView(this.menu, this.enableOrder, !_.isEmpty(item));
        }
    }
  }

  onOrder(event) {
    event.cancelBubble = true
    let currentHour = new Date().getHours()
    if (this.menuSrv.currentGroup.masterGroup && this.menuSrv.currentGroup.masterGroup["option"]["show_time"] instanceof Array &&
      this.menuSrv.currentGroup.masterGroup["option"]["show_time"].length == 2) {
      if (currentHour < this.menuSrv.currentGroup.masterGroup["option"]["show_time"][0] || currentHour >= this.menuSrv.currentGroup["masterGroup"]["option"]["show_time"][1]) {
        this.cmp.pop("この料理はすでに販売期間外です。別の料理を注文してください");
      } else {
         if ( this.menuUtil.isShowView(this.menu) )  {
           this.onClick(event);
         } else if (this.menuUtil.isCourse(this.menu) && this.menu.level !== 1) {
           this.menuUtil.showCourse(this.menu, this.enableOrder);
         } else {
           event.stopPropagation();
           if (this.menu && this.menu.id) {
        	 this.menu.course.map(item => {item["selected"] = true})
             this.menuSrv.addOrder(this.menu);
           }
         }
      }
    } else {
      if ( this.menuUtil.isShowView(this.menu) )  {
        this.onClick(event);
      } else if (this.menuUtil.isCourse(this.menu) && this.menu.level !== 1) {
        this.menuUtil.showCourse(this.menu, this.enableOrder);
      } else {
        event.stopPropagation();
        if (this.menu && this.menu.id) {
		      this.menu.course.map(item => {item["selected"] = true})
          this.menuSrv.addOrder(this.menu,0,true);
        }
      }
    }
  }

  srcError(event) {
    try {
      // const src = '/assets/images/menu/' + this.menu.no + '.jpg';
      // if ( event.srcElement.src != src ) {
      //   this.menu.image = src;
      //   this.site_image_host = '';
      // }
    } catch (e) {

    }

  }

  // checkTax(menu: any) {
  //   if (Util.isEmpty(menu["option"]))
  //     return false;

  //   if (Util.isEmpty(menu.option["tax"]) || !menu.option["tax"])
  //     return false;


  //   return true;
  // }

  mousedown(event) {
    event.target.src = '/assets/images/pushbutton.png';
  }

  mouseup(event) {
    setTimeout(function () {
      event.target.src = '/assets/images/addbutton.png';
    }, 100);

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
