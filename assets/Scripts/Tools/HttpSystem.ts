import GameManager from "../Game/GameManager";
import { Global } from "../Global";
import Guide from "./Guide";
import PlatformBytedance from "./PlatformBytedance";
import Tool from "./Tool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HttpSystem {

    static Get(e, t, o) {
        e += "?";
        var i = true;
        for (var n in t) {
            if (i) {
            e += n + "=" + t[n];
            i = false;
            } else {
            e += "&" + n + "=" + t[n];
            }
        }
        console.log("Get url=", e);
        var a = new XMLHttpRequest();
        a.onreadystatechange = function () {
            if (4 == a.readyState) {
            if (a.status >= 200 && a.status < 400) {
                var e = a.responseText;
                if (e) {
                var t = JSON.parse(e);
                o(t);
                } else {
                console.log("HttpSystem 返回数据不存在");
                o(false);
                }
            } else {
                console.log("HttpSystem 请求失败");
                o(false);
            }
            }
        };
        a.open("GET", e, true);
        a.send();
    }

    static Post(e, t, o) {
        var i = {};
        for (var n in t) i[n] = t[n];
        console.log("Post url=", e);
        console.log("Post postContent=", i);
        var a = new XMLHttpRequest();
        a.onreadystatechange = function () {
            if (4 == a.readyState) {``
            if (a.status >= 200 && a.status < 400) {
                var e = a.responseText;
                console.log(e);
                if (e) {
                var t = JSON.parse(e);
                o(t);
                } else {
                console.log("HttpSystem 返回数据不存在");
                o(false);
                }
            } else {
                console.log("HttpSystem 请求失败");
                o(false);
            }
            }
        };
        a.open("POST", e);
        a.setRequestHeader("Access-Control-Allow-Origin", "*");
        a.setRequestHeader("Content-type", "application/json; charset=utf-8");
        a.send(JSON.stringify(i));
    }
   static updatePlayerData(){
        if (Global.playerData.openId) {
            this.Get("http://101.200.240.23:4443/admin/gameapi/get_cloud_user_data", {
                userid: Global.playerData.openId
            }, (t) => {
                if (!t.errcode) {
                    for (const key in Global.playerData) {
                        if(t[key]){
                            Global.playerData[key] = t[key];
                        }
                    }
                }
            });
        }
    }
    
    static uploadPlayerData(key, value){
        cc.sys.localStorage.setItem("PlayerData", JSON.stringify(Global.playerData));
        if(!PlatformBytedance.Instance.isTTPlatform) return;

        this.Post("http://101.200.240.23:4443/admin/gameapi/set_cloud_user_data", {
            userid: Global.playerData.openId,
            key: key,
            value: value
        }, (t) => {
            if(t.errcode){
                console.log("上传玩家数据失败");
            }
        })
    }
    
    // uploadPlayerData = function (e) {
    //     if (Global.playerData.openId && !(Global.playerData.version <= Global.playerData.serverDataVersion)) {
    //         Global.playerData.version < 10 && (Global.playerData.version = 10);
    //         var t = JSON.stringify(Global.playerData);
    //         if (t) {
    //             var o = Tool.base64Encode(t);
    //             o = encodeURIComponent(o);
    //             console.log("encodeStr: ", o);
    //             console.log("更新服务器用户数据上传");
    //             this.Post("http://101.200.240.23:4443/admin/gameapi/save_cloud_user_data", {
    //                 userid: Global.playerData.openId,
    //                 user_data: o
    //             }, function (t) {
    //             console.log("更新服务器用户数据上传返回:", t);
    //             if (!t.errcode) {
    //                 Global.playerData.serverDataVersion = Global.playerData.version;
    //                 console.log("更新服务器用户数据上传返回 version:", Global.playerData.version);
    //                 e && e();
    //             }
    //             });
    //         }
    //     }
    // }

    // checkUpdateOrUploadData = function (e, t, o, n) {
    //     var r = this;
    //     undefined === e && (e = true);
    //     undefined === t && (t = null);
    //     undefined === o && (o = null);
    //     undefined === n && (n = null);
    //     console.log("checkUpdateOrUploadData PlayerData.data.openId= ", Global.playerData.openId);
    //     if (Global.playerData.openId) {
    //       Global.setUpdateServerTime();
    //       console.log("刷新本地或服务器数据");
    //       this.Get("http://101.200.240.23:4443/admin/Gameapi/get_cloud_user_data", {
    //         userid: Global.playerData.openId
    //       }, function (i) {
    //         console.log("刷新本地或服务器数据返回=", i);
    //         if (i) {
    //           Global.isGetServerData = true;
    //           var c = i.data;
    //           if ("" == c || !c) {
    //             console.log("更新服务器数据,服务器数据为空");
    //             Global.serverDataVersion = 0;
    //             return void r.uploadPlayerData(t);
    //           }
    //           c = decodeURIComponent(c);
    //           c = Tool.base64Decode(c);
    //           console.log("serverPlayerString: ", c);
    //           if ("" == c || !c) {
    //             console.log("更新服务器数据,反编码失败");
    //             Global.serverDataVersion = 0;
    //             return void r.uploadPlayerData(t);
    //           }
    //           try {
    //             var l = JSON.parse(c + "");
    //             if (!l) {
    //               Global.serverDataVersion = 0;
    //               console.log("更新服务器数据,解析用户数据失败1");
    //               return void r.uploadPlayerData(t);
    //             }
    //             console.log("PlayerData.data.version=", Global.playerData.version);
    //             console.log("serverPlayerData.version=", l.version);
    //             if (l.version == Global.playerData.version) {
    //               console.log("服务器和本地数据版本一致 version=", Global.playerData.version);
    //               n && n();
    //             } else if (Global.playerData.version > l.version) {
    //               console.log("本地数据更新服务器数据");
    //               r.uploadPlayerData(t);
    //             } else if (e && l.version > Global.playerData.version) {
    //               console.log("服务器数据更新本地数据 serverPlayerData=", l);
    //               Global.playerData = l;
    //               //Global.resetData();
    //               o && o();
    //             }
    //           } catch (u) {
    //             console.error("更新服务器数据,解析用户数据失败error=", u);
    //             Global.serverDataVersion = 0;
    //             r.uploadPlayerData(t);
    //           }
    //         } else {
    //           r.uploadPlayerData(t);
    //         }
    //       });
    //     }
    // }
}
export {HttpSystem};
