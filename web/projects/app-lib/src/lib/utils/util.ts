import { language } from '../../language/language';

function convertDate(key, value) {
    return Util.formatValueToDate(value);
}

export const Util = {

    i18n: function (txt) {
        if (language.hasOwnProperty(txt)) {
            return language[txt];
        }
        return txt;
    },

    formatDateObject: function (object) {

        if (typeof object !== 'string') {
            object = Util.encode(object);
        }
        return JSON.parse(object, (key: any, value: any) => convertDate(key, value));
    },

    formatValueToDate: function (value) {
        if (typeof value !== 'string') {
            return value;
        }
        if (value === '0001-01-01T00:00:00') {
            return null;
        }
        const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
        if (!match) {
            return value;
        }
        return new Date(value);
    },

    isEmpty: function (value): boolean {

        if (typeof value === 'undefined')
            return true;

        if (value === null)
            return true;

        if (value === '')
            return true;

        return false;
    },

    isEmptyArray: function (array): boolean {
        if (array instanceof Array) {
            if (array.length === 0) {
                return true;
            }
            return false
        } else {
            return true;
        }

    },

    isEmptyDict(dict): boolean {
        if (dict instanceof Object) {
            let result = true;
            for (const key of Object.keys(dict)) {
                if (dict[key] instanceof Object) {
                    result = Util.isEmptyDict(dict[key]);
                    if (!result) { break; }
                    continue;
                }
                if (dict[key] instanceof Array) {
                    result = Util.isEmptyArray(dict[key]);
                    if (!result) { break; }
                    continue;
                }
                if (dict[key] !== null && dict[key] !== '' && typeof dict[key] !== 'undefined') {
                    result = false;
                    break;
                }
            }
            return result;
        } else {
            return true;
        }
    },

    isArray: function (array): boolean {
        return array && array instanceof Array;
    },

    isNumber(arg: any): arg is number {
        return typeof arg === "number";
    },

    encode: function (obj): any {
        return JSON.stringify(obj);
    },


    decode: function (json): any {
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    },

    copy: function (data): any {
        var str = Util.encode(data),
            model = Util.decode(str);
        return model;
    },

    /**
     * パスを連結する。
     */
    joinpath: function (param1: string, param2: string, separator: string = '/'): string {
        let result: string;

        if (param1.endsWith(separator)) {
            param1 = param1.substr(0, param1.length - 1);
        }
        if (param2.startsWith(separator)) {
            param2 = param2.substr(1);
        }

        const param1s = param1.split(separator);
        const param2s = param2.split(separator);

        result = param1s.join(separator) + separator + param2s.join(separator);

        return result;
    },

    device: (function () {
        var nav = navigator.userAgent;

        if ((nav.indexOf('iPhone') > 0 && nav.indexOf('iPad') == -1) ||
            nav.indexOf('ipad') > 0 ||
            nav.indexOf('Android') > 0) {
            return 'smart';
        }
        return 'pc';
    }()),

    clone: function (obj) {
        const json = Util.encode(obj)
        return Util.decode(json);
    },

    append: function (object, config, defaults = null) {
        if (defaults) {
            Util.append(object, defaults);
        }
        const skipArray = ['hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'valueOf', 'toLocaleString', 'toString', 'constructor']

        if (object && config && typeof config === 'object') {
            var i, j, k;

            for (i in config) {
                object[i] = config[i];
            }

            if (skipArray) {
                for (j = skipArray.length; j--;) {
                    k = skipArray[j];
                    if (config.hasOwnProperty(k)) {
                        object[k] = config[k];
                    }
                }
            }
        }

        return object;
    },

    appendIf: function (args, config) {
        var property;
        const object = Util.clone(args);
        if (object) {
            for (property in config) {
                if (object[property] === undefined) {
                    object[property] = config[property];
                }
            }
        }

        return object;
    },
};