import { Component, OnInit, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { SelectionModel, SelectionChange } from '@angular/cdk/collections';
import { JsonService, Util, AuthenticationService } from 'ami';
import { SeatListData } from './seat.interface';

@Component({
    selector: 'seat-list',
    templateUrl: './seat-list.component.html',
    styleUrls: ['./seat-list.component.css']
})
export class SeatListComponent implements OnInit {

    displayedColumnsWithSelect = ['select', 'no', 'name', 'group_name', 'type', 'tobacco', 'counts'];

    dataSource: MatTableDataSource<SeatListData>;

    selection = new SelectionModel<SeatListData>(true, []);

    params = {};

    // 選択するテーブル名称
    selections_table = '';

    enabled_takeout = true;

    constructor(
        private authSrv: AuthenticationService,
        private jsonSrv: JsonService,
        public dialogRef: MatDialogRef<SeatListComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) { }

    ngOnInit() {
        if (!Util.isEmpty(this.data.enabled_takeout)) {
            this.enabled_takeout = this.data.enabled_takeout;
        }
        const params = { usable: true };

        // sample = true の場合、シンプルモードで表示

        this.displayedColumnsWithSelect = ['select', 'no', 'name'];


        if (!Util.isEmpty(this.data.using)) {
            //利用開始のみ選択（会計画面より）
            params['using'] = true;
        }
        if (!Util.isEmpty(this.data.takeout)) {
            //利用開始のみ選択（会計画面より）
            params['takeout'] = this.data.takeout;
        }
        this.params = params;
        this.jsonSrv.get('master/seat/', params).subscribe((response?: any[]) => {
            let array = [];
            if (!Util.isEmpty(response) && response[0]) {
                array = response;
            }
            this.dataSource = new MatTableDataSource(array);
            array.forEach((seat) => {
                if (!Util.isEmptyArray(this.data.selected) && this.data.selected.indexOf(seat.id) >= 0) {
                    this.selection.toggle(seat);

                }
            });
        });

        // 選択するテーブル名称を表示
        this.selection.onChange.subscribe((event: SelectionChange<SeatListData>) => {
            event.removed.forEach((data) => { data.selected = false });
            event.added.forEach((data) => { data.selected = true });

            this.selections_table = '';
            this.selection.selected.forEach((data) => {
                this.selections_table += data.seat_no + '(' + data.name + ')' + ',';
            });
        });
    }

    ok() {
        if (this.data.multiSelecte) {
            this.dialogRef.close(this.selection.selected);
        } else {
            this.dialogRef.close(this.selection.selected[0]);
        }
    }

    clear() {
        this.selection.clear();
    }

    close(): void {
        this.ok();
    }

    rowClick(row) {
        if (!this.data.multiSelecte) {
            this.selection.clear();
        }
        this.selection.toggle(row);
    }

    onCheckChange(event) {
        let params = this.params;
        params['takeout'] = 0
        if (event.checked == true) {
            params['takeout'] = 1;
        }
        // params['using'] = true;
        this.jsonSrv.get('master/seat/', params).subscribe((response?: any[]) => {
            let array = [];
            if (!Util.isEmpty(response) && response[0]) {
                array = response;
            }
            this.dataSource = new MatTableDataSource(array);
            array.forEach((seat) => {
                if (!Util.isEmptyArray(this.data.selected) && this.data.selected.indexOf(seat.id) >= 0) {
                    this.selection.toggle(seat);

                }
            });
        });
    }

    // rowClass(row) {
    //     return this.?  : '';
    // }
}

