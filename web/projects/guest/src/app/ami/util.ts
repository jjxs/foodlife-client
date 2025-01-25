
export class Util {

    static isEmpty(value) {

        if (typeof value === 'undefined')
            return true;

        if (value === null)
            return true;

        if (value === '')
            return true;

        return false;
    };


    static encode(obj) {
        return JSON.stringify(obj);
    };


    static decode(json) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return null;
        }
    };

    static copy(data) {
        var str = this.encode(data),
            model = this.decode(str);
        return model;
    };

    /**
     * パスを連結する。
     */
    static joinpath(param1: string, param2: string, separator: string = '/'): string {
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
    }

    static device = (function () {
        var nav = navigator.userAgent;

        if ((nav.indexOf('iPhone') > 0 && nav.indexOf('iPad') == -1) ||
            nav.indexOf('ipad') > 0 ||
            nav.indexOf('Android') > 0) {
            return 'smart';
        }
        return 'pc';
    }());


}
