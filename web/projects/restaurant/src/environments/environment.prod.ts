export const environment = {


  // api_ip: "http://54.238.69.106:8000",
  // socket_ip: "54.238.69.106:8001",
  // host: "http://54.238.69.106/",
  // theme_url: "http://54.238.69.106/assets/css",


  // api_ip: "http://{{saas}}.testserver.ymtxplus.com",
  // socket_ip: "{{saas}}.testsocket.ymtxplus.com",
  // host: "http://testapp.ymtxplus.com/",
  // theme_url: "http://testapp.ymtxplus.com/assets/css", // TODO: =》リリース後、自分のサーバURLへ変更,

  api_ip: "https://{{saas}}.server.ymtxplus.com",
  socket_ip: "{{saas}}.socket.ymtxplus.com",
  host: "https://app.ymtxplus.com/",
  theme_url: "https://app.ymtxplus.com/assets/css", // TODO: =》リリース後、自分のサーバURLへ変更,

  top_path: "/menu", //"/menu" "/staff/top"
  standard_category_for_kichen: "menu_category_standard", //監視用分类，为每一种分类都要建立同学管道，浪费资源，所以只要决定一种即可
  production: true,
  version: "1.0.181212",
  guest_login_info: {
    username: "guest",
    password: "14376-EB9C-EE35"
  }
};
