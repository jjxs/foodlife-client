import { MenuCategory } from "../menu/menu.interface";

export class CallingSeat {
    group: number;
    group_no: string;
    group_name: string;
    id: number;
    name: string;
    seat_no: string;
    count: number;
}

export class StaffMenu {

    price: number = 0;
    ori_price: number = 0;
    tax_in: boolean = false;
    is_free: boolean = false;
    id: number = 0;
    name: string = '';
    image: string = '';
    no: number = 0;
    count: number = 0;
    note: string = '';
    introduction: string = '';
    menu_options: Array<object>;
    course: Array<object>;
    usable: false;
    stock_status: number;
    mincount: number;

    constructor(data?: MenuCategory) {
        this.count = 0;
        this.is_free = false;
        if (data) {
            this.id = data.menu_id;
            this.no = data.menu_no;
            this.name = data.menu_name;
            this.price = data.menu_price;
            this.ori_price = data.menu_ori_price;
            this.image = data.image;
            this.course = data.course;
            this.menu_options = data.menu_options;
            this.usable = data.menu_usable;
            this.stock_status = data.stock_status;
            this.introduction = data.introduction;
            this.tax_in = data.tax_in;
            this.mincount = data.mincount;
        }
    }
}