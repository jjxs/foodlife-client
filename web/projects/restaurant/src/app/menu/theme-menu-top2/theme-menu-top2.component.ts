import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Menu } from '../menu.interface';
import { MenuService, ViewChangedEvent } from '../menu.service';
import { style, trigger, state, transition, animate, keyframes } from '@angular/animations';


@Component({
  selector: 'restaurant-theme-menu-top2',
  templateUrl: './theme-menu-top2.component.html',
  styleUrls: ['./theme-menu-top2.component.css']
})
export class ThemeMenuTop2Component implements OnInit, OnChanges {

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
