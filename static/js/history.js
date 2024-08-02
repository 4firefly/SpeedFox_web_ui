/**
 * 加载首页的 4 个游戏
 * @param {JSON} all_game 游戏列表
 * @param {*} i 数量
 * @param {*} history_id 
 */
function LoadHomePageGames(all_game, i, history_id) {
  let home_game_number = i;
  $.each(all_game, function (position, field) {
      if (history_id) {
          if (field.id != history_id) {
              return; 
          }
      }
      if (home_game_number > position) {
          $(".home_game_list").append(`
              <div class="home_game_box">
                  <div class="box_a">
                      <img src="${API_SERVER_ADDRESS}/up_img/${field.img}.webp?from=homepage_games" class="game_img" onclick="CheckandPopupServerList(${field.id})" gameimg="${field.id}">
                      
                      <div class="top">
                          <div class="icon">
                              <!-- 
                              <i class="layui-icon layui-icon-website" title="区服/节点"></i> 
                              <i class="layui-icon layui-icon-rate" title="置顶"></i> 
                              -->
                              <i class="layui-icon layui-icon-error" title="删除" onclick="deleteHistoryGame(${field.id})"></i> 
                          </div>
                      </div>
                      <div class="bottom" onclick="CheckandPopupServerList(${field.id})">
                          <p>立即加速 <i class="layui-icon layui-icon-next"></i> </p>
                      </div>
                      
                      <!-- 加速中效果 -->
                      <div class="game_starting_shadow" game_now_starting_id="${field.id}" style="display: none;">
                          <iframe marginwidth=0 marginheight=0 width=100% height=100% src="" frameborder=0></iframe>
                      </div>
                      
                      <!-- 完成 -->
                      <div class="Game_start_ok" start_gameid="${field.id}">
                          <p>即时延迟</p>
                          <h2><Start_speed_ping_html>0</Start_speed_ping_html><ms>ms</ms></h2>
                          
                          <div class="button_box">
                              <button type="button" class="layui-btn layui-btn-primary layui-border-blue"  onclick="ShowSpeedInfo()">加速详情</button>
                              <button type="button" class="layui-btn layui-btn-primary layui-border-red"  onclick="stop_speed()">停止加速</button>
                          </div>
                      </div>
                  </div>
                  <div class="box_b">
                      <p title="${field.name}">${field.name}</p>
                  </div>
              </div>
              
          `);
      }
      else {
          return;
      }
  });
}

/**
 * 装载首页向下滑的游戏列表
 * @param {JSON} all_game 
 * @param {number} history_id 
 */
function LoadHomePageAllGames(all_game, history_id) {
  $.each(all_game, function(i, field){
      
      if(history_id){
          if(field.id != history_id){
              return; 
          }
      }
      $(".home_game_list_all").append(`
              <div class="home_game_box home_game_box_all">
                  <div class="box_a">
                      <img src=${API_SERVER_ADDRESS}/up_img/` + field.img + `.webp?from=homepage_allgames" class="game_img" onclick="CheckandPopupServerList(` + field.id + `)" gameimg="` + field.id + `">
                      
                      <div class="top">
                          <div class="icon">
                              <!-- 
                              <i class="layui-icon layui-icon-website" title="区服/节点"></i> 
                              <i class="layui-icon layui-icon-rate" title="置顶"></i> 
                              -->
                              <i class="layui-icon layui-icon-error" title="删除" onclick="deleteHistoryGame(` + field.id + `)"></i> 
                          </div>
                      </div>
                      <div class="bottom" onclick="CheckandPopupServerList(` + field.id + `)">
                          <p>立即加速 <i class="layui-icon layui-icon-next"></i> </p>
                      </div>
                      
                      <!-- 加速中效果 -->
                      <div class="game_starting_shadow" game_now_starting_id="` + field.id + `" style="display: none;">
                          <iframe marginwidth=0 marginheight=0 width=100% height=100% src="" frameborder=0></iframe>
                      </div>
                      
                      <!-- 完成 -->
                      <div class="Game_start_ok" start_gameid="` + field.id + `">
                          <p>即时延迟</p>
                          <h2><Start_speed_ping_html>0</Start_speed_ping_html><ms>ms</ms></h2>
                          
                          <div class="button_box">
                              <button type="button" class="layui-btn layui-btn-primary layui-border-blue"  onclick="ShowSpeedInfo()">加速详情</button>
                              <button type="button" class="layui-btn layui-btn-primary layui-border-red"  onclick="stop_speed()">停止加速</button>
                          </div>
                      </div>
                      
                      
                      
                  </div>
                  <div class="box_b">
                      <p title="` + field.name + `">` + field.name + `</p>
                  </div>
              </div>
              
          
      `);
  });

}

/**
 * 加载首页不够4个游戏时的没有图标
 */
