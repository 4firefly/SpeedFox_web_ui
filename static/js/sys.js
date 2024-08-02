const { ipcRenderer: ipc, shell } = require('electron');
const API_SERVER_ADDRESS = "https://api.jihujiasuqi.com";
const SYS_JS_VERSION = 202406240430;

/*
* 获取 url 参数
* 缺点：每次都循环一次
* */
function getUrlParams() {
    var params = {};
    var queryString = window.location.search.substring(1);
    var regex = /([^&=]+)=([^&]*)/g;
    var match;

    while (match = regex.exec(queryString)) {
        params[decodeURIComponent(match[1])] = decodeURIComponent(match[2]);
    }
    return params;
}

// OEM 设置
let oem_config  = get_JSON(API_SERVER_ADDRESS+"/api/v2/?mode=get_oem&product=" + getUrlParams().product);
$('.nav .logo').attr('src', oem_config.logo);

let Framework;

const Api = new SFApi(API_SERVER_ADDRESS, getUrlParams().product);

/*document.addEventListener('keydown', function(event) {
    // 禁用 F12 打开开发者工具
    if (event.key === 'F12') {
        event.preventDefault();
    }

    // 禁用 Ctrl+Shift+I 或 Ctrl+Shift+C 打开开发者工具
    if ((event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'C')) ||
        // 禁用 Ctrl+Shift+J 或 Ctrl+U 打开开发者工具
        (event.ctrlKey && (event.key === 'J' || event.key === 'U')) ||
        // 禁用 Ctrl+R 或 F5 刷新页面
        ((event.ctrlKey && event.key === 'R') || event.key === 'F5')) {
        event.preventDefault();
    }
});*/

$(function() {
    $("[page='home']").trigger("click");
    ipc.send('loadingWindow', 'hide');
    if(getUrlParams().silent !== "true") {
        app_window('show');
    }
    ipc.send('speed_code_config', {"mode" : "taskkill"});
    ipc.send('batchRemoveHostRecords');
    // 加载首页滚动图
    render_home();
});


ipc.on('Framework', (event, message) => {
    Framework = message
    re = new RegExp('Chrome/(.+?) ');
    Framework.appVersion = re.exec(navigator.appVersion)[1];
    $(".Framework").html(`程序版本: ${Framework.version} 内核版本: ${Framework.appVersion} SYS.JS 版本: ${SYS_JS_VERSION}`);

    // new version
    if (oem_config.up_version !== Framework.version) {
        if (oem_config.up_url == "") {
            return;
        }
         let content = `
            <div class="update_box">
                ${oem_config.up_content}
                <p class="dl1">0 B/s</p>
                <p class="dl2">0%</p>
                <div class="layui-progress " lay-showpercent="true">
                  <div class="layui-progress-bar layui-bg-blue" ></div>
                </div>
            </div>`;
        DownloadFile(oem_config.up_url, content, "update_blob");
    } else {
        ipc.send('speed_code_test');
    }
});

ipc.on('selected-file', (event, message) => {
    console.log('路径选择:',message[0] ,"游戏id" , currentGameInfo.id);
    
    if (!message[0] || message[0] == undefined || message[0] == '') {
      layer.tips('设置路径错误！', '.set_game_user',{
        tips: [2,'#ff5722']
      });
        return; 
    }
    localStorage.setItem('start_game_'+currentGameInfo.id , message[0]);
    layer.tips('设置成功！', '.set_game_user', {
        tips: [2,'#16b777']
      });
});



function start_game_user() {
    let game_start_path = localStorage.getItem('start_game_'+currentGameInfo.id)


    if (!game_start_path) {
        ipc.send('user_get_exe');
        return; 
    }
    console.log('路径:',game_start_path ,"游戏id" , currentGameInfo.id);
    ipc.send('user_start_exe', game_start_path);
    layer.tips('正在启动游戏！', '.start_game_user', {
        tips: [1,'#16b777']
      });
}


$('.home_game_list').mouseover(function(){
    // console.log('鼠标放到游戏列表内了:√');
    DOMMouseScroll_lock = false
}).mouseout(function(){
    // console.log('鼠标没有放到游戏列表内了:×');
    DOMMouseScroll_lock = true
})
 
DOMMouseScroll_lock = true //滚轮锁
$(document).on("mousewheel DOMMouseScroll", function (event) {
    
    var delta = (event.originalEvent.wheelDelta && (event.originalEvent.wheelDelta > 0 ? 1 : -1)) ||  // chrome & ie
                (event.originalEvent.detail && (event.originalEvent.detail > 0 ? -1 : 1));              // firefox
    
    if (DOMMouseScroll_lock) {
        return; 
    }
    
    
    if (delta > 0) {
    // 向上滚
     console.log("up+++++");
    //  game_list_all_transition(0)
    //do somthing
    } else if (delta < 0) {
      // 向下滚
      console.log("down+++++");
      if(home_game_list_max - getLocalHistoryGames().length < 0){
        game_list_all_transition(1)
      }
     //do somthing
    }
    
    // if(home_game_list_max - Game_history_get().length < 0){
    //     if (delta > 0) {
    //     // 向上滚
    //      console.log("up+++++");
    //      Game_history_json = moveLastToFirst(Game_history_json);
    //     //do somthing
    //     } else if (delta < 0) {
    //       // 向下滚
    //       console.log("down+++++");
    //       Game_history_json = moveFirstToLast(Game_history_json);
    //      //do somthing
    //     }
    //     localStorage.setItem('Game_history', JSON.stringify(Game_history_json));
    //     Game_history() // 加载历史游戏
    // }
    
    
});

