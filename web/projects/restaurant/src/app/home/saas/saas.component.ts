import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { AuthenticationService, AuthenticatedEvent, Util } from 'ami';
import { environment } from 'projects/restaurant/src/environments/environment';

@Component({
  selector: 'app-saas',
  templateUrl: './saas.component.html',
  styleUrls: ['./saas.component.css']
})
export class SaasComponent implements OnInit, OnDestroy {
  saas_id = '';
  constructor(
    private dialogRef: MatDialogRef<SaasComponent>,
  ) {
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  save() {
    this.saas_id = this.saas_id.trim();
    if ( this.saas_id == '' ) {
      return;
    }
    Util.setSaasID(this.saas_id);
    this.dialogRef.close();
  }
}
