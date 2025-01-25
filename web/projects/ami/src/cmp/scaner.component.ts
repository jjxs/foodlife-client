import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import jsQR from "jsQR";
import { JsonService } from '../lib/http/json.service';
import { Util } from '../lib/common/util';
import { JsonResult } from '../lib/http/http.interface';

@Component({
  selector: 'ami-scaner',
  templateUrl: './scaner.component.html',
  styleUrls: ['./scaner.component.css']
})
export class AmiScaner implements OnInit {

  @ViewChild('camera', {static: false}) public camera;
  @ViewChild('canvas', {static: false}) public canvas;

  @Output() changed = new EventEmitter<JsonResult>()

  nickname = "";
  constructor(private jsonSrv: JsonService) { }

  ngOnInit() {
    let ctx = this.canvas.nativeElement.getContext('2d');
    const image = new Image();
    image.onload = function () {
      ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, 96, 96);
    };
    image.src = '/assets/images/barcode.png';
  }

  scan(event) {
    this.camera.nativeElement.click();

  }

  onChange(event) {
    let ctx = this.canvas.nativeElement.getContext('2d');

    if (this.camera.nativeElement.files && this.camera.nativeElement.files[0]) {
      this.jsonSrv.upload('master/qr/read/', this.camera.nativeElement.files[0]).subscribe((response: JsonResult) => {
        this.changed.emit(response);
      });
    }
    //   let ctx = this.canvas.nativeElement.getContext('2d');
    //   let me = this;
    //   const image = new Image();
    //   image.onload = function () {
    //     try {

    //       ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, 96, 96);
    //       const imageData = ctx.getImageData(0, 0, 96, 96);
    //       const result = jsQR(imageData.data, 96, 96);
    //       me.nickname = result.data;
    //       me.changed.emit(result.data);
    //     } catch (error) {
    //       me.changed.emit(error);
    //     }
    //     // console.log(result.data);
    //     // console.log(result);
    //   };
    //   image.src = '/assets/images/barcode.png';
    //   image.src = URL.createObjectURL(event.target.files[0]);

  }
}