// 跳转到全部游戏或者切换回去
function game_list_all_transition(mode) {
    if(mode == 1){
        $(".home_game_list").addClass("home_game_list_transition");
        $(".home_carousel").addClass("home_carousel_transition");
        $(".home_game_list_all").addClass("home_game_list_all_transition");
        
        // 滑动到45高度
        $(".home_game_list_all").animate({scrollTop: 6},1);
        
    }
    if(mode == 0){
        $(".home_game_list").removeClass("home_game_list_transition");
        $(".home_carousel").removeClass("home_carousel_transition");
        $(".home_game_list_all").removeClass("home_game_list_all_transition");
        
    }
    
}


var div = document.getElementById("home_game_list_all");
div.onscroll = function() {
  var scrollPosition = div.scrollTop;

  if (scrollPosition < 1) {
    console.log("滚动位置在顶部。");
    game_list_all_transition(0)
  }
};


function moveFirstToLast(arr) {
    if (arr.length > 0) {
        var firstElement = arr.shift(); // Remove the first element
        arr.push(firstElement); // Add the first element to the end
    }
    return arr;
}
function moveLastToFirst(arr) {
        if (arr.length > 0) {
            var lastElement = arr.pop(); // Remove the last element
            arr.unshift(lastElement); // Add the last element to the beginning
        }
        return arr;
    }

// 接收主进程的消息(加速状态)
var socksok = {};
let GameStartSpeedTimer = null;
var msg_from_kernel = null;

var speed_code_get_newdata = 0
ipc.on('speed_code', (event, message) => {
    console.log('主线程发送信息:', message);
    msg_from_kernel = message;
    // TODO: deprecated
    if(message.tag == "net_speed_start"){
        console.log('来自host模块的socks测试信息:', message);
        if(message.start == "SOCKS OK"){
            console.log('来自host模块的socks测试 - 成功！');
            $(".start_game .box .pt_list .pt_box .layui-icon").hide()
            net_speed_list()
            layer.close(net_speed_layui_box)
        }
        return;
    }

    if(message.start == "SOCKS OK"){
        isSocksReady = true;
        clearTimeout(GameStartSpeedTimer);
        speed_session_id = generateUniqueID();
        StartMonitor(); // 更新数据
        ShowSpeedInfo();
        setTimeout(() => {
            // $("[page='start_game']").trigger("click");
            console.log('加速成功,跳转页面:', currentGameID);

            // 上升优先级
            ipc.send('high_priority', "sniproxy.exe");
            ipc.send('high_priority', "SpeedNet.exe");
            ipc.send('high_priority', "SpeedProxy.exe");
            ipc.send('high_priority', "SpeedMains.exe");
            ipc.send('high_priority', "SpeedFox.tun2socks.exe");

            // 遮罩 实时延时
            $("[start_gameid='"+currentGameID +"']").show();
            
            $("[game_now_starting_id='"+currentGameID +"']").hide();
            $("[game_now_starting_id='"+currentGameID +"'] iframe").prop('src', '');

            if(currentGameSpeedConfig.config_host.includes("**")){
                starthost = currentGameSpeedConfig.config_host.split("\r\n");
                // starthost = starthost.replaceAll("*","");
                console.log('检测到需要加速的host 数组',starthost);
                for (var i = 0; i < starthost.length; i++) {
                    starthostdata = starthost[i].replaceAll("*","");
                    console.log('检测到需要加速的host 数组', starthostdata);
                    net_speed_set(starthostdata,1)
                }
            }
        }, 1000);
    }
    
    if(message.start == "SOCKS ERR"){
        clearTimeout(GameStartSpeedTimer);
        stop_speed();
        var r = confirm("当前服务器不可用,请尝试更换其他服务器\n\n\n服务器链接失败，要查看日志么?");
        if (r == true) {
            error_page("服务器检测连通性失败")
        }
        return;
    }
    // show error log
    if (message.start == "log") {
        $(".error_log").html(message.log);
        return;
    }

    if(message.id == "SpeedProxy_OK"){
      if(!isSocksReady){
            ipc.send('speed_code_config', {"mode" : "socks_test"});
            ipc.send('socks_connect_test');// 测试udp
            updateConnectionStatusIcon()
            socksTestResult = []
      }
      
    }
  
    if(message.start == "close"){
        if(currentGameID == 0){
            // 正常停
            console.log('进程停止(正常)');
            return;
        }
        console.log('进程意外终止!(在游戏加速中丢失)');
    }
  
});

// 返回ping数据
ipc.on('ping-reply', (event, message) => {
    // console.log(`参数: `,message)
    // 列表返回延迟
    if(message.pingid == "ping_server_list" && currentRegionServerList) {
        // console.log(`PING 返回: `,message)
        updateDelayData(message.res.host, message.res.time);
        updateServerDelayData(message.res.host) // 绘制数据
        currentRegionServerList.forEach(function(item) {
            if (item.test_ip === message.res.host) {
                if(message.res.time == "unknown"){
                    message.res.time = 9999
                }
                item.ping = message.res.time + " ms";
                item.ping_initSort = message.res.time;
            }
        });

    }
    else if (message.pingid == "ping_connect_server_test" ) {
        // console.log(`PING 返回: `,message)
        Start_speed_ping(message);
    }
});





function formatTime(seconds) {
    // 计算小时
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600; // 计算剩余秒数

    // 计算分钟
    const minutes = Math.floor(seconds / 60);
    seconds = seconds % 60; // 计算剩余秒数

    // 格式化成两位数
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    // 返回格式化的字符串
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}


// 开始加速,更新数据
let MonitorInterval;

