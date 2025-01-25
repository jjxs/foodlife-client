import { Component, OnInit, Inject, Input, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatDialog } from '@angular/material';
import { SelectionModel, SelectionChange } from '@angular/cdk/collections';
import { JsonService, Util, AuthenticationService } from 'ami';
import { SeatListData } from '../seat.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { SeatOrderComponent } from '../seat-order/seat-order.component';

@Component({
    selector: 'seat-map',
    templateUrl: './seat-map.component.html',
    styleUrls: ['./seat-map.component.css']
})
export class SeatMapComponent implements OnInit {

    seatList = [];
    utypes = [
      { id: "1" , name: '初回' },
      { id: "2" , name: 'リピート' },
      { id: "3" , name: '常連' },
      { id: "4" , name: '不明' },
    ];

    @Output() selectSeat = new EventEmitter<any>();

    constructor(
        private authSrv: AuthenticationService,
        private router: Router,
        protected dialog: MatDialog,
        private jsonSrv: JsonService) {
            this.getSeatLists();
        }

    ngOnInit() {
    }

    goTo(item) {
        this.selectSeat.emit( { value: item.id } );
    }

    getSeatLists() {
        let condition = {
            seat_group: [],
            seat_type: [],
            seat_smoke_type: [],
            seat_number: [],
            seat_usable: '0',
            takeout_type: 0,
          };
        this.jsonSrv.post('restaurant/seat_list/', condition ).subscribe((response?: any) => {
            if (!Util.isEmpty(response['data']) && response['data'][0]) {
                this.seatList = response['data'];
            }
        });
    }

    getUtypeName(id) {
        for(var i in this.utypes) {
            if ( this.utypes[i]['id']==id) {
                return this.utypes[i]['name'];
            }
        }
        return '-';
    }

    
  seatSet(item) {
    if ( Util.isEmpty(item['use_start']) ) {
        return;
    }
    const dialog = this.dialog.open(SeatOrderComponent, {
      ariaDescribedBy: '_SeatOrderComponent_',
      // disableClose: false,
      width: '500px',
      // height: '60%',
      data: { value: { id: item['id']} }
    });
    dialog.afterClosed().subscribe(result => {
      this.getSeatLists();
    });
  }
}

