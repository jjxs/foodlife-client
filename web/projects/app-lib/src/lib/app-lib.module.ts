import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import {
  MatIconModule,
  MatToolbarModule,
  MatButtonModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatSelectModule,
  MatRadioModule,
  MatFormFieldModule,
  MatTreeModule,
  MatCheckboxModule,
  MatDialogModule,
  MatDatepickerModule,
  MatProgressBarModule,
  MatAutocompleteModule,
  MatInputModule
} from '@angular/material';
import { AppLibComponent } from './app-lib.component';
import { ConfirmComponent } from './cmp/confirm/confirm.component';
import { ErrorsComponent } from './cmp/errors/errors.component';
import { TreeSelectComponent, ChecklistDatabase } from './cmp/tree-select/tree-select.component';
import { InputSelectComponent } from './cmp/input-select/input-select.component';
import { PopComponent } from './cmp/pop/pop.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WindowComponent } from './cmp/window/window.component';
import { CmpService } from './cmp/cmp.service';
import { PagingComponent } from './cmp/paging/paging.component';
import { DateSelectComponent } from './cmp/date-select/date-select.component';
import { DatePopWinComponent } from './cmp/date-pop/date-pop-win/date-pop-win.component';
import { DatePopComponent } from './cmp/date-pop/date-pop.component';
import { AuthService } from './auth/auth.service';
import { TableEmptyMessageComponent } from './cmp/table-empty-message/table-empty-message.component';
import { LoadingComponent } from './cmp/loading/loading.component';


const EXPORTED_DECLARATIONS = [
  PopComponent,
  WindowComponent,
  ErrorsComponent,
  ConfirmComponent,
  PagingComponent,
  TreeSelectComponent,
  InputSelectComponent,
  DateSelectComponent,
  DatePopComponent,
  DatePopWinComponent,
  LoadingComponent,
  TableEmptyMessageComponent,
];

@NgModule({
  declarations: [AppLibComponent, EXPORTED_DECLARATIONS],
  imports: [
    MatIconModule,
    MatToolbarModule,
    MatProgressBarModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTreeModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatInputModule,
    CommonModule,
    DragDropModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    PopComponent,
    ConfirmComponent,
    WindowComponent,
    TreeSelectComponent
  ],
  providers: [DatePipe, ChecklistDatabase, CmpService, AuthService],
  exports: [AppLibComponent, EXPORTED_DECLARATIONS]
})
export class AppLibModule { }
