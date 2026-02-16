import { EventsName } from "../EventsName";
import { Global } from "../Global";
import Guide from "./Guide";
import HttpSystem from "./HttpSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PlatformBytedance {
    VideoAdPos = "ih2j8n7in29216hi6b";
    isTTPlatform = true;
    static Instance: PlatformBytedance = null;
    static init(){
        this.Instance = new PlatformBytedance();
        this.Instance.isTTPlatform = cc.sys.platform == cc.sys.BYTEDANCE_GAME;
        this.Instance.initRewardVideo();
        this.Instance.initSysInfo();
        this.Instance.checkGetOpenId();
    }

    initRewardVideo = function () {
        var e = this;
        if (this.isTTPlatform && tt.createRewardedVideoAd) {
          this.adRewardVideo = tt.createRewardedVideoAd({
            adUnitId: this.VideoAdPos
          });
          this.adRewardVideo.onClose(function (t) {
            if (t && t.isEnded || undefined === t) {
              if (e.onVideoRewardHandler) {
                e.onVideoRewardHandler();
                e.onVideoRewardHandler = null;
              }
            } else {
              e.onVideoCloseHandler && e.onVideoCloseHandler();
              e.showToast("视频未看完");
            }
          });
          this.adRewardVideo.onError(function (t) {
            console.log("激励视频加载失败", JSON.stringify(t));
            e.onVideoCloseHandler && e.onVideoCloseHandler();
          });
        }
    }

    showVideo = function (successFun, failedFun, pullFun) {
        var i = this;
        if (this.isTTPlatform) {
          this.onVideoRewardHandler = successFun;
          this.onVideoCloseHandler = failedFun;
          this.adRewardVideo.show().then(function () {
            console.log("广告显示成功");
            pullFun && pullFun();
          }).catch(function (e) {
            console.log("广告组件出现问题", e);
            i.adRewardVideo.load().then(function () {
                pullFun && pullFun();
                i.adRewardVideo.show().then(function () {
                    console.log("广告显示成功");
                }).catch(function () {
                    i.onVideoCloseHandler && i.onVideoCloseHandler();
                });
            });
          });
        } else {
            successFun && successFun();
        }
    }
    initSysInfo = function () {
        var e = this;
        if (this.isTTPlatform) {
          this.sysInfo = tt.getSystemInfoSync();
          console.log("this.sysInfo=", this.sysInfo);
          var t = tt.getLaunchOptionsSync();
          console.log("lauchInfo=", t);
          
          console.log("调用tt.onShow");
          tt.onShow(function (t) {
            console.log("启动参数如下：", t.query);
            console.log("来源信息如下：", t.refererInfo);
            console.log("场景值信息如下：", t.scene);
            cc.game.emit(EventsName.REFRESHGIFTBTN);
            e.daren_scene = t.scene;
            ("homepage" === t.launch_from || "homepage" === t.launchFrom) && t.location;
            e.appInfoSync = tt.getAppInfoSync();
          });
          this.appInfoSync = tt.getAppInfoSync();
          console.log("appInfoSync=", this.appInfoSync);
          "Douyin" == this.sysInfo.appName && tt.checkScene && tt.checkScene({
            scene: "sidebar",
            success: function (t) {
              e.supportJumpToSide = true;
              console.log("check scene success: ", t.isExist);
            },
            fail: function (e) {
              console.log("check scene fail:", e);
            }
          });
        }
    }

    navigateToScene = function () {
        console.log("tt.navigateToScene");
        tt.navigateToScene({
            scene: "sidebar",
            success: function () {
                console.log("navigate to scene success");
            },
            fail: function (e) {
                console.log("navigate to scene fail: ", e);
            }
        });
    }

    canJumpToSide = function () {
        return this.supportJumpToSide && tt.navigateToScene;
    }

    islaunchFromSide = function () {
        if (this.daren_scene) {
            return this.daren_scene == ByteSceneValue.抖极侧边栏 || this.daren_scene == ByteSceneValue.抖音侧边栏 || this.daren_scene == ByteSceneValue.测试侧边栏;
        } else {
            console.log("no daren_scene");
            return false;
        }
    }

    canShowSideGift = function () {
        if(cc.sys.platform != cc.sys.BYTEDANCE_GAME){
            return false;
        }

        if(!Global.isNextDay(Global.getSideGiftTime))
            return false;

        return true;
    }

    report = function (e, t) {
        tt.reportAnalytics(e, t);
    }

    checkGetOpenId = function () {
        console.log("checkGetOpenId 1=", Global.playerData.openId);
        if (this.isTTPlatform && !Global.playerData.openId) {
            console.log("checkGetOpenId 2");
            this.getUserId();
        }
        else{
          HttpSystem.updatePlayerData();
        }
    }
    getUserId = function () {
        tt.login({
            force: true,
            success: function (e) {
                var o;
                console.log("login res=", e);
                console.log("login 调用成功" + e.code + " " + e.anonymousCode);
                o = e.code;
                HttpSystem.Get("http://101.200.240.23:4443/admin/api/getopenid", {
                  code: o
                }, function (e) {
                  console.log("getUserId getopenid2 responseJson=", e);
                  if (e) {
                    Global.setOpenId(e.openid);
                  }
                });
            },
            fail: function () {
              console.log("login 调用失败");
            }
        });
    }
}
export{PlatformBytedance};

enum ByteSceneValue{
    测试侧边栏 = "021001",
    抖音侧边栏 = "101001",
    抖极侧边栏 = "990003",
    抖音桌面 = "021020",
    抖极桌面 = "101020",
    测试桌面 = "991020",
};
