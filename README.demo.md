1. 時間計算

```Typescript

        console.log("order.order_time", order.order_time)
        const now = new Date();
        if (!(order.order_time instanceof Date)) {
                order.order_time = new Date(order.order_time);
        }
        const diff: any = now.getTime() - order.order_time.getTime();
        order.wait_minutes = Math.floor(diff / 1000 / 60)


```

2. grid 奇偶分开

```html
  <ng-container matColumnDef="down1">
    <td mat-cell *matCellDef="let element; let isOdd = odd;" style="width: 50px">
      <button *ngIf="isOdd && action==='split'" mat-mini-fab color="primary" (click)="onDown(element)">
        <mat-icon>arrow_downward</mat-icon>
      </button>
    </td>
  </ng-container>
  <ng-container matColumnDef="down2">
    <td mat-cell *matCellDef="let element; let isEven = even;" style="width: 50px">
      <button *ngIf="isEven && action==='split'" mat-mini-fab color="primary" (click)="onDown(element)">
        <mat-icon>arrow_downward</mat-icon>
      </button>
    </td>
  </ng-container>
  
```

3. 控件全屏，并且不做小范围滚动

```html
  <div fxLayout="column" fxLayoutAlign="space-between center" style="height: 100vh;overflow-y:hidden;">
```

4. 屏幕变化时，自动切换横纵显示方式，（fxFlexFill和fxFlex配合控制自动布局）

https://stackblitz.com/edit/angular-flex-layout-seed?file=app%2Ftest.component.ts

```html
      <div class="bounds">
    
      <div class="content" 
           fxLayout="row" 
           fxLayout.xs="column" 
           fxFlexFill >
           
          <div fxFlex="15" class="sec1" fxFlex.xs="55">
              first-section
          </div>
          <div fxFlex="30" class="sec2" >
              second-section
          </div>
          <div fxFlex class="sec3" fxFlex.xs="15">
              third-section
          </div>
          
      </div>
      
    </div>

```

5. access key and value of object using *ngFor

方法一：
```Typescript
@Component({
  selector: 'app-myview',
  template: `<div *ngFor="let key of objectKeys(items)">{{key + ' : ' + items[key]}}</div>`
})

export class MyComponent {
  objectKeys = Object.keys;
  items = { keyOne: 'value 1', keyTwo: 'value 2', keyThree: 'value 3' };
  constructor(){}
}

```

方法二
```HTML
<ng-container *ngFor="let order of seat.value.orders | keyvalue">
  <restaurant-order-card *ngIf="!order.value.is_menu_free" [order]="order.value"></restaurant-order-card>
  <restaurant-order-card-menufree *ngIf="order.value.is_menu_free" [order]="order.value"></restaurant-order-card-menufree>
</ng-container>
```
