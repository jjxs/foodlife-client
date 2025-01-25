import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Menu } from '../menu.interface';
import { MenuService, ViewChangedEvent } from '../menu.service';
import { style, trigger, state, transition, animate, keyframes } from '@angular/animations';


@Component({
  selector: 'restaurant-theme-menu-top',
  templateUrl: './theme-menu-top.component.html',
  styleUrls: ['./theme-menu-top.component.css'],
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
export class ThemeMenuTopComponent implements OnInit, OnChanges {

  @Input() enableOrder = true;
  menuData: Array<Menu> = []
  maxPage = 0;
  currentPage = 0;
  animationStatus = undefined;

  viewChanged$;

  @Output() pageChanged = new EventEmitter<number>();


  constructor(private srv: MenuService) {
    this.viewChanged$ = this.srv.viewChanged$.subscribe((event: ViewChangedEvent) => {
      if (event.current_page >= 0) {
        this.currentPage = event.current_page;
      }
      if (event.max_page > 0) {
        this.maxPage = event.max_page;
      }
      this.menuData = event.view_data;
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
