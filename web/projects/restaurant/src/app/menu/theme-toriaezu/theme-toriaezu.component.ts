import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Menu } from '../menu.interface';
import { MenuService, ViewChangedEvent } from '../menu.service';
import { JsonService, Util, AuthenticationService } from 'ami';
import { MatDialog } from '@angular/material';


@Component({
  selector: 'restaurant-theme-toriaezu',
  templateUrl: './theme-toriaezu.component.html',
  styleUrls: ['./theme-toriaezu.component.css']
})
export class ThemeToriaezuComponent implements OnInit, OnChanges {

  @Input() editMode: false
  @Input() show: true
  menu_top_data = {}

  constructor(
    private jsonSrv: JsonService,
    private dialog: MatDialog,
    private menuSrv: MenuService) {
  }

  ngOnDestroy() {
  }

  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
  }

  getTopData() {
    this.jsonSrv.get('restaurant/menu/menu_top/', {}).subscribe((response?: any[]) => {
      if (!Util.isEmpty(response) && response[0]) {
      }
    });
  }

  btnClick(id) {
    if( this.editMode ) {
      this.edit(id);
    } else {
      this.process(id);
    }
  }

  edit(id) {
    
  }
  
  getItem(id) {
  }

  process(id) {
  }

  openDialog(item) {
  }

  goto(item){
  }  
}