var msg_from_kernel_json = []
function StartMonitor() {
    let MonitorStartTime;
    let code_onlineok;
    MonitorStartTime = Date.parse(new Date()) / 1000;
    MonitorInterval = setInterval(function(){
        time_s = Date.parse(new Date()) / 1000 - MonitorStartTime;
        // console.log(formatTime(time_s))
        // 计时
        $('.start_game .box .stop_speed time').text(formatTime(time_s));
        

        const pingdata = {
            host: Server_config.ip+":"+Server_config.port,
            timeout: 8, // 超时时间，单位为秒
            C:1,// 次数
            pingid: "ping_connect_server_test"
        };
        
        ipc.send('ping', pingdata);        
        /* code_onlineok = false;
        
        
        try {
            speed_code_msg_json = $.parseJSON(msg_from_kernel);
        }catch(err) {}
        
        if (serverConnectionConfig.mode == "nf2_start") {
            code_onlineok = false
            // nf2组件重点关照
            try {
                console.log('核心在线时间',speed_code_msg_json.code.time,'核心误差时间', Date.parse(new Date())/1000 - speed_code_msg_json.code.time)
            }catch(err) {}
            
            
            try {
                if(Date.parse(new Date())/1000 - speed_code_msg_json.code.time < 5){
                    code_onlineok = true
                }
            }catch(err) {}
        }
       else if (serverConnectionConfig.mode == "wintun_start") {
           code_onlineok = true;
       }
        
        
        console.log('核心状态',code_onlineok)*/
        
        
    },1000);
}

// 返回流量数据 (本地服务器)
let UploadUserBDTimer = 5


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
    UploadUserBDTimer --

    if(UploadUserBDTimer < 0){
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


// 更新延迟数据
var delayValues = []
var numBars = 0
var lossok = 0
var server_ping_ms = 0


function Start_speed_ping(message) {
    // console.log(` 更新延迟数据: `,message.ms)
    
        // serverDelayCanvas_
        // Canvas 渲染 ===============================================
        var canvas = document.getElementById('Start_speed_pingCanvas');
        var ctx = canvas.getContext('2d');

        // 定义一些参数
        numBars = 60; // 竖条数量
        var barWidth = canvas.width / numBars; // 竖条的宽度
        if (delayValues.length < 110) {
            // console.error("数组长度小于 100，先随机拉点屎");
            for (var i = 0; i < 110; i++) {
                delayValues.push(0);
            }
        }
 
        // for (var i = 0; i < 100; i++) {
            // delayValues.push(Math.random() * 300); // 延迟值在0到300之间随机生成
        
       
        // 启动前2秒不写入数据
        if(time_s > 1){
            delayValues.push(message.ms); 
            render(); // 渲染
        }
        
         // 延迟大于999就爆表了，再高不显示了
        if(message.ms > 999){
            message.ms = 999
        }
        
        
   
        $("Start_speed_ping_html").text(message.ms)
        
        server_ping_ms = message.ms
        
        // $(".home_game_box .box_a .Game_start_ok h2").text(message.ms)
        
        
        // 取出最新的 100 个元素
        let latest100 = delayValues.slice(-100);
        
        // 计算大于 999 的数量
        let lossCount = latest100.filter(num => num > 3000).length;
        
        
        if($("Start_speed_loss_html").text() != lossCount){
            console.log('loss出现变化:', lossCount);
            if(lossCount > 1){
                console.log('loss大于1:', lossCount);
                
                // if(!$('.start_game .box .ping .diubao').visible()){
                //     return;
                // }
                
                // layer.tips('多倍发包补偿成功!', ".start_game .box .ping .diubao", {
                //   tips: [2]
                // });
                
                
                // if(lossok + 30 < Date.parse(new Date())/1000){
                //     lossok = Date.parse(new Date())/1000;
                    
                //     layer.tips('多倍发包补偿成功!', ".start_game .box .ping .diubao", {
                //       tips: [2]
                //     });
                //     delayValues = removeIsolatedPackets(delayValues);
                    
                    
                    
                // }
                
                
            }
            
            if(lossCount == 10){
                // ipcRenderer.send('speed_tips_Window', {"url" : "https://api.jihujiasuqi.com/app_ui/pc/page/tips/tips.php?text= <marquee scrollamount='14'>当前网络丢包严重,请检查网络环境或更换节点！&nbsp;&nbsp;&nbsp;&nbsp;</marquee>"});
            }
            
        }
        
        $("Start_speed_loss_html").text(lossCount)
        
        
        
        
        
        // 大于600个数组就开始删，预防炸了(10分钟)
        if (delayValues.length > 110) {
            delayValues.shift(); // 删除数组中的第一个元素
        }
        
        // console.log('delayValues.length' ,delayValues.length);
        
        // }

        // 渲染函数
        function render() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空Canvas

            // 只绘制最新的50条数据
            var startIdx = Math.max(0, delayValues.length - numBars);
            var endIdx = delayValues.length;

            // 绘制竖条
            for (var i = startIdx; i < endIdx; i++) {
                var delay = delayValues[i];
                var height = (delay / 350) * canvas.height; // 将延迟值映射到Canvas高度
                var color = getColor(delay);
                ctx.fillStyle = color;
                ctx.fillRect((i - startIdx) * barWidth, canvas.height - height, barWidth, height);
            }
        }

        // 获取颜色
        function getColor(delay) {
            var ratio = delay / 350; // 延迟值的比率
            var r = Math.round(255 * ratio); // 红色分量
            var g = Math.round(255 * (1 - ratio)); // 绿色分量
            return 'rgb(' + r + ', ' + g + ', 0)';
        }

        // Canvas 渲染 结束===============================================
    
}


// 消除孤立延迟
function removeIsolatedPackets(arr) {
    let result = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > 999) {
            // Check if the packet is isolated
            if ((i === 0 || arr[i - 1] <= 999) && (i === arr.length - 1 || arr[i + 1] <= 999)) {
                continue; // Skip this isolated packet
            }
        }
        result.push(arr[i]);
        console.log('消除孤立延迟');
    }
    return result;
}

function createCycleFunction() {
  const values = [60, 300, 600];
  let index = 0;

  return function() {
    const result = values[index];
    index = (index + 1) % values.length; // 每次调用后递增索引，并循环到数组的开头
    console.log("numBars" , result);
  };
}

