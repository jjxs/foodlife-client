import { AppValidators } from './valid/validators';

export class AppSettings {
    public static theme_list = [
        {id: 'default', name: 'デフォルト', menu_count: 9, img: '/assets/images/theme/theme5.jpg'},
        {id: 'twocolumn', name: 'ランチ１', menu_count: 2, img: '/assets/images/theme/theme1.jpg', photo_args: '1 '},
        {id: 'third', name: 'ランチ２', menu_count: 2, img: '/assets/images/theme/theme2.jpg'},
        {id: 'double', name: 'ランチ３', menu_count: 2, img: '/assets/images/theme/theme3.jpg'},
        {id: 'kosu', name: 'コース', menu_count: 3, img: '/assets/images/theme/theme4.jpg'},
        {id: 'menu-top', name: 'おすすめ１', menu_count: 10, img: '/assets/images/theme/theme6.jpg'},
        {id: 'menu-top2', name: 'おすすめ２', menu_count: 14, img: '/assets/images/theme/theme7.jpg'},
    ];
    public static init(language: string) {
        // 静的なクラス設定
        AppValidators.Language = language;
    }

    public static getThemeList() {
        return AppSettings.theme_list;
    }

    public static getThemeMenuCount(theme_id) {
        // tslint:disable-next-line: forin
        for ( const key in AppSettings.theme_list ) {
            const row = AppSettings.theme_list[key];
            if (row['id']==theme_id) {
                return row['menu_count'];
            }
        }
        return 9;
    }

}