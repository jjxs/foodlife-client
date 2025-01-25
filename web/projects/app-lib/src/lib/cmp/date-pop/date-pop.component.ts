import { DatePopWinComponent } from './date-pop-win/date-pop-win.component';
import { Component, OnInit, OnDestroy, Input, forwardRef } from '@angular/core';
import { Util } from '../../utils/util';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { Subject } from 'rxjs';
import { coerceBooleanProperty } from '@angular/cdk/coercion';

// export enum DateSelectType {
//   Datetime = 0,
//   Day = 1,
// }

// export class DateSelectErrorStateMatcher implements ErrorStateMatcher {
//   isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
//     const isSubmitted = form && form.submitted;
//     return (control && control.invalid);
//   }
// }


@Component({
  selector: 'app-date-pop',
  templateUrl: './date-pop.component.html',
  styleUrls: ['./date-pop.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => DatePopComponent) },
    // { provide: NG_VALIDATORS, multi: true, useExisting: DatePopComponent },
  ],
  // host: {
  //   '[class.example-floating]': 'shouldLabelFloat',
  //   '[id]': 'id',
  //   '[attr.aria-describedby]': 'describedBy',
  // }
})
export class DatePopComponent implements ControlValueAccessor, OnDestroy, OnInit {
  ngOnInit(): void {
  }
  ngOnDestroy(): void {

  }
  constructor(
    private dialog: MatDialog,
    private auth: AuthService,
    private datepipe: DatePipe) { }

  @Input('selectType') selectType: string = "Day";

  onChange = (_: any) => { };
  onTouched = () => { };
  stateChanges = new Subject<void>();

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  @Input()
  get readonly(): boolean { return this._readonly; }
  set readonly(value: boolean) {
    this._readonly = coerceBooleanProperty(value);
    // this._disabled ? this.group.reado : this.group.enable();
    this.stateChanges.next();
  }
  _readonly = false;


  innerValue: string;
  innerDate: Date;
  outerValue: string;

  get value(): string {
    return this.innerValue;
  }


  set value(val: string) {
    if (this.innerValue === val) {
      return;
    }

    if (Util.isEmpty(val)) {
      this.innerValue = "";
      this.innerDate = new Date();
      this.onChange(this.innerValue)
      return;
    }

    let date: Date;
    const regex = /[0-9¥-¥/]*(T| )[0-9¥:]*/g;
    if (regex.test(val)) {
      this.innerDate = new Date(val);
    } else {
      this.innerDate = new Date()
    }
    this.innerValue = this.datepipe.transform(this.innerDate, this.auth.DateFormatDef[this.selectType])
    this.outerValue = this.datepipe.transform(this.innerDate, "yyyy-MM-dd")
    this.onChange(this.outerValue)
  }

  writeValue(value: string) {
    this.value = value;
  }
  // @Input() value: string;
  // @Output() valueChange = new EventEmitter<string>();  // 出力口。

  open() {
    //console.log(".... open .... ")
    const dialog = this.dialog.open(DatePopWinComponent, {
      width: '300px',
      height: '355px',
      hasBackdrop: true,
      // disableClose: true,
      autoFocus: true,
      data: this.innerDate
    });
    dialog.afterClosed().subscribe((result: Date) => {
      if (Util.isEmpty(result)) {
        //console.log("... result is empty")
        return;
      }

      //console.log("... result is not empty", result);
      this.innerDate = result;
      this.innerValue = this.datepipe.transform(result, this.auth.DateFormatDef[this.selectType])
      this.outerValue = this.datepipe.transform(this.innerDate, "yyyy-MM-dd")
      this.onChange(this.outerValue)
      // this.valueChange.emit(val)
    })
  }


  // change(value) { //値が変化した
  //   this.value = value
  //   this.valueChange.emit(this.value)
  // }

  // clear() { //入力値をクリア
  //   this.value = ""
  //   this.valueChange.emit(this.value)
  // }

}
