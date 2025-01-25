// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  api_ip: "http://192.168.100.173:8000",
  socket_ip: "192.168.100.173:8001",
  //api_ip: "http://127.0.0.1:8000",
  //socket_ip: "127.0.0.1:8001",
  host: "http://localhost:4200/",
  theme_url: "https://material.angular.io/assets", // TODO: =》リリース後、自分のサーバURLへ変更,
  standard_category_for_kichen: "menu_category_standard", //監視用分类，为每一种分类都要建立同学管道，浪费资源，所以只要决定一种即可
  production: false,
  guest_login_info: {
    username: "guest",
    password: "14376-EB9C-EE35"
  }
};