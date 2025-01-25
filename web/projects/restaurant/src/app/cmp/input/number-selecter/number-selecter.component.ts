import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { timer } from 'rxjs';
import { trigger, state, transition, style, animate, keyframes } from '@angular/animations';
@Component({
  selector: 'number-selecter',
  templateUrl: './number-selecter.component.html',
  styleUrls: ['./number-selecter.component.css'],
  animations: [
    trigger('changecount', [
      transition('* => *', [
        animate(100, keyframes([
          style({ 'font-size': '180%', 'font-weight': '900', color: 'white', offset: 0.2 }),
          style({ 'font-size': '120%', 'font-weight': '500', color: 'black', offset: 1.0 })
        ]))
      ])
      // transition('* => void', [
      //   animate(300, keyframes([
      //     style({ opacity: 0, transform: 'translateX(0)', offset: 0 }),
      //     style({ opacity: 1, transform: 'translateX(100%)', offset: 1.0 })
      //   ]))
      // ])
    ])
  ]
})
export class NumberSelecterComponent implements OnInit {

  @Input() count = 0;
  @Input() max = 99;
  @Input() mincount = 1;
  @Output() countChange = new EventEmitter<number>();

  timer: any;

  constructor() { }

  ngOnInit() {
  }

  mousedown(event, flg) {
    // event.stopPropagation();
    const me = this;

    this.timer = timer(1000, 100)
      .subscribe(val => {
        if (flg)
          this.add()
        else
          this.remove()
      });
  }

  mouseup(event) {
    //event.stopPropagation();
    try {
      this.timer.unsubscribe();
    } catch (error) {

    }
  }

  add() {
    this.count = parseInt(this.count.toString()) + 1;
    if ( this.count < this.mincount ) {
      this.count = this.mincount;
    }
    this.countChange.emit(this.count);
  }

  remove() {
    this.count = parseInt(this.count.toString()) - 1;
    if ( this.count < this.mincount ) {
      this.count = 0;
    }
    this.countChange.emit(this.count);
  }

  dblclck(event) {
    event.stopPropagation();
  }
}
