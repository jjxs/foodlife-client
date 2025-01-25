import { Component, OnInit, ViewChild } from "@angular/core";
import { MatSort, MatTableDataSource, MatDialog } from "@angular/material";
import { SelectionModel, SelectionChange } from "@angular/cdk/collections";
import { JsonService, Util, JsonResult } from "ami";
import { HomeService } from "../home/home.service";
import { group } from "@angular/animations";
import { CmpService } from "../cmp/cmp.service";
import { Router } from "@angular/router";
import { OrderHistoryComponent } from "../order/order-history/order-history.component";
import { ThemeService } from "../cmp/ami-theme-select/theme.service";

interface ReserveListData {
  id?: string;
  reserve_date: Date;
  person: string;
  phone: string;
  name: string;
  seat_type: number;
  smoke: boolean;
  memo: string;
  saas_id: string;
  status: string;
}
@Component({
  selector: "app-reserve",
  templateUrl: "./reserve.component.html",
  styleUrls: ["./reserve.component.css"],
})
export class ReserveComponent implements OnInit {
  constructor(
    private jsonSrv: JsonService,
    private homeSvr: HomeService,
    private cmp: CmpService,
    private router: Router,
    private themeSvr: ThemeService,
    private dialog: MatDialog
  ) {}

  dataSource: MatTableDataSource<ReserveListData>;
  displayedColumnsWithSelect = [
    "name",
    "phone",
    "person",
    "seat_type",
    "smoke",
    "reserve_date",
    "memo",
    "control",
  ];

  complete: boolean = false;

  ngOnInit() {
    this.fetchReserve();
  }

  fetchReserve() {
    this.jsonSrv
      .post("restaurant/reserve/fetch_reserve/", {
        "status": this.complete ? "1" : "0",
      })
      .subscribe((response: any) => {
        this.dataSource = new MatTableDataSource(response.data);
        console.log(this.dataSource);
        if (!Util.isEmpty(response) && !Util.isEmptyArray(response)) {
          // this.cmp.pop(response['message']);
        }
      });
  }

  refresh(event) {
    this.fetchReserve();
  }

  setOver(event, element: ReserveListData) {
    // 処理済
    element.status = "1";
    this.jsonSrv
      .post("restaurant/reserve/update_reserve/", element)
      .subscribe((response: any) => {
        this.refresh(null);
      });
  }
}
