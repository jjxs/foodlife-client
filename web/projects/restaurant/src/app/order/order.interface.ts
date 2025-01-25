import { SeatStatus } from "../seats/seat.interface";

// 注文一覧画面で表示用
export class OrderSeatInfo implements SeatStatus {
    id: number;
    seat: number;
    seat_group_no: number;
    seat_group_name: number;
    seat_no: number;
    seat_name: number;
    start: Date;
    end: Date;
    security_key: string;

    //クライアント側拡張データ　該当注文完了していること
    hasWaitData: boolean;

    // { order.id: order}
    orders: {};

    constructor(item: SeatStatus) {
        this.id = item.id;
        this.seat = item.seat;
        this.seat_group_no = item.seat_group_no;
        this.seat_group_name = item.seat_group_name;
        this.seat_no = item.seat_no;
        this.seat_name = item.seat_name;
        this.start = new Date(item.start);
        this.end = new Date(item.end);
        this.security_key = item.security_key;

        this.orders = {};
    }
}

export interface Order {
    id: number;
    order_time: Date;
    type_name: string;
    method_name: string;
    user_name: string;
    guest_name: number;
    seat_id: number;

    //クライアント側拡張データ　該当注文完了していること
    wait_minutes: number;

    //クライアント側拡張データ　 該当注文完了していることを表す
    over: boolean;
    details: Array<OrderDetail>;

    // 判断放題メニュー、    
    // true => 放題
    // false => 放題でない
    is_menu_free: boolean;

    // null => 放題ではない、 
    // true => 確認済み
    // false => 確認待ち
    menu_free_usable: boolean;
}

export interface OrderDetail {
    id: number;
    order_id: number;
    price: number;
    count: number;
    option: object;
    menu_option: object;
    menu_id: number;
    menu_no: number;
    menu_name: string;
    menu_tax_in: boolean;
    status_start: Date;
    status_code: number;
    status_id: number;
    status_name: string;
    detail_free_id: number;
    detail_free_start: Date;
    detail_free_end: Date;
    detail_free_usable: boolean;
    seat_id: number;
    menu_image: string;
}

export interface OrderDetailStatus {
    status: number;
    status_code: number;
    status_name: string;
    start_time: Date;
}

