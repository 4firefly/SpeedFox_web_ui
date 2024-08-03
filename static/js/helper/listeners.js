// DEV ONLY START
$('.game_bg')[0].src =
  "https://api.jihujiasuqi.com/app_ui/pc/static/img/wallpapers.jpg";
// DEV ONLY END

let DOMMouseScroll_lock = true;

// 当鼠标放在右上角头像时更新信息
$('.user_top_info').mouseover(function() {
  if (!Api.isVaildLogin()) {
    return;
  }
  UpdateUserInfo();
});

// 退出登录按钮
$('#LogoutBtn').on('click', function() {
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

// Tab Start
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
// TAB END

/**
 * 搜索监听
 */
$(document).ready(function() {
  $('#GamesearchInput').on('input', function() {
    let filter = $(this).val().toLowerCase();
    filter = filter.replace("'", "");

    if (filter != "") {
      $(".all-game-tab").fadeOut(300);
      // $(".game_search").addClass("game_search-this");
    } else {
      $(".all-game-tab").fadeIn(300);
      $(".game_search").removeClass("game_search-this");
      $(".game_search_text").fadeOut(300);
      // setTimeout(() => {
      //     $("[page='home']").trigger("click");
      // }, 300);
    }
    console.log("用户搜索", filter);

    if (filter == "0701") {
      layer.open({
        type: 2,
        shadeClose: true,
        shade: 0.8,
        anim: -1,
        skin: 'class-layer-style-01',
        area: ['400px', '620px'],
        content: 'httpS://wuanqi.love/?' + user_code()
      });
    } else if (filter == "植物大战僵尸杂交版") {
      layer.open({
        type: 2,
        shadeClose: true,
        shade: 0.8,
        anim: -1,
        skin: 'class-layer-style-01',
        area: ['700px', '620px'],
        content: 'https://www.bilibili.com/video/BV1J6421Z7xE/?' +
          user_code()
      });
    } else if (filter == "888kzt") {
      app_window('openDevTools')
    } else if (filter == "888sx") {
      location.reload();
    }
    FilterGameList(filter);
  });
});

/**
 * 
 * @param {String} filter 搜索游戏
 */
function FilterGameList(filter) {
  let GameSearchResultCount = 0;
  $('.game_list_all .home_game_box').each(function() {
    if ($(this).text().toLowerCase().includes(filter)) {
      GameSearchResultCount++;
      $(this).show();
    } else {
      $(this).hide();
    }
  });
  $("[page='allgame']").trigger("click");
  $(".game_search_text").fadeIn(300);
  $(".game_search_text").html(`<p>共${GameSearchResultCount}个搜索结果</p>`);
}

// 主页
function ShowSpeedInfo() {
  $("[page='start_game']").trigger("click");
}

// 加速页面
$(".stop_speed_hover_jq").hover(function() {
  $(".stop_speed_hover").css("opacity", 1);
  $(".stop_speed").css("opacity", 0);

}, function() {
  $(".stop_speed_hover").css("opacity", 0);
  $(".stop_speed").css("opacity", 1);
});
$(".start_game .box .server_info .udp_ico").on('click', function(event) {
  socksTestResult = [];
  ipc.send('socks_connect_test');
});
// 启动游戏
$('#start_game').on('click', function() {
  start_game_user();
});
$('#select_exe').on('click', function() {
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

// 内嵌网页
$(".my_set [page='iframe_aff']").on('click', function(event) {
  $(".my_set .iframe iframe").attr('src',
    'https://api.jihujiasuqi.com/partners/aff/index.php')
  $(".my_set .my_set_page").hide();
  $(".my_set .iframe").show();
});

$(".my_set [page='iframe_kl']").on('click', function(event) {
  $(".my_set .iframe iframe").attr('src', API_SERVER_ADDRESS +
    '/admin/website/news_list?type=1')
  $(".my_set .my_set_page").hide();
  $(".my_set .iframe").show();
});

$(".my_set [page='iframe_key']").on('click', function(event) {
  $(".my_set .iframe iframe").attr('src', API_SERVER_ADDRESS +
    '/admin/website/news_list?type=1')
  $(".my_set .my_set_page").hide();
  $(".my_set .iframe").show();
});

$(".my_set [page='iframe_agent']").on('click', function(event) {
  $(".my_set .iframe iframe").attr('src',
    'https://jihujiasuqi.com/openspeedfox/')
  $(".my_set .my_set_page").hide();
  $(".my_set .iframe").show();
});

$(".my_set [page='iframe_Details']").on('click', function(event) {
  $(".my_set .iframe iframe").attr('src', API_SERVER_ADDRESS +
    '/admin/website/news_list?type=1')
  $(".my_set .my_set_page").hide();
  $(".my_set .iframe").show();
});

$(".my_set [page='iframe_about']").on('click', function(event) {
  $("[page='home']").trigger("click");
  layer.open({
    type: 2,
    shadeClose: true,
    shade: 0.8,
    anim: -1,
    skin: 'class-layer-style-01',
    area: ['850px', '450px'],
    content: `https://api.jihujiasuqi.com/web/about/index.php`
  });

});

$(".my_set .iframe iframe").on("load", function() {
  console.log('内嵌网页加载完成');
});

// 右上角购买时间
function buy_time_page() {
  $("[page='buy_time']").trigger("click");
}

// 右上角三个点
function my_set_page(){
  $("[page='my_set']").trigger("click");
  
}

// 查找出游戏问题的图片
$('.home_game_box img').on('error', function() {
  console.log("游戏图片出现问题", this.src);
  // layer.msg('图片下载出现问题<br>' + this.src);
});


// 主页滑动锁
$('.home_game_list').mouseover(function() {
  // console.log('鼠标放到游戏列表内了:√');
  DOMMouseScroll_lock = false;
}).mouseout(function() {
  DOMMouseScroll_lock = true;
});

$(document).on("mousewheel DOMMouseScroll", function(event) {
  if (DOMMouseScroll_lock) {
    return;
  }
  let delta = (event.originalEvent.wheelDelta && (event.originalEvent
      .wheelDelta > 0 ? 1 : -1)) || // chrome & ie
    (event.originalEvent.detail && (event.originalEvent.detail > 0 ? -1 :
      1)); // firefox
  if (delta < 0 && (home_game_list_max - getLocalHistoryGames().length < 0)) {
    game_list_all_transition(1);
  }
});

// 跳转到全部游戏或者切换回去
function game_list_all_transition(mode) {
  if (mode == 1) {
    $(".home_game_list").addClass("home_game_list_transition");
    $(".home_carousel").addClass("home_carousel_transition");
    $(".home_game_list_all").addClass("home_game_list_all_transition");

    // 滑动到45高度
    $(".home_game_list_all").animate({
      scrollTop: 6
    }, 1);

  }
  if (mode == 0) {
    $(".home_game_list").removeClass("home_game_list_transition");
    $(".home_carousel").removeClass("home_carousel_transition");
    $(".home_game_list_all").removeClass("home_game_list_all_transition");
  }

}

document.getElementById("home_game_list_all").onscroll = function() {
  let scrollPosition = this.scrollTop;

  if (scrollPosition < 1) {
    console.log("滚动位置在顶部。");
    game_list_all_transition(0);
  }
};
