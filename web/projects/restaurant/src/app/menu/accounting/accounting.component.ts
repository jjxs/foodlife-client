import { Component, OnInit, Input, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Menu } from '../menu.interface';
import { MenuService, ViewChangedEvent } from '../menu.service';
import { style, trigger, state, transition, animate, keyframes } from '@angular/animations';
import { CounterService } from '../../counter/counter.service';


@Component({
  selector: 'restaurant-accounting',
  templateUrl: './accounting.component.html',
  styleUrls: ['./accounting.component.css'],
  animations: [
  ]
})
export class AccountingComponent implements OnInit, OnChanges {
  @Input() show: true;

  countPriceChanged$;

  countPrice: number = 0;
  count: number = 1;
  price: number = 0;
  last: number = 0;

  constructor(
    public menuSrv: MenuService,
    public counterSrv: CounterService
    ) {
    this.countPriceChanged$ = this.counterSrv.countPriceChanged$.subscribe((countPrice: number) => {
      this.countPrice = countPrice;
      
      this.onCountChange(1);
    });
  }

  ngOnDestroy() {
    this.countPriceChanged$.unsubscribe();
  }

  ngOnInit() {
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
  }

  onCountChange(count) {
    if(count<=0) {
      count = 1;
    }
    this.count = count;
    this.price = Math.floor(this.countPrice / this.count);
    this.last =this.countPrice % this.count;
  }
}
