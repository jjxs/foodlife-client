import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    private searchStr = "body,span,button,textarea,input,label,div,.mat-button-wrapper,.node-label ";

    useFont(size?: number) {
        let value = 0.8;
        if (size) {
            value = size;
        } else {
            value = Number(localStorage.getItem("__font_size__") || value);
        }

        var list = document.querySelectorAll(this.searchStr)
        for (let index = 0; index < list.length; ++index) {
            list[index]["style"]["fontSize"] = value + "rem";
        }
        // document.getElementsByClassName("body,span,button,textarea,input,label,div")["style"] = 'font-size: ' + event.value + 'rem;font-family: -apple-system, "BlinkMacSystemFont", "Helvetica Neue", Helvetica, "Arial", "ヒラギノ角ゴ ProN W3",    "Hiragino Kaku Gothic ProN", "メイリオ", Meiryo, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",    "Segoe UI Symbol", "Noto Color Emoji";';
    }

    useFontByEl(el) {
        const value = Number(localStorage.getItem("__font_size__"));
        var list = el.querySelectorAll(this.searchStr)
        for (let index = 0; index < list.length; ++index) {
            list[index]["style"]["fontSize"] = value + "rem";
        }
    }

    resetFont() {
        if (localStorage) {
            localStorage.setItem("__font_size__", "0.8");
        }
        this.useFont()
    }
}