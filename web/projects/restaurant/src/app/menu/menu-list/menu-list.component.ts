import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CmpService } from '../../cmp/cmp.service';
import { JsonService, Util, AuthenticationService } from 'ami';
import { Master, MenuCategory, Menu, CategoryChangedEvent } from '../menu.interface';
import { MenuService, OrderEvent } from '../menu.service';
import { SeatService, MenufreeConfirmResult } from '../../seats/seat.service';
import { trigger, state, transition, style, animate, keyframes } from '@angular/animations';


// （TODO: 所属料理、注文可能品ない場合、該当タブ非表示にする）<br>
// （TODO: 持ち帰りから遷移可能、３モードが必要＝＞席モード、放題モード、持ち帰りモード）

@Component({
  selector: 'restaurant-menu-list',
  templateUrl: './menu-list.component.html',
  styleUrls: ['./menu-list.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        animate(1200, keyframes([
          style({ opacity: 0, transform: 'translateX(-100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(20px)', offset: 0.4 }),
          style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
        ]))
      ])
      // transition('* => void', [
      //   animate(300, keyframes([
      //     style({ opacity: 0, transform: 'translateX(0)', offset: 0 }),
      //     style({ opacity: 1, transform: 'translateX(100%)', offset: 1.0 })
      //   ]))
      // ])
    ])
  ],
})
export class MenuListComponent implements OnInit , OnDestroy{

  @Input() enableOrder = true;
  @Input() menuCount = 9;
  @Input() show = false;

  list = [];
  send_order_list = [];

  // すべてのメニューデータ
  orign_menus = null;
  menufree_list = [];


  // 現在のカテゴリー（現在ページ）で、表示するデータ
  // menu_data = [];
  // max_page = 0;

  // 每页应显示的料理内容,索引就是页面位置，从0开始
  menu_page: Array<Array<Menu>> = [];
  // 用于定义 移动页面的时候，每页应该从menu_page哪里开始表示
  menu_page_position = {};
  // 用于定义 料理种别被选中时，应该从menu_page哪里开始表示
  menu_page_category = {};

  currentPage = 0;
  maxPage = 0;
  category_value = -1;

  categroyData: Array<Master>;

  theme_id = 'default';

  disabledTab = false;
  public viewData;

  is_sending = false;

  public show_order_theme = true;
  public show_ranking_theme = false;

  currentCategory;
  currenCategoryChangedEvent;

  categoryChanegd$;
  afterMenufreeConfirm$;
  themeChanged$;
  constructor(
    private menuSrv: MenuService,
    private cmp: CmpService,
    private authSrv: AuthenticationService,
    private jsonSrv: JsonService,
    private seatSrv: SeatService
  ) {
    // 放題注文確認完了後
    this.afterMenufreeConfirm$ = this.seatSrv.afterMenufreeConfirm$.subscribe((response: MenufreeConfirmResult) => {
      this.loadGroupChanged(this.currenCategoryChangedEvent);
      // console.log('// 注文確認完了後')
      // console.log(response);
      // TODO: 确认放题注文有无，并取得放题彩带列表 刷新菜单数据
      // onInit 同样技能统合
      // this.cmp.loading('放題の注文が確認完了しました、メニューリフレッシュする')
      // this.setMenuFreeData(response.list);
      // this.cmp.unloading(700);
    });
    this.themeChanged$ = this.menuSrv.themeChanged$.subscribe((theme_id: string) => {
      this.theme_id = theme_id;
      if (this.menuSrv.disabled_tab_theme_list.indexOf(theme_id) >= 0) {
        this.disabledTab = true;
      } else {
        this.disabledTab = false;
      }

      if (this.menuSrv.show_order_theme_list.indexOf(theme_id) >= 0) {
        this.show_order_theme = true;
      } else {
        this.show_order_theme = false;
      }

      if (this.menuSrv.show_ranking_theme_list.indexOf(theme_id) >= 0) {
        this.show_ranking_theme = true;
      } else {
        this.show_ranking_theme = false;
      }
    });

    this.categoryChanegd$ = this.menuSrv.categoryChanged$.subscribe((category: CategoryChangedEvent) => {
      this.categoryChanged(category);
    });

    // 注文発生する(POP画面など、他の画面から注文した場合)
    this.menuSrv.order$.subscribe((order: OrderEvent) => {
      // console.log(order)
      const menu = this.checkSpec(Util.copy(order));
      const item = this.list.find((data) =>
        data.menu['id'] === menu['id'] && data.menu['name'] === menu['name']
      );
      if (item) {
        if (item.count >= order.menu.mincount && order.isFromOrderButton) {
          order.count = 1
        }
        item.count += order.count;
      } else {
        this.list.unshift({
          menu: menu,
          count: order.count
        });
      }
    });

    // 注文後
    this.menuSrv.afterOrder$.subscribe((result: boolean) => {
      this.is_sending = false;
      // this.cmp.unloading();
      if (result) {
        this.list = [];
      } else {
        this.list = this.send_order_list;
        // 注文できない場合、席の状況を再度確認する
        // this.getSeatStatus();
      }
      this.send_order_list = [];

    });
  }

