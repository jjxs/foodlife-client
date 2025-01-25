import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { CounterService } from '../counter.service';
import { CounterDetailOrder } from '../counter.interface';
import { Util } from 'ami';
import _ from 'lodash';

@Component({
  selector: 'restaurant-counter-details-confirm',
  templateUrl: './counter-details-confirm.component.html',
  styleUrls: ['./counter-details-confirm.component.css']
})
export class CounterDetailsConfirmComponent implements OnInit {

  details: object = {}

  taxDetails: object = {}

  hasTax: boolean = false;
  /*
    data: {
      details: this.details,
      money: this.money,
      pay_method: master,
    }
  */
  constructor(
    private dialog: MatDialog,
    public counterSrv: CounterService,
    public dialogRef: MatDialogRef<CounterDetailsConfirmComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }

  ngOnInit() {
    if (this.data.details) {
      this.data.details.forEach((element: CounterDetailOrder) => {
        const detailKey = element.menu_no.toString() + "_" + element.price.toString();
        if (element.tax_in) {

          if (this.taxDetails[detailKey]) {
            this.taxDetails[detailKey].count += element.count;
          } else {
            this.taxDetails[detailKey] = Util.copy(element);
          }
          this.hasTax = true;

        } else {

          if (this.details[detailKey]) {
            this.details[detailKey].count += element.count;
          } else {
            this.details[detailKey] = Util.copy(element);
          }

        }
      });

      for (let key in this.taxDetails) {
        let value: CounterDetailOrder = this.taxDetails[key];
        value.total = this.counterSrv.countPriceTaxIn(value);
        //value.price_tax_in = this.counterSrv.tax(value.price);
        value.price_tax_in = value.price;
      }


      for (let key in this.details) {
        let value: CounterDetailOrder = this.details[key];
        value.total = this.counterSrv.countPrice(value);
      }

    }

  }


  printDetail() {
    //console.log(this.data)
    const params = {
      details: this.details,
      taxDetails: this.taxDetails,
      money: this.data.money,
      pay_name: this.data.pay_method,
      fax: this.data.money['tax'],
      shopInfo: this.counterSrv.getShopInfo(),
      seat_name: _.uniq(this.data.details.map(e=>{return e.seat_name}))
    };

    if ( !this.counterSrv.detail_print(params) ) {
      const frame = window.document.getElementById("iframe_details");
      frame["contentWindow"].printdetails(params)
    }
  }

  closeEmpty() {
    this.dialogRef.close({});
  }
}
