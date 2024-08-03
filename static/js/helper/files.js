/*
* 外部打开 url
* url: 需要打开的 url
* */
function open_url(url) {
  ipc.send('openurl', url);
}
