import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sel-counter',
  templateUrl: './sel-counter.component.html',
  styleUrls: ['./sel-counter.component.css']
})
export class SelCounterComponent implements OnInit {

  @Input() count = 2;

  constructor() { }

  ngOnInit() {
  }

}
