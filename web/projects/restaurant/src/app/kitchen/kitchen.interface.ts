import { Util } from "ami";

export interface GoToNextResult {
    detail_status_id: number;
    status_code: number;
    status_username: string;
}

export interface ITaskData {
    order_id: number;
    order_time: Date;
    detail_id: number;
    count: number;
    menu_id: number;
    menu_no: number;
    menu_name: string;
    menu_note: string;
    option: any;
    menu_option: any;
    seat_id: number;
    seat_no: number;
    seat_name: string;
    detail_status_id: number;
    status_code: number;
    status_username: string;
    menu_image: string;
    ship_addr: string;
    ship_name: string;
    ship_tel: string;
    ship_time: string;
    price: number;
}

export class TaskData implements ITaskData {

    order_id: number;
    order_time: Date;
    detail_id: number; // KEY項目
    count: number;
    menu_id: number;
    menu_no: number;
    menu_name: string;
    menu_display_name: Array<string>;
    menu_note: string;
    option: any;
    menu_option: any;
    seat_id: number;
    seat_no: number;
    seat_name: string;
    detail_status_id: number;
    status_code: number;
    status_username: string;
    from_code: number;
    menu_image: string;

    ship_addr: string;
    ship_name: string;
    ship_tel: string;
    ship_time: string;
    price: number;

    //拡張データ
    sub_data: Array<ITaskData>;
    sub_details: any;
    sub_total: number;

    constructor(task: ITaskData) {
        this.order_id = task.order_id;
        this.order_time = new Date(task.order_time);
        this.detail_id = task.detail_id;　// KEY項目
        this.count = task.count;
        this.menu_id = task.menu_id;
        this.menu_no = task.menu_no;
        this.menu_name = task.menu_name;
        this.menu_note = task.menu_note;
        this.option = task.option;
        this.menu_option = task.menu_option;
        this.seat_id = task.seat_id;
        this.seat_no = task.seat_no;
        this.seat_name = task.seat_name;
        this.detail_status_id = task.detail_status_id;
        this.status_code = task.status_code;
        this.status_username = task.status_username;
        this.from_code = 0;
        this.sub_data = new Array<TaskData>();
        this.sub_details = [];
        this.sub_total = 0;
        this.menu_image = task.menu_image;
        this.ship_addr = task.ship_addr;
        this.ship_name = task.ship_name;
        this.ship_tel = task.ship_tel;
        this.ship_time = task.ship_time;
        this.price = task.price;
    }
    getTotal() {
        let total = 0;
        this.sub_data.forEach(element => {
            total += element.count;
        });
        return total;
    }
    addsub(task: TaskData) {
        if (this.sub_data.length === 0) {
            // 自分自身も追加  
            const copy = Util.copy(this);
            const ownerTask = new TaskData(copy)
            this.sub_data.push(ownerTask);
            this.sub_details.push(ownerTask.detail_id);
            this.detail_id = -1;
        }

        this.sub_data.push(task);
        this.sub_details.push(task.detail_id);

    }

    removesub(detail_id: number) {

        const index = this.sub_data.findIndex((data: TaskData) => { return data.detail_id === detail_id });
        if (index >= 0) {
            this.sub_data.splice(index, 1);
        }

        this.sub_details.splice(this.sub_details.indexOf(detail_id), 1);
    }

}


export enum StatusCode {
    // 確認待ち
    Code_0 = 0,

    // 受付
    Code_100 = 100,

    // 調理開始
    Code_200 = 200,

    // 調理済み
    Code_300 = 300,

    // 出来上がり
    Code_999 = 999,

    // 取消
    Code_Cancel = -1
}