/*
* 外部打开 url
* url: 需要打开的 url
* */
function open_url(url) {
  ipc.send('openurl', url);
}

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
