import { Component, OnInit } from '@angular/core';
import { AuthenticationService, AuthenticatedEvent } from '../ami/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  params = {
    username: "",
    password: ""
  }

  constructor(private authSrv: AuthenticationService) { }

  ngOnInit() {
    // this.authSrv.Authenticated$.subscribe((event: AuthenticatedEvent) => {
    //   if (event.result) {
      
    //   }
    // });
  }

  login() {
    this.authSrv.authenticate(this.params);
  }

}
