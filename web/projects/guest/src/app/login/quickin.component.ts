import { Component, OnInit, ViewChild } from '@angular/core';
import jsQR from "jsQR";
import { AuthenticationService } from '../ami/authentication.service';

@Component({
  selector: 'app-quickin',
  templateUrl: './quickin.component.html',
  styleUrls: ['./quickin.component.css']
})
export class QuickinComponent implements OnInit {

  nickname = "";
  constructor(private authSrv: AuthenticationService) { }

  ngOnInit() {
   
  }


}

