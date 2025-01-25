export interface CounterDetailOrder {
    order_id: number;
    detail_id: number;
    price: number;
    count: number;
    tax_in: boolean;
    menu_id: number;
    menu_no: number;
    menu_name: String;
    menu_note: String;
    status_code: number;
    status_name: String;
    detail_free_id: number;
    detail_free_usable: boolean;
    seat_id: number;
    seat_no: number;
    seat_name: String;
    is_delete: boolean;
    is_ready: boolean;
    is_split: boolean;
    is_takeout: boolean;

    //拡張　
    // 合計 price * count
    total: number;
    price_tax_in: number;
}

export enum CounterAction {
    Pay = "pay",
    Average = "average",
    Input = "input",
    Edit = "edit"
}

export interface CounterDetail {
    amounts_actually: number;
    amounts_actually_tax: number;
    amounts_payable: number;
    canceled: boolean;
    canceled_type_id: number;
    change: number;
    code: 0
    counter_id: number;
    create_time: Date;
    cut: number;
    display_name: String;
    id: number;
    pay: number;
    pay_method_id: number;
    price: number;
    reduce: number;
    tax: number;
    total: number;
    user_id: number;
    username: String;
}

export interface Counter {
    id: number;
    canceled: boolean;
    create_time: Date;
    is_average: boolean;
    is_input: boolean;
    is_pay: boolean;
    is_split: boolean;

    // 拡張データ
    pay_price: number, 　 //合計支払値
    total_price: number,　//合計計算値
    tax_price: number,　  //合計税金計算値
    is_completed: boolean, //　支払完了であるかどうか判定

    delete: boolean;
    number: number,

    details: Array<CounterDetail>;
    seats: Array<CounterSeat>;
}

export interface CounterSeat {
    counter_id: number;
    counter_no: String;
    create_time: Date;
    start: Date;
    end: Date;
    group_id: number;
    group_name: String;
    id: number;
    seat_id: number;
    seat_name: String;
    seat_no: String;
}
