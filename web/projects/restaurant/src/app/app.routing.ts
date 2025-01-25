import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SeatViewComponent } from './seat-view/seat-view.component';
import { HomeComponent } from './home/home.component';
import { CounterComponent } from './counter/counter.component';
import { OrderComponent } from './order/order.component';
import { SeatsComponent } from './seats/seats.component';
import { SeatManagerComponent } from './seats/seat-manager/seat-manager.component';
import { SeatEditManagerComponent } from './seats/seat-manager/seat-edit-manager/seat-edit-manager.component';
import { SettingsComponent } from './settings/settings.component';
import { KitchenComponent } from './kitchen/kitchen.component';
import { MenuComponent } from './menu/menu.component';
import { TopComponent } from './menu/top/top.component';
import { MonitorComponent } from './counter/monitor/monitor.component';
import { StaffComponent } from './staff/staff.component';
import { StaffTopComponent } from './staff/staff-top/staff-top.component';
import { StaffMenuComponent } from './staff/staff-menu/staff-menu.component';
import { StaffOrderComponent } from './staff/staff-order/staff-order.component';
import { StaffCounterComponent } from './staff/staff-counter/staff-counter.component';
import { StaffSettingComponent } from './staff/staff-setting/staff-setting.component';
import { SetsubiErrorComponent } from './setsubi-error/setsubi-error.component';
import { GuestComponent } from './guest/guest.component';
import { GuestQRComponent } from './guest/guest-qr/guest-qr.component';
import { GuestMenuComponent } from './guest/guest-menu/guest-menu.component';
import { CustomerCallComponent } from './counter/customer-call/customer-call.component';
import { ReserveComponent } from './reserve/reserve.component';


const appRoutes: Routes = [
    { path: 'start', component: SeatViewComponent },
    { path: 'counter', component: CounterComponent },
    { path: 'order', component: OrderComponent },
    { path: 'seats', component: SeatsComponent },
    { path: 'seat-manager', component: SeatManagerComponent },
    { path: 'seat-edit-manager', component: SeatEditManagerComponent },
    { path: 'settings', component: SettingsComponent },
    { path: 'kitchen', component: KitchenComponent },
    { path: 'reserve', component: ReserveComponent },
    { path: 'menu', component: MenuComponent },
    { path: 'monitor', component: MonitorComponent },
    { path: 'top', component: TopComponent },
    { path: 'setsubi-error', component: SetsubiErrorComponent},
    { path: 'customer-call', component: CustomerCallComponent },
    // {
    //     path: '',
    //     redirectTo: environment.top_path,
    //     pathMatch: 'full'
    // },
    {
        path: 'staff', component: StaffComponent,
        children: [
            {
                path: 'top',
                component: StaffTopComponent
            },
            {
                path: 'menu',
                component: StaffMenuComponent
            },
            {
                path: 'order',
                component: StaffOrderComponent
            },
            {
                path: 'counter',
                component: StaffCounterComponent
            },
            {
                path: 'setting',
                component: StaffSettingComponent
            }
        ]
    },
    {
        path: 'guest', component: GuestComponent,
        children: [
            {
                path: 'qr/:sid/:seat/:sign',
                component: GuestQRComponent
            },
            {
                path: 'menu',
                component: GuestMenuComponent
            }
        ]
    },
    { path: 'home', component: HomeComponent }
];

// export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(appRoutes);
@NgModule({
  imports: [
    RouterModule.forRoot(appRoutes),
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
