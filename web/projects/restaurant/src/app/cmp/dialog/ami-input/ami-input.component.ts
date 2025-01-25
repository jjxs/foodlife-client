import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { trigger, state, transition, style, animate, keyframes } from '@angular/animations'

@Component({
  selector: 'ami-input',
  templateUrl: './ami-input.component.html',
  styleUrls: ['./ami-input.component.css'],
  animations: [
    trigger('changecount', [
      transition('* => *', [
        animate(100, keyframes([
          style({ 'font-size': '180%', 'font-weight': '900', color: 'white', offset: 0.2 }),
          style({ 'font-size': '120%', 'font-weight': '500', color: 'black', offset: 1.0 })
        ]))
      ])
    ]),
  ]
})
export class AmiInput {
  value = '';
  constructor(
    public dialogRef: MatDialogRef<AmiInput>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ok() {
    this.dialogRef.close( {status: 'yes', data: this.value});
   }

  close(): void {
    this.dialogRef.close( {status: 'no'});
  }

  onInput(event) {
    this.value = this.value.toString() + event;
  }
  backspaceInput() {
    let val = this.value.toString();
    if (val.length > 0) {
      val = val.substr(0, val.length - 1);
      this.value = val;
    }
  }
  clearInput() {
    this.value = '';
  }

}
