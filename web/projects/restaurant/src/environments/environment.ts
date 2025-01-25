// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  // api_ip: "http://127.0.0.1:4201",
  // socket_ip: "127.0.0.1:4202",
  top_path: "/staff/top", //"/menu"

  api_ip: "http://localhost:8000",
  socket_ip: "192.168.0.117:8001",
  host: "localhost:4200/",
  theme_url: "http://192.168.0.117:4200/assets/css", // TODO: =》リリース後、自分のサーバURLへ変更,

  // api_ip: "http://{{saas}}.localhost:8000",
  // socket_ip: "{{saas}}.localhost:8001",
  // host: "http://127.0.0.1:4200/",
  // theme_url: "http://127.0.0.1:4200/assets/css", // TODO: =》リリース後、自分のサーバURLへ変更,
  standard_category_for_kichen: "menu_category_standard", //監視用分类，为每一种分类都要建立同学管道，浪费资源，所以只要决定一种即可
  production: false,
  version: "1.0.181212",
  guest_login_info: {
    username: "guest",
    password: "14376-EB9C-EE35"
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
