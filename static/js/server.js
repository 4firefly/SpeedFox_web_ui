let oChooseServerPopup; // 选择服务器弹窗
let LatencyTestInterval = null; // 延时测试
let LatencyTestTimeout = null;
let serverDelayData = []; // 延时数据
let currentRegionServerList = null; // 区服
let currentGameInfo; // 游戏信息
let currentGameSpeedConfig = []; // 游戏加速信息 (host)
let serverConnectionConfig = []; // 服务器连接信息

function CheckandPopupServerList(id, mode) {
  // 检测有没有登录
  if (!Api.isVaildLogin()) {
      console.log("账号未登录");
      ShowLoginPopup();
      return; 
  }

  // 检测有没有游戏在加速
  if (nCurrentSpeedGameID != 0) {
      layer.msg('有其他游戏正在加速！');
      $("[page='home']").trigger("click");
      return; 
  }
  
  // 检测有没有修复
  if (fix_schedule != 0) {
      layer.msg('正在修复组件,请等待修复完成');
      return;
  }
  
  addGameHistory(id);

  // 在列表加速
  if (mode == 2) {
      LoadGameHistory();
      $("[page='home']").trigger("click");
  }
  ShowChooseServerPopup(id);
}

/**
 * 展示选择区服和服务器弹窗
 * @param {number} gameid 
 * @returns null
 */
function ShowChooseServerPopup(gameid) {
  function getDataById(data, id) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        return data[i];
      }
    }
    return null; // 如果没有找到匹配的 id，返回 null
  }
  currentGameInfo = getDataById(allGamesList, gameid+"");

  oChooseServerPopup = layer.open({
      type: 1,
      shadeClose: true,
      shade: 0.8,
      anim: -1,
      skin: 'class-layer-style-01',
      area: ['850px', '550px'],
      content:`
          <div class="server_list_page_body">
              <div class="layui-tab layui-tab-brief server-list-tab" lay-filter="top-tab">
                  <ul class="layui-tab-title">

                      <li page="server_sort">选择区服</li>
                      <li page="server_list">专线节点</li>
                      <!-- 
                      <li page="my_server_list">独享节点</li>
                      -->
                  </ul>
              </div>
              <div class="list_box">
                  <div class="layui-form" lay-filter="form-demo-skin">
                      <div class="all_server">
                          <i class="layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop serverload"></i>
                      </div>
                      <div class="server_list" style="display: none;">
                          <div class="provider_switch" style="display: none;">
                              <input type="checkbox" name="AAA" lay-skin="switch">
                          </div>
                          <!-- <i class="layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop serverload"></i>-->
                          <div class="tablelist">
                              <table class="layui-hide" id="ID-table-data"></table>
                          </div>
                          <div class="layui-form mode_set">
                          <input type="radio" name="mode_set_name" mode="nf2_start" title="进程模式" disabled checked1> 
                          <input type="radio" name="mode_set_name" mode="wintun_start" title="路由模式" disabled> 
                          </div>
                          <button type="button" class="layui-btn layui-btn-normal   go_start" onclick="startSpeedUp()"><p>立即加速</p></button>
                      </div>
                  </div>
                  <p class="Ticket_MSG" onclick="Ticket_MSG()"> 问题反馈 </p>
                  <load>
                      <i class="layui-icon layui-icon-loading-1 layui-anim layui-anim-rotate layui-anim-loop"></i>
                  </load>
              </div>
          </div>`,
      end: function () {
            console.log('服务器列表弹层已被移除');
            window.clearInterval(LatencyTestInterval);
            window.clearInterval(LatencyTestTimeout);
          }
      });
  
  // 监听加速模式
  $(".server_list_page_body .layui-form .mode_set").on('click', function(event) {
      let selectedOption = $('input[name="mode_set_name"]:checked');
      let modeValue = selectedOption.attr('mode');
      if (modeValue) {
          console.log("Selected mode: " + modeValue);
          serverConnectionConfig.speedMode = modeValue;
      } else {
          console.log("No option selected");
      }
  })

  layui.form.render();

  currentRegionServerList = null; // 清空列表
  serverDelayData = []; // 清空测试历史延迟
  window.clearInterval(LatencyTestInterval);
  window.clearInterval(LatencyTestTimeout);
  $("[page='server_list']").on('click', function(event) {
      if(!currentRegionServerList) {
          layer.msg('请先选择区服');
          setTimeout(() => { 
              $("[page='server_sort']").trigger("click");
          }, 1);
          return; 
      }
      $(".server_list").show()
      $(".all_server").hide()
  });
  // 区服列表
  $("[page='server_sort']").on('click', function(event) {
      $(".all_server").show();
      $(".server_list").hide();
  });

  // 写入加速配置
  currentGameSpeedConfig = Api.getGameConfig(gameid);
  $("[page='server_sort']").trigger("click");
  $(".all_server").html("");
  
  if(currentGameSpeedConfig.Server_CountryCode == "" || currentGameSpeedConfig.Server_CountryCode == null){
      layer.msg('此游戏暂无可用区服');
      return; 
  }
  let currentGameServerRegions = Api.getServerRegions();
  let Server_CountryCode_arry = currentGameSpeedConfig.Server_CountryCode.split(',')
  $.each(Server_CountryCode_arry, function(i, field_CountryCode) {
      $.each(currentGameServerRegions, function(i, field){
          if (field_CountryCode != field.CountryCode) {
              return; 
          }
          $(".all_server").append(`
              <button type="button" class="layui-btn layui-btn-normal" id="server_sort_${field.id}" onclick="getRegionServerList('${field.CountryCode}');"><img src="static/img/Flag/${field.Flag.toLowerCase()}.png" class="Flag"><p>${field.name}</p></button>
          `);
      });
  });
  // 上次选择的区服
  let last_time_region = localStorage.getItem('last_time_region_' + (gameid + ""));
  if (last_time_region) {
      console.log("上次选择的服务器" , last_time_region);
      getRegionServerList(last_time_region);
  }

  if (currentGameSpeedConfig.nf2_config) {
      $('.mode_set [mode="nf2_start"]').removeAttr('disabled');
  }
  if (currentGameSpeedConfig.net_config) {
      $('.mode_set [mode="wintun_start"]').removeAttr('disabled');
  }

  // 读取用户选择的模式
  let last_time_mode = localStorage.getItem('last_time_mode_' + gameid);

  if(!last_time_mode) {
      $('.mode_set [mode="nf2_start"]').trigger("click");
      $('.mode_set [mode="wintun_start"]').trigger("click");
  } else {
      $(`.mode_set [mode="${last_time_mode}"]`).trigger("click");
  }

  layui.form.render();
}


