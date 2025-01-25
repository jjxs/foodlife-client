import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, Util } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CounterService } from '../../counter/counter.service';
import { SeatListData, Seat, SeatStatus } from '../../seats/seat.interface';
import { CmpService } from '../../cmp/cmp.service';
import { Subject, forkJoin } from "rxjs"

@Component({
  selector: 'staff-change-seat',
  templateUrl: './staff-change-seat.component.html',
  styleUrls: ['./staff-change-seat.component.css']
})
export class StaffChangeSeatComponent implements OnInit {

  seat_id = 0 ;
  seatList: Array<SeatListData> = [];
  selectedSeat: any;

  constructor(
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    private cmp: CmpService,
    public dialogRef: MatDialogRef<StaffChangeSeatComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.seatList = data['seatList'];
      this.selectedSeat = data['selectedSeat'];
    }

  ngOnInit() {
  }
  close(): void {
    this.dialogRef.close(this.seat_id);
  }

  ok() {
    const params = {
      'current_seatid': this.selectedSeat.id,
      'target_seatid' : this.seat_id
    };

    this.jsonSrv.delete('restaurant/seat_status', { id: this.seat_id }).subscribe((result1?) => {
      this.jsonSrv.post('restaurant/seat_status', { id: this.seat_id }).subscribe((result2: Array<any>) => {
            if ( result2['result'] == true || result1['result'] == true ) {
              this.changeSeat(params);
            } else {
              this.cmp.pop(result1['message']);
            }
        });
    })
  }
  changeSeat(params){
    this.jsonSrv.post('restaurant/seat/change_seat/', params).subscribe((response?) => {
      if (response && response["message"]) {
        if ( response['result'] == true ) {
          this.jsonSrv.delete('restaurant/seat_status', { id: this.selectedSeat.id }).subscribe((result:any) => {
            if ( result['result'] == true ) {
              this.cmp.pop(response["message"]);
              this.close();
            } else {
              this.cmp.pop(result['message']);
            }
          });
        } else {
          this.cmp.pop(response["message"]);
        }
        this.jsonSrv.delete('restaurant/seat_status', { id: this.seat_id })
      }

    });
  }
}