  checkSpec(order) {
    for (const i in order.menu.menu_options) {
      if (order.menu.menu_options[i]['select_name'] !== undefined
        && order.menu.menu_options[i]['select_name'] !== false) {
        order.menu.name = order.menu.name + '-' + order.menu.menu_options[i]['select_name'];
      }
    }
    return order.menu;
  }

  ngOnDestroy() {
    this.afterMenufreeConfirm$.unsubscribe();
    this.categoryChanegd$.unsubscribe();
    this.themeChanged$.unsubscribe();
  }

  ngOnInit() {
  }


  setMenuFreeData(list: Array<number>) {

    list.forEach(menuId => {

      // 最新のメニューデータで放題情報を設定
      if (!Util.isEmpty(this.orign_menus[menuId])) {
        this.orign_menus[menuId].is_free = true;
      }

      // 最新放題メニューをリストへ追加
      if (this.menufree_list.indexOf(menuId) < 0) {
        this.menufree_list.push(menuId);
      }
    });
  }

  // 放題情報取得 （取得必要となるタイミング：初期、刷新後、webscoket受信した場合（カテゴリー選択時メニュー新規取得しないため、処理必要ない））
  getMenuFreeData() {
    this.jsonSrv.get('restaurant/menu/menufree_menus/', { seat_id: this.seatSrv.SeatId })
      .subscribe((response: Array<number>) => {

        if (response && !Util.isEmptyArray(response)) {
          this.setMenuFreeData(response);
        }
      });
  }

  onPageChanged(event) {
    if (event < 0) {
      // 滑动事件会触发多次，change事件，但有一次为有效，有效的情况下才继续
      return;
    }
    this.category_value = this.menu_page_category[event];
    const me = this;
    const theme_id = this.theme_id;
    const startPosition = this.menu_page_position[event];
    this.categroyData.map(function (row, index, array) {
      if (row['id'] == me.category_value) {
        me.theme_id = row['theme_id'];
        me.currentCategory = row;
      }
    });
    if (me.theme_id != theme_id) {
      this.menuSrv.themeChanged(me.theme_id);
      this.theme_id = me.theme_id;
    }

    this.viewData = this.menu_page[event];
    this.maxPage = this.menu_page.length;
    this.currentPage = event;
    this.menuSrv.viewChanged({
      current_page: startPosition,
      max_page: this.menu_page.length,
      view_data: this.menu_page[event],
      category: this.currentCategory
    });


  }

