import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ons-page',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit {

  animation: string = 'default';

  selectId = 2;

  constructor() { }

  ngOnInit() {
  }

  view_data = [
    { id: 0, name: '筑前煮', price: 1999, count: 0, unit: '人分', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/57/01/157/rc732x546_1209130251_72f2a6a263a7251f9829f7347382faa7.jpg' },
    { id: 1, name: '中華丼', price: 3999, count: 0, unit: '人分', url: 'http://img.cpcdn.com/recipes/4513256/280/418ccb6deb49910dbcbbe167a5d3d82f.jpg' },
    { id: 2, name: '海鮮飯', price: 1234, count: 0, unit: '皿', url: 'https://tblg.k-img.com/restaurant/images/Rvw/25659/640x640_rect_25659146.jpg' },
    { id: 3, name: '塩鮭の冷やし茶漬け', price: 1999, count: 0, unit: '茶碗', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/73/42/4273/rc732x546_1606031709_166ba69e696139056bd4d25d4fd9c165.jpg' },
    { id: 4, name: 'たちうおの中華風辛味煮', price: 3999, count: 0, unit: '人分', url: 'http://www.nissui.co.jp/recipe/images/16/00687.jpg' },
    { id: 5, name: '香彩ジャスミン', price: 3999, count: 0, unit: '人分', url: 'http://d35omnrtvqomev.cloudfront.net/photo/article/article_part/image_path_1/13294/799189c728d4d1ddc613381f1ced60.jpg' },
    { id: 6, name: '麻婆豆腐', price: 3999, count: 0, unit: '人分', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/57/01/157/rc732x546_1209130251_72f2a6a263a7251f9829f7347382faa7.jpg' },
    { id: 7, name: '牛肉面', price: 780, count: 0, unit: '人分', url: 'https://pic.pimg.tw/nixojov/1468201784-201305714_n.jpg?v=1468202151' },
    { id: 8, name: '南粤美食', price: 999, count: 0, unit: 'kg', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/57/01/157/rc732x546_1209130251_72f2a6a263a7251f9829f7347382faa7.jpg' },
    { id: 9, name: '洋食屋', price: 1699, count: 0, unit: 'kg', url: 'https://imgfp.hotp.jp/IMGH/95/10/P025209510/P025209510_480.jpg' },
    { id: 10, name: '美食米門', price: 2999, count: 0, unit: '人分', url: 'https://tblg.k-img.com/restaurant/images/Rvw/28513/640x640_rect_28513856.jpg' }
  ]

  menu_data = [
    {
      type_name: 'ご飯',
      datas: [
        { name: '筑前煮', price: 1999, count: 0, unit: '人分', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/57/01/157/rc732x546_1209130251_72f2a6a263a7251f9829f7347382faa7.jpg' },
        { name: '中華丼', price: 3999, count: 0, unit: '人分', url: 'http://img.cpcdn.com/recipes/4513256/280/418ccb6deb49910dbcbbe167a5d3d82f.jpg' },
        { name: '海鮮飯', price: 1234, count: 0, unit: '皿', url: 'https://tblg.k-img.com/restaurant/images/Rvw/25659/640x640_rect_25659146.jpg' },
        { name: '塩鮭の冷やし茶漬け', price: 1999, count: 0, unit: '茶碗', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/73/42/4273/rc732x546_1606031709_166ba69e696139056bd4d25d4fd9c165.jpg' },
      ]
    },
    {
      type_name: '中華',
      datas: [
        { name: 'たちうおの中華風辛味煮', price: 3999, count: 0, unit: '人分', url: 'http://www.nissui.co.jp/recipe/images/16/00687.jpg' },
        { name: '香彩ジャスミン', price: 3999, count: 0, unit: '人分', url: 'http://d35omnrtvqomev.cloudfront.net/photo/article/article_part/image_path_1/13294/799189c728d4d1ddc613381f1ced60.jpg' },
        { name: '麻婆豆腐', price: 3999, count: 0, unit: '人分', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/57/01/157/rc732x546_1209130251_72f2a6a263a7251f9829f7347382faa7.jpg' },
        { name: '牛肉面', price: 780, count: 0, unit: '人分', url: 'https://pic.pimg.tw/nixojov/1468201784-201305714_n.jpg?v=1468202151' },
        { name: '南粤美食', price: 999, count: 0, unit: 'kg', url: 'https://c-chefgohan.gnst.jp/imgdata/recipe/57/01/157/rc732x546_1209130251_72f2a6a263a7251f9829f7347382faa7.jpg' },
      ]
    },
    {
      type_name: '洋食',
      datas: [
        { name: '洋食屋', price: 1699, count: 0, unit: 'kg', url: 'https://imgfp.hotp.jp/IMGH/95/10/P025209510/P025209510_480.jpg' },
        { name: '美食米門', price: 2999, count: 0, unit: '人分', url: 'https://tblg.k-img.com/restaurant/images/Rvw/28513/640x640_rect_28513856.jpg' }
      ]
    }
  ];
}
