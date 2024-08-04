// const { ipcRenderer: ipc, shell } = require('electron');
const API_SERVER_ADDRESS = "https://api.jihujiasuqi.com";
const SYS_JS_VERSION = 202406240430;


// OEM 设置
let oem_config = get_JSON(API_SERVER_ADDRESS +
  "/api/v2/?mode=get_oem&product=" + getUrlParams().product);
$('.nav .logo').attr('src', oem_config.logo);
if (!getUrlParams().product) {
  layer.msg('缺失产品参数,请登录 极狐合作门户 <br>检查 product 是否配置正确！');
}

if (getUrlParams().demo_watermark) {
  // layer.msg('测试版');
  $(".demo_watermark").show();
}
let Framework;

function app_window(mode) {
  ipc.send('mainWindow', mode);
}

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


$(document).ready(function() {
  allGamesList = Api.getGameList();
  ipc.send('loadingWindow', 'hide');
  $("[page='home']").trigger("click");
  $(".app_page").css("opacity", 1.0);
  if (getUrlParams().silent !== "true") {
    app_window('show');
  }
    // 加载首页滚动图
  render_home();
  LoadGameList(allGamesList);
  if (!Api.isVaildLogin()) {
    console.log("账号未登录,不加载历史游戏,加载热门游戏");
    LoadHomePageGames(allGamesList, home_game_list_max, false);
   } else {
    UpdateUserInfo();
    LoadGameHistory();
  }
  setInterval(function() {
    UpdateUserInfo();
  }, 1000 * 30);
});

