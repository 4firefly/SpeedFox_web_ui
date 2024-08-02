let currentGameID = 0;

let isSocksReady = false;

function startSpeedUp() {
    if (serverConnectionConfig.id == "" || serverConnectionConfig.id == undefined) {
        layer.msg('未选择服务器');
        return; 
    }
    sendGameConfig(currentGameSpeedConfig.id, serverConnectionConfig.id, serverConnectionConfig.mode);
  }

  function sendGameConfig(gameid, serverid, mode) {
    layer.close(oChooseServerPopup);// 关闭服务器列表弹层

    Server_config = null;
    $("[game_now_starting_id='"+gameid+"']").show();
    $("[game_now_starting_id='"+gameid+"'] iframe").prop('src', Game_start_iframe);
    currentGameID = gameid
    Game_start_animation(1);
    

    ipc.send('speed_code_config', {"mode" : "taskkill"});

    GameStartSpeedTimer = setTimeout(function() {
        stop_speed();
        error_page("加速超时");
    }, 1000 * 16);

    Server_config = Api.getServerConfig(serverid)

    localStorage.setItem('server_sort_' + currentGameSpeedConfig.id, Server_config.CountryCode);
    let v2config = '';
    if (serverConnectionConfig.code_mod == "v2ray") {
        v2config = buildV2Config(Server_config);
    }
    let SpeedCfg = {
        "Game_config" : currentGameSpeedConfig,
        "Server_config" : Server_config,
        "mode": mode,
        "code_mod":serverConnectionConfig.code_mod,
        "v2config": v2config
    };
    ipc.send('speed_code_config', SpeedCfg);
    isSocksReady = false;
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

    if (serverConnectionConfig.mode == "nf2_start") {
        speed_mod = "进程模式";
    }
    else if (serverConnectionConfig.mode == "wintun_start") {
        speed_mod = "路由模式";
    }
    $('.start_game .box .server_info p').text(Server_config.name + "-" + Server_config.id + " | " + speed_mod);
}

function updateConnectionStatusIcon() {
  if(socksTestResult.TCP && socksTestResult.udp){
      $('.start_game .box .server_info .udp_ico').attr('src', API_SERVER_ADDRESS+'/app_ui/pc/static/img/nettestok.png');
  }else{
      $('.start_game .box .server_info .udp_ico').attr('src', API_SERVER_ADDRESS+'/app_ui/pc/static/img/nettesterr.png');
  }
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
