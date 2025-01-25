import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { JsonService, Util } from 'ami';
import { CmpService } from '../../cmp/cmp.service';
import { MatTabGroup } from '@angular/material';
import { Master, GroupChange, MenuCategory, CategoryChangedEvent, MasterGroup } from '../menu.interface';
import { SeatService } from '../../seats/seat.service';
import { MenuService } from '../menu.service';
@Component({
  selector: 'restaurant-menu-tab',
  templateUrl: './menu-tab.component.html',
  styleUrls: ['./menu-tab.component.css']
})
export class MenuTabComponent implements OnInit {

  @ViewChild("tabs", {static: false}) tabGroups: MatTabGroup;

  @Input() catetegoryList = [];

  group: MasterGroup;

  groupChanged$;

  categorys = [];

  @Input() categoryValue = -1;


  constructor(
    private cmp: CmpService,
    private jsonSrv: JsonService,
    private menuSrv: MenuService
  ) {
    this.groupChanged$ = this.menuSrv.groupChanged$.subscribe((groupChange: GroupChange) => {
      let group = groupChange.masterGroup;
      this.categorys = group.master_data;

      // let category_list = []
      // for(var i in this.catetegoryList) {
      //   category_list.push(this.catetegoryList[i])
      // }
      // this.categorys = categorys
      // categorys.forEach((item: any) => {
      //   if( category_list.length==0 ) {
      //     this.categorys.push(item)
      //   } else {
      //     category_list.forEach((cid: any)=> {
      //       if(cid==item['id']) {
      //         this.categorys.push(item)
      //       }
      //     })
      //   }
      // });
      // console.info(this.catetegoryList, this.categorys)
      this.group = group;

      let index = 0;
      for(var cid in this.categorys) {
        if( this.categorys[cid].id==groupChange.categoryId ) {
          index = Number(cid);
          break;
        }
      }

      this.changeTheme(this.categorys[index]);
      this.categoryValue = this.categorys[index].id;
      // event　を発火する
      this.menuSrv.changeCategory({
        index: index,
        id: this.categoryValue,
        data: this.categorys[index],
        group: this.group
      });
    });

  }

  ngOnDestroy() {
    this.groupChanged$.unsubscribe();
  }

  ngOnInit() {

  }

  changeTheme(category: Master) {
    let theme_id = category.theme_id;
    if(this.menuSrv.theme_list.indexOf(theme_id)<0) {
      theme_id = 'default';
    }
    this.menuSrv.themeChanged(theme_id);
    // this.menuSrv.changeGroup(this.group);
    // console.info('menu-tab', category);
  }

  clickCategory(category: Master, index: number) {
    this.changeTheme(category);
    this.categoryValue = category.id;
    // event　を発火する
    this.menuSrv.changeCategory({
      index: index,
      id: category.id,
      data: category,
      group: this.group
    });
  }


  // onGroupChanged(group: MasterGroup) {
  //   this.categorys = this.master_group[0].master_data;
  //   this.categoryValue = this.categorys[0].id.toString();

  //   // event　を発火する
  //   this.categoryChanged.emit({
  //     index: 0,
  //     id: this.categorys[0].id,
  //     data: this.categorys[0],
  //     group: this.master_group[0]
  //   });
  // }

  // temp() {
  //   this.jsonSrv.get('master/master/?domain__in=menu_category', {}).subscribe((response?: any[]) => {
  //     if (!Util.isEmpty(response) && response[0]) {

  //       const hour = new Date().getHours();
  //       //console.log(hour, response);
  //       response.forEach((group: any) => {
  //         if (group.option && !Util.isEmpty(group.option.display) && !group.option.display) {
  //           return true;
  //         }

  //         if (group.option) {
  //           if ((!Util.isEmpty(group.option.start) && hour < group.option.start)
  //             || (!Util.isEmpty(group.option.end) && hour > group.option.end)) {
  //             return true;
  //           }
  //         }

  //         group.selected = false;
  //         this.master_group.push(group);
  //       });
  //       this.master_group[0].selected = true;
  //       this.categorys = this.master_group[0].master_data;
  //       this.categoryValue = this.categorys[0].id.toString();

  //       // event　を発火する
  //       this.categoryChanged.emit({
  //         index: 0,
  //         id: this.categorys[0].id,
  //         data: this.categorys[0],
  //         group: this.master_group[0]
  //       });
  //     }
  //   });
  // }


  // clickCategory(group: MasterGroup) {
  //   this.master_group.forEach((item: any) => {
  //     item["selected"] = false;
  //   });
  //   this.categorys = [];
  //   group["selected"] = true;
  //   this.categorys = group.master_data;
  //   this.categoryValue = this.categorys[0].id.toString();

  //   // 1件目でcategoryChangedイベントを発火する
  //   this.onCategoryClick(null, group.master_data[0], 0);
  // }



  // onCategoryClick(event, category, index) {
  //   const selectedGroup = this.master_group.find((group) => group.selected);

  //   this.categoryChanged.emit({
  //     index: index,
  //     id: category.id,
  //     data: category,
  //     group: selectedGroup
  //   });
  // }
  // // グループ選択した場合
  // onGroupChange(event) {
  //   const dialog = this.cmp.select({
  //     list: this.master_group,
  //     title: '好み分類選択',
  //     dispalyColumn: 'display_name'
  //   });

  //   dialog.afterClosed().subscribe((result) => {
  //     if (!Util.isEmpty(result)) {
  //       this.categorys = [];
  //       this.master_group.forEach((item: any) => {
  //         item.selected = false;
  //         if (item.id === result.id) {
  //           item.selected = true;
  //           this.categorys = item.master_data;
  //           this.categoryValue = this.categorys[0].id.toString();

  //           // 1件目でcategoryChangedイベントを発火する
  //           this.onCategoryClick(null, item.master_data[0], 0);
  //         }
  //       });

  //     }
  //   });

  // }


}