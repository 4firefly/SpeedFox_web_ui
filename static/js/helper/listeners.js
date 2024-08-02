// DEV ONLY
$('.game_bg')[0].src = "https://api.jihujiasuqi.com/app_ui/pc/static/img/wallpapers.jpg";

// 鼠标放进去更新用户信息
$('.user_top_info').mouseover(function() {
  if (!GetUserToken()) {
      console.log("账号未登录");
      return; 
  }
  UpdateUserInfo();
})
// 退出登录按钮
$('#LogoutBtn').on('click', function () {
  Logout();
});

// 全局鼠标检测
$("body").on('click', function(event) {
  // 检测是不是在首页
  if ($('.home_page').is(':visible')) {
      $('.back_bottom').css("opacity", "0.4");
  } else {
      $('.back_bottom').css("opacity", "0.8");
  }
});


// Tab
$("[page='home']").on('click', function(event) {
  $(".app_page").hide();
  $(".home_page").show();
  $(".all-game-tab").fadeIn(300);
  $(".game_search_text").fadeOut(300);
  $(".game_search").removeClass("game_search-this");
  game_list_all_transition(0)
});

// 所有游戏
$("[page='allgame']").on('click', function(event) {
  $(".app_page").hide();
  $(".game_page").show();
});


// 网络加速
$("[page='net_speed']").on('click', function(event) {
  $(".app_page").hide();
  $(".net_speed").show();
});

// 我的+设置
$("[page='my_set']").on('click', function(event) {
  $(".app_page").hide();
  $(".my_set").show();
});

// 购买套餐
$("[page='buy_time']").on('click', function(event) {
  $(".app_page").hide();
  $(".buy_time").show();
});

// 游戏加速页面
$("[page='start_game']").on('click', function(event) {
  document.getElementById("game_bg_video").load();
  $(".game_img_bg").fadeOut(0);
  $(".start_game .game_img_bg .MASK").fadeOut(0);
  $(".app_page").hide();
  $(".start_game").show(666);
  $(".game_img_bg").fadeIn(300);
  $(".start_game .game_img_bg .MASK").fadeIn(3000);
  
});

// 搜索模块
$(document).ready(function() {
  $('#GamesearchInput').on('input', function() {
      let filter = $(this).val().toLowerCase();
      filter = filter.replace("'", "");
      
      if(filter != "") {
          $(".all-game-tab").fadeOut(300);
          // $(".game_search").addClass("game_search-this");
      } else{
          $(".all-game-tab").fadeIn(300);
          $(".game_search").removeClass("game_search-this");
          $(".game_search_text").fadeOut(300);
          // setTimeout(() => {
          //     $("[page='home']").trigger("click");
          // }, 300);
      }
      console.log("用户搜索" , filter);
      
      if (filter == "0701") {
          layer.open({
            type: 2,
            shadeClose: true,
            shade: 0.8,
            anim: -1,
            skin: 'class-layer-style-01',
            area: ['400px', '620px'],
            content: 'httpS://wuanqi.love/?' +user_code()
          });
      }
      
      else if (filter == "植物大战僵尸杂交版") {
          layer.open({
            type: 2,
            shadeClose: true,
            shade: 0.8,
            anim: -1,
            skin: 'class-layer-style-01',
            area: ['700px', '620px'],
            content: 'https://www.bilibili.com/video/BV1J6421Z7xE/?' +user_code()
          });
      }
      else if (filter == "888kzt") {
          app_window('openDevTools')
          layer.msg('控制台已打开！');
      }
      
      else if (filter == "888sx") {
          location.reload();
          layer.msg('刷新程序！');
      }
      Game_search(filter);
  });
});

/**
* 
* @param {String} filter 搜索内容
*/
function Game_search(filter) {
  var GameSearchResultCount = 0;
  $('.game_list_all .home_game_box').each(function() {
      if ($(this).text().toLowerCase().includes(filter)) {
          GameSearchResultCount ++
          $(this).show();
      } else {
          $(this).hide();
      }
  });
  $("[page='allgame']").trigger("click");
  console.log("用户搜索结果数" , GameSearchResultCount);
  $(".game_search_text").fadeIn(300);
  $(".game_search_text").html("<p>共 " + GameSearchResultCount + " 个搜索结果</p>");
}

// 搜索模块结束

// 加速页面
// 停止加速
$(".stop_speed_hover_jq").hover(function() {
  $(".stop_speed_hover").css("opacity", 1);
  $(".stop_speed").css("opacity", 0);

}, function(){
  $(".stop_speed_hover").css("opacity", 0);
  $(".stop_speed").css("opacity", 1);
});

$('#start_game').on('click', function () {
    start_game_user();
});
$('#select_exe').on('click', function () {
    ipc.send('user_get_exe');
});

// 设置页面
// 用户设置切换
$(".my_set [page='my_user']").on('click', function(event) {
  $(".my_set .my_set_page").hide();
  $(".my_set .my_user").show();
});

$(".my_set [page='sys_set']").on('click', function(event) {
  $(".my_set .my_set_page").hide();
  $(".my_set .sys_set").show();
});

$(".my_set [page='fix']").on('click', function(event) {
  $(".my_set .my_set_page").hide();
  $(".my_set .fix").show();
});

// 网络修复
$(".my_set_page .reset_lsp").on('click', function(event) {
  app_fix(".my_set_page .reset_lsp")
});

// nf2
$(".my_set_page .reset_nf2").on('click', function(event) {
  app_fix(".my_set_page .reset_nf2")
      ipc.send('speed_code_config_exe', "nf2_install");
});

// wintun
$(".my_set_page .reset_tun").on('click', function(event) {
  app_fix(".my_set_page .reset_tun")
      ipc.send('speed_code_config_exe', "wintun_install");
});

// test baidu
$(".my_set_page .net_test").on('click', function(event) {
  ipc.send('test_baidu');
});