ipc.on('Framework', (event, message) => {
  Framework = message
  re = new RegExp('Chrome/(.+?) ');
  Framework.appVersion = re.exec(navigator.appVersion)[1];
  $(".Framework").html(
    `程序版本: ${Framework.version} 内核版本: ${Framework.appVersion} SYS.JS 版本: ${SYS_JS_VERSION}`
    );

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

// 返回ping数据
ipc.on('ping-reply', (event, message) => {
  // console.log(`参数: `,message)
  // 列表返回延迟
  if (message.pingid == "ping_server_list" && currentRegionServerList) {
    // console.log(`PING 返回: `,message)
    updateDelayData(message.res.host, message.res.time);
    updateServerDelayData(message.res.host) // 绘制数据
    currentRegionServerList.forEach(function(item) {
      if (item.test_ip === message.res.host) {
        if (message.res.time == "unknown") {
          message.res.time = 9999
        }
        item.ping = message.res.time + " ms";
        item.ping_initSort = message.res.time;
      }
    });

  } else if (message.pingid == "ping_connect_server_test") {
    // console.log(`PING 返回: `,message)
    RenderPingLines(message);
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

function StartMonitor() {
  let MonitorStartTime;
  MonitorStartTime = Date.parse(new Date()) / 1000;
  MonitorInterval = setInterval(function() {
    time_s = Date.parse(new Date()) / 1000 - MonitorStartTime;
    // console.log(formatTime(time_s))
    // 计时
    $('.start_game .box .stop_speed time').text(formatTime(time_s));

    const pingdata = {
      host: Server_config.ip + ":" + Server_config.port,
      timeout: 8, // 超时时间，单位为秒
      C: 1, // 次数
      pingid: "ping_connect_server_test"
    };

    ipc.send('ping', pingdata);

  }, 1000);
}

// 返回流量数据 (本地服务器)

// 更新延迟数据
var delayValues = []
var numBars = 0
var lossok = 0
var server_ping_ms = 0

function RenderPingLines(message) {
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
  if (time_s > 1) {
    delayValues.push(message.ms);
    render(); // 渲染
  }

  // 延迟大于999就爆表了，再高不显示了
  if (message.ms > 999) {
    message.ms = 999
  }

  $("Start_speed_ping_html").text(message.ms)

  server_ping_ms = message.ms

  // $(".home_game_box .box_a .Game_start_ok h2").text(message.ms)

  // 取出最新的 100 个元素
  let latest100 = delayValues.slice(-100);

  // 计算大于 999 的数量
  let lossCount = latest100.filter(num => num > 3000).length;

  if ($("Start_speed_loss_html").text() != lossCount) {
    console.log('loss出现变化:', lossCount);
    if (lossCount > 1) {
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

    if (lossCount == 10) {
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
      ctx.fillRect((i - startIdx) * barWidth, canvas.height - height, barWidth,
        height);
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
      if ((i === 0 || arr[i - 1] <= 999) && (i === arr.length - 1 || arr[i +
          1] <= 999)) {
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
    console.log("numBars", result);
  };
}

// 窗口操作


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 获取json数据
function get_JSON(url) {
  $.getJSON({
      async: false,
      url
    })
    .done(function(data) {
      // 请求成功时的处理逻辑
      //   console.log("请求成功" + data);
      JSONdata = data
    })
    .fail(function(xhr, status, error) {
      // 请求失败时的处理逻辑
      console.log("请求失败" + error, status, xhr);
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

// 写入游戏配置+服务器配置



var speed_code_test_mode = 0
ipc.on('speed_code_test', (event, message) => {
  console.log(`环境检测 `, message)
  if (speed_code_test_mode == 0) {
    console.log(`环境检测 `, message)
    speed_code_test_mode = 1
    if (message.includes(
        "You must install or update .NET to run this application") ||
      message.includes(
        "You can resolve the problem by installing the specified framework and/or SDK"
        ) || message.includes(
        "You must install .NET to run this application")) {
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

      DownloadFile(
        "https://api.jihujiasuqi.com/dl/net%E4%BC%A0%E5%AE%B6%E5%AE%9D.exe",
        content, "NET_blob")
    }
  }

  if (speed_code_test_mode == 2) {
    console.log(`环境检测-安装是否成功 `, message)
    if (message.includes("test_run")) {
      console.log(`环境成功 `)
      layer.msg('组件安装成功!', {
        icon: 1
      });
      layer.close(update_app_lay);
    }
    if (message.includes(
        "You must install or update .NET to run this application.") ||
      message.includes(
        "You can resolve the problem by installing the specified framework and/or SDK"
        ) || message.includes(
        "You must install .NET to run this application")) {
      speed_code_test_mode = 0
      layer.msg('组件安装失败!', {
        icon: 2
      });
      layer.close(update_app_lay);
    }
  }

});

// 充值页面
function Pay_page_web() {
  layer.open({
    type: 2,
    shadeClose: true,
    shade: 0.8,
    anim: -1,
    skin: 'class-layer-style-01',
    area: ['700px', '470px'],
    content: 'page/pay/pay.php?product=' + getUrlParams()
      .product // iframe 的 url
  });
}

// 游戏状态锁定




// 定义获取数据的函数


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

function formatnet_speed(limit) {
  var size = "";

  limit = limit * 8
  if (limit < 0.1 * 1024) { //小于0.1KB，则转化成B
    size = limit.toFixed(2) + " B/s"
  } else if (limit < 0.1 * 1024 * 1024 * 1024) { //小于0.1MB，则转化成KB
    // size = (limit/1024).toFixed(2) + " KB/s"
    size = (limit / 1024).toFixed(0) + " KB/s"
  } else { //小于0.1GB，则转化成MB
    size = (limit / (1024 * 1024)).toFixed(2) + " MB/s"
  }

  var sizeStr = size + ""; //转成字符串
  var index = sizeStr.indexOf("."); //获取小数点处的索引
  var dou = sizeStr.substr(index + 1, 2) //获取小数点后两位的值
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

  layui.use(function() {
    var carousel = layui.carousel;
    // 渲染 - 图片轮播
    carousel.render({
      elem: '#ID-carousel-home_carousel',
      width: '1000px',
      height: '200px',
      anim: "updown",
      arrow: "none", // 鼠标始终隐藏
      interval: 2333
    });
  });
}

// 跳转到错误页面
function error_page(data) {

  ipc.send('speed_code_config', {
    "mode": "log"
  });
  layer.msg('正在抓取错误...', {
    icon: 16,
    shade: 0.01
  });
  ipc.send('web_log',
    `[出现错误] #=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#`
    );
  ipc.send('web_log', `[出现错误] 故障时间:` + new Date());
  ipc.send('web_log', `[出现错误] 初步诊断原因:` + data);
  ipc.send('web_log', `[出现错误] 服务器 Name:` + Server_config.name);
  ipc.send('web_log', `[出现错误] 服务器 ID:` + Server_config.id);

  ipc.send('web_log', `[出现错误] 加速游戏 NAME:` + currentGameSpeedConfig.name);
  ipc.send('web_log', `[出现错误] 加速游戏 ID:` + currentGameSpeedConfig.id);

  ipc.send('web_log', `[出现错误] userAgent:` + navigator.userAgent);
  ipc.send('web_log',
    `[出现错误] #=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#=-=#`
    );

  stop_speed();
}

// 下载文件
function download_file(data) {
  const url =
  'https://api.jihujiasuqi.com/update/speedfox.3.1.5_b3.exe'; // 替换为实际的文件URL
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
      const downloadSpeed = (event.loaded / 1024 / elapsedTime).toFixed(
      2); // KB/s
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
    reader.onload = function() {
      const arrayBuffer = this.result;
      const buffer = Buffer.from(arrayBuffer);
      resolve(buffer);
    };
    reader.onerror = function(error) {
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
    closeBtn: 0,
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
      const downloadSpeed = (event.loaded / elapsedTime).toFixed(2); // KB/s

      // document.getElementById('downloadSpeed').textContent = `Speed: ${downloadSpeed} KB/s`;
      $(".update_box .layui-progress-bar").width(percentComplete + "%");

      $(".update_box .dl1").text(bytesToSize(downloadSpeed) + "");
      $(".update_box .dl2").text(percentComplete.toFixed(2) + "%");
      // console.log('文件下载 速度', downloadSpeed ,"百分比" ,percentComplete);
    }
  };

  xhr.onload = function() {
    console.log('xhr', xhr);
    if (xhr.status === 200) {
      const blob = xhr.response;

      // 将 Blob 对象转换成 ArrayBuffer
      const reader = new FileReader();
      reader.onloadend = () => {
        const arrayBuffer = reader.result;
        // 发送 ArrayBuffer 到主进程

        if (datafile == "update_blob") {
          ipc.send('update_blob', arrayBuffer);

          var t2 = window.setInterval(function() {
            if (fake_percentComplete > 80) {
              window.clearInterval(t2) // 去除定时器
              fake_percentComplete = 0
              $(".update_box .dl1").text("出错了...");
              $(".update_box .dl2").text(" ");

              alert("安装出错,安装包已完成下载,请选择储存位置手动安装！");
              const link = document.createElement('a');
              link.href = window.URL.createObjectURL(blob);
              link.download = '安装包.exe'; // 设置下载文件的名称
              link.click();

            } else {
              fake_percentComplete++
              $(".update_box .layui-progress-bar").width(
                fake_percentComplete + "%");
              $(".update_box .dl1").text("正在尝试快速安装 !");
              $(".update_box .dl2").text(fake_percentComplete + "%");
            }

          }, 100)

        } else if (datafile == "NET_blob") {
          ipc.send('NET_blob', arrayBuffer);
          speed_code_test_mode = 2

          var t2 = window.setInterval(function() {
            if (fake_percentComplete > 99) {
              window.clearInterval(t2) // 去除定时器
              ipc.send('speed_code_test');

            } else {
              fake_percentComplete++
              $(".update_box .layui-progress-bar").width(
                fake_percentComplete + "%");
              $(".update_box .dl1").text("正在安装环境 !");
              $(".update_box .dl2").text(fake_percentComplete + "%");
            }

          }, 100)

        }

        fake_percentComplete = 0

      };
      reader.readAsArrayBuffer(blob);

      // const link = document.createElement('a');
      // link.href = window.URL.createObjectURL(blob);
      // link.download = 'your-file.zip'; // 设置下载文件的名称
      // link.click();
    } else {
      console.error('安装包404');
      layer.close(update_app_lay);
      layer.msg('安装包下载失败,可能没有配置', {
        icon: 2
      });
    }
  };

  xhr.onerror = function() {
    console.error('An error occurred while downloading the file.');
  };

  xhr.send();
}

const alphabet_key =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

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

function createObjectFile(blob, filename, type = 'text/plain') {
  return new File([blob], filename, {
    type
  });
}

var fix_schedule = 0
var fix_timer

function app_fix(css) {
  if (fix_schedule != 0) {
    layer.msg('正在修复,请等待修复完成');
    return
  }

  // 检测有没有游戏在加速
  if (nCurrentSpeedGameID != 0) {
    layer.msg('有其他游戏正在加速！\n无法修复！');
    return;
  }

  var fix_timer = setInterval(function() {
    fix_schedule++
    $(css).text(fix_schedule / 10 + "%")
    if (fix_schedule > 999) {
      fix_schedule = 0
      clearInterval(fix_timer); //清除定时器
      $(css).text("修复完成")
      ipc.send('speed_code_config', {
        "mode": "taskkill"
      });
    }
  }, 10);
}

function Ticket_MSG() {
  layer.open({
    type: 2,
    shadeClose: true,
    shade: 0.8,
    anim: -1,
    skin: 'class-layer-style-01',
    area: ['800px', '600px'],
    content: 'https://api.jihujiasuqi.com/apps/Ticket_new/?&user_code=' +
      GetUserToken() + '&product=' + getUrlParams().product
  });
}

// NEW AERA!

