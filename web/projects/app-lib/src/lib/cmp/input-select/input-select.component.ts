import { Component, OnInit, OnDestroy, Input, ElementRef, Optional, Self } from '@angular/core';
import { CmpService } from '../cmp.service';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Util } from '../../utils/util';
import { ControlValueAccessor, FormGroup, FormBuilder, NgControl, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { MatFormFieldControl, ErrorStateMatcher, MatAutocompleteSelectedEvent, MatInput } from '@angular/material';
import { Subject, Observable, Subscription } from 'rxjs';
import { FocusMonitor } from '@angular/cdk/a11y';
import { map, startWith } from 'rxjs/operators';
import { JsonService } from '../../http/json.service';
import { JsonResult } from '../../http/http.interface';

export interface InputSelectParams {
  url: string;
  title: string;
  params?: any;
  autoCompUrl?: string;
  isSingleSelect?: boolean;
  select?: string;
  selectFn?: Function;
  returnItem?: string;
}

export class InputSelectErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return (control && control.invalid);
  }
}


@Component({
  selector: 'app-input-select',
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.css'],
  providers: [{ provide: MatFormFieldControl, useExisting: InputSelectComponent }],
  host: {
    '[class.example-floating]': 'shouldLabelFloat',
    '[id]': 'id',
    '[attr.aria-describedby]': 'describedBy',
  }
})
export class InputSelectComponent implements ControlValueAccessor, MatFormFieldControl<String>, OnDestroy, OnInit {

  // サブスクリプション
  subs = new Subscription();

  @Input('params') params: InputSelectParams = {
    url: "",
    title: ""
  }

  matcher = new InputSelectErrorStateMatcher();

  // 継承プロパティ
  shouldLabelFloat: boolean = false; //?
  autofilled?: boolean = true;      //?
  describedBy = '';                 //?

  group: FormGroup;
  stateChanges = new Subject<void>();
  focused: boolean = false
  // errorState = false;
  controlType: string = 'app-input-select'
  static nextId = 0;
  id: string = `example-tel-input-${InputSelectComponent.nextId++}`;

  onChange = (_: any) => { };
  onTouched = () => { };

  get empty() {
    return !this.group.get("inputValue").value;
  }

  @Input()
  get placeholder(): string { return this._placeholder; }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  _placeholder: string;

  @Input()
  get required(): boolean { return this._required; }
  set required(value: boolean) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  private _required = false;

  @Input()
  get disabled(): boolean { return this._disabled; }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.group.disable() : this.group.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get readonly(): boolean { return this._readonly; }
  set readonly(value: boolean) {
    this._readonly = coerceBooleanProperty(value);
    // this._disabled ? this.group.reado : this.group.enable();
    // this.stateChanges.next();
  }
  private _readonly = false;


  // get value(): string {
  //   if (Util.isEmpty(this.params.returnItem)) {
  //     return this.group.get("inputValue").value;
  //   }

  //   return this.group.get("returnValue").value;
  // }
  set value(val: string) {
    this.group.get("inputValue").setValue(val);

    // クリア時×ボタンを消す
    if (Util.isEmpty(this.group.get("inputValue").value)) {
      this.selected = false;
    }
    this.stateChanges.next();
    this._handleInput();

  }


  get errorState() {
    return this.ngControl.errors !== null && !!this.ngControl.touched;
  }

  // カスタマイズ項目
  selected = false;
  selecting = false;
  filteredOptions: Observable<string[]>;
  autoCompList: any;