// 窗口操作
function app_window(mode) {
    ipc.send('mainWindow', mode);
}


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 获取json数据
function get_JSON(url){
    $.getJSON({async: false,url})
    .done(function(data) {
      // 请求成功时的处理逻辑
    //   console.log("请求成功" + data);
      JSONdata = data
    })
    .fail(function(xhr, status, error) {
      // 请求失败时的处理逻辑
      console.log("请求失败" + error,status,xhr);
      layer.msg('数据请求失败 <br>返回码:' + xhr.status);
    });
    return JSONdata;
}


//  生成用户随机数
function generateUniqueID() {
    const timestamp = Date.now(); // 当前时间戳
    const randomNum = Math.floor(Math.random() * 1000000); // 生成随机数
    return `${timestamp}${randomNum}`;
}


function pc_uuid() {
    pc_uuid_str = localStorage.getItem('pc_uuid');
    if(localStorage.getItem('pc_uuid') == null){
        pc_uuid_str = generateUniqueID();
        localStorage.setItem('pc_uuid', pc_uuid_str);
    }
    return pc_uuid_str
}

// 获取用户 user_code
function GetUserToken() {
    user_code_str = localStorage.getItem('user_code');
    if(localStorage.getItem('user_code') == null){
        return false;
    }
    Api.setToken(user_code_str);
    return user_code_str
}

function UpdateUserInfo() {
    let res = Api.getUserInfo();
    if(res.response == "ERR") {
        localStorage.setItem('user_code', "");
        console.log("用户信息丢失，强制下号");
        $('.my_user .username').text("未登录");
        $('.my_user .UID').text("未登录");
        if (currentGameID + 0  != 0) {
            stop_speed();
        }
      return false;
    }
    $('.my_user .username').text(res.username);
    $('.my_user .UID').text("ID:"+res.uid);
    return true;
}


var Game_start_iframe = "page/load/"

// 写入游戏配置+服务器配置

var Server_config


var speed_code_test_mode = 0
ipc.on('speed_code_test', (event, message) => {
    console.log(`环境检测 `,message)
    if(speed_code_test_mode == 0){
        console.log(`环境检测 `,message)
        speed_code_test_mode = 1
        if(message.includes("You must install or update .NET to run this application") || message.includes("You can resolve the problem by installing the specified framework and/or SDK") || message.includes("You must install .NET to run this application")){
            console.log(`缺少必要的环境 `)
            content = `
            <div class="update_box">
                <h2> 缺少必要的组件,正在联网下载 </h2>
             
             
                <p class="dl1">0 B/s</p>
                <p class="dl2">0%</p>
                <div class="layui-progress " lay-showpercent="true">
                  <div class="layui-progress-bar layui-bg-blue" ></div>
                </div>
            </div>`
            

            
            DownloadFile("https://api.jihujiasuqi.com/dl/net%E4%BC%A0%E5%AE%B6%E5%AE%9D.exe", content, "NET_blob")
        }
    }
    
    if(speed_code_test_mode == 2){
        console.log(`环境检测-安装是否成功 `,message)
         if(message.includes("test_run")){
              console.log(`环境成功 `)
              layer.msg('组件安装成功!', {icon: 1});
              layer.close(update_app_lay);
         }
          if(message.includes("You must install or update .NET to run this application.") || message.includes("You can resolve the problem by installing the specified framework and/or SDK") ||  message.includes("You must install .NET to run this application")){
             speed_code_test_mode = 0
              layer.msg('组件安装失败!', {icon: 2});
              layer.close(update_app_lay);
         }
    }
    
});


var socksTestResult = []
ipc.on('socks_connect_test', (event, message) => {
    console.log(`连接检测 `,message)
    
    if(message.includes("UDP: OK")){
        console.log(`UDP 连接正常 `)
        layer.msg('UDP 连接正常', {offset: 'b',anim: 'slideUp'});
        ipc.send('web_log', `UDP 连接正常 `);
        socksTestResult.udp = true
    }
    
    if(message.includes("TCP: OK")){
        console.log(`TCP 连接正常 `)
        layer.msg('TCP 连接正常', {offset: 'b',anim: 'slideUp'});
        ipc.send('web_log', `TCP 连接正常 `);
        socksTestResult.TCP = true
    }
    
    updateConnectionStatusIcon();
});




$(".start_game .box .server_info .udp_ico").on('click', function(event) {
    ipc.send('socks_connect_test');// 测试udp
    socksTestResult=[]
    updateConnectionStatusIcon()
});



function ShowSpeedInfo() {
    $("[page='start_game']").trigger("click");
}



function stop_speed() {
    console.log(`停止加速 `)
    ipc.send('speed_code_config', {"mode" : "taskkill"});
    
    console.log('确认一下 currentGameID :', currentGameID);
    
    
    // $("[page='start_game']").trigger("click");
    
    $("[start_gameid='"+currentGameID +"']").hide();
    currentGameID = 0
    
    start_speed_time = $('.start_game .box .stop_speed time').text();
    // ipcRenderer.send('speed_tips_Window', {"url" : "https://api.jihujiasuqi.com/app_ui/pc/page/tips/tips.php?text= <p style='position: fixed;top: -34px;'>已停止加速！</p> <p style='position: absolute;top: 10px;font-size: 12px;'>加速时长:" + start_speed_time + "</p>"});
    
    
    // 奶奶的为啥清理不掉，多清理亿轮
    for (i = 0; i < 32; i++) {
        clearTimeout(GameStartSpeedTimer);
    }
    Game_start_animation(0)
    $('.start_game .box .stop_speed').html("正在停止...")
    $(".start_game .box .stop_speed_hover").html("正在停止...")
    clearInterval(MonitorInterval);// 清理定时器
    setTimeout(() => {
        delayValues = []
        $("[page='home']").trigger("click");
        $('.start_game .box .stop_speed').html('<i class="layui-icon layui-icon-radio"></i> 加速中:<time></time>')
        $(".start_game .box .stop_speed_hover").html('<i class="layui-icon layui-icon-radio"></i> 停止加速')
    }, 1000 * 2);
    
    
    // 批量吧所有配置设置成0 host
    net_speed_json.forEach(service => {
            service.start = 0;
    });
    ipc.send('batchRemoveHostRecords');
}



