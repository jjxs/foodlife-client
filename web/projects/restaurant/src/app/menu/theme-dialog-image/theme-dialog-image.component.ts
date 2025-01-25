import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, Util } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MenuService } from '../menu.service';
import { Menu } from '../menu.interface';
import { CounterService } from '../../counter/counter.service';
import { AppService } from '../../../../../restaurant/src/app/app.service';

@Component({
  selector: 'theme-dialog-image',
  templateUrl: './theme-dialog-image.component.html',
  styleUrls: ['./theme-dialog-image.component.css']
})
export class ThemeDialogImageComponent implements OnInit {

  item;
  image_list = [];
  current_image;
  current_index = 0;
  site_image_host = "";

  constructor(
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    public dialogRef: MatDialogRef<ThemeDialogImageComponent>,
    public menuSrv: MenuService,
    public appService: AppService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.site_image_host = this.appService.SiteImageHost + '/';
    this.item = data['item'];
    if (this.item.option != null) {
      this.image_list = this.item.option.substr(0, this.item.option.length - 1).split(';');
    }
    this.current_image = this.image_list[0];
    this.current_index = 0;
  }

  ngOnInit() {
  }
  close(): void {
    this.dialogRef.close(null);
  }
  preClick(event) {
    if (this.current_index > 0) {
      this.current_index = this.current_index - 1;
      this.current_image = this.image_list[this.current_index];
    }
  }

  nextClick(event) {
    if (this.current_index < (this.image_list.length - 1)) {
      this.current_index = this.current_index + 1;
      this.current_image = this.image_list[this.current_index];
    }
  }

}
