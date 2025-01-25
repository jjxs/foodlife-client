import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuthenticationService, AuthenticatedEvent, Util } from 'ami';
import { environment } from 'projects/restaurant/src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  params = {
    saas_id: '',
    username: '',
    password: ''
  }

  default_saas_id = '';
  authenticated;
  constructor(
    private authSrv: AuthenticationService,
    private dialogRef: MatDialogRef<LoginComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.params.saas_id = Util.getSaasID();
    this.default_saas_id = Util.getSaasID();
    this.authenticated = this.authSrv.Authenticated$.subscribe((event: AuthenticatedEvent) => {
      if (event.result === true) {
        this.dialogRef.close();
        // this.authSrv.init();
      }
      this.authenticated.unsubscribe();
    });

  }

  ngOnInit() {
    //console.log("this LoginComponent")
  }

  ngOnDestroy() {
    this.authenticated.unsubscribe();
  }

  login() {
    this.authSrv.authenticate(this.params);
  }

  guestLogin() {
    this.authSrv.authenticate(environment.guest_login_info);
  }
}
