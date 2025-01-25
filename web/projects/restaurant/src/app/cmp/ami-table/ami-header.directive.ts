import { Directive, ElementRef, HostListener, HostBinding, EventEmitter, Output } from '@angular/core';

export class AmiHeaderMoveEvent {
    fromId: string;
    toId: string;
}

@Directive({
    selector: '[appAmiHeader]'
})
export class AmiHeaderDirective {
    constructor(private el: ElementRef) {

    }
    m_down_x = 0;
    m_move_x = 0;
    m_max = 0;
    m_min = 0;
    resizable = false;
    // tslint:disable-next-line:no-output-on-prefix
    @Output() onAmiHeaderMove = new EventEmitter<AmiHeaderMoveEvent>();

    amiEvent: AmiHeaderMoveEvent = new AmiHeaderMoveEvent();

    @HostBinding('attr.draggable') draggable = true;

    @HostListener('dragstart', ['$event']) onDragStart(e) {
        // console.log('dragstart', this.el.nativeElement.id);
        this.el.nativeElement.style.backgroundColor = '#d4d4d4';
        e.dataTransfer.setData('fromId', this.el.nativeElement.id);
    }

    @HostListener('dragend', ['$event']) onDragEnd(e) {
        this.el.nativeElement.style.backgroundColor = '#eaeaea';
    }

    @HostListener('drop', ['$event']) onDrop(e) {
        e.preventDefault();
        const formId = e.dataTransfer.getData('fromId');
        const toId = this.el.nativeElement.id;
        // console.log('fromID:', e.dataTransfer.getData('fromId'));
        // console.log('toId:', toId);
        if (e.target.classList.contains('mat-sort-header-container') && e.target.tagName === 'DIV') {
            e.target.parentElement.style['border-right'] = '1px solid #d4d4d4';
            // let index = this.displayedColumns.indexOf(formId);
            // this.displayedColumns.splice(index, 1);
            // index = this.displayedColumns.indexOf(toId);
            // this.displayedColumns.splice(index + 1, 0, formId);
            // this.headChanged = true;
            // console.log('changed');
            this.amiEvent.fromId = formId;
            this.amiEvent.toId = toId;
            this.onAmiHeaderMove.emit(this.amiEvent);
        }
    }

    @HostListener('dragover', ['$event']) onDragOver(e) {
        e.preventDefault();

    }

    @HostListener('dragenter', ['$event']) onDragEnter(e) {
        if (e.target.classList.contains('mat-sort-header-container') && e.target.tagName === 'DIV') {
            e.target.parentElement.style['border-right'] = '5px solid cornflowerblue';
        }

    }

    @HostListener('dragleave', ['$event']) onDragLeave(e) {
        if (e.target.classList.contains('mat-sort-header-container') && e.target.tagName === 'DIV') {
            e.target.parentElement.style['border-right'] = '1px solid #d4d4d4';
        }

    }

    @HostListener('mousedown', ['$event']) onMouseDown(e) {
        this.m_down_x = 0;
        this.resizable = false;
        if (e.offsetX > (e.target.scrollWidth - 10) || e.offsetX < 10) {
            this.el.nativeElement.parentElement.parentElement.style['cursor'] = 'col-resize';
            // console.log('draggable', this.el.nativeElement.draggable);
            this.el.nativeElement.draggable = false;

            if (e.offsetX > (e.target.scrollWidth - 10)) {
                this.m_min = 0 - this.el.nativeElement.scrollWidth;
                this.m_max = this.el.nativeElement.nextSibling.scrollWidth;
            } else {
                this.m_min = 0 - this.el.nativeElement.previousSibling.scrollWidth;
                this.m_max = this.el.nativeElement.scrollWidth;
            }
            this.resizable = true;
            this.m_down_x = e.pageX;
            return true;
        }
        this.el.nativeElement.draggable = true;
        this.el.nativeElement.parentElement.parentElement.style['cursor'] = '';
    }

    @HostListener('mouseup', ['$event']) onMouseUp(e) {
        this.resizable = false;
    }

    @HostListener('mousemove', ['$event']) onMouseMove(e) {
        if (this.resizable === true) {
            // console.log(e.pageX, this.m_move_x);
            this.m_move_x = e.pageX - this.m_down_x;
            // console.log(this.m_move_x);
        }
    }


    @HostListener('mouseover', ['$event']) onMouseOver(e) {
        if (e.offsetX > (e.target.scrollWidth - 10) || e.offsetX < 10) {
            this.el.nativeElement.parentElement.parentElement.style['cursor'] = 'col-resize';
            return true;
        }

        this.el.nativeElement.parentElement.parentElement.style['cursor'] = '';
    }

    private highlight(color: string) {
        this.el.nativeElement.style.backgroundColor = color;
    }
}
