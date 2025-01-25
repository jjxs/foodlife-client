function taxCount(total) {
  return Math.floor(total / 0.08);
}


$(window).on('load', function () {
  // $("#barcode").barcode("20181120213756000720", "code128")
});
window.printdetails = function (response) {
  console.log(response);
  var html,
    display_name = "[" + response.pay_name + "]";

  $('#current').text(moment().format('YYYY年MM月DD日 HH時mm分'))
  var oldFax = false;
  var detailRow = $("#detail-rows").empty();
  if (response.details && Object.keys(response.details).length > 0) {
    $.each(response.details, function (index, data) {
      oldFax = (new Date(data.order_time)).getTime() >= (new Date("2019-10-01")).getTime() ? false : true;
      html = "";
      html += '<div class="row">'
      html += '<div class="row-top">' + (data.menu_no) + '　' + data.menu_name + '</div>'
      if(data.ori_price && data.ori_price>data.price) {
        html += '<div class="row-bottom" >' + data.count + 'コ　　X　 <span style="text-decoration:line-through;">' + formatMoney(data.ori_price) + '　　 ￥' + formatMoney(data.count*data.ori_price) + '</span></div>'
        html += '<div class="row-bottom" style="width:100%; ">'+ formatMoney(data.price) + '　　 ￥' + formatMoney(data.total) + '</div>'
      } else {
        html += '<div class="row-bottom" >' + data.count + 'コ　　X　'+ formatMoney(data.price) + '　　 ￥' + formatMoney(data.total) + '</div>'
      }
      html += '</div>'
      detailRow.append(html);
    });
    $('.cls-tax-none').css({
      'display': 'flex'
    });
  } else {
    $('.cls-tax-none').css({
      'display': 'none'
    });
  }

  var detailTaxRow = $("#detail-tax-rows").empty();
  if (response.taxDetails && Object.keys(response.taxDetails).length > 0) {
    $.each(response.taxDetails, function (index, data) {
      oldFax = (new Date(data.order_time)).getTime() >= (new Date("2019-10-01")).getTime() ? false : true;
      html = "";
      html += '<div class="row">'
      html += '<div class="row-top">' + (data.menu_no) + '　' + data.menu_name + '</div>'
      html += '<div class="row-bottom">' + data.count + 'コ　　X　 ' + formatMoney(data.price_tax_in) + '　　 ￥' + formatMoney(data.total) + '</div>'
      html += '</div>'
      detailTaxRow.append(html);
    });
    $('#total-tax').text(formatMoney(response.money.price_tax_in));
    $('.cls-tax').css({
      'display': 'flex'
    });
  } else {
    $('.cls-tax').css({
      'display': 'none'
    });
  }

  var fax = response.fax;
  if( oldFax ) {
    fax = 8;
  }

  $('.fax-show').html('消費税等(' + fax + '.0%)');
  $('.tax-count-show').html('小計 (' + fax + '.0% 消費税込）');

  $('#total').text(formatMoney(response.money.total));

  if (response.money.cut === 0) {
    $('#sale1_div').css({
      'display': 'none'
    });
  } else {
    $('#sale1_div').css({
      'display': 'flex'
    });
    $('#sale1_title').text('割引 ' + (response.money.cut) + "%");
    $('#sale1').text(formatMoney(response.money.cut_value));
  }

  if (response.money.reduce === 0) {
    $('#sale2_div').css({
      'display': 'none'
    });
  } else {
    $('#sale2_div').css({
      'display': 'flex'
    });
    $('#sale2').text(formatMoney(response.money.reduce));
  }

  $('#tax').text(formatMoney(response.money.tax_value));
  $('#price').text(formatMoney(response.money.amounts_actually));
  $('#pay').text(formatMoney(response.money.pay));
  $('#change').text(formatMoney(response.money.change));
  if (response.no_pay === true) {
    $('#no_pay').text("　-- 分割支払い --");
  }
  $('#pay_name').text(display_name);

  $("#barcode").barcode(response.detail_no, "code128")
  window.print();
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
