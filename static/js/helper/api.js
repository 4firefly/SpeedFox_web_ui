class SFApi {
  constructor (API_BASE, product) {
    this.host = API_BASE;
    this.product = product;
  }
  _getJSON(url, sign) {
    console.log(url);
    let new_url = new URL(url);
    let JSONdata;
    new_url.searchParams.append('product', this.product);
    if (sign) {
      new_url.searchParams.append('user_code', this.token);
    }
    new_url = new_url.href.toString();
    $.getJSON({ async: false, url: new_url })
    .done(function(data) {
      JSONdata = data;
    })
    .fail(function(xhr, status, error) {
      console.error("_getJSON Failed!" + error,status,xhr);
      layer.msg('数据请求失败 <br>返回码:' + xhr.status);
    });
    return JSONdata;
  }
  setToken (token) {
    this.token = token;
  }
  getUserInfo() {
    let res = this._getJSON(
      `${this.host}/api/v2/?mode=user_info`,
      true);
    return res;
  }
  getGameList() {
    let res = this._getJSON(
      `${this.host}/api/v2/?mode=game_list`,
      false);
    return res;
  }
  getGameConfig(gameid) {
    let res = this._getJSON(
      `${this.host}/api/v2/?mode=game_config&id=${gameid}`,
      true
    );
    return res;
  }
  getServerRegions() {
    let res = this._getJSON(
      `${this.host}/api/v2/?mode=server_sort`,
      true
    );
    return res;
  }
  getRegionServers(reg) {
    let res = this._getJSON(
      `${this.host}/api/v2/?mode=server_list&CountryCode=${reg}`,
      true
    );
    return res;
  }
  getServerConfig(serverID) {
    let res = this._getJSON(
      `${this.host}/api/v2/?mode=server_info&sid=${serverID}`,
      true
    );
    return res;
  }
  buildRESUrl() {

  }
  uploadUserData(session_id, server_id, game_id, speed, flow, ping, version) {
    let res = this._getJSON(
      `${this.host}/api/v2/?mode=server_user_info_update&speed_session_id=${session_id}&server=${server_id}&game=${game_id}&speed=${speed}&flow=${flow}&ping=${ping}&version=${version}`,
      true
    );
    return res;
  }
}
