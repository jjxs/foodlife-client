import { Component, OnInit, Inject, ViewContainerRef, ComponentFactoryResolver, ViewChild, AfterViewInit, OnChanges, OnDestroy, AfterViewChecked, ComponentRef, AfterContentInit, Injector, ElementRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ComponentType } from '@angular/cdk/portal';
import { IWindowComponent, IWindowResult } from './window.interface';
import { Util } from '../../utils/util';
import { Subscription, Observable } from 'rxjs';
import { CmpWindowService } from './window.service';
import { CmpService } from '../cmp.service';
import { AppService } from '../../service/app.service';
import { ResizeWindow } from './window.class';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.css']

})
export class WindowComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy, AfterViewChecked {
  ngAfterViewChecked(): void {

  }

  title = 'APP';
  private service: CmpWindowService;
  // private component: any;
  // private componentType: any;
  // private windowComponent: IWindowComponent;
  // private parameters: any = {};
  // private isViewInitialized: boolean = true;
  // private displayProperty = { "display": "none" }

  @ViewChild('container', { read: ViewContainerRef, static: false }) viewContainerRef: ViewContainerRef;

  private windowComponent: ComponentRef<any> = null;
  private showSpinner = true;

  private resizeWin: ResizeWindow = null;

  constructor(
    private app: AppService,
    private injector: Injector,
    private _elementRef: ElementRef<HTMLElement>,
    public dialogRef: MatDialogRef<WindowComponent>,
    private componentFactoryResolver: ComponentFactoryResolver,
    @Inject(MAT_DIALOG_DATA) public data
  ) {
    // this.componentType = this.data["__component"]
    // this.parameters = Util.append(this.parameters, );
    //console.log(this.data)
    this.title = this.data["title"] || this.title;

  }

  ngAfterViewInit(): void {
    this.viewContainerRef.clear();
    this.service = new CmpWindowService(this.dialogRef);
    this.service.setParameters(this.data)
    const injectorService = Injector.create({
      providers: [{ provide: CmpWindowService, useValue: this.service }],
      parent: this.injector
    });
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data["__component"]);
    this.windowComponent = this.viewContainerRef.createComponent(componentFactory, undefined, injectorService);
    // (<IWindowComponent>this.windowComponent.instance).cmpWindow = this.dialogRef;
    // (<IWindowComponent>this.windowComponent.instance).cmpParameters = this.data;
    this.windowComponent.changeDetectorRef.detectChanges();
    this.app.useFont();

  }
  ngOnChanges(changes: import("@angular/core").SimpleChanges): void {
    // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data["__component"]);
    // this.windowComponent = this.viewContainerRef.createComponent(componentFactory);
    // this.renderComponent();
    //console.log("window ngOnChanges!!!!!!")
  }

  ngOnInit() {

    // this.viewContainerRef.clear();
    // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data["__component"]);
    // this.ngOnDestroy();
    // this.windowComponent = this.viewContainerRef.createComponent(componentFactory);
    // console.log("windows _elementRef", this._elementRef.nativeElement.closest(".cdk-overlay-pane"))



    let div = null;
    if (this._elementRef.nativeElement.closest) {
      div = this._elementRef.nativeElement.closest(".cdk-overlay-pane");
    } else {
      div = this._elementRef.nativeElement.parentElement.parentElement.parentElement.querySelector(".cdk-overlay-pane");
    }
    if (div !== null) {
      this.resizeWin = new ResizeWindow(div as HTMLElement);
    }

  }

  componentCloseWindow(result) {
    this.dialogRef.close(result)
  }
  // ngAfterViewInit(): void {

  //   // this.windowComponent.changeDetectorRef.detectChanges();
  //   // this.title = this.data["title"] || this.title;

  // }

  ngOnDestroy(): void {
    if (this.windowComponent) {
      //this.windowComponent.changeDetectorRef.detach();
      this.windowComponent.destroy();
      this.service.destroy();
      //this.validationMessageComponent.destroy();
    }

    if (this.resizeWin) {
      this.resizeWin.destroy();
    }
  }

  // distroy() {
  //   if (this.component && this.component["destroy"]) {
  //     this.component["destroy"]();
  //   }
  // }

  close() {
    this.service.send();

    // if (!(<IWindowComponent>this.windowComponent.instance)["onWindowClose"]) {
    //   this.dialogRef.close();
    //   return;
    // }

    // const result = (<IWindowComponent>this.windowComponent.instance).onWindowClose()

    // if ((result && result["close"]) || result) {
    //   this.dialogRef.close(result["data"]);
    //   return;
    // }

    // console.log("(<Observable<any>>result).subscribe(result => {", result)
    // if (result instanceof Subscription) {
    //   (<Subscription>result).as
    //     .subscribe(win => {
    //       console.log("(<Observable<any>>result).subscribe(result => {", win);
    //       return true;
    //     });

    //   return;
    // }


  }



}
