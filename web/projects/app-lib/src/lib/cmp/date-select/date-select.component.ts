import { Component, OnInit, OnDestroy, Input, ElementRef, Optional, forwardRef, Host, SkipSelf } from '@angular/core';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Util } from '../../utils/util';
import {
  ControlValueAccessor,
  FormGroup,
  FormBuilder,
  FormControl,
  FormGroupDirective,
  NgForm,
  NG_VALUE_ACCESSOR,
  AbstractControl,
  ControlContainer
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';

export enum DateSelectType {
  Datetime = 0,
  Day = 1,
}

export class DateSelectErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {

    if (Util.isEmpty(control))
      return false;

    if (control.disabled)
      return false

    if (!control.dirty && control.untouched)
      return false

    if (Util.isEmpty(control.errors))
      return false

    return true;

  }
}


@Component({
  selector: 'app-date-select',
  templateUrl: './date-select.component.html',
  styleUrls: ['./date-select.component.css'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, multi: true, useExisting: forwardRef(() => DateSelectComponent) },
    // { provide: NG_VALIDATORS, multi: true, useExisting: DateSelectComponent },
  ],
  // host: {
  //   '[class.example-floating]': 'shouldLabelFloat',
  //   '[id]': 'id',
  //   '[attr.aria-describedby]': 'describedBy',
  // }
})
export class DateSelectComponent implements OnInit, ControlValueAccessor, OnDestroy {

  // validate(control: AbstractControl) {

  //   let errors = [], result = {};

  //   if (this.group.get("day").errors && (this.group.get("day").dirty || this.group.get("day").touched)) {
  //     errors.push(this.creatError("day"));
  //   }
  //   // if (this.group.get("STATE_CODE").errors && (this.group.get("STATE_CODE").dirty || this.group.get("STATE_CODE").touched)) {
  //   //   errors.push(this.creatError("STATE_CODE"));
  //   // }
  //   // if (this.group.get("CITY_CODE").errors && (this.group.get("CITY_CODE").dirty || this.group.get("CITY_CODE").touched)) {
  //   //   errors.push(this.creatError("CITY_CODE"));
  //   // }

  //   if (errors.length === 0) {
  //     return null;
  //   }

  //   result[CmpValidateError.KeyWord] = errors
  //   return result;

  // }

  // creatError(key: string) {
  //   const el = this._elementRef.nativeElement.parentElement.querySelector('[formControlName="' + key + '"]');
  //   let name = "";
  //   if (el && el.getAttribute("placeholder")) {
  //     name = el.getAttribute("placeholder")
  //   }
  //   return new CmpValidateError(key, name, this.group.get(key).errors);
  // }

  // registerOnValidatorChange?(fn: () => void): void {

  // }

  @Input('selectType') selectType: String = "Day";

  matcher = new DateSelectErrorStateMatcher();

  group: FormGroup;

  // // 継承プロパティ
  // shouldLabelFloat: boolean = false; //?
  // autofilled?: boolean = true;      //?
  // describedBy = '';                 //?


  // stateChanges = new Subject<void>();
  // focused: boolean = false;
  // errorState = false;
  // controlType: string = 'swws-input-select'
  // static nextId = 0;
  // id: string = `example-tel-input-${DateSelectComponent.nextId++}`;

  onChange = (_: any) => { };
  onTouched = () => { };

  get empty() {
    return !this.group.get("day").value;
  }