console.log("pc_uuid" ,pc_uuid()); // 输出一个pcuuid ，uuid不一样直接下号
console.log("params" , getUrlParams()); // 获取请求参数





if(!getUrlParams().product){
    layer.msg('缺失产品参数,请登录 极狐合作门户 <br>检查 product 是否配置正确！');
}

if(getUrlParams().demo_watermark){
    // layer.msg('测试版');
    $(".demo_watermark").show()
}

// 充值页面
function Pay_page_web(){
    layer.open({
        type: 2,
        shadeClose: true,
        shade: 0.8,
        anim: -1,
        skin: 'class-layer-style-01',
        area: ['700px', '470px'],
        content: 'page/pay/pay.php?product=' + getUrlParams().product // iframe 的 url
      });
}



// 游戏状态锁定
function Game_start_animation(status) {
    if (status != 0) {
        $(".home_game_box .box_a .bottom").fadeOut(300);
        $(".home_game_box .box_a .top").fadeOut(300);
    } else{
        $(".home_game_box .box_a .bottom").fadeIn(300);
        $(".home_game_box .box_a .top").fadeIn(300);
        
        $(".game_starting_shadow").hide();
        $(".game_starting_shadow iframe").prop('src', '');
    }
}

function ShowLoginPopup(){
    layer.open({
        type: 2,
        title: 'iframe',
        shadeClose: true,
        shade: 0.8,
        anim: -1,
        skin: 'class-layer-style-01',
        area: ['320px', '380px'],
        content: 'page/oauth/login_home.php?product=' + getUrlParams().product // iframe 的 url
        ,end: function(){
           console.log('登录页面退出');
           UpdateUserInfo()
        }
      });
      
}



// 定义获取数据的函数
function getDataById(data, id) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].id === id) {
            return data[i];
        }
    }
    return null; // 如果没有找到匹配的 id，返回 null
}

function formatSizeUnits(bytes) {
//   if (bytes < 1024) {
//     // return bytes + " bytes";
//     return   "0 KB";
    
    
//   } else 
  if (bytes < 1048576) {
    return (bytes / 1024).toFixed(2) + " KB";
  } else if (bytes < 1073741824) {
    return (bytes / 1048576).toFixed(2) + " MB";
  } else {
    return (bytes / 1073741824).toFixed(2) + " GB";
  }
}


function formatnet_speed(limit){
    var size = "";
    
    limit = limit*8
    if(limit < 0.1 * 1024){                            //小于0.1KB，则转化成B
        size = limit.toFixed(2) + " B/s"
    }else if(limit < 0.1 * 1024 * 1024 * 1024){            //小于0.1MB，则转化成KB
        // size = (limit/1024).toFixed(2) + " KB/s"
        size = (limit/1024).toFixed(0) + " KB/s"
    }else{     //小于0.1GB，则转化成MB
        size = (limit/(1024 * 1024)).toFixed(2) + " MB/s"
    }
 
    var sizeStr = size + "";                        //转成字符串
    var index = sizeStr.indexOf(".");                    //获取小数点处的索引
    var dou = sizeStr.substr(index + 1 ,2)            //获取小数点后两位的值
    // if(dou == "00"){                                //判断后两位是否为00，如果是则删除00               
    //     return sizeStr.substring(0, index) + sizeStr.substr(index + 3, 2)
    // }
    return size;
}


function bytesToSize(bytes) {
    const kb = bytes / 1024;
    const mb = kb / 1024;
    if (mb >= 1) {
        return mb.toFixed(2) + ' MB/s';
    } else {
        return Math.floor(kb) + ' KB/s';
    }
}


// 主页轮播
function render_home() {
    
    // 临时测试数据
    $(".home_carousel").html(`
    
        <div class="layui-carousel" id="ID-carousel-home_carousel" style="background: black;">
          <div carousel-item>
            <div onclick="open_url('https://live.bilibili.com/31183133')"><img src="https://api.jihujiasuqi.com/blog/usr/uploads/2024/04/3704830239.jpg"></div>
            <div onclick="open_url('https://www.kekexc.com/dp/17he/jihujiasuqi17/')"><img src="https://api.jihujiasuqi.com/blog/usr/uploads/2024/07/852049510.jpg"></div>
            <div onclick="open_url('https://space.bilibili.com/80504012')"><img src="https://api.jihujiasuqi.com/update/2.png"></div>

            <!--
            <div><img src="https://randomfox.ca/images/52.jpg"></div>
            <div><img src="https://randomfox.ca/images/53.jpg"></div>
            <div><img src="https://randomfox.ca/images/54.jpg"></div>
            -->
          </div>
        </div>
    
    `);
    
    layui.use(function(){
      var carousel = layui.carousel;
      // 渲染 - 图片轮播
      carousel.render({
        elem: '#ID-carousel-home_carousel',
        width: '1000px',
        height: '200px',
        anim: "updown",
        arrow:"none",// 鼠标始终隐藏
        interval: 2333
      });
    });
}