/**
 * 获取指定区服服务器列表
 * @param {String} sort 
 * @returns 
 */
function getRegionServerList(sort) {
  window.clearInterval(LatencyTestInterval);
  window.clearInterval(LatencyTestTimeout);
  $(".server_list .tablelist").hide()
  $(".server_list .serverload").show()
  currentRegionServerList = null; // 清空列表
  serverDelayData = []; // 清空测试历史延迟
  serverConnectionConfig = []; // 清除连接历史
  renderServerList(); // 渲染列表
  try {
      currentRegionServerList = Api.getRegionServers(sort);
      console.log(currentRegionServerList);
  } catch {
      $("[page='server_sort']").trigger("click");
      layer.msg('当前地区服务器获取失败');
  }
  $("[page='server_list']").trigger("click");
  if (!currentRegionServerList) {
      layer.msg('当前地区服务器为空!');
      $("[page='server_sort']").trigger("click");
      return; 
  }
  
  // 修改所有对象的name字段
  currentRegionServerList.forEach(function(item) {
      item.name += "-" + item.id; // 将id值添加到name字段后面
      item.ping = "<p class='server_ms'>测速中</p>";
      item.netok= `<netok> <canvas id="serverDelayCanvas_${item.test_ip}"  width="162" height="32"></canvas> </netok>`;
      
      if (item.tag == "official") {
          item.tag = `
          <div title="官方服务器">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shield-fill-check" viewBox="0 0 16 16" style="color: rgb(0 255 102 / 75%);    margin-top: 6px;">
                <path fill-rule="evenodd" d="M8 14.933a.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0   0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067v13.866zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c  .596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 0 1-2.517 2.453 7.159 7.159 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 0 1-1.048-.625 11.777 11.777 0 0 1  -2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 62.456 62.456 0 0 1 5.072.56z"/>
              </svg>
          </div>`;
      }
      else if (item.tag == "community") {
          item.tag = `
          <div title="社区服务器">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-shield-fill-check" viewBox="0 0 16 16" style="color: #ffd600d4;    margin-top: 6px;">
                <path fill-rule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm-.55 8.502L7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0zM8.002 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
          </div>`;
      }
  });

  renderServerList(); // 渲染列表
  $(".server_list_page_body load").show();

  // 批量开测
  try {
    window.clearInterval(LatencyTestInterval);
    window.clearInterval(LatencyTestTimeout);
  } catch (error) {
    console.log("可能没定时器" ,error);
  }
  LatencyTestInterval = window.setInterval(function() {
      $.each(currentRegionServerList, function(i, field) {
          const pingdata = {
                mode: "ping_server_list",
                host: field.test_ip + ":" + field.test_port,
                pingid: "ping_server_list"
          };
          ipc.send('ping', pingdata);
      })
  },1000 * .5);
  
  // 测16秒结束
  LatencyTestTimeout = setTimeout(function() {
      if ($('.server_ms').text().trim() === "测速中") {
          $('.server_ms').text("状态未知");
      }
      window.clearInterval(LatencyTestInterval);  // 去除定时器
      window.clearInterval(LatencyTestTimeout);  // 去除定时器
      console.log('Cleared All Unfinished Latency Test Timers.');
  }, 1000 * 16);
  
  // 整的差不多了，等1s 刷新列表
  setTimeout(function() {
      renderServerList();
      $(".server_list .tablelist").show();
      $(".server_list_page_body load").hide();
  }, 1000 * 1);
}