  // サブスクリプション
  subs = new Subscription();

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    //this.stateChanges.next();
  }
  _placeholder: string;

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    // this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    // this._disabled ? this.group.disable() : this.group.enable();
    if (value && this.control) {
      this.control.setErrors(null)
    }
    // this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get readonly(): boolean { return this._readonly; }
  set readonly(value: boolean) {
    this._readonly = coerceBooleanProperty(value);
    // this._disabled ? this.group.reado : this.group.enable();
    // this.stateChanges.next();
    if (value && this.control) {
      this.control.setErrors(null)
    }
  }
  _readonly = false;

  @Input()
  get max(): string { return this._max; }
  set max(value: string) {
    this._max = value;
    // this._disabled ? this.group.reado : this.group.enable();
    // this.stateChanges.next();
  }
  _max = '';

  // get value(): string {
  //   if (Util.isEmpty(this.params.returnItem)) {
  //     return this.group.get("inputValue").value;
  //   }

  //   return this.group.get("returnValue").value;
  // }
  set value(val: string | Date) {

    if (Util.isEmpty(val)) {
      this.group.get("day").setValue("");
      return;
    }

    //TODO: ここでフォーマットをチェックする

    const date = new Date(val);

    this.group.get("day").setValue(date);
    this.group.get("hour").setValue(date.getHours());
    this.group.get("minute").setValue(date.getMinutes());
    this.group.get("second").setValue(date.getSeconds());

    // this.stateChanges.next();
    this._handleInput(val);

  }


  // get errorState() {
  //   console.log("... ... error ... ...")
  //   return this.ngControl.errors !== null && !!this.ngControl.touched;
  // }

  // // カスタマイズ項目
  // selected = false;
  // selecting = false;
  // filteredOptions: Observable<string[]>;
  // autoCompList: any;

  @Input() formControlName: string;
  private control: AbstractControl;

  constructor(
    formBuilder: FormBuilder,
    private datepipe: DatePipe,
    // private cmp: CmpService,
    // private json: JsonService,
    // private _focusMonitor: FocusMonitor,
    @Optional() @Host() @SkipSelf()
    private controlContainer: ControlContainer) {

    //console.log("InputSelectComponent.constructor");

    this.group = formBuilder.group({
      day: '',
      hour: '',
      minute: '',
      second: ''
    });

    // const moni = _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
    //   if (this.focused && !origin) {
    //     this.onTouched();
    //   }
    //   this.focused = !!origin;
    //   this.stateChanges.next();
    // });

    // this.subs.add(moni);


  }

  ngOnInit(): void {
    if (this.controlContainer) {
      if (this.formControlName) {
        this.control = this.controlContainer.control.get(this.formControlName);
      } else {
        console.warn('Missing FormControlName directive from host element of the component');
      }
    } else {
      console.warn('Can\'t find parent FormGroup directive');
    }

    this.control.statusChanges.subscribe(() => {
      if (this._disabled || this._readonly) {
        this.group.get("day").setErrors(null);
        return;
      }

      if (this.control && this.control.errors) {
        const errors = Util.clone(this.control.errors)
        this.group.get("day").setErrors(errors);
      } else {
        this.group.get("day").setErrors(null);
      }

    })
  }

  // 継承メソッド
  ngOnDestroy() {
    //this.stateChanges.complete();
    // this._focusMonitor.stopMonitoring(this._elementRef);
    this.subs.unsubscribe();
  }

  // setDescribedByIds(ids: string[]) {
  //   this.describedBy = ids.join(' ');
  // }

  // onContainerClick(event: MouseEvent) {
  //   if ((event.target as Element).tagName.toLowerCase() != 'input') {
  //     this._elementRef.nativeElement.querySelector('input')!.focus();
  //   }
  // }

  writeValue(val: string | null): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(value): void {
    //this.onChange(this.group.value);
    // if (!Util.isEmpty(input)) {
    //   this.onChange(input.value);
    //   return;
    // }

    // if (Util.isEmpty(this.params.returnItem)) {
    //   this.onChange(this.group.get("inputValue").value);
    //   return;
    // }
    const day = this.group.get("day").value;
    if (Util.isEmpty(day) || this.group.get("day").status === 'INVALID') {
      this.onChange(value);
      return;
    }
    let returnVal = this.datepipe.transform(day, "yyyy-MM-dd");
    this.onChange(returnVal);

  }

  //   /*
  //  */
  //   openOrg() {
  //     if (!this.group.disabled) {
  //       this.selecting = true;
  //       const tree = this.cmp.select({
  //         url: this.params.url,
  //         title: this.params.title,
  //         params: this.params.params,
  //         isSingleSelect: this.params.isSingleSelect
  //       }).afterClosed().subscribe(
  //         (result?: []) => {
  //           const codes = []
  //           const values = []
  //           if (Util.isArray(result)) {
  //             result.forEach((value) => {
  //               codes.push(value[this.params.select])
  //               if (!Util.isEmpty(this.params.returnItem))
  //                 values.push(value[this.params.returnItem])
  //             })
  //           }
  //           if (!Util.isEmptyArray(codes)) {
  //             this.group.get("inputValue").setValue(codes.join(","));
  //             this.onChange(this.group.get("inputValue").value);
  //             this.selected = true;
  //             // this.group.get("inputValue").disable();

  //             if (!Util.isEmpty(this.params.returnItem)) {
  //               this.group.get("returnValue").setValue(values.join(","));
  //             }

  //           } else {
  //             this.selected = this.selected;
  //           }
  //           this.selecting = false;
  //           this._handleInput();
  //         });
  //       this.subs.add(tree);
  //     }
  //   }

  // clear() {
  //   // this.group.get("inputValue").setValue("");
  //   // this.onChange(this.group.get("inputValue").value);
  //   // if (!Util.isEmpty(this.params.returnItem)) {
  //   //   this.group.get("returnValue").setValue("");
  //   //   this.onChange(this.group.get("returnValue").value);
  //   // }
  //   // this.selecting = false;
  //   // this.selected = false;
  // }

  // /**
  //  * オートコンプリートのフィルター
  //  */
  // private _filter(value: any): string[] {
  //   const filterValue = value.toLowerCase();

  //   return this.autoCompList.filter(option => option['VIEW_VALUE'].toLowerCase().indexOf(filterValue) === 0);
  // }

  // /**
  //  * オートコンプリート表示設定
  //  */
  // displayFn(selected: any) {
  //   if (!selected) { return ''; }

  //   const index = this.autoCompList.findIndex(option => option.VALUE === selected);
  //   if (index === -1) { return selected; }
  //   return this.autoCompList[index].VIEW_VALUE;
  // }

  // /**
  //  * オートコンプリート値設定
  //  */
  // setRealValue(event: MatAutocompleteSelectedEvent) {

  //   this.group.get("inputValue").setValue(event.option.viewValue);
  //   this.onChange(this.group.get("inputValue").value);

  //   // if (!Util.isEmpty(this.params.returnItem)) {
  //   //   this.group.get("returnValue").setValue(event.option.value);
  //   //   this.onChange(this.group.get("returnValue").value);
  //   //   this.selected = true;
  //   // }
  // }

}
