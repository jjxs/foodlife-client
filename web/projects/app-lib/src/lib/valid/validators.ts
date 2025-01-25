import { ValidatorFn, AbstractControl, FormControl, Validators, ValidationErrors } from '@angular/forms';
import { MessageService } from '../service/message.service';
import { Util } from '../utils/util';
import { Const } from '../const/const';

// @dynamic
export class CmpValidateError {
    // key: string = "";
    // name: string = "";
    // errors: ValidationErrors;
    // static key : string = 'eee';
    public static KeyWord: string = "CmpValidateError";
    constructor(public key: string, public name: string = "", public errors: ValidationErrors) {

    }
}

// @dynamic
export class AppValidators {

    public static Language: string = "J";
    public static msg: MessageService = new MessageService();

    static empty(object?: any): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } | null => {

            return null;
        }
    }

    static isDay(): ValidatorFn {

        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern('[0-9]{4}[-][0-9]{1,2}[-][0-9]{1,2}'));

            if (newControl.errors) {
                hasError = true;
            }

            if (Util.isEmpty(control.value)) {
                hasError = false;
            }

            const message = this.msg.get(Const.Messages.MQ00039);

            return hasError ? { 'isDay': message } : null;

        };
    }
    static isEmail(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern("^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-a-zA-Z0-9!#$%&'*+\/=?^_`{|}~-]+(?:.[a-zA-Z0-9-]+)*$"));

            if (newControl.errors) {
                hasError = true;
            }

            if (Util.isEmpty(control.value)) {
                hasError = false;
            }

            const message = this.msg.get(Const.Messages.MQ00039);

            return hasError ? { 'email': message } : null;

        };
    }

    

    static isHalfEnNumber(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern('[a-zA-Z0-9]*'));

            if (newControl.errors) {
                hasError = true;
            }

            const message = this.msg.get(Const.Messages.MQ00040);

            return hasError ? { 'isHalfEnNumber': message } : null;

        };
    }

    static isHalfEnNumberComma(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern('[a-zA-Z0-9,]*'));

            if (newControl.errors) {
                hasError = true;
            }

            const message = this.msg.get(Const.Messages.MQ00041);

            return hasError ? { 'isHalfEnNumberComma': message } : null;

        };
    }

    static isHalfEn(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern('[a-zA-Z]*'));

            if (newControl.errors) {
                hasError = true;
            }

            const message = this.msg.get(Const.Messages.MQ00042);

            return hasError ? { 'isHalfEn': message } : null;

        };
    }

    static isHalfNumber(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern('[0-9]*'));

            if (newControl.errors) {
                hasError = true;
            }

            const message = this.msg.get(Const.Messages.MQ00043);

            return hasError ? { 'isHalfNumber': message } : null;

        };
    }

    static isFullCharacter(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern('[^\x01-\x7E]*'));

            if (newControl.errors) {
                hasError = true;
            }

            const message = this.msg.get(Const.Messages.MQ00044);

            return hasError ? { 'isFullCharacter': message } : null;
        };
    }

    static isMoney(inte: number, dec: number): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            let tmp = "{0," + String(inte) + "}";
            let tmp1 = "{1," + String(dec) + "}"

            const newControl = new FormControl(control.value, Validators.pattern('[0-9]' + tmp + '?([.][0-9]' + tmp1 + ')?'));

            if (newControl.errors) {
                hasError = true;
            }

            const array = [inte, dec];
            const message = this.msg.get(Const.Messages.MQ00045, array);

            return hasError ? { 'isMoney': message } : null;
        };
    }

    static isNumber(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {

            let hasError = false;

            const newControl = new FormControl(control.value, Validators.pattern('^\\d+(\.\\d+)?'));

            if (newControl.errors) {
                hasError = true;
            }

            const message = this.msg.get(Const.Messages.MQ00043);

            return hasError ? { 'isNumber': message } : null;
        };
    }
}