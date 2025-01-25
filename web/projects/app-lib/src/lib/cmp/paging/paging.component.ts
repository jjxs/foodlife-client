import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatSelectChange } from '@angular/material';
import { Util } from '../../utils/util';

export interface PagingChangeEvent {
  //現在ページ毎の表示件数
  ROWNUM_FROM: number;

  // 現在ページ目（１～
  ROWNUM_TO: number;
}

@Component({
  selector: 'app-paging',
  templateUrl: './paging.component.html',
  styleUrls: ['./paging.component.scss']
})
export class PagingComponent implements OnInit {

  options = [5, 10, 25, 50, 100]

  size: number = 25;

  math = Math;

  // ページサイズ表示、非表示
  @Input() hidePageSize: boolean = true;

  // トータル件数
  private _total: number = 0
  @Input() set total(value: number) {
    this._total = value;
    if (this.total === 0) {
      this.page = 1;
      return
    }

    if (this.total < this.size) {
      this.page = 1;
      return;
    }

    if (this.getTotal() <= this.page) {
      this.page = 1;
    }
  }

  get total(): number {
    return this._total;
  }

  // 現在ページ目（１～
  page: number = 1;

  //　ページ移動する
  @Output('change') change = new EventEmitter<PagingChangeEvent>();

  constructor() { }

  ngOnInit() {

  }

  init() {
    this.total = 0;
    this.page = 1;

  }

  getTotal() {
    return Math.ceil(this.total / this.size)
  }

  changePage(event) {
    let newValue = parseInt(event.currentTarget.value);
    if (newValue > this.getTotal()) {
      newValue = this.getTotal();
      
    }
    this.page = newValue;
    this.fireChange(newValue)
  }

  moveToFrist(event) {
    if (this.page <= 1)
      return;
    this.page = 1;
    this.fireChange(1)
  }


  moveToLast(event) {
    if (this.page >= this.getTotal())
      return;
    const current = Math.ceil(this.total / this.size);
    this.page = current;
    this.fireChange(current)
  }


  moveToPre(event) {
    if (this.page <= 1)
      return;

    this.page = this.page - 1
    this.fireChange(this.page - 1)
  }

  moveToNext(event) {
    if (this.page >= this.getTotal())
      return;

    this.page = this.page + 1
    this.fireChange(this.page + 1)
  }

  //ページ毎表示件数選択時
  selectionChange(event: MatSelectChange) {
    if (this.total !== 0) {
      this.page = 1;
      this.fireChange(1, event.value);
    }
  }

  fireChange(page: number, size?: number) {

    const currentSize = size || this.size;

    this.change.emit({
      ROWNUM_FROM: (page - 1) * currentSize + 1,
      ROWNUM_TO: page * currentSize
    })
  }

  getParam() {
    return {
      ROWNUM_FROM: (this.page - 1) * this.size + 1,
      ROWNUM_TO: this.page * this.size
    }
  }

}