function LoadHomePageNoGameIcon() {
  $(".home_game_list").append(`
      <div class="home_game_box nogame">
          <div class="box_a">
              <img src="${API_SERVER_ADDRESS}/up_img/apex.png.webp" class="game_img" >
              
              <div class="top_nogame">
                 <img src="static/img/fox_avater.png" class="top_nogame_img" >
                 <p> 使用顶部搜索,立即加速 </p>
              </div>
              <div class="bottom_nogame">
                  <i class="layui-icon layui-icon-release"></i> 
                  <h2> 添加更多游戏 </h2>
              </div>
              <div class="game_starting_shadow"  style="display: none;">
                  <iframe marginwidth=0 marginheight=0 width=100% height=100% src="" frameborder=0></iframe>
              </div>
              
          </div>
      </div>
      
  `);
}

/**
 * 加载所有历史游戏
 */
function LoadGameHistory() {
  $(".home_game_list").html("")// 清理首页的渣子
  $(".home_game_list_all").html("")// 清理首页的渣子
  
  console.log("历史游戏" , getLocalHistoryGames() , getLocalHistoryGames().length); // 获取请求参数
  console.log("历史游戏首页缺少" , home_game_list_max - getLocalHistoryGames().length); // 获取请求参数
  // 装载历史游戏
  
  $.each(getLocalHistoryGames(), function(i, field){
      if(!gameAll.some(item => item.id === field.id+"")){
          console.log("ID" ,field.id , "好像不是个游戏,已删除"); 
          deleteHistoryGame(field.id)
          console.log("刷新下历史游戏"); 
          setTimeout(() => {
              LoadGameHistory();
          }, 1000 * 1);
          
      }
      if (home_game_list_max > i) { // 不够四个游戏或前4个的时候
          LoadHomePageGames(gameAll, Infinity, field.id);
      }
      LoadHomePageAllGames(gameAll, field.id);
  })
  // 只有历史游戏是5的时候创建一个隐藏的高
  if(getLocalHistoryGames().length == 5){
      $(".home_game_list_all").append(`
       <div class="home_game_box nogame" style="opacity: 0.0;height: 285px;">
          <div class="box_a">
              <img src="${API_SERVER_ADDRESS}/up_img/apex.png.webp" class="game_img" >
              <div class="top_nogame">
                 <img src="static/img/fox_avater.png" class="top_nogame_img" >
                 <p> 使用顶部搜索,立即加速 </p>
              </div>
              <div class="bottom_nogame">
                  <i class="layui-icon layui-icon-release"></i> 
                  <h2> 添加更多游戏 </h2>
              </div>
              <div class="game_starting_shadow"  style="display: none;">
                  <iframe marginwidth=0 marginheight=0 width=100% height=100% src="" frameborder=0></iframe>
              </div>
          </div>
      </div>
      `);
  }
  for (let i = 0; i < home_game_list_max - getLocalHistoryGames().length; i++) {
    LoadHomePageNoGameIcon(); // 填充不够4个剩下的部分
  }
}

/**
 * 加载所有游戏列表
 * @param {JSON} all_game 
 */
function LoadGameList(all_game) {
  $.each(all_game, function(i, field){
      // console.log("装载全部游戏" , field);
      $(".game_list_all").append(`
          <div class="home_game_box" gameid="${field.id}" onclick="CheckandPopupServerList(${field.id}, 2);" >
              <div class="box_a">
                  <img src="${API_SERVER_ADDRESS}/up_img/${field.img}.webp?gameid=${field.id}&from=gamelist" class="game_img" loading="lazy">
                  
                  <!--
                  <div class="top">
                      <div class="icon">
                          <i class="layui-icon layui-icon-website" title="区服/节点"></i> 
                      </div>
                  </div>
                  -->
                  
                  <div class="bottom">
                      <button type="button" class="layui-btn layui-bg-blue layui-btn-sm layui-btn-fluid button">立即加速</button>
                  </div>
                  
              </div>
              
              <div class="box_b"  style="height: 12px;overflow: hidden;padding-bottom: 16px;">
                  <p title="${field.name}">${field.name}</p>
                  <search style="display: none;">${field.search}</search>
              </div>
          </div>
          
      `);
      
  });
}

// 获取历史游戏json
function getLocalHistoryGames() {
    Game_history_json = localStorage.getItem('Game_history');
    if (!Game_history_json) {
        Game_history_json = [];
    } else {
        Game_history_json = JSON.parse(Game_history_json);
    }
    return Game_history_json;
}

// 设置历史游戏json
function addGameHistory(id) {
    // 写入历史游戏
    Game_history_json = getLocalHistoryGames();
    // 删除
    Game_history_json = Game_history_json.filter(item => item.id !== id);
    
    let arr  =
    {
        "id" : id,
    };
    Game_history_json.unshift(arr);
    localStorage.setItem('Game_history', JSON.stringify(Game_history_json));
    // 写入历史游戏
}

// 删除历史游戏
function deleteHistoryGame(id) {
    Game_history_json = getLocalHistoryGames();
    // 删除
    Game_history_json = Game_history_json.filter(item => item.id !== id);
    localStorage.setItem('Game_history', JSON.stringify(Game_history_json));
    LoadGameHistory();
}
