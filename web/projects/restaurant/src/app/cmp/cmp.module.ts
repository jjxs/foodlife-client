import { NgModule } from '@angular/core';
import { AmiTableComponent } from './ami-table/ami-table.component';
import { AmiThemeSelectComponent } from './ami-theme-select/ami-theme-select.component'
import { AmiHeaderDirective } from './ami-table/ami-header.directive';
import { AmiLoading } from './dialog/ami-loading.component';


import {
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule
} from '@angular/material';
import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCommonModule } from '@angular/material';
import { AmiConfirm } from './dialog/ami-confirm.component';
import { AmiConfirm2 } from './dialog/ami-confirm2/ami-confirm2.component';
import { AmiConfirm3 } from './dialog/ami-confirm3/ami-confirm3.component';
import { AmiInput } from './dialog/ami-input/ami-input.component';

// flex-layout
import { FlexLayoutModule, BREAKPOINT } from '@angular/flex-layout';
import { AmiPop } from './dialog/ami-pop.component';
import { AmiSelecter } from './dialog/ami-selecter.component';
import { NumberSelecterComponent } from './input/number-selecter/number-selecter.component';
import { ThemeDirective } from './ami-theme-select/theme.directive';
import { ToggleBarComponent } from './animation/toggle-bar/toggle-bar.component';
import { NumberInputComponent } from './number-input/number-input.component';
const PRINT_BREAKPOINTS = [{
    alias: 'xs.print',
    suffix: 'XsPrint',
    mediaQuery: 'print and (max-width: 297px)',
    overlapping: false
}];

const EXPORTED_DECLARATIONS = [
    AmiTableComponent,
    AmiHeaderDirective,
    AmiLoading,
    AmiConfirm,
    AmiConfirm2,
    AmiConfirm3,
    AmiInput,
    AmiPop,
    AmiSelecter,
    NumberSelecterComponent,
    AmiThemeSelectComponent,
    ThemeDirective,
    ToggleBarComponent,
    NumberInputComponent
];

@NgModule({
    imports: [
        OverlayModule,
        CdkTableModule,
        CommonModule,
        FormsModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,
        // flex-layout
        FlexLayoutModule,
    ],
    providers: [
        { provide: BREAKPOINT, useValue: PRINT_BREAKPOINTS, multi: true }

    ],
    exports: EXPORTED_DECLARATIONS,
    declarations: EXPORTED_DECLARATIONS,
    entryComponents: [
        AmiLoading,
        AmiConfirm,
        AmiConfirm2,
        AmiConfirm3,
        AmiInput,
        AmiPop,
        AmiSelecter,
        NumberInputComponent
    ]
})
export class CmpModule { }

