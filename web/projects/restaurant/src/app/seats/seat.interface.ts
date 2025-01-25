export class Seat {
    group: number;
    group_name: string;
    group_no: string;
    id: number;
    name: string;
    number: number;
    seat_no: string;
    seat_smoke_type: number;
    seat_smoke_type_name: string;
    seat_type: number;
    seat_type_name: string;
    start: Date;
    usable: true
}

export interface SeatStatus {
    id: number;
    seat: number;
    seat_group_no: number;
    seat_group_name: number;
    seat_no: number;
    seat_name: number;
    start: Date;
    end: Date;
    security_key: string;
}

export interface SeatListData {
    id: number
    seat_no: string
    name: string
    start: Date
    usable: boolean
    number: number
    seat_type_name: string
    seat_smoke_type_name: string
    group_no: string
    group_name: string
    selected: boolean
}
