import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationService } from '../ami/authentication.service';

@Component({
  selector: 'ons-page',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('carousel') carousel;

  @ViewChild('homedialog') public homedialog;
  items = [{
    style: {
      'background-image': 'url(/assets/images/menu/000001.jpg)',
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
      'background-position': 'center center',
    }
  }, {
    style: {
      'background-image': 'url(https://tblg.k-img.com/restaurant/images/Rvw/25659/640x640_rect_25659146.jpg)',
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
      'background-position': 'center center',
    }

  }, {
    style: {
      'background-image': 'url(https://c-chefgohan.gnst.jp/imgdata/recipe/57/01/157/rc732x546_1209130251_72f2a6a263a7251f9829f7347382faa7.jpg)',
      'background-size': 'cover',
      'background-repeat': 'no-repeat',
      'background-position': 'center center',
    }
  }];

  title = "";

  constructor(private authSrv: AuthenticationService) { }

  ngOnInit() {
    this.authSrv.scanAfter$.subscribe((result) => {
      this.authSrv.Usable = true;
      this.title = result.toString();
      ;
    });
  }

  order() {
    this.authSrv.scan({});
  }

  prev() {
    this.carousel.nativeElement.prev();
  }
  next() {
    this.carousel.nativeElement.next();
  }

  onPreHide(event) {
    // event.cancel(); // cancel hiding popover
  }

  login() {
    this.authSrv.login({});
  }
}
