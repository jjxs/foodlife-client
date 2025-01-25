import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { OnsenModule } from 'ngx-onsenui';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { OrderComponent } from './order/order.component';
import { MenuComponent } from './menu/menu.component';
import { DetailComponent } from './Menu/detail/detail.component';
import { LoginComponent } from './login/login.component';
import { ReservationComponent } from './reservation/reservation.component';
import { SettingComponent } from './setting/setting.component';
import { HomeComponent } from './home/home.component';
import { SelCounterComponent } from './cmp/sel-counter/sel-counter.component';
import { QuickinComponent } from './login/quickin.component';
import { MenuPopComponent } from './cmp/pop-menu/pop-menu.component';
import { HttpClientModule } from '@angular/common/http';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AmiModule } from 'ami';
import { WebInterceptor } from './shared/web.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    OrderComponent,
    MenuComponent,
    DetailComponent,
    LoginComponent,
    ReservationComponent,
    SettingComponent,
    HomeComponent,
    SelCounterComponent,
    QuickinComponent,
    MenuPopComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OnsenModule,
    AmiModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
  entryComponents: [
    OrderComponent,
    MenuComponent,
    DetailComponent,
    LoginComponent,
    ReservationComponent,
    SettingComponent,
    HomeComponent
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: WebInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