  constructor(
    formBuilder: FormBuilder,
    private cmp: CmpService,
    private json: JsonService,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Self() public ngControl: NgControl
  ) {

    //console.log("InputSelectComponent.constructor")

    this.group = formBuilder.group({
      inputValue: '',
      returnValue: ''
    });

    const moni = _focusMonitor.monitor(_elementRef, true).subscribe(origin => {
      if (this.focused && !origin) {
        this.onTouched();
      }
      this.focused = !!origin;
      this.stateChanges.next();
    });

    this.subs.add(moni);

    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit(): void {
    if (this.params.autoCompUrl) {
      this.autoCompList = [];
      const autocomp = this.json.get(this.params.autoCompUrl, this.params.params).subscribe((response?: JsonResult) => {
        if (response) {
          this.autoCompList = response.data;
          this.filteredOptions = this.group.get('inputValue').valueChanges
            .pipe(
              startWith(''),
              map(value => (Util.isArray(value) && value.length >= 1) ? this._filter(value) : [])
            );
        }
      });
      this.subs.add(autocomp);
    }

  }

  // 継承メソッド
  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
    this.subs.unsubscribe();
  }

  setDescribedByIds(ids: string[]) {
    this.describedBy = ids.join(' ');
  }

  onContainerClick(event: MouseEvent) {
    if ((event.target as Element).tagName.toLowerCase() != 'input') {
      this._elementRef.nativeElement.querySelector('input')!.focus();
    }
  }

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

  _handleInput(input?: MatInput): void {
    //this.onChange(this.group.value);
    if (!Util.isEmpty(input)) {
      this.onChange(input.value);
      return;
    }

    if (Util.isEmpty(this.params.returnItem)) {
      this.onChange(this.group.get("inputValue").value);
      return;
    }

    this.onChange(this.group.get("returnValue").value);

  }

  /*
 */
  openOrg() {
    if (!(this.group.disabled || this.readonly)) {
      this.selecting = true;
      const tree = this.cmp.select({
        url: this.params.url,
        title: this.params.title,
        params: this.params.params,
        isSingleSelect: this.params.isSingleSelect
      }).afterClosed().subscribe(
        (result?: []) => {
          const codes = []
          const values = []
          if (Util.isArray(result)) {
            result.forEach((value) => {
              codes.push(value[this.params.select])
              if (!Util.isEmpty(this.params.returnItem))
                values.push(value[this.params.returnItem])
            })
          }
          if (!Util.isEmptyArray(codes)) {
            this.group.get("inputValue").setValue(codes.join(","));
            this.onChange(this.group.get("inputValue").value);
            this.selected = true;
            // this.group.get("inputValue").disable();

            if (!Util.isEmpty(this.params.returnItem)) {
              this.group.get("returnValue").setValue(values.join(","));
            }

          } else {
            this.selected = this.selected;
          }
          this.selecting = false;
          this._handleInput();
        });
      this.subs.add(tree);
    }
  }

  clear() {
    this.group.get("inputValue").setValue("");
    this.onChange(this.group.get("inputValue").value);
    if (!Util.isEmpty(this.params.returnItem)) {
      this.group.get("returnValue").setValue("");
      this.onChange(this.group.get("returnValue").value);
    }
    this.selecting = false;
    this.selected = false;
  }

  /**
   * オートコンプリートのフィルター
   */
  private _filter(value: any): string[] {
    const filterValue = value.toLowerCase();

    return this.autoCompList.filter(option => option['VIEW_VALUE'].toLowerCase().indexOf(filterValue) === 0);
  }

  /**
   * オートコンプリート表示設定
   */
  displayFn(selected: any) {
    if (!selected) { return ''; }

    const index = this.autoCompList.findIndex(option => option.VALUE === selected);
    if (index === -1) { return selected; }
    return this.autoCompList[index].VIEW_VALUE;
  }

  /**
   * オートコンプリート値設定
   */
  setRealValue(event: MatAutocompleteSelectedEvent) {

    this.group.get("inputValue").setValue(event.option.viewValue);
    this.onChange(this.group.get("inputValue").value);

    if (!Util.isEmpty(this.params.returnItem)) {
      this.group.get("returnValue").setValue(event.option.value);
      this.onChange(this.group.get("returnValue").value);
      this.selected = true;
    }
  }

}
