import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShowcountService {

  constructor() { }

  // 関連レポートタグ用
  RelationCount = new Subject<string>();
  RelationCount$ = this.RelationCount.asObservable();
  public relationCount(count: string) {
    if (count != '0') {
      this.RelationCount.next(`（${count}）`);
    }
  }

  // 添付ファイルボタン用
  AttachmentFile = new Subject<string>();
  AttachmentFile$ = this.AttachmentFile.asObservable();
  public attachmentFile(count: string) {
    if (count != '0') {
      this.AttachmentFile.next(`（${count}）`);
    }
  }

  // 起票済みレポートタグ用
  ApplyCount = new Subject<string>();
  ApplyCount$ = this.ApplyCount.asObservable();
  public draftCount(count: string) {
    if (count != '0') {
      this.ApplyCount.next(`（${count}）`);
    }
  }
}