
import { Directive, OnInit, Renderer2, ElementRef } from '@angular/core';
import { ThemeService } from './theme.service';
@Directive({
    selector: '[theme]'
})
export class ThemeDirective implements OnInit {

    

    constructor(
        private themeSrv: ThemeService,
        private renderer: Renderer2,
        private el: ElementRef) {

    }

    ngOnInit() {
        //console.log("ThemeDirective.ngOnInit")
        this.renderer.addClass(this.el.nativeElement, this.themeSrv.init_theme);
        
        this.themeSrv.themeChanged$.subscribe((theme: any) => {
            //console.log("this.themeSrv.themeChanged$.subscribe")
            this.renderer.removeClass(this.el.nativeElement, theme.old);
            this.renderer.addClass(this.el.nativeElement, theme.new);
            
        });

    }

}