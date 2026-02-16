// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import { EventsName } from "../EventsName";
import { Global } from "../Global";
import HttpSystem from "./HttpSystem";
import { PlatformBytedance } from "./PlatformBytedance";
import Tool from "./Tool";

const {ccclass, property} = cc._decorator;

@ccclass("GuideConfig")
export class GuideConfig{
    @property({
        type:cc.Boolean,
        displayName: '是否自动弹出'
    })
    isAutoShow = true;

    @property({
        type:cc.Node,
        displayName: '节点'
    })
    node = null;

    @property({
        type:cc.Float,
        displayName: '自动关闭时间',
        visible: function(){
            return this.isAutoShow;
        }
    })
    closetime = 0;
    
    @property({
        type:cc.Float,
        displayName: '延迟时间'
    })
    delaytime = 0;

    @property({
        type:cc.String,
        displayName: '提示文字'
    })
    text = '请点击这里';

}

@ccclass
export default class Guide extends cc.Component {

    @property({
        type:cc.Node,
        visible: false,
        displayName:'引导遮罩'
    })
    blackNode:cc.Node = null;

    @property({
        type:cc.Node,
        visible: false,
        displayName:'引导禁触'
    })
    maskNode:cc.Node = null;

    _skeleton:sp.Skeleton = null;//手指动画
    _tipsLabel:cc.RichText = null;//提示文字

    _actionArray = [];

    _currentButton:cc.Button = null
    // LIFE-CYCLE CALLBACKS:
    static init(){
        cc.log('Guide:'+Global.guide);
        
        if(!Global.guide.isAllGuide){
            let sceneName = cc.director.getScene().name;
            //如果是当前的场景名字
            cc.log(sceneName);
            let script = cc.Canvas.instance.node.addComponent(Guide);
            // if(Global.guide.json[Global.guide.index].scenename == sceneName){
            //     //给当前canvas添加guide脚本
            // }
            
            //发送消息第几条开始引导
        }
    }

