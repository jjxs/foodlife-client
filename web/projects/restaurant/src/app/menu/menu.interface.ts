

export interface MasterGroup {
    id: number;
    name: string;
    display_name: string;
    domain: string;
    master_data: Array<Master>;
    enabled: number;

    //拡張データ
    selected: boolean;
}

export interface Master {
    id: number;
    code: number;
    display_name: string;
    display_order: number;
    theme_id: string;
    menu_count: number;
    group: number;
    name: string;
    note: string;
    extend: string;
    option: object;
}

export interface Menu {
    //model id
    id: number;
    name: string;
    no: number;
    ori_price: number;
    price: number;
    tax_in: boolean;
    mincount?: number;
    stock_status: number;
    usable: boolean;
    note: string;
    introduction: string;
    //extend item
    is_free: boolean;
    menu_options: Array<object>;
    image: string;
    course: Array<Object>;
    option: any;
    level?: number;
}

export interface MenuCategory {
    //model id
    id: number;

    //menu id
    menu: number;
    menu_id: number;
    menu_name: string;
    menu_no: number;
    menu_price: number;
    menu_ori_price: number;
    menu_usable: false;
    image: string;
    //　master id
    category: number;
    //　master group id
    category_group: number;
    //　master name
    category_name: string;
    display_order: number;
    course: Array<Object>;
    menu_options: Array<object>;
    is_free: boolean;
    stock_status: number;
    introduction: string;
    tax_in: boolean;
    mincount: number;
}

export interface Menufree {
    id: number;
    menu: number;
    menu_name: string;
    name: string;

    //master id
    free_type: number;

    usable_time: number;
    display_order: number;

    //拡張用
    count: number;
    count_over: number;
    selected: boolean;

    menus: Array<MenufreeDetail>;
}

export interface MenufreeDetail {
    id: number;
    menu: number;
}

//　放題注文明細
export interface MenufreeOrderDetail {
    order_id: number;
    detail_id: number;
    detail_free_id: number;
    menu_id: number;
    count: number;
    menu_free_id: number;
    free_type_id: number;
    seat_id: number;
    usable: boolean;
    start: Date;
    end: Date;
}

//放題の注文時間計算用
export interface MenufreeTimeInfo {
    free_type_id: number;
    menu_id: number;
    menu_no: number;
    menu_name: string;
    start: Date;
    end: Date;
}


export interface CategoryChangedEvent {
    index: number;
    id: number;
    data: Master;
    group: MasterGroup;
  }

export interface GroupChange {
    masterGroup : MasterGroup;
    categoryId: number;
}

export interface MenuTop {
    id: number;
    name:  string;
    target_type: string;
    link:  string;
    image: string;
    note:  string;
    sort:  number;
    option: string;
    enabled: number;
}
