import { Injectable } from '@angular/core';
import { Util } from 'ami';
import { MenuKosuComponent } from './menu-kosu/menu-kosu.component';
import { MatDialog } from '@angular/material';
import { MenuViewComponent } from './menu-view/menu-view.component';


/**
 *
*/
@Injectable({
    providedIn: 'root'
})
export class MenuUtil {

    constructor(
        private dialog: MatDialog
        // private authSrv: AuthenticationService
    ) {
    }

    isCourse(menu) {
        if (Util.isEmpty(menu.course)) {
            return false;
        }
        return Object.values(menu.course).length > 0;
    }

    showCourse(menu, enableOrder, onOrder=false) {
        if (menu.id) {
            const dialog = this.dialog.open(MenuKosuComponent, {
                width: '90vw',
                height: '100vw',
                maxWidth: '90vw',
                data: {
                menu: menu,
                enableOrder: enableOrder,
                onOrder: onOrder
                }
            });
        }
    }

    isShowView(menu) {
        if (Util.isEmpty(menu.menu_options)) {
            return false;
        }

        return Object.values(menu.menu_options).length > 0;
    }
    showView(menu, enableOrder, isOrder?:boolean, onOrder=false) {
        if (menu.id) {
        const dialog = this.dialog.open(MenuViewComponent, {
          width: '550px',
          data: {
            menu: menu,
            enableOrder: enableOrder,
            onOrder: onOrder,
            isOrder:isOrder
          }
        });
      }
    }


}
