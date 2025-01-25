import { Component, OnInit } from '@angular/core';
import { PopMenuService } from './pop-menu.service';

@Component({
  selector: 'app-pop-menu',
  templateUrl: './pop-menu.component.html',
  styleUrls: ['./pop-menu.component.css']
})
export class MenuPopComponent implements OnInit {

  constructor(
    private popSrv: PopMenuService
  ) { }

  ngOnInit() {
  }

  pop(btn) {
    this.popSrv.pop(btn);

  }

}
