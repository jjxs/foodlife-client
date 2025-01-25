import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ons-page',
  templateUrl: './reservation.component.html',
  styleUrls: ['./reservation.component.css']
})
export class ReservationComponent implements OnInit {

  isEdit = false;

  shownext = false;
  name = '';
  reservation_display_name = '';
  reservation_name = '';
  reservation_phone = '';
  reservation_allow_access = '';
  reservation_datetime = '';
  vegetables = ['連絡OK', '連絡NG'];
  selectedVegetable = 'Bananas';
  colors = ['Red', 'Green', 'Blue'];
  checkedColors = ['Green', 'Blue'];

  constructor() { }

  ngOnInit() {
  }

}