    static checkGuide(){
        Global.remotebundle.load('res/Json/GuideConfig',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
            var guideconfig = jsonAsset.json;
            
            var checkGuide = () => {
                for (let index = 0; index < guideconfig[guideconfig.length-1].NO; index++) {
                    if(index == Global.guide.isGuideArray.length){
                        Global.guide.isGuideArray.push(false);
                    }
                    
                }
                let completedIndex = 0;//第几阶段引导
                Global.guide.isGuideArray.forEach((element,index) => {
                    if(element){
                        completedIndex = index+1;
                    }
                    else{
                        if (Global.guide.isAllGuide) {
                            Global.guide.isAllGuide = false;
                        }
                    }
                });
                if(completedIndex ==  guideconfig[guideconfig.length-1].NO){
                    Global.guide.isAllGuide = true;
                }
                Global.guide.json = guideconfig;
                
                //到第几行引导了6
                try {
                    Global.guide.json.forEach((element,index) => {
                        if(element.NO == (completedIndex+1)){
                            Global.guide.index = index;
                            throw new Error("");
                            
                        }
                    });
                } catch (error) {
                    
                }
            }
            if(PlatformBytedance.Instance.isTTPlatform && Global.playerData.openId){
                HttpSystem.Get("http://101.200.240.23:4443/admin/gameapi/get_cloud_user_GuideConfig", {
                    userId:Global.playerData.openId,
                },(e) => {
                    if(!e.errcode){
                        Global.guide = JSON.parse(e.data);
                        checkGuide();
                    }
                    else{
                        var guide = cc.sys.localStorage.getItem('Guide');
                        if(guide){
                            Global.guide = JSON.parse(guide);
                        }
                        checkGuide();
                    }
                });
            }
            else{
                var guide = cc.sys.localStorage.getItem('Guide');
                if(guide){
                    Global.guide = JSON.parse(guide);
                }
                checkGuide();
            }
        });
    }

    onLoad () {
        cc.game.on(EventsName.GUIDE, this.callNext, this);
        cc.game.on(EventsName.GUIDE_FAILED, this._guideFailed, this);
    }

    start () {
        cc.Camera.findCamera(this.node).cullingMask = 1<<0;
        let newCameraNode = new cc.Node();
        this.node.addChild(newCameraNode);
        let newCamera = newCameraNode.addComponent(cc.Camera);
        newCamera.depth = 0;
        newCamera.cullingMask = 1<<1;
        newCamera.clearFlags = cc.Camera.ClearFlags.DEPTH + cc.Camera.ClearFlags.STENCIL;

        this.blackNode = new cc.Node();
        let texture = new cc.Texture2D();
        let spriteFrame = new cc.SpriteFrame();
        texture.initWithData(new Uint8Array([0,0,0]), cc.Texture2D.PixelFormat.RGB888,1,1);
        spriteFrame.setTexture(texture);
        spriteFrame.setRect(cc.rect(0,0,cc.winSize.width,cc.winSize.height));
        this.blackNode.addComponent(cc.Sprite).spriteFrame = spriteFrame;
        this.blackNode.color = cc.color(0,0,0);
        this.blackNode.opacity = 60;
        this.blackNode.group = 'guide';
        this.node.addChild(this.blackNode);
        this.blackNode.setSiblingIndex(0);

        this.maskNode = new cc.Node();
        //this.maskNode.setContentSize(cc.winSize);
        let widget = this.maskNode.addComponent(cc.Widget);
        widget.isAlignLeft = true;
        widget.left = 0;
        widget.isAlignRight = true;
        widget.right = 0;
        widget.isAlignTop = true;
        widget.top = 0;
        widget.isAlignBottom = true;
        widget.bottom = 0;
        widget.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;//窗口变化也变化
        this.maskNode.addComponent(cc.BlockInputEvents);
        this.node.addChild(this.maskNode);

        let skeletonNode = new cc.Node();
        skeletonNode.group = 'guide';
        this._skeleton = skeletonNode.addComponent(sp.Skeleton);
        this.maskNode.addChild(skeletonNode);
        Global.remotebundle.load('res/UI/other_14',sp.SkeletonData,  (err, data:sp.SkeletonData)=> {
            this._skeleton.skeletonData = data;
            this._fingerShow();
        });

        Global.remotebundle.load('res/UI/TalkNode',cc.Prefab,  (err, data:cc.Prefab)=> {
            let node = cc.instantiate(data);
            node.group = 'guide';
            this.maskNode.addChild(node);
            this._tipsLabel = node.getChildByName("New Node").getChildByName('content2').getComponent(cc.RichText);
            this._tipsShow();
        });

        //this.maskNode.active = true;
        //因为初始化的时候没有根据分辨率来，所以在下一帧调用
        if(Global.guide.json[Global.guide.index].isAutoShow === 1){
            this.scheduleOnce(this.nextGuide,Global.guide.json[Global.guide.index].delaytime);
        }
        //this.nextGuide();
    }

    nextGuide(){
        this.blackNode.active = true;
        this.maskNode.active = true;
        this.maskNode.setSiblingIndex(this.node.childrenCount-1);

        let nowNodeConfig = Global.guide.json[Global.guide.index];
        cc.log(Global.guide.index+'  '+Global.guide.json)
        let node = cc.find(nowNodeConfig.path);
        node.group = 'guide';

        let newNode = new cc.Node('btn');
        newNode.setContentSize(node.getContentSize());
        let position = node.parent.convertToWorldSpaceAR(node.getPosition());
        position = this.maskNode.convertToNodeSpaceAR(position);
        this.maskNode.addChild(newNode);
        newNode.setPosition(position);
        // newNode.setSiblingIndex(0);
        if(!nowNodeConfig.isTouchMove){
            let nowBtn = node.getComponent(cc.Button);
            let newBtn = newNode.addComponent(cc.Button);
    
            if (nowBtn) {
                // let handler = nowBtn.clickEvents[0];
                // newBtn.clickEvents.push(handler);
                this._currentButton = nowBtn;
            }
            else{
    
            }
            
            if(nowNodeConfig.closetime > 0){
                this.scheduleOnce(this.next, nowNodeConfig.closetime);
            }
            else{
                var clickEventHandler = new cc.Component.EventHandler();
                clickEventHandler.target = this.node; // 这个 node 节点是你的事件处理代码组件所属的节点
                clickEventHandler.component = "Guide";// 这个是代码文件名
                clickEventHandler.handler = "next";
                newBtn.clickEvents.push(clickEventHandler);
            }
        }
        else{
            var idCardStartTouchPos;
            var fingetStartPos;
            newNode.on(cc.Node.EventType.TOUCH_START,() => {
                idCardStartTouchPos = newNode.position;
                fingetStartPos = this._skeleton.node.position;
           },this);
           newNode.on(cc.Node.EventType.TOUCH_MOVE, (touch:cc.Touch, event) => {
                let startPos = touch.getStartLocation();
                let endPos = touch.getLocation();
                let deltaPos = endPos.sub(startPos);
                node.setPosition(idCardStartTouchPos.add(cc.v3(deltaPos)));
                newNode.setPosition(idCardStartTouchPos.add(cc.v3(deltaPos)));
                this._skeleton.node.setPosition(fingetStartPos.add(cc.v3(deltaPos)));
           },this);
           newNode.on(cc.Node.EventType.TOUCH_END,() => {
                if(newNode.position.sub(idCardStartTouchPos).mag() > 30){
                    node.setPosition(newNode.position);
                    this.next();
                }
           },this);
        }
        

        if(Global.guide.json[Global.guide.index].isPause === 1){
            //需要暂停
            //cc.game.emit(EventsName.SET_GAME_PAUSE, true);
            //this._actionArray = cc.director.getActionManager().pauseAllRunningActions();
            let animation = node.getComponent(cc.Animation);
            if(animation){
                animation.pause();
            }
        }
        if(Global.guide.json[Global.guide.index].isTouchSwallow === 1){
            //需要穿透
            //this.maskNode.removeComponent(cc.BlockInputEvents);
            this.maskNode.active = false;
            this.node.on(cc.Node.EventType.TOUCH_START, this.next, this, true);
            this.node.on(cc.Node.EventType.TOUCH_END, this.next, this, true);
            // this.node['_touchListener'].setSwallowTouches(false);
        }
        this._fingerShow();
        this._tipsShow();
    }

    next(){
        //响应事件
        if(this._currentButton){
            let events = this._currentButton.clickEvents;
            let sender = new cc.Event.EventTouch(null,null);
            sender.target = this._currentButton.node;
            events.forEach(event => {
                event.emit([sender, event.customEventData]);
            });
            
            this._currentButton = null;
        }
        
        

        let nowNodeConfig = Global.guide.json[Global.guide.index];
        let node = cc.find(nowNodeConfig.path);
        if(node){
            //切场景时候可能已为null
            node.group = 'default';
        }

        if(Global.guide.json[Global.guide.index].isPause === 1){
            //需要恢复
            //cc.game.emit(EventsName.SET_GAME_PAUSE, false);
            //cc.director.getActionManager().resumeTargets(this._actionArray);
            let animation = node.getComponent(cc.Animation);
            if(animation){
                animation.resume();
            }
        }
        if(Global.guide.json[Global.guide.index].isTouchSwallow === 1){
            //需要穿透
            //this.maskNode.removeComponent(cc.BlockInputEvents);
            this.maskNode.active = true;
            this.node.off(cc.Node.EventType.TOUCH_START, this.next, this, true);
            this.node.off(cc.Node.EventType.TOUCH_END, this.next, this, true);
            // this.node['_touchListener'].setSwallowTouches(false);
        }

        this.blackNode.active = false;
        this.maskNode.getChildByName('btn').removeFromParent();
        this._tipsLabel.node.parent.active = false;
        this._skeleton.node.active = false;
        if(Global.guide.json[Global.guide.index].canOperate === 1){
            //需要能继续操作
            this.maskNode.active = false;
        }
        if(Global.guide.index+1 >= Global.guide.json.length){
            Global.guide.isAllGuide = true;
            
            this.close();
        }
        else{
            if(Global.guide.json[Global.guide.index+1].isAutoShow === 1){
                this.scheduleOnce(this.nextGuide,Global.guide.json[Global.guide.index+1].delaytime);
            }
            else{
                this.maskNode.active = false;
            }
        }
        if(Global.guide.json[Global.guide.index].isRecord === 1){
            //需要记录
            Global.guide.isGuideArray[Global.guide.json[Global.guide.index].NO-1] = true;
            cc.sys.localStorage.setItem('Guide',JSON.stringify(Global.guide));
            HttpSystem.uploadPlayerData("guideConfig", JSON.stringify(Global.guide));
        }

        Global.guide.index++;
        // cc.log(Global.guide.index)
        
    }

    close(){
        this.node.removeComponent('Guide');
    }

    onDestroy(){
        if(this.blackNode){
            this.blackNode.destroy();
        }
        if(this.maskNode){
            this.maskNode.destroy();
        }
    }
    callNext(index?){
        if(index != null){
            //只触发一次
            cc.log(Global.guide.index);
            if(index != Global.guide.index) return;
        }
        this.scheduleOnce(this.nextGuide,Global.guide.json[Global.guide.index].delaytime);
    }

    // update (dt) {}

    _catShot(){
        cc.game.emit(EventsName.GUIDE, 10);
    }

    _guideFailed(index){
        if(index === Global.guide.index){
            this.unschedule(this.nextGuide);
            Global.guide.index --;
            if(Global.guide.json[Global.guide.index].isAutoShow === 1){
                this.scheduleOnce(this.nextGuide,Global.guide.json[Global.guide.index].delaytime);
            }
        }
    }

    _tipsShow(){
        if(this._tipsLabel){
            if(Global.guide.json[Global.guide.index].tips == ''){
                this._tipsLabel.node.parent.active = false;
            }
            else{
                this._tipsLabel.node.parent.active = true;
                // cc.log(Global.guide.json[Global.guide.index].tips);
                this._tipsLabel.string = Global.guide.json[Global.guide.index].tips;
                this._tipsLabel.node.parent.position = Tool.vstringToCoord(Global.guide.json[Global.guide.index].tipsPos);
            }
        }
    }

    _fingerShow(){
        if(this._skeleton){
            let nowNodeConfig = Global.guide.json[Global.guide.index];
            if(nowNodeConfig.animename == ''){
                this._skeleton.node.active = false;
            }
            else{
                this._skeleton.node.active = true;
                
                let node = cc.find(nowNodeConfig.path);
                let position = node.parent.convertToWorldSpaceAR(node.getPosition());
                position = this.maskNode.convertToNodeSpaceAR(position);
                this._skeleton.node.setPosition(position);
                this._skeleton.node.scaleX = nowNodeConfig.fingerFlipX ? -1 : 1;
                this._skeleton.setAnimation(0, nowNodeConfig.animename, true);
            }
        }
    }
}