// 跳转到错误页面
function error_page(data) {
    
    
    
    
    ipc.send('speed_code_config', {"mode" : "log"});
    layer.msg('正在抓取错误...', {icon: 16,shade: 0.01});;
    ipc.send('web_log', `[出现错误] #=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#`);
    ipc.send('web_log', `[出现错误] 故障时间:` + new Date());
    ipc.send('web_log', `[出现错误] 初步诊断原因:` + data);
    ipc.send('web_log', `[出现错误] 服务器 Name:` + Server_config.name);
    ipc.send('web_log', `[出现错误] 服务器 ID:` + Server_config.id);
    
    ipc.send('web_log', `[出现错误] 加速游戏 NAME:` + currentGameSpeedConfig.name);
    ipc.send('web_log', `[出现错误] 加速游戏 ID:` + currentGameSpeedConfig.id);

    ipc.send('web_log', `[出现错误] userAgent:` + navigator.userAgent);
    ipc.send('web_log', `[出现错误] #=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#`);
    
    
    stop_speed()
    // setTimeout(() => {
    //     $(".app_page").hide();
    //     $(".error_page").show();
        
    //     $(".error_title").html(data);
    //     var textarea = document.getElementById('error_log');
    //     textarea.scrollTop = textarea.scrollHeight;
        
    //     // // 准备验证码
    //     // $('.error_captcha').captcha({
    //     //   clicks: 3,
    //     //   url: '/apps/captcha2/captcha.php',
    //     //   tip: '请按照顺序依次点击图中的',
    //     //   callback: function(){
    //     //     // alert('表单提交');
    //     //     console.log($(".error_captcha input[name='captcha']").val())
    //     //   },
    //     // });

    //     // setTimeout(() => {
    //     //     var r=confirm("您是否愿意吧错误日志提交给我们，这样我们会更好的优化客户端");
    //     //     if (r==true){
    //     //         $(".error_log_captcha_submit").click()
    //     //     }
    //     // }, 1000);
        
    // }, 1000 * 3);
}


// 下载文件
function download_file(data) {
    const url = 'https://api.jihujiasuqi.com/update/speedfox.3.1.5_b3.exe'; // 替换为实际的文件URL
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            // document.getElementById('progress-bar').style.width = percentComplete + '%';
            // document.getElementById('percentComplete').textContent = `Completed: ${percentComplete.toFixed(2)}%`;

            const elapsedTime = (Date.now() - startTime) / 1000; // 秒数
            const downloadSpeed = (event.loaded / 1024 / elapsedTime).toFixed(2); // KB/s
            // document.getElementById('downloadSpeed').textContent = `Speed: ${downloadSpeed} KB/s`;
            
            // console.log('文件下载 速度', downloadSpeed ,"百分比" ,percentComplete);
        }
    };

    xhr.onload = function() {
        if (xhr.status === 200) {
            const blob = xhr.response;
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'your-file.zip'; // 设置下载文件的名称
            link.click();
        }
    };

    xhr.onerror = function() {
        console.error('An error occurred while downloading the file.');
    };

    xhr.send();
}


// 封装函数将 Blob 转换为 Buffer
async function blobToBuffer(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function () {
      const arrayBuffer = this.result;
      const buffer = Buffer.from(arrayBuffer);
      resolve(buffer);
    };
    reader.onerror = function (error) {
      reject(error);
    };
    reader.readAsArrayBuffer(blob);
  });
}


var update_app_lay = null;
/*
* inurl: 下载地址
* content1 popup 内润
* datafile: update_blob 更新文件*/
function DownloadFile(inurl, content1, datafile) {
    
    // 在此处输入 layer 的任意代码
    update_app_lay = layer.open({
      type: 1, // page 层类型
      area: ['800px', '400px'],
      shade: 0.6, // 遮罩透明度
      shadeClose: false, // 点击遮罩区域，关闭弹层
      maxmin: false, // 允许全屏最小化
      anim: 0, // 0-6 的动画形式，-1 不开启
      closeBtn:0,
      content: content1
    //   content: `
    //     <div class="update_box">
    //         <h2> 每次的更新,只为更好的体验 </h2>
            
            
            
    //         <p class="dl1">0 B/s</p>
    //         <p class="dl2">0%</p>
    //         <div class="layui-progress " lay-showpercent="true">
    //           <div class="layui-progress-bar layui-bg-blue" ></div>
    //         </div>
    //     </div>`
    });
    
    // return
    const url = inurl; // 替换为实际的文件URL
    // const url = 'https://api.jihujiasuqi.com/logo.png'; // 替换为实际的文件URL
    const xhr = new XMLHttpRequest();
    const startTime = Date.now();

    xhr.open('GET', url, true);
    xhr.responseType = 'blob';

    xhr.onprogress = function(event) {
        if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            // document.getElementById('progress-bar').style.width = percentComplete + '%';
            // document.getElementById('percentComplete').textContent = `Completed: ${percentComplete.toFixed(2)}%`;

            const elapsedTime = (Date.now() - startTime) / 1000; // 秒数
            const downloadSpeed = (event.loaded  / elapsedTime).toFixed(2); // KB/s

            // document.getElementById('downloadSpeed').textContent = `Speed: ${downloadSpeed} KB/s`;
            $(".update_box .layui-progress-bar").width( percentComplete + "%");
            
            $(".update_box .dl1").text( bytesToSize(downloadSpeed) + "");
            $(".update_box .dl2").text( percentComplete.toFixed(2) + "%");
            // console.log('文件下载 速度', downloadSpeed ,"百分比" ,percentComplete);
        }
    };

    xhr.onload = function() {
        console.log('xhr', xhr );
        if (xhr.status === 200) {
            const blob = xhr.response;
            
            
            // 将 Blob 对象转换成 ArrayBuffer
            const reader = new FileReader();
            reader.onloadend = () => {
                const arrayBuffer = reader.result;
                // 发送 ArrayBuffer 到主进程
                
                
                if(datafile == "update_blob"){
                    ipc.send('update_blob', arrayBuffer);
                    
                    
                    
                    var t2 = window.setInterval(function() {
                    	if(fake_percentComplete > 80){
                    	    window.clearInterval(t2)  // 去除定时器
                    	    fake_percentComplete = 0
                    	    $(".update_box .dl1").text( "出错了...");
                            $(".update_box .dl2").text(  " ");
                            
                            
                            alert("安装出错,安装包已完成下载,请选择储存位置手动安装！");
                            const link = document.createElement('a');
                            link.href = window.URL.createObjectURL(blob);
                            link.download = '安装包.exe'; // 设置下载文件的名称
                            link.click();
                            
                            
                    	}else{
                    	    fake_percentComplete ++
                    	    $(".update_box .layui-progress-bar").width( fake_percentComplete + "%");
                    	    $(".update_box .dl1").text( "正在尝试快速安装 !");
                            $(".update_box .dl2").text( fake_percentComplete + "%");
                    	}
                    	
                    },100)
                    
                }
                else if(datafile == "NET_blob") {
                    ipc.send('NET_blob', arrayBuffer);
                    speed_code_test_mode = 2
                    
                    var t2 = window.setInterval(function() {
                    	if(fake_percentComplete > 99){
                    	    window.clearInterval(t2)  // 去除定时器
                    	    ipc.send('speed_code_test');
                            
                    	}else{
                    	    fake_percentComplete ++
                    	    $(".update_box .layui-progress-bar").width( fake_percentComplete + "%");
                    	    $(".update_box .dl1").text( "正在安装环境 !");
                            $(".update_box .dl2").text( fake_percentComplete + "%");
                    	}
                    	
                    },100)
                
                    
                }
                
                fake_percentComplete = 0
                

              
              
            };
            reader.readAsArrayBuffer(blob);
            
            
            
            // const link = document.createElement('a');
            // link.href = window.URL.createObjectURL(blob);
            // link.download = 'your-file.zip'; // 设置下载文件的名称
            // link.click();
        }else{
            console.error('安装包404');
            layer.close(update_app_lay);
            layer.msg('安装包下载失败,可能没有配置', {icon: 2});
        }
    };

    xhr.onerror = function() {
        console.error('An error occurred while downloading the file.');
    };

    xhr.send();
}







