// const pricePreStr = "(消費税等  pricePreStr円を含みます)"
// $(window).on('load', function () {
//     document.getElementById('timer').innerText = sampleDate(new Date(), 'YYYY年MM月DD日');
//     document.getElementById('receipt_customer_name').innerText = "土屋 様";
//     document.getElementById('receipt_price').innerText = " 1,080 -";
//     document.getElementById('receipt_price_pre').innerText = pricePreStr.replace('pricePreStr', pricePre(1080));
//     document.getElementById('receipt_note').innerText = "11";
// });

// window.printdetails = function (params) {

//     document.getElementById('receipt_price').value = params["price"];
//     document.getElementById('receipt_price_pre').value = pricePre(params["price"]);
//     print();
// }

// function sampleDate(date, format) {
//     format = format.replace(/YYYY/, date.getFullYear());
//     format = format.replace(/MM/, formatTwo(date.getMonth() + 1));
//     format = format.replace(/DD/, formatTwo(date.getDate()));

//     return format;
// }

// function formatTwo(dateInt) {
//     return dateInt < 10 ? `0${dateInt}` : dateInt;
// }

// function pricePre(price) {
//     return Math.round(price / 1.08 * 0.08);
// }


window.printdetails = function (counter, detail) {

  $('#current').text(moment().format('YYYY年MM月DD日 HH時mm分'))

  $('#tax').text(formatMoney(detail.amounts_actually_tax));
  $('#price').text(formatMoney(detail.amounts_actually));
  $("#no").text(detail.no)

  $("#eatin").text(formatMoney(detail.eatin)+"円")
  $("#eatin_tax").text(formatMoney(detail.eatin_tax)+"円")
  $("#takeout").text(formatMoney(detail.takeout)+"円")
  $("#takeout_tax").text(formatMoney(detail.takeout_tax)+"円")

  if(new Date() >= new Date("2023-10-01")){
    $("#login_no").text('登録番号：' + detail["shopInfo"]["no"])
  }
  print();
}


function formatMoney(amount, decimalCount = 0, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(amount = Math.abs(Number(amount) || 0).toFixed(decimalCount)).toString();
    let j = (i.length > 3) ? i.length % 3 : 0;

    return negativeSign + (j ? i.substr(0, j) + thousands : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) + (decimalCount ? decimal + Math.abs(amount - i).toFixed(decimalCount).slice(2) : "");
  } catch (e) {
    console.log(e)
  }
};
