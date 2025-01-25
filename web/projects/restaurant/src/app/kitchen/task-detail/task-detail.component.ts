import { Component, OnInit, Inject } from '@angular/core';
import { JsonService, Util } from 'ami';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CounterService } from '../../counter/counter.service';
import { TaskData } from '../kitchen.interface';
import { CmpService } from '../../cmp/cmp.service';

@Component({
  selector: 'restaurant-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.css']
})
export class TaskDetailComponent implements OnInit {

  task: TaskData;
  items = [];

  constructor(
    public counterSrv: CounterService,
    private jsonSrv: JsonService,
    private cmp: CmpService,
    public dialogRef: MatDialogRef<TaskDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.task = data['task'];
      const items = {};
      // tslint:disable-next-line: forin
      for (const i in this.task.option) {
        const item = this.task.option[i];
        let index = this.items.length;
        if (item['index'] != undefined) {
          index = item['index'];
        }
        items[index] = item;
      }
      this.items = Object.values(items);
  }

  ngOnInit() {
  }

  ok(item, index) {
    const option_id = item['id'];
    this.doAction(option_id, 1);
    item['status'] = 1;
  }

  back(item, index) {
    const option_id = item['id'];
    this.doAction(option_id, 0, false);
    item['status'] = 0;
  }


  doAction(option_id, status = 1, close = false) {
    const params = {
      detail_id: this.task.detail_id,
      detail_status_id: this.task.detail_status_id,
      current_status_code: this.task.status_code,
      next_status_code: this.task.status_code,
      menu_id: this.task.menu_id,
      task: this.task,
      option_id: option_id,
      status: status
    };
    this.jsonSrv.post('restaurant/kitchen/order_option/', params).subscribe((response: any) => {
      if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
        this.cmp.pop(response['message']);
      }

      if ( close ) {
        this.dialogRef.close({});
      }
    });
  }

  close(): void {
    this.dialogRef.close(null);
  }

}
