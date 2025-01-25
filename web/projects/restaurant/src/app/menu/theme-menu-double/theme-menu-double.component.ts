import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Menu } from '../menu.interface';
import { MenuService, ViewChangedEvent } from '../menu.service';
import { style, trigger, state, transition, animate, keyframes } from '@angular/animations';


@Component({
  selector: 'restaurant-theme-menu-double',
  templateUrl: './theme-menu-double.component.html',
  styleUrls: ['./theme-menu-double.component.css'],
  animations: [
    trigger('animationStatus', [
      state('left', style({})),
      state('right', style({})),
      transition('* => right', [
        animate(400, keyframes([
          style({ opacity: 0, transform: 'translateX(100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
        ]))
      ]),
      transition('* => left', [
        animate(400, keyframes([
          style({ opacity: 0, transform: 'translateX(-100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
        ])),
      ]),
      transition('* => end', [
        animate(800, keyframes([
          style({ opacity: 0, transform: 'translateX(100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(-100px)', offset: 0.4 }),
          style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
        ]))
      ]),
      transition('* => front', [
        animate(800, keyframes([
          style({ opacity: 0, transform: 'translateX(-100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(100px)', offset: 0.4 }),
          style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class ThemeMenuDoubleComponent implements OnInit, OnChanges {

  private _menuData: Array<Menu>;
  private _currentPage = 0;
  private _maxPage = 0
  @Input() enableOrder = true;
  @Input('viewData') set menuData(viewData: Array<Menu>){
    this._menuData = viewData;
  };
  get menuData(): Array<Menu> {
    return this._menuData;
  }

  @Input('maxPage') set maxPage(maxPage: number) {
    this._maxPage = maxPage
  };

  get maxPage(): number {
    return this._maxPage;
  }

  @Input('currentPage') set currentPage(currentPage: number) {
    this._currentPage = currentPage
  };

  get currentPage(): number {
    return this._currentPage;
  }

  // menuData: Array<Menu> = []
  // maxPage = 0;
  // currentPage = 0;
  animationStatus = undefined;

  viewChanged$;

  @Output() pageChanged = new EventEmitter<number>();


  constructor(public menuSrv: MenuService) {
    this.viewChanged$ = this.menuSrv.viewChanged$.subscribe((event: ViewChangedEvent) => {
      if (event.current_page >= 0) {
        this._currentPage = event.current_page;
      }
      if (event.max_page > 0) {
        this._maxPage = event.max_page;
      }
      this._menuData = event.view_data;
    });
  }

  ngOnDestroy() {
    this.viewChanged$.unsubscribe();
  }
  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    // let log: string[] = [];
    // for (let propName in changes) {
    //   console.log(propName);
    //   let changedProp = changes[propName];
    //   console.log(changedProp.currentValue);

    // }
  }

  nextClick(event) {

    // console.info(this.viewData, 'view_data');
    if (this.currentPage >= this.maxPage - 1)
      return;

    if (this.currentPage === this.maxPage - 2) {
      this.animationStatus = "end";
    } else {
      this.animationStatus = "right";
    }
    this.currentPage += 1;
    this.pageChanged.emit(this.currentPage);
  }

  preClick(event) {

    // console.info(this.viewData, 'view_data');

    if (this.currentPage <= 0)
      return;

    if (this.currentPage === 1) {
      this.animationStatus = "front";
    } else {
      this.animationStatus = "left";
    }
    this.currentPage -= 1;
    this.pageChanged.emit(this.currentPage);
  }

  animationDone(event) {
    this.animationStatus = "";
  }
}
