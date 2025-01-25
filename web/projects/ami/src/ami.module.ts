import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AmiComponent } from './ami.component';
import { AmiScaner } from './cmp/scaner.component';


@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [AmiComponent, AmiScaner],
  exports: [AmiComponent, AmiScaner] // 外で利用したい部品は必ずここに置く
})
export class AmiModule { }
