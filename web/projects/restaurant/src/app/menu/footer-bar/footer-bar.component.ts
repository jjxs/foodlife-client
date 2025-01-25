import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Menu } from '../menu.interface';
import { MenuService, ViewChangedEvent } from '../menu.service';
import { style, trigger, state, transition, animate, keyframes } from '@angular/animations';
import { Router } from '@angular/router';
import { JsonService } from 'ami';
import { MatDialog } from '@angular/material';
import { MenuLanguageComponent } from '../menu-language/menu-language.component';
import { AppService } from '../../app.service';


@Component({
  selector: 'restaurant-footer-bar',
  templateUrl: './footer-bar.component.html',
  styleUrls: ['./footer-bar.component.css'],
  animations: [
  ]
})
export class FooterBarComponent implements OnInit {

  @Input() menu = 'top';

  @Input() seat = {};

  lang;

  show_call_staff:boolean = false;

  constructor(
    public menuSrv: MenuService,
    private jsonSrv: JsonService,
    private dialog: MatDialog,
    private router: Router,
    private appService: AppService
  ) {
  }

  ngOnDestroy() {
  }

  ngOnInit() {
    this.show_call_staff = this.appService.showCallStaff()
  }

  btnClick(goto) {
    this.menuSrv.menuChanged(goto);
  }

  callStaff() {
    console.log('call staff->' + this.seat['seat_no'])
    this.jsonSrv.post('restaurant/menu/call_staff/', { seat_no: this.seat['seat_no'], seat_name: this.seat["name"] }).subscribe((response=>{}));
  }

  language() {
    const dialog = this.dialog.open(MenuLanguageComponent, {
      width: '400px',
      height: '240px',
      data: {
      }
    });
    dialog.afterClosed().subscribe(result => {
    });
  }

}