// 加速平台
$.getJSON(API_SERVER_ADDRESS+"/api/v2/?mode=host_speed&user_code="+ GetUserToken()).done(function(data) {
    net_speed_json = data
    // 批量吧所有配置设置成0
    net_speed_json.forEach(service => {
            service.start = 0;
    });
    
}).fail(function(xhr, status, error) {
  // 请求失败时的处理逻辑
    console.log("【host_speed】请求失败" + error,status,xhr);
    layer.msg('[host_speed] 数据请求失败 <br>返回码:' + xhr.status);
});

var net_speed_layui_box
function net_speed(){
    net_speed_layui_box = layer.open({
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
                
                    <!-- <div class="net_speed_list_data">
                        <img class="ico" src="https://api.jihujiasuqi.com/up_img/ico/steam_black_logo_icon_147078.png" class="avater">
                        <div class="title1">Sbeam游戏中心</div>
                        <button type="button" class="layui-btn layui-btn-lg layui-btn-primary layui-border-blue layui-btn-sm net_speed_list_button">
                            <i class="layui-icon layui-icon-release"></i> 
                            开始加速
                        </button>
                    </div> -->
                
                
                </div>
                
            </div>
    `,end: function(){
    console.log('平台加速页面已移除');
  }
    });
    
    net_speed_list()
}

// 加载加速状态列表
function net_speed_list(){
    $(".start_game .box .pt_list .pt_box .add").show()
    $(".net_speed_list").html("")
    $.each(net_speed_json, function(i, field){
        
        if(field.start == 0){
            net_speed_list_start_mod_html = `
                <button type="button" class="layui-btn layui-btn-lg layui-btn-primary layui-border-blue layui-btn-sm net_speed_list_button net_speed_list_button_`+field.code+`" onclick="net_speed_set('`+ field.code +`',1)">
                    <i class="layui-icon layui-icon-release"></i> 
                    开始加速
                </button>
            
            `
        }else{
            net_speed_list_start_mod_html = `
                <button type="button" class="layui-btn layui-btn-lg layui-btn-primary layui-border-red layui-btn-sm net_speed_list_button net_speed_list_button_`+field.code+`" onclick="net_speed_set('`+ field.code +`',0)">
                    <i class="layui-icon layui-icon-release"></i> 
                    停止加速
                </button>
            
            `
        }
        
        
        $(".net_speed_list").append(`
                    <div class="net_speed_list_data">
                        <img class="ico" src="https://api.jihujiasuqi.com/up_img/`+field.ico+`" class="avater">
                        <div class="title1">` + field.name + `</div>
                        `+net_speed_list_start_mod_html+`
                        <div class="layui-progress" lay-filter="net_speed_list_progress_`+field.code+`">
                          <div class="layui-progress-bar layui-bg-blue" lay-percent="1%"></div>
                        </div>
                    </div>
        `);
        
        layui.element.render('net_speed_list_progress_'+field.code, 'net_speed_list_progress_'+field.code);
        
    })
}




const alphabet_key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function encodeNumberToString(number) {
    let encoded = '';
    while (number > 0) {
        let remainder = number % alphabet_key.length;
        encoded = alphabet_key[remainder] + encoded;
        number = Math.floor(number / alphabet_key.length);
    }
    return encoded;
}

function decodeStringToNumber(string) {
    let decoded = 0;
    for (let i = 0; i < string.length; i++) {
        decoded = decoded * alphabet_key.length + alphabet_key.indexOf(string[i]);
    }
    return decoded;
}

// 示例用法
// let number = 1234567890;
// let encodedString = encodeNumberToString(number);
// console.log(encodedString); // 输出: Kq3W4

// let decodedNumber = decodeStringToNumber(encodedString);
// console.log(decodedNumber); // 输出: 1234567890







// 设置加速状态 net_speed_set(平台,模式0关1开)
function net_speed_set(mode,open){
    $(".net_speed_list_button_"+mode).hide()
    $(`[lay-filter='net_speed_list_progress_`+mode+`']`).show()
    layui.element.progress('net_speed_list_progress_'+mode, "100%");
    
    net_speed_json.forEach(service => {
        if (service.code === mode) {
            service.start = open;
        }
    });
    net_speed_set_start(open)
    
    if(open == 0){
        console.log('关闭不走流程，直接刷新');
        net_speed_list()
    }
    
}
function net_speed_set_start(open){
    
    // 先删老host
    ipc.send('batchRemoveHostRecords');
    
    
    // 启动平台加速网络
    //ws://ws1.cloudflare.foxcloud.asia:8080?path=/ws
    ipc.send('host_speed_start', {"f" : "ws://ws1.cloudflare.foxcloud.asia:8080?path=/ws"});
    
    // 启动host服务器
    ipc.send('speed_code_config', {"mode" : "sniproxy"});
    
    // 测试socks
     var socks_test  =
        {
            "tag" : "net_speed_start",
            "server" : "127.114.233.8:16789",
        };
    ipc.send('socks_test', socks_test);
    
    host = ""
    $(".start_game .box .pt_list").html("") // 清除加速页面已同时加速的列表
    
    net_speed_json.forEach(service => {
        if (service.start === 1) {
            host = host + service.host
            $(".start_game .box .pt_list").append(`
            
                <div class="pt_box">
                    <img src="https://api.jihujiasuqi.com/up_img/`+service.ico+`" title="`+service.name+`">
                    <i class="layui-icon layui-icon-loading layui-anim layui-anim-rotate layui-anim-loop"></i> 
                </div>
            
            `)
        }
    });
    
    $(".start_game .box .pt_list").append(`
               <div class="pt_box" onclick="net_speed()">
                    <i class="layui-icon layui-icon-add-1 add" style="position: relative;top: 4px;left: -3px;font-size: 24px;margin-left: 0px;"></i> 
                </div>
            `)
    
    

    const host_dataArray = host.split("\r\n");
    
    
    if(host_dataArray.length == 0 || host_dataArray[0] == ""){
        console.log('无host可配置',host_dataArray.length);
        // 删老host
        ipc.send('batchRemoveHostRecords');
        return;
    }
    console.log('需要配置的host',host_dataArray,"数量",host_dataArray.length);
    // 配置黑名单host,加快加载速度
    const hostrecordsToAdd = [
                { ip: '0.0.0.0', hostname:"www.youtube.com"},
                { ip: '0.0.0.0', hostname:"youtube.com"},
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




function createObjectFile(blob,filename,type='text/plain'){
	return new File([blob],filename,{ type });
}


function my_set_page(){
    $("[page='my_set']").trigger("click");
    
}


function Logout(){
    stop_speed();
    localStorage.setItem('user_code', "");
    $("[page='home']").trigger("click");
}

function buy_time_page(){
    $("[page='buy_time']").trigger("click");
}



// 内嵌网页
$(".my_set [page='iframe_aff']").on('click', function(event) {
    $(".my_set .iframe iframe").attr('src','https://api.jihujiasuqi.com/partners/aff/index.php')
    $(".my_set .my_set_page").hide();
    $(".my_set .iframe").show();
});

$(".my_set [page='iframe_kl']").on('click', function(event) {
    $(".my_set .iframe iframe").attr('src',API_SERVER_ADDRESS+'/admin/website/news_list?type=1')
    $(".my_set .my_set_page").hide();
    $(".my_set .iframe").show();
});

$(".my_set [page='iframe_key']").on('click', function(event) {
    $(".my_set .iframe iframe").attr('src',API_SERVER_ADDRESS+'/admin/website/news_list?type=1')
    $(".my_set .my_set_page").hide();
    $(".my_set .iframe").show();
});

$(".my_set [page='iframe_agent']").on('click', function(event) {
    $(".my_set .iframe iframe").attr('src','https://jihujiasuqi.com/openspeedfox/')
    $(".my_set .my_set_page").hide();
    $(".my_set .iframe").show();
});

$(".my_set [page='iframe_Details']").on('click', function(event) {
    $(".my_set .iframe iframe").attr('src',API_SERVER_ADDRESS+'/admin/website/news_list?type=1')
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
        content:`https://api.jihujiasuqi.com/web/about/index.php`
    });

});


