import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-seat-view',
  templateUrl: './seat-view.component.html',
  styleUrls: ['./seat-view.component.css']
})
export class SeatViewComponent implements OnInit {

  isHandset: Observable<BreakpointState> = this.breakpointObserver.observe(Breakpoints.Handset);

  amiDate = new Date();

  constructor(private breakpointObserver: BreakpointObserver) {
  }


  ngOnInit() {
    this.isHandset.subscribe(result => {
      result.matches = false;
      return 'dialog';
    });
  }
  
  clicked() {
    this.amiDate = new Date();
  }
}

