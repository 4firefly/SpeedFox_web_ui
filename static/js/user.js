function UpdateUserInfo() {
  let res = Api.getUserInfo();
  if (res.response == "ERR") {
      localStorage.removeItem('user_code');
      $('.my_user .username').text("未登录");
      $('.my_user .UID').text("未登录");
      if (nCurrentSpeedGameID + 0  != 0) {
          stop_speed();
      }
    return;
  }
  $('.my_user .username').text(res.username);
  $('.my_user .UID').text(`ID:${res.uid}`);
}

/**
 * @deprecated
 * @returns String
 */
function GetUserToken() {
  user_code_str = localStorage.getItem('user_code');
  if (localStorage.getItem('user_code') == null) {
    return false;
  }
  Api.setToken(user_code_str);
  return user_code_str
}

function ShowLoginPopup() {
  layer.open({
    type: 2,
    title: 'iframe',
    shadeClose: true,
    shade: 0.8,
    anim: -1,
    skin: 'class-layer-style-01',
    area: ['320px', '380px'],
    content: 'page/oauth/login_home.php?product=' + getUrlParams().product // iframe 的 url
      ,
    end: function() {
      UpdateUserInfo();
    }
  });
}

function Logout() {
  stop_speed();
  localStorage.removeItem('user_code');
  // $("[page='home']").trigger("click");
}
