import { Component, OnInit, Input, OnChanges, ElementRef } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, NgControl } from '@angular/forms';

import { trigger, state, transition, style, animate, keyframes } from '@angular/animations';
import { CmpValidateError } from '../../valid/validators';
import { Const } from '../../const/const';
import { MessageService } from '../../service/message.service';

@Component({
  selector: 'app-errors',
  templateUrl: './errors.component.html',
  styleUrls: ['./errors.component.css'],
  animations: [
    trigger('flyInOut', [
      state('in', style({ transform: 'translateX(0)' })),
      transition('void => *', [
        animate(1200, keyframes([
          style({ opacity: 0, transform: 'translateX(-10%)', offset: 0 }),
          style({ opacity: 1, transform: 'translateX(10px)', offset: 0.4 }),
          style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
        ]))
      ])
    ])
  ]
})
export class ErrorsComponent implements OnInit, OnChanges {

  @Input() formGroup: FormGroup;
  constructor(
    private msg: MessageService,
    private _elementRef: ElementRef<HTMLElement>
  ) { }

  ngOnInit() {
    //console.log(this.formGroup);
  }

  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
  }

  setErrors(errors: { [key: string]: string }) {
    Object.keys(errors).forEach((key, index, ary) => {
      const ctl = this.formGroup.get(key)
      if (ctl) {
        ctl.setErrors({ "server": errors[key] });
      }
    });
  }

  getErrors() {
    const errors = [];
    let name = "";
    for (let key in this.formGroup.controls) {
      let control: AbstractControl = this.formGroup.controls[key];
      if (control.invalid && (control.touched || control.dirty) && control.errors) {

        //　カスタマイズ部品の場合
        if (control.errors[CmpValidateError.KeyWord]) {

          const cmpErrors: Array<CmpValidateError> = control.errors[CmpValidateError.KeyWord];

          cmpErrors.forEach((cmpErr: CmpValidateError) => {
            this.createErrors(cmpErr.name + ":　", cmpErr.errors, errors);
          });

          continue;
        }


        const el = this._elementRef.nativeElement.parentElement.querySelector("[formControlName='" + key + "']");
        if (el && el.getAttribute("placeholder")) {
          name = el.getAttribute("placeholder") + ":　";
        }

        this.createErrors(name, control.errors, errors)

      }

      // Use `key` and `value`
    }
    return errors;
  }


  createErrors(name, errors, result) {
    if (errors["required"]) {
      result.push(name + "必須項目です。");
    }

    if (errors["email"]) {
      result.push(name + "フォーマットが不正です。");
    }

    if (errors["isDay"]) {
      result.push(name + errors["isDay"]);
    }

    if (errors["isHalfEnNumber"]) {
      result.push(name + errors["isHalfEnNumber"]);
    }

    if (errors["isHalfEnNumberComma"]) {
      result.push(name + errors["isHalfEnNumberComma"]);
    }

    if (errors["isHalfEn"]) {
      result.push(name + errors["isHalfEn"]);
    }

    if (errors["isHalfNumber"]) {
      result.push(name + errors["isHalfNumber"]);
    }

    if (errors["isFullCharacter"]) {
      result.push(name + errors["isFullCharacter"]);
    }

    if (errors["isMoney"]) {
      result.push(name + errors["isMoney"]);
    }

    if (errors["isNumber"]) {
      result.push(name + errors["isNumber"]);
    }

    if (errors["minlength"]) {
      const error = errors["minlength"];
      const msg = this.msg.get(Const.Messages.MQ00026, [error["requiredLength"]]);
      result.push(name + msg);
    }

    if (errors["maxlength"]) {
      const error = errors["maxlength"];
      const msg = this.msg.get(Const.Messages.MQ00037, [error["requiredLength"]]);
      result.push(name + msg);
    }

    if (errors["min"]) {
      const error = errors["min"];
      const msg = this.msg.get(Const.Messages.MQ00026, [error["requiredLength"]]);
      result.push(name + msg);
    }

    if (errors["max"]) {
      const error = errors["max"];
      const msg = this.msg.get(Const.Messages.MQ00037, [error["requiredLength"]]);
      result.push(name + msg);
    }

    //サーバエラー
    if (errors["server"]) {
      const error = errors["server"];
      result.push(name + error);
    }

    if (errors["error"]) {
      const error = errors["error"];
      result.push(name + error);
    }
  }


}
