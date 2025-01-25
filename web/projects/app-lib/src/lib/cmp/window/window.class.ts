export class ResizeWindow {

    private container: HTMLElement;
    private element: HTMLElement;

    constructor(el: HTMLElement) {
        this.container = el;
        //console.log("...ResizeWindow constructor...", el)



        this.init();
    }

    init() {
        var me = this;
        this.element = this.container.querySelector("mat-dialog-container");

        this.element.addEventListener("mousemove", function (ev: MouseEvent) {

            if (ev.target !== me.element) {
                return;
            }

            //console.log("... onMousemove ...", ev.target)
            // console.log(ev.x + "　:　" + ev.y + ",", ev.clientX + "　:　" + ev.clientY + ",", ev.offsetX + "　:　" + ev.offsetY)

            const offsetHeight = me.element.offsetHeight;
            const offsetWidth = me.element.offsetWidth;


            me.element.classList.remove("nwse-resize");
            me.element.classList.remove("nesw-resize");
            me.element.classList.remove("ns-resize");
            me.element.classList.remove("ew-resize");


            if (ev.offsetX < 15 && ev.offsetY < 15) {

                me.element.classList.add("nwse-resize");
            } else if (ev.offsetX > (offsetWidth - 15) && ev.offsetY > (offsetHeight - 15)) {

                me.element.classList.add("nwse-resize");

            } else if (ev.offsetX > (offsetWidth - 15) && ev.offsetY < 15) {

                me.element.classList.add("nesw-resize");

            } else if (ev.offsetX < 15 && ev.offsetY > (offsetHeight - 15)) {

                me.element.classList.add("nesw-resize");

            } else if (ev.offsetX <= 15) {

                me.element.classList.add("ew-resize");

            } else if (ev.offsetX >= (offsetWidth - 15)) {

                me.element.classList.add("ew-resize");

            } else if (ev.offsetY <= 15) {

                me.element.classList.add("ns-resize");

            } else if (ev.offsetY >= (offsetHeight - 15)) {

                me.element.classList.add("ns-resize");

            } else {

            }
        });
        // this._el.addEventListener("mouseup", this.onMouseUp);

        // });
        //console.log(this._el.scrollWidth + "," + this._el.clientWidth + "," + this._el.offsetWidth)
        // const divTopLeft = document.createElement('div');
        // divTopLeft.classList.add("resizer");
        // divTopLeft.classList.add("top-left");
        // this._el.appendChild(divTopLeft)

        // const divTopRight = document.createElement('div');
        // divTopLeft.classList.add("resizer");
        // divTopLeft.classList.add("top-right");
        // this._el.appendChild(divTopRight)

        // const divBottomLeft = document.createElement('div');
        // divTopLeft.classList.add("resizer");
        // divTopLeft.classList.add("bottom-left");
        // this._el.appendChild(divBottomLeft)

        // const divBottomRight = document.createElement('div');
        // divTopLeft.classList.add("resizer");
        // divTopLeft.classList.add("bottom-right");
        // this._el.appendChild(divBottomRight)

        const minimum_size = 20;
        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;


        function stopResize() {
            me.element.classList.remove("resizable");

            me.element.classList.remove("top-left");
            me.element.classList.remove("bottom-right");
            me.element.classList.remove("top-right");
            me.element.classList.remove("bottom-left");
            me.element.classList.remove("side-left");
            me.element.classList.remove("side-right");
            me.element.classList.remove("side-top");
            me.element.classList.remove("side-bottom");

            window.removeEventListener('mousemove', resize)
        }

        function resize(e) {

            let width = original_width;
            let height = original_height;

            if (me.element.classList.contains('top-left')) {
                width = original_width - (e.pageX - original_mouse_x)
                height = original_height - (e.pageY - original_mouse_y)

            }
            else if (me.element.classList.contains('bottom-right')) {
                width = original_width + (e.pageX - original_mouse_x);
                height = original_height + (e.pageY - original_mouse_y)
            }
            else if (me.element.classList.contains('top-right')) {
                width = original_width + (e.pageX - original_mouse_x)
                height = original_height - (e.pageY - original_mouse_y)

            }
            else if (me.element.classList.contains('bottom-left')) {
                height = original_height + (e.pageY - original_mouse_y)
                width = original_width - (e.pageX - original_mouse_x)

            }
            else if (me.element.classList.contains('side-left')) {
                width = original_width - (e.pageX - original_mouse_x)
            }
            else if (me.element.classList.contains('side-right')) {
                width = original_width + (e.pageX - original_mouse_x)

            }
            else if (me.element.classList.contains('side-top')) {
                height = original_height - (e.pageY - original_mouse_y)
            }
            else if (me.element.classList.contains('side-bottom')) {
                height = original_height + (e.pageY - original_mouse_y)
            }
            else {

            }

            if (width > minimum_size) {
                me.container.style.width = width + 'px'
            }
            if (height > minimum_size) {
                me.container.style.height = height + 'px'
            }

        }

        this.element.addEventListener('mousedown', function (ev) {



            //console.log("element.addEventListener('mousedown', function (e) ")

            if (ev.target !== me.element) {
                // console.log(ev.x + "　:　" + ev.y + ",", ev.clientX + "　:　" + ev.clientY + ",", ev.offsetX + "　:　" + ev.offsetY)
                // console.log(ev.target, element)
                return;
            }

            original_width = parseFloat(getComputedStyle(me.container, null).getPropertyValue('width').replace('px', ''));
            original_height = parseFloat(getComputedStyle(me.container, null).getPropertyValue('height').replace('px', ''));


            original_x = me.element.getBoundingClientRect().left;
            original_y = me.element.getBoundingClientRect().top;
            original_mouse_x = ev.pageX;
            original_mouse_y = ev.pageY;


            const offsetHeight = me.element.offsetHeight;
            const offsetWidth = me.element.offsetWidth;

            me.element.classList.remove("top-left");
            me.element.classList.remove("bottom-right");
            me.element.classList.remove("top-right");
            me.element.classList.remove("bottom-left");
            me.element.classList.remove("side-left");
            me.element.classList.remove("side-right");
            me.element.classList.remove("side-top");
            me.element.classList.remove("side-bottom");
            me.element.classList.remove("resizable");

            if (ev.offsetX < 15 && ev.offsetY < 15) {

                me.element.classList.add("resizable");
                me.element.classList.add("top-left");
            } else if (ev.offsetX > (offsetWidth - 15) && ev.offsetY > (offsetHeight - 15)) {

                me.element.classList.add("resizable");
                me.element.classList.add("bottom-right");

            } else if (ev.offsetX > (offsetWidth - 15) && ev.offsetY < 15) {

                me.element.classList.add("resizable");
                me.element.classList.add("top-right");

            } else if (ev.offsetX < 15 && ev.offsetY > (offsetHeight - 15)) {

                me.element.classList.add("resizable");
                me.element.classList.add("bottom-left");

            } else if (ev.offsetX <= 15) {

                me.element.classList.add("resizable");
                me.element.classList.add("side-left");

            } else if (ev.offsetX >= (offsetWidth - 15)) {

                me.element.classList.add("resizable");
                me.element.classList.add("side-right");

            } else if (ev.offsetY <= 15) {

                me.element.classList.add("resizable");
                me.element.classList.add("side-top");

            } else if (ev.offsetY >= (offsetHeight - 15)) {

                me.element.classList.add("resizable");
                me.element.classList.add("side-bottom");

            } else {

            }

            window.addEventListener('mousemove', resize)
            window.addEventListener('mouseup', stopResize)
        });
    }





    destroy() {
        // this.element.removeEventListener("mousemove", this.onMousemove)
        this.element = null;
        this.container = null;
    }

}