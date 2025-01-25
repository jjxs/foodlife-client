import { Component, OnInit, ViewChild, Output, Inject, EventEmitter, AfterViewInit } from '@angular/core';
import { JsonService, JsonResult, TableEmptyMessageComponent, CmpService, Util } from 'app-lib';
import { FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'seat-edit-manager',
  templateUrl: './seat-edit-manager.component.html',
  styleUrls: ['./seat-edit-manager.component.css']
})
export class SeatEditManagerComponent implements OnInit, AfterViewInit {
  // 編集フォーム
  editForm: FormGroup;

  grouptype = [];
  typegroup = [];
  smokegroup = [];

  // ID
  currentID = null;

  constructor(
    private json: JsonService,
    private fb: FormBuilder,
    private cmp: CmpService,
    public dialogRef: MatDialogRef<SeatEditManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.editForm = this.fb.group({
      seat_no: ['', Validators.required],
      name: ['', Validators.required],
      group_id: ['', []],
      seat_type_id: ['', []],
      seat_smoke_type_id: [''],
      number: ['', []],
      takeout_type: false,
    });
    if (data != null) {
      if (Object.keys(data).length !== 0) {
        const params = this.editForm.value;
        params['id'] = data['id'];
        this.json.post('s/seat_manager_api/get_seat_edit_data', params).subscribe((response: JsonResult) => {
          if (response.data) {
            this.editForm.patchValue(response.data.result[0]);
            this.grouptype = response.data.seatgroup;
            this.typegroup = response.data.typegroup;
            this.smokegroup = response.data.smokegroup;
            this.currentID = params['id'];
          }
        });
      }
    } else {
      this.json.post('s/seat_manager_api/get_seat_add_data', {}).subscribe((response: JsonResult) => {
        if (response.data) {
          this.grouptype = response.data.seatgroup;
          this.typegroup = response.data.typegroup;
          this.smokegroup = response.data.smokegroup;
          this.currentID = null;
        }
      });
    }
  }

  ngOnInit() {
  }

  ngAfterViewInit(): void {

  }
  onCancel() {
    this.editForm.reset();
    this.dialogRef.close();
  }

  onSave() {
    const params = this.editForm.value;
    params['id'] = this.currentID;
    Object.values(this.editForm.controls).forEach((c: FormControl) => c.markAsTouched());
    if (this.editForm.valid) {
      this.json.post('s/seat_manager_api/set_seat_data', params).subscribe((response: JsonResult) => {
        if (response) {
          this.cmp.pop(response.message);
          if (response.result) {
            this.dialogRef.close("1");
          }
        }
      });
    }
  }
}
