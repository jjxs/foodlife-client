export interface MasterGroup {

    id: number;
    name: string;
    display_name: string;
    domain: string;
    master_data: Array<Master>;

    //拡張データ
    selected: boolean;
}

export interface Master {
    id: number;
    name: string;
    code: number;
    display_name: string;
    display_order: number;
    group: number;
    note: string;
}