let nCurrentSpeedGameID = 0;
let Server_config;
let isSocksReady = false;
let socksTestResult = {
  'tcp': false,
  'udp': false
};
let UploadUserBDTimer = 5;
let GameStartSpeedTimer;
let HostSpeedList;
ipc.on('speed_code', (event, message) => {
  console.log('主线程发送信息:', message);

  if (message.tag == "socks_startup_check" && message.status == "ok") {
      isSocksReady = true;
      clearTimeout(GameStartSpeedTimer);
      speed_session_id = generateUniqueID();
      StartMonitor();
      ShowSpeedInfo();
      console.log('加速成功,跳转页面:', nCurrentSpeedGameID);

      // 上升优先级
      ipc.send('high_priority', "core.exe");
      ipc.send('high_priority', "SpeedNet.exe");
      ipc.send('high_priority', "SpeedProxy.exe");
      ipc.send('high_priority', "SpeedMains.exe");
      ipc.send('high_priority', "SpeedFox.tun2socks.exe");

      // 遮罩 实时延时
      $("[start_gameid='"+nCurrentSpeedGameID +"']").show();
      $("[game_now_starting_id='"+nCurrentSpeedGameID +"']").hide();
      $("[game_now_starting_id='"+nCurrentSpeedGameID +"'] iframe").prop('src', '');

      // host 加速
      if (currentGameSpeedConfig.config_host.includes("**")) {
          let SpeedHostArr = currentGameSpeedConfig.config_host.split("\r\n");
          for (let i = 0; i < SpeedHostArr.length; i++) {
              let currPlatflorm = SpeedHostArr[i].replaceAll("*","");
              console.log('检测到需要加速的平台', currPlatflorm);
              SpeedHost(currPlatflorm, 1);
          }
      }
      return;
  }
  else if (message.tag == "host_startup_check" && message.status == "ok") {
      console.log('来自host模块的socks测试信息:', message);
      console.log('来自host模块的socks测试 - 成功！');
      $(".start_game .box .pt_list .pt_box .layui-icon").hide();
      RenderHostPopup();
      layer.close(HostSpeedPopup);
  }
  if (message.start == "SOCKS ERR") {
      clearTimeout(GameStartSpeedTimer);
      stop_speed();
      let req = confirm("当前服务器不可用,请尝试更换其他服务器\n\n\n服务器链接失败，要查看日志么?");
      if (req == true) {
          error_page("服务器检测连通性失败");
      }
      return;
  }
  // show error log
  if (message.start == "log") {
      $(".error_log").html(message.log);
      return;
  }

  if (message.id == "Tunnel_OK") {
    if (!isSocksReady) {
          ipc.send('speed_code_config', {"mode" : "socks_startup_check"});
          ipc.send('socks_connect_test'); // update icon
    }

  }

  if (message.start == "close") {
      if (nCurrentSpeedGameID == 0) {
          // 正常停
          console.log('进程停止(正常)');
          return;
      }
      console.log('进程意外终止!(在游戏加速中丢失)');
  }

});

ipc.on('socks_connect_test', (event, message) => {
    console.log(`连接检测 `, message);
    if (message.includes("TCP: OK")) {
      socksTestResult.tcp = true;
    }
    if (message.includes("UDP: OK")) {
      socksTestResult.udp = true;
    }
    if (socksTestResult.tcp && socksTestResult.udp) {
      layer.msg('连接测试正常', {
        offset: 'b',
        anim: 'slideUp'
      });
      $('.start_game .box .server_info .udp_ico').attr('src', API_SERVER_ADDRESS+'/app_ui/pc/static/img/nettesterr.png');
      $('.start_game .box .server_info .udp_ico').attr('src', API_SERVER_ADDRESS+'/app_ui/pc/static/img/nettestok.png');
    }
});

function startSpeedUp() {
    if (!serverConnectionConfig.id) {
        layer.msg('未选择服务器');
        return; 
    }
    HostSpeedList = Api.getHostList();
    HostSpeedList.forEach(service => {
        service.start = 0;
    });
    sendGameConfig(currentGameSpeedConfig.id);
  }

  function sendGameConfig(gameid) {
    let speedMode = serverConnectionConfig.speedMode;
    layer.close(oChooseServerPopup);// 关闭服务器列表弹层

    $("[game_now_starting_id='"+gameid+"']").show();
    // ???
    let Game_start_iframe = "page/load/";
    $("[game_now_starting_id='"+gameid+"'] iframe").prop('src', Game_start_iframe);
    nCurrentSpeedGameID = gameid;
    updateGameStartAnim(1);

    GameStartSpeedTimer = setTimeout(function() {
        stop_speed();
        error_page("加速超时");
    }, 1000 * 16);

    Server_config = Api.getServerConfig(serverConnectionConfig.id);

    localStorage.setItem('last_time_region_' + currentGameSpeedConfig.id, Server_config.CountryCode);
    localStorage.setItem('last_time_mode_' + currentGameSpeedConfig.id, serverConnectionConfig.speedMode);
    let v2config = '';
    if (serverConnectionConfig.code_mod == "v2ray") {
        v2config = buildV2Config(Server_config);
    }
    let SpeedCfg = {
        "Game_config" : currentGameSpeedConfig,
        "Server_config" : Server_config,
        "mode": speedMode,
        "code_mod": serverConnectionConfig.code_mod,
        "core_type": serverConnectionConfig.code_mod,
        "v2config": v2config
    };
    isSocksReady = false;
    ipc.send('startSpeed', SpeedCfg);
    let gamebg = "";
    if (currentGameSpeedConfig.wallpapers == "noset") {
        gamebg = `${Api.host}/up_img/${currentGameSpeedConfig.img}.webp`;
    } else {
        gamebg = `${Api.host}/up_img/wallpapers/${currentGameSpeedConfig.wallpapers}`;
    }

    // 设置游戏图片等信息
    $('.start_game .game_bg').attr('src', gamebg);
    $('.start_game .box .gamename').text(currentGameSpeedConfig.name);
    $('.start_game .game_bg_video').hide();

    // 如果是视频就切换视频
    if (gamebg.includes(".mp4")) {
        $('.start_game .game_bg_video source').attr('src', gamebg);
        $('.start_game .game_bg_video').show()
        document.getElementById("game_bg_video").load();
    }

    let speed_mod = "自动";

    if (speedMode == "nf2_start") {
        speed_mod = "进程模式";
    }
    else if (speedMode == "wintun_start") {
        speed_mod = "路由模式";
    }
    $('.start_game .box .server_info p').text(Server_config.name + "-" + Server_config.id + " | " + speed_mod);
}

function buildV2Config (Server_config) {
  let v2config = `
    {
      "inbounds": [
        {
          "port": 16780,
          "protocol": "socks",
          "listen": "127.0.0.1",
          "settings": {
            "auth": "noauth",
            "udp": true
          }
        }
      ],
      "outbounds": [
        {
          "protocol": "`+Server_config.connect_mode+`",
          "settings": {
            "servers": [
              {
                "address": "`+Server_config.ip+`",
                "port": `+Server_config.port+`,
                "method": "`+Server_config.method+`",
                "password": "`+Server_config.token+`"
              }
            ],
            "port": 0,
            "plugin": "",
            "pluginOpts": "",
            "mtu": 0
          },
          "mux": {
            "enabled": false,
            "concurrency": 0
          }
        }
      ]
    }
    `;
    return v2config;
}

function stop_speed() {
    console.log(`停止加速 `)
    ipc.send('speed_code_config', { "mode": "taskkill" });
  
    $("[start_gameid='" + nCurrentSpeedGameID + "']").hide();
    nCurrentSpeedGameID = 0
  
    start_speed_time = $('.start_game .box .stop_speed time').text();
    // ipcRenderer.send('speed_tips_Window', {"url" : "https://api.jihujiasuqi.com/app_ui/pc/page/tips/tips.php?text= <p style='position: fixed;top: -34px;'>已停止加速！</p> <p style='position: absolute;top: 10px;font-size: 12px;'>加速时长:" + start_speed_time + "</p>"});
  
    // 奶奶的为啥清理不掉，多清理亿轮
    clearTimeout(GameStartSpeedTimer);
    updateGameStartAnim(0);
    $('.start_game .box .stop_speed').html("正在停止...")
    $(".start_game .box .stop_speed_hover").html("正在停止...")
    clearInterval(MonitorInterval); // 清理定时器
    setTimeout(() => {
      delayValues = []
      $("[page='home']").trigger("click");
      $('.start_game .box .stop_speed').html(
        '<i class="layui-icon layui-icon-radio"></i> 加速中:<time></time>')
      $(".start_game .box .stop_speed_hover").html(
        '<i class="layui-icon layui-icon-radio"></i> 停止加速')
    }, 1000 * 2);
  
    // 批量吧所有配置设置成0 host
    HostSpeedList.forEach(service => {
      service.start = 0;
    });
    ipc.send('batchRemoveHostRecords');
}

/**
 * 
 * @param {String} platform 
 * @param {number} turnStatus 
 */
function SpeedHost(platform, turnStatus) {
  $(`.net_speed_list_button_${platform}`).hide();
  $(`[lay-filter='net_speed_list_progress_`+platform+`']`).show();
  layui.element.progress('net_speed_list_progress_'+platform, "100%");
  
  HostSpeedList.forEach(service => {
      if (service.code === platform) {
          service.start = turnStatus;
      }
  });
  updateHosts();

  if (turnStatus == 0) {
      console.log('关闭不走流程，直接刷新');
      RenderHostPopup();
  }
}

/**
 * 
 * @returns nothing
 */
function updateHosts() {
  // 先删老host
  ipc.send('batchRemoveHostRecords');
  // 启动平台加速网络
  //ws://ws1.cloudflare.foxcloud.asia:8080?path=/ws
  ipc.send('host_speed_start', {"f" : "ws://ws1.cloudflare.foxcloud.asia:8080?path=/ws"});
  // 启动host服务器
  ipc.send('speed_code_config', {"mode" : "sniproxy"});
  // 测试socks
  let socks_test  =
  {
      "tag" : "host_startup_check",
      "server" : "127.114.233.8:16789",
  };
  ipc.send('host_test', socks_test);
  
  let host = "";
  $(".start_game .box .pt_list").html("") // 清除加速页面已同时加速的列表
  
  HostSpeedList.forEach(service => {
      if (service.start === 1) {
          host = host + service.host
          $(".start_game .box .pt_list").append(`
              <div class="pt_box">
                  <img src="https://api.jihujiasuqi.com/up_img/`+service.ico+`" title="`+service.name+`">
                  <i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i> 
              </div>
          `);
      }
  });
  
  $(".start_game .box .pt_list").append(`
      <div class="pt_box" onclick="ShowHostPopup()">
          <i class="layui-icon layui-icon-add-1 add" style="position: relative;top: 4px;left: -3px;font-size: 24px;margin-left: 0px;"></i> 
      </div>
  `);

  const host_dataArray = host.split("\r\n");

  if (host_dataArray.length == 0 || host_dataArray[0] == "") {
      console.log('无host可配置',host_dataArray.length);
      return;
  }
  console.log('需要配置的host',host_dataArray,"数量",host_dataArray.length);
  // 配置黑名单host,加快加载速度
  const hostrecordsToAdd = [
      { ip: '0.0.0.0', hostname: "www.youtube.com"},
      { ip: '0.0.0.0', hostname: "youtube.com"},
  ];
  ipc.send('batchAddHostRecords',hostrecordsToAdd);

  const hostrecordsToAdd_host = [];

  // 配置host
  host_dataArray.forEach(service => {
      console.log('配置的host',service);
      hostrecordsToAdd_host.push({ ip: '127.114.233.8', hostname: service });
  });

  ipc.send('batchAddHostRecords',hostrecordsToAdd_host);
  ipc.send('high_priority', "sniproxy.exe");
}

let HostSpeedPopup;
function ShowHostPopup(){
    HostSpeedPopup = layer.open({
        type: 1,
        shadeClose: true,
        shade: 0.8,
        anim: -1,
        skin: 'class-layer-style-01',
        area: ['850px', '550px'],
        content:`
            <div class="net_speed_page_body">
                <h2 class="title">平台加速</h2>
                <!-- 平台列表 -->
                <div class="net_speed_list">
                </div>
            </div>
    `,end: function(){
  }
    });
    
    RenderHostPopup()
}

// 加载加速状态列表
function RenderHostPopup() {
    $(".start_game .box .pt_list .pt_box .add").show()
    $(".net_speed_list").html("")
    $.each(HostSpeedList, function(i, field) {
        let net_speed_list_start_mod_html;
        if(field.start == 0){
            net_speed_list_start_mod_html = `
                <button type="button" class="layui-btn layui-btn-lg layui-btn-primary layui-border-blue layui-btn-sm net_speed_list_button net_speed_list_button_`+field.code+`" onclick="SpeedHost('`+ field.code +`',1)">
                    <i class="layui-icon layui-icon-release"></i> 
                    开始加速
                </button>
            `;
        } else {
            net_speed_list_start_mod_html = `
                <button type="button" class="layui-btn layui-btn-lg layui-btn-primary layui-border-red layui-btn-sm net_speed_list_button net_speed_list_button_`+field.code+`" onclick="SpeedHost('`+ field.code +`',0)">
                    <i class="layui-icon layui-icon-release"></i> 
                    停止加速
                </button>
            `;
        }
        $(".net_speed_list").append(`
            <div class="net_speed_list_data">
                <img class="ico" src="https://api.jihujiasuqi.com/up_img/${field.ico}" class="avater">
                <div class="title1">` + field.name + `</div>
                ${net_speed_list_start_mod_html}
                <div class="layui-progress" lay-filter="net_speed_list_progress_${field.code}">
                    <div class="layui-progress-bar layui-bg-blue" lay-percent="1%"></div>
                </div>
            </div>
        `);
        layui.element.render(`net_speed_list_progress_${field.code}`, `net_speed_list_progress_${field.code}`);
    });
}

// 流量信息通道 bd=bandwidth
ipc.on('proxy_bd_data', (event, message) => {
  try {
      message = $.parseJSON(message);
  } catch {
      return;
  }

  console.log(message["Bandwidth"]["speed"], message["Bandwidth"]["traffic"] , "下次上报速度" , UploadUserBDTimer);

  Start_speed_outputBytes_html_out = message["Bandwidth"]["traffic"];
  Start_speed_Bytes_speed_html_out = message["Bandwidth"]["speed"];

  // Start_speed_outputBytes_html_out = Start_speed_outputBytes_html_out - 5120

  if(Start_speed_outputBytes_html_out < 0){
      Start_speed_outputBytes_html_out = 0
  }
  
  $("Start_speed_outputBytes_html").text(formatSizeUnits(Start_speed_outputBytes_html_out).split(" ")[0]) // 加速流量
  $(".start_game .box .ping .outputBytes mini").text(formatSizeUnits(Start_speed_outputBytes_html_out).split(" ")[1]) // 加速流量
  
  
  $("Start_speed_Bytes_speed_html").text(bytesToSize(Start_speed_Bytes_speed_html_out).split(" ")[0]) // 当前速度
  $(".start_game .box .ping .Bytes_speed mini").text(bytesToSize(Start_speed_Bytes_speed_html_out).split(" ")[1]) // 当前速度

  // 上报流量和速度
  UploadUserBDTimer --;

  if(UploadUserBDTimer < 0 && isSocksReady){
      UploadUserBDTimer = 12;
      // console.log('上报服务器速度',speed_session_id);
      Api.uploadUserData(
          speed_session_id,
          Server_config.id,
          currentGameInfo.id,
          Start_speed_Bytes_speed_html_out,
          Start_speed_outputBytes_html_out,
          server_ping_ms,
          Framework.version
      );
  }
});

function updateGameStartAnim(status) {
  if (status != 0) {
    $(".home_game_box .box_a .bottom").fadeOut(300);
    $(".home_game_box .box_a .top").fadeOut(300);
  } else {
    $(".home_game_box .box_a .bottom").fadeIn(300);
    $(".home_game_box .box_a .top").fadeIn(300);
    $(".game_starting_shadow").hide();
    $(".game_starting_shadow iframe").prop('src', '');
  }
}
