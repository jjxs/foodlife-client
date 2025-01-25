import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, Util } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { MenuService } from '../menu.service';
import { Menu } from '../menu.interface';
import { CounterService } from '../../counter/counter.service';
import { AppService } from '../../app.service';

@Component({
  selector: 'restaurant-menu-language',
  templateUrl: './menu-language.component.html',
  styleUrls: ['./menu-language.component.css']
})
export class MenuLanguageComponent implements OnInit {
  languageList = [
    { 'id' : 'ja', 'name': '日本語'},
    { 'id' : 'en', 'name': 'English'},
    { 'id' : 'zh', 'name': '中文'}
  ];

  language;

  constructor(
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    public dialogRef: MatDialogRef<MenuLanguageComponent>,
    public menuSrv: MenuService,
    private appService: AppService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.language = this.appService.getLanguage();
  }

  ngOnInit() {
  }

  ok() {
    this.appService.setLanguage(this.language);
    this.dialogRef.close({});
  }

  close(): void {
    this.dialogRef.close(null);
  }

}
