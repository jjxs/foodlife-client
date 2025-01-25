import { JsonResult, TableEmptyMessageComponent, JsonService, CmpService } from 'app-lib';
import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material';
import { SeatEditManagerComponent } from './seat-edit-manager/seat-edit-manager.component';

@Component({
    selector: 'seat-manager',
    templateUrl: './seat-manager.component.html',
    styleUrls: ['./seat-manager.component.css']
})
export class SeatManagerComponent implements OnInit {

    dataSource = new MatTableDataSource<any>([]);

    // チェックボックスセレクション
    selection = new SelectionModel<any>(true, []);

    constructor(
        private dialog: MatDialog,
        private json: JsonService,
        private cmp: CmpService) {
    }

    ngOnInit() {
        this.onSearch();
    }

    onSearch() {
        this.dataSource.data = [];
        this.selection.clear();
        this.json.post('s/seat_manager_api/get_seat_data', {}).subscribe((response: JsonResult) => {
            if (response) {
                this.dataSource.data = response.data;
            }
        });
    }

    onAdd() {
        const dialog = this.dialog.open(SeatEditManagerComponent, {
            width: '700px',
            height: '600px',
        })
        dialog.afterClosed().subscribe(result => {
            if (result == "1") {
                this.onSearch();
            }
        });
    }

    onEdit(event) {
        const dialog = this.dialog.open(SeatEditManagerComponent, {
            width: '700px',
            height: '600px',
            data: event
        })
        dialog.afterClosed().subscribe(result => {
            if (result == "1") {
                this.onSearch();
            }
        });
    }

    onDelete(row?) {
        this.cmp.confirm('選択されたカテゴリーを削除しますか？').afterClosed().subscribe(result => {
            if (result === 'yes') {
                this.doDelete(row);
            }
        });
    }
    doDelete(row) {
        const params = {
            rows: row
        };
        this.json.post('s/seat_manager_api/delete_seat_data', params).subscribe((response: JsonResult) => {
            if (response.result != undefined) {
                this.cmp.pop(response.message);
                this.onSearch();
            } else {
                this.cmp.pop('削除できませんでした');
            }
        });
    }

    onCheckChange(event) {
        let params = {};
        if (event.checked == false) {
            params["takeout"] = 0;
        }
        this.dataSource.data = [];
        this.selection.clear();
        this.json.post('s/seat_manager_api/get_seat_data', params).subscribe((response: JsonResult) => {
            if (response) {
                this.dataSource.data = response.data;
            }
        });
    }
}

