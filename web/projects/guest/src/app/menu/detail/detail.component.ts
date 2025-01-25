import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent {

  @Input() menuData = [{ id: 0, name: '', price: 0, count: 0, unit: '', url: '' }];

  @Input() menuId = 0;

  current: any;

  constructor() {
    this.current = this.menuData[0];
  }

  prev() {
    this.menuId = this.menuId - 1;
    this.current = this.menuData[this.menuId]
    
  }

  next() {
    this.menuId = this.menuId + 1;
    this.current = this.menuData[this.menuId]

  }


}