/**
 * 渲染服务器列表
 */
function renderServerList() {

  // 渲染数据
  layui.use('table', function() {
    let table = layui.table;
    
    // 已知数据渲染
    table.render({
      elem: '#ID-table-data',
      cols: [[ //标题栏
        {field: 'name', title: '节点', width: 350},
        {field: 'provider', title: "提供者", width: 150},
        {field: 'netok', title: '网络质量', width: 180},
        {field: 'ping', title: '延迟',sort: true},
      //   {field: 'speed_mode', title: '模式',sort: true},
      ]],
      data: currentRegionServerList,
      height: 382,
      width: 774,
      escape: false, // 不开启 HTML 编码
      initSort: {
        field: 'ping_initSort', // 按 延迟 字段排序
        type: 'asc' // 降序排序
      },
      
      //skin: 'line', // 表格风格
      //even: true,
      // page: true, // 是否显示分页
      // limits: [5, 10, 15],
      // limit: 5 // 每页默认显示的数量
    });
    
    // listener
    table.on('row(ID-table-data)', function(obj){
        let data = obj.data;
        serverConnectionConfig = data;
        let modeValue = $('input[name="mode_set_name"]:checked').attr('mode');
        if (modeValue) {
            serverConnectionConfig.speedMode = modeValue
        }
        obj.setRowChecked({
          type: 'radio'
        });
    });
  });
}

/**
 * 更新延时数据到临时数据库 TODO: 似乎有 bug?
 * @param {String} ip 
 * @param {*} delay 
 */
function updateDelayData(ip, delay) {
  // 检查是否存在对应的 IP 地址
  let existingEntry = serverDelayData.find(function(entry) {
      return entry.ip === ip;
  });

  // 如果不存在，创建一个新的对象
  if (!existingEntry) {
      serverDelayData.push({
          ip: ip,
          delays: [delay]
      });
  } else {
      // 如果存在，添加延迟数据
      existingEntry.delays.push(delay);
  }
}

/**
 * 更新延时 canvas
 * @param {String} ip 
 * @returns 
 */
function updateServerDelayData(ip) {
  let canvas = document.getElementById('serverDelayCanvas_' + ip);
  try {
      ctx = canvas.getContext('2d');
  } catch (error) {
      // console.error('Error getting 2D context for Canvas:', error);
      // 这里可以进行其他的错误处理操作，比如使用备用方案或给用户提示
      return;
  }
  
  // 定义一些参数
  let numBars = 16; // 竖条数量
  let barWidth = canvas.width / numBars; // 竖条的宽度

  // 模拟延迟数据
  let delayValues =  getDelaysByIp(ip);

  // 渲染函数
  function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // 清空Canvas

      // 只绘制最新的50条数据 实际上32条
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

  // 初始化渲染
  render();
}

/**
 * 从临时数据库中找到Ip的delays
 * @param {String} ip 
 * @returns 
 */
function getDelaysByIp(ip) {
  // 查找匹配的 IP 地址
  var entry = serverDelayData.find(function(entry) {
      return entry.ip === ip;
  });

  // 如果找到匹配的条目，则返回延迟数组，否则返回 null
  return entry ? entry.delays : null;
}