  // Groupが変更した場合
  loadGroupChanged(event: CategoryChangedEvent) {
    this.currenCategoryChangedEvent = event;
    const group: any = event.group;
    const category_data = event.group.master_data;
    // console.info(group);
    const groupID = group.id;
    let groupOption = {};
    if (!Util.isEmpty(group.option)) {
      groupOption = group.option;
    }
    // console.info(this.theme_id, '|menu_list');
    this.menu_page = [];
    this.menu_page_position = {};
    this.jsonSrv.get('restaurant/menu/menucategory/', { category_group: groupID, seat_id: this.seatSrv.SeatId }).subscribe((response?: Array<MenuCategory>) => {

      // console.log('master/menucategory/', response)
      if (Util.isEmpty(response) || Util.isEmpty(response[0])) {
        this.cmp.unloading(500);
        return;
      }

      const dict = {};
      if (category_data && category_data[0]) {
        // master データ
        category_data.forEach(category => {
          dict[category.id] = [];
        });

        // カテゴリー データ
        response.forEach(item => {
          // 整理MenuCategory定义的，每种Category所属的Menu
          const m = this.orign_menus[item.menu];
          if (m!=undefined) {
            m['option'] = groupOption;
            m['menu_options'] = item['menu_options'];
            m['name'] = item['menu_name'];
            m['image'] = item['image'];
            m['ori_price'] = item['menu_ori_price'];
            m['price'] = item['menu_price'];
            m['course'] = item['course'];
            m['introduction'] = item['introduction'];
            m['note'] = item['note'];
            m['mincount'] = item['mincount'];
            m['is_free'] = (Util.isEmpty(item['is_free']) ? false : Boolean(item['is_free']) );
            m['stock_status'] = item['stock_status'];
            dict[item.category].push(m);
          }
        });

        // ページ毎に整理する
        category_data.forEach(category => {
          const array: Array<Menu> = dict[category.id];
          if (array.length == 0) {
            return;
          }
          // 各カテゴリーのページ目
          this.menu_page_position[category.id] = this.menu_page.length;
          this.menuCount = category.menu_count;

          if (array.length <= this.menuCount) {
            this.menu_page_category[this.menu_page.length] = category.id;
            this.menu_page.push(array);
          } else {
            let temp: Array<Menu> = new Array<Menu>();
            for (let i = 0; i < array.length; i++) {
              temp.push(array[i]);
              if (temp.length == this.menuCount) {
                this.menu_page_category[this.menu_page.length] = category.id;
                this.menu_page.push(temp);
                temp = new Array<Menu>();
              }
            }

            if (array.length > 0 && temp.length > 0) {
              this.menu_page_category[this.menu_page.length] = category.id;
              this.menu_page.push(temp);
            }
          }
        });
        let startPosition = 0;
        let menu_data = [];
        while (true) {
          this.category_value = category_data[event.index].id;
          this.currentCategory = category_data[event.index];

          startPosition = this.menu_page_position[category_data[event.index].id];
          menu_data = this.menu_page[startPosition];
          if ( Util.isEmpty(menu_data) ) {
            event.index = event.index + 1;
          } else {
            break;
          }
          if ( event.index>=category_data.length ) {
            break;
          }
          console.info(menu_data, event.index, category_data.length)
        }
        if ( !Util.isEmpty(menu_data) ) {
          this.menuSrv.viewChanged({
            current_page: startPosition,
            max_page: this.menu_page.length,
            view_data: menu_data,
            category: this.currentCategory
          });
        }

        // if (category_data[0].group == 23) {
        //   var aa = document.getElementsByName("restaurantmenutab");
        //   for (var i = 0; i < aa.length; i++) {
        //     aa[i].style.display = 'none';
        //   }
        // } else {
        //   var aa = document.getElementsByName("restaurantmenutab");
        //   for (var i = 0; i < aa.length; i++) {
        //     aa[i].style.display = 'flex';
        //   }
        // }
      }
    });

  }

  // tabが変更する場合
  categoryChanged(event: CategoryChangedEvent) {
    this.categroyData = event.group.master_data;
    if (this.menu_page_position[event.id]) {
      const startPosition = this.menu_page_position[event.id];
      const menu_data = this.menu_page[startPosition];

      this.viewData = menu_data;
      this.maxPage = this.menu_page.length;
      this.currentPage = startPosition;
      const me = this;
      this.categroyData.map(function (row, index, array) {
        if (row['id'] == event.id) {
          me.currentCategory = row;
        }
      });
      this.menuSrv.viewChanged({
        current_page: startPosition,
        max_page: this.menu_page.length,
        view_data: menu_data,
        category: this.currentCategory
      });
    } else {
      // menu_page_positionに存在しない場合（グループ変更した際）
      // 該当カテゴリーのグループデータを再作成
      if (Util.isEmpty(this.orign_menus)) {
        this.orign_menus = this.menuSrv.getMenuList();
        // すべてのメニューデータ取得
        // this.jsonSrv.get('restaurant/menu/menu_list/', {}).subscribe((response?: Array<Menu>) => {
        //   let array = [];
        //   if (!Util.isEmpty(response) && response[0]) {
        //     response.forEach((menu: Menu) => {
        //       menu.is_free = false;
        //       this.orign_menus[menu.id] = menu;
        //     });

        // TODO： 毎回メニュー最新データ取得する場合、放題メニューでデータを更新する
        this.getMenuFreeData();

        this.loadGroupChanged(event);
        //   }
        // });
      } else {
        this.loadGroupChanged(event);
      }

    }
  }

  // 注文確定押下
  onOrder(event) {
    // this.is_sending = true;
    // this.cmp.loading('注文処理中... ...');
    if (this.list.length>0) {
      this.send_order_list = this.list;
      this.list = [];
      this.menuSrv.sendOrder(this.send_order_list);
    }
  }


  clear(event, item) {
    const index = this.list.findIndex((data) => data === item);
    this.list.splice(index, 1);
  }


}