$(".my_set .iframe iframe").on("load", function() {
    console.log('内嵌网页加载完成');
});




var fix_schedule = 0
var fix_timer
function app_fix(css){
    if(fix_schedule != 0){
        layer.msg('正在修复,请等待修复完成');
        return
    }
    
    
        // 检测有没有游戏在加速
    if(currentGameID != 0){
        layer.msg('有其他游戏正在加速！\n无法修复！');
        return; 
    }
    
    
    var fix_timer = setInterval(function() { 
        fix_schedule ++
        $(css).text(fix_schedule/10 + "%")
        if(fix_schedule > 999){
            fix_schedule = 0
            clearInterval(fix_timer);//清除定时器
            $(css).text("修复完成")
            ipc.send('speed_code_config', {"mode" : "taskkill"});
        }
    }, 10);
}



function Ticket_MSG(){
    layer.open({
      type: 2,
      shadeClose: true,
      shade: 0.8,
      anim: -1,
      skin: 'class-layer-style-01',
      area: ['800px', '600px'],
      content: 'https://api.jihujiasuqi.com/apps/Ticket_new/?&user_code='+GetUserToken()+'&product='+  getUrlParams().product 
    });
}














// NEW AERA!
$(function() {
    $("[page='home']").trigger("click");
    $(".app_page").css("opacity", 1.0);
});


let gameAll = Api.getGameList();
let home_game_list_max = 4;

$(document).ready(function() {
    LoadGameList(gameAll);
    if (!GetUserToken()) {
        console.log("账号未登录,不加载历史游戏,加载热门游戏");
        LoadHomePageGames(gameAll, home_game_list_max, false);
    } else {
        console.log("账号已登录 " , GetUserToken());
        UpdateUserInfo();
        LoadGameHistory();
        // 循环更新用户数据
        setInterval(function() {
                UpdateUserInfo();
        }, 1000 * 30);
    }
});


// 查找出问题的图片
$('.home_game_box img').on('error', function() {
    console.log("游戏图片出现问题" , this.src );
    // layer.msg('图片下载出现问题<br>' + this.src);
});
