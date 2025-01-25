import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MenuService } from '../../menu/menu.service';
import { Menu } from '../../menu/menu.interface';
import { CounterService } from '../../counter/counter.service';
import { CmpService } from '../../cmp/cmp.service';
import { AppService } from '../../app.service';
import { Util } from 'ami';
import { StaffMenuViewComponent } from '../../staff/staff-menu-view/staff-menu-view.component';


@Component({
  selector: 'restaurant-guest-menu-view',
  templateUrl: './guest-menu-view.component.html',
  styleUrls: ['./guest-menu-view.component.css']
})
export class GuestMenuViewComponent extends StaffMenuViewComponent implements OnInit {

}
