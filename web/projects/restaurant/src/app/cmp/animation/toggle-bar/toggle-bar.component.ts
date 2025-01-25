import { Component, OnInit, Input } from '@angular/core';
import { trigger, state, transition, style, animate, keyframes } from '@angular/animations';
import { Observable, timer } from 'rxjs';
import { Util } from 'ami';
import { MenufreeTimeInfo } from '../../../menu/menu.interface';
@Component({
  selector: 'cmp-toggle-bar',
  templateUrl: './toggle-bar.component.html',
  styleUrls: ['./toggle-bar.component.css'],
  animations: [
    trigger('flyInOut', [
      transition('void => 1', [
        animate(1000, keyframes([
          style({ opacity: 0, transform: 'translateY(100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 })
        ]))
      ]),
      transition('void => -1', [
        animate(1000, keyframes([
          style({ opacity: 0, transform: 'translateY(100%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateY(0)', offset: 1.0 })
        ]))
      ]),
      transition('1 => void', [
        animate(4000, keyframes([
          style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
          style({ opacity: 0, transform: 'translateY(-100%)', offset: 1 })
        ]))
      ]),
      transition('-1 => void', [
        animate(4000, keyframes([
          style({ opacity: 1, transform: 'translateY(0)', offset: 0 }),
          style({ opacity: 0, transform: 'translateY(-100%)', offset: 1 })
        ]))
      ])
    ])
  ]
})
export class ToggleBarComponent implements OnInit {

  constructor() { }

  dataIndex = 0;
  @Input() array: Array<MenufreeTimeInfo> = [];

  display = "";
  timer: any;
  currentIndex = 0;
  currentValue = 0;
  status = [
    { from: 0, to: 1 },
    { from: 1, to: 0 },
    { from: 0, to: -1 },
    { from: -1, to: 0 }
  ]

  ngOnInit() {
    this.timer = timer(1000, 5000).subscribe(val => {

      if (this.currentIndex > 3)
        this.currentIndex = 0

      this.currentValue = this.status[this.currentIndex].to;

      if (this.currentValue !== 0) {
        this.setDisplay();
      }

      this.currentIndex++;
    });
  }

  setDisplay() {

    this.dataIndex = 0;
    const data = this.array[this.dataIndex];   
 

   // this.display = data.menu_name + ":　" + new Date().toLocaleTimeString();
  }
}
