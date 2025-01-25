

function convertDate(key, value) {
    return Util.formatValueToDate(value);
}

export const Util = {
    setSaasID: function(val) {
        localStorage.setItem('SAAS_ID', val);
    },

    getSaasID: function() {
        const saas_id = localStorage.getItem('SAAS_ID');
        if (this.isEmpty(saas_id)) {
            const l = location.hostname.split('.');
            if ( l.length>2 && l[1]=='app' ) {
                return l[0];
            }
            return '';
        } else {
            return saas_id;
        }
    },

    setImageHost: function(val) {
        localStorage.setItem('__site_image_host__', val);
    },

    getImageHost: function() {
        return localStorage.getItem('__site_image_host__');
    },


    formatDateObject: function (object) {
        // Object.keys(object).forEach((key) => {
        //     object[key] = Util.formatValueToDate(object[key]);
        // });
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
    }())
};