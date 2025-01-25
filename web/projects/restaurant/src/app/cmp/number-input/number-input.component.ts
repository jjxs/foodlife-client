import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'restaurant-number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.css']
})
export class NumberInputComponent implements OnInit {

  value: number = 0;
  params_value: number = 0;
  constructor(
    public dialogRef: MatDialogRef<NumberInputComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    this.params_value = this.data.value;
  }

  onInput(event: String) {
    const temp = Number(this.value.toString() + event);
    if (!isNaN(temp)) {
      this.value = temp;
    }
  }

  clearInput() {
    this.value = 0;
  }

  backspaceInput() {
    let val = this.value.toString();
    if (val.length > 0) {
      val = val.substr(0, val.length - 1);
      this.value = Number(val);
    }
  }

  confrim() {
    this.dialogRef.close(this.value);
  }

  close(event) {
    this.dialogRef.close(this.params_value);
  }
}
