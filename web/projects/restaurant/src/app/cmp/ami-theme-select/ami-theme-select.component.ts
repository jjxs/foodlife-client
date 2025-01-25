import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    QueryList,
    ViewChildren,
    AfterViewInit,
    Renderer2,
    OnChanges,
    SimpleChanges,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { StyleManager } from '../../shared/style.manager'
import { environment } from '../../../environments/environment'

import { CmpService } from '../cmp.service'
import { ThemeService } from './theme.service';
@Component({
    // tslint:disable-next-line:component-selector
    selector: 'ami-theme-select',
    templateUrl: './ami-theme-select.component.html',
    styleUrls: ['./ami-theme-select.component.css']
})
export class AmiThemeSelectComponent implements OnInit {
    theme = 'indigo-pink';

    constructor(
        private cmp: CmpService,
        private themeSvr: ThemeService,
        public styleManager: StyleManager,
        private overlayContainer: OverlayContainer) {
        this.themeSvr.change$.subscribe((theme: string) => { 
            this.onClick(theme);
        })
    }

    ngOnInit() {
        this.styleManager.removeStyle('theme');
        this.styleManager.setStyle('theme', `${environment.theme_url}/${this.theme}.css`);

        const event = {
            'old': this.theme,
            'new': this.theme,
        };
        this.themeSvr.themeChange(event);
        // this.styleManager.setStyle('theme', `assets/${this.theme}.css`);


    }

    onClick(theme: string) {


        const event = {
            'old': this.theme,
            'new': theme,
        };
        this.theme = theme;
        this.styleManager.removeStyle('theme');
        this.styleManager.setStyle('theme', `${environment.theme_url}/${this.theme}.css`);
        
        this.themeSvr.themeChange(event);
    }
}