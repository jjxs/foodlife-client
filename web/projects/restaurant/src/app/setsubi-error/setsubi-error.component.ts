import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-setsubi-error',
  templateUrl: './setsubi-error.component.html',
  styleUrls: ['./setsubi-error.component.css']
})
export class SetsubiErrorComponent {
  mac_id;
  
  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.mac_id = this.route.snapshot.params['mac_id'];
  }

}
