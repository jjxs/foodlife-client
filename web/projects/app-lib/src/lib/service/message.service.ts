import { Injectable } from '@angular/core';
import { Util } from '../utils/util';

window["__Message_Store__"] = {}

@Injectable({
    providedIn: 'root'
})
export class MessageService {

    // store: {}

    constructor() {
        //console.log("MessageService")
    }

    // init(messages?: []) {
    //     if (Util.isArray(messages)) {
    //         window["__Message_Store__"] = {}
    //         messages.forEach((val) => {
    //             window["__Message_Store__"][val["ID"]] = val["MESSAGE"]
    //         });
    //     }
    // }

    get(id, args?: any) {
        const msg = window["__Message_Store__"][id];

        if (!Util.isEmpty(args)) {
            return msg.replace(/%(\d+)/g, function (m, k) {
                return args[k - 1];
            });
        }

        return msg;
    }
}
