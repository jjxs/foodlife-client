import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TaskData } from '../kitchen.interface';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { MatDialog } from '@angular/material';
import { Util, JsonService } from 'ami';
@Component({
  selector: 'restaurant-task',
  templateUrl: './task.component.html',
  styleUrls: ['./task.component.css']
})
export class TaskComponent implements OnInit {

  @Input() taskData: TaskData;

  @Output() next = new EventEmitter<TaskData>();
  @Output() back = new EventEmitter<TaskData>();
  @Output() cancel = new EventEmitter<TaskData>();
  @Output() delete = new EventEmitter<TaskData>();
  @Output() subDel = new EventEmitter<TaskData>();
  @Output() subNext = new EventEmitter<TaskData>();
  @Output() subCancel = new EventEmitter<TaskData>();
  @Output() removeTask = new EventEmitter();

  @Input() buttonColor = 'accent';
  @Input() nextName = '次へ';
  @Input() backName = '戻';
  @Input() cancelName = '取消';
  @Input() deleteModel = false;
  @Input() canBack = true;
  @Input() canNext = true;
  @Input() canDelete = false;
  @Input() siteImgHost = '';
  @Input() currentStatus = '100';
  @Input() chinese = false;
  @Input() japan = true;

  @Input() multiTask: boolean = false;

  items = [];

  constructor(
    private dialog: MatDialog,
    private jsonSrv: JsonService,
    ) {
    }

  ngOnInit() {
    const items = {};
    for (const i in this.taskData.option) {
      const item = this.taskData.option[i];
      let index = this.items.length;
      if (item['index'] != undefined) {
        index = item['index'];
      }
      items[index] = item;
    }
    this.items = Object.values(items);
  }

  onNext() {
    this.next.emit(this.taskData);
  }

  onBack() {
    this.back.emit(this.taskData);
  }

  onCancel() {
    this.cancel.emit(this.taskData);
  }

  onDelete() {
    this.delete.emit(this.taskData);
  }

  onSubDel(sub: TaskData, index: number) {

    // this.removeSub(index);
    this.subDel.emit(sub);
  }

  onSubNext(sub: TaskData, index: number) {
    // this.removeSub(index);
    this.subNext.emit(sub);
  }

  onSubCancel(sub: TaskData, index: number) {
    // this.removeSub(index);
    this.subCancel.emit(sub);
  }

  // removeSub(index: number) {
  //   //　subtask　因为先隐藏数据再更新数据库，当数据库更是中错误发生时，可以考虑刷新全部数据
  //   this.taskData.sub_data.splice(index, 1);
  //   if (this.taskData.sub_data.length === 0) {
  //     this.removeTask.emit();
  //   }
  // }

  showDetail(task: TaskData) {
    if ( task.status_code != 100 && task.status_code != 300 ) {
      return ;
    }
    if ( Util.isEmpty(task.option) || Object.keys(task.option).length==0 ) {
      return;
    }
    // tslint:disable-next-line: no-console
    console.info(task.option);
    const dialog = this.dialog.open(TaskDetailComponent, {
      width: '600px',
      data: {
        task: task
      }
    });
  }

  ok(item, index) {
    const option_id = item['id'];
    this.doAction(option_id, 1);
    item['status'] = 1;
  }

  modoru(item, index) {
    const option_id = item['id'];
    this.doAction(option_id, 0, false);
    item['status'] = 0;
  }


  doAction(option_id, status = 1, close = false) {
    const params = {
      detail_id: this.taskData.detail_id,
      detail_status_id: this.taskData.detail_status_id,
      current_status_code: this.taskData.status_code,
      next_status_code: this.taskData.status_code,
      menu_id: this.taskData.menu_id,
      task: this.taskData,
      option_id: option_id,
      status: status
    };
    this.jsonSrv.post('restaurant/kitchen/order_option/', params).subscribe((response: any) => {
      if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
        // this.cmp.pop(response['message']);
      }

      // if ( close ) {
      //   this.dialogRef.close({});
      // }
    });
  }
}
