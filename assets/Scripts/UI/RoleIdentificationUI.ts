// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { EventsName } from "../EventsName";
import { Global } from "../Global";
import PlatformBytedance from "../Tools/PlatformBytedance";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property({
        displayName:'鉴定开启提示文字',
    })
    unLockText: string = '神秘力量帮助你直接看穿一切';

    @property({
        displayName:'鉴定锁住提示文字',
    })
    lockText: string = '神秘力量还需等待：';

    node_AD: cc.Node = null;
    node_User: cc.Node = null;
    lbSkipTime: cc.Label = null;
    lbDec: cc.Label = null;
    onLoad () {
        this.node_AD = this.node.getChildByName("ad");
        this.node_User = this.node.getChildByName("use");
        this.lbSkipTime = this.node_AD.getChildByName("lbDec").getComponent(cc.Label);
        this.lbDec = this.node.getChildByName("lbDec").getComponent(cc.Label);
        this.node.on(cc.Node.EventType.TOUCH_START, () => {
            this.node.active = false;
        }, this);
    }

    start () {
        this.refreshState();
    }
    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    update (dt) {
        const currentTime = Global.datetime.getTime();
        const timeDiff = currentTime - Global.playerData.lastSkipTime;
        const oneHour = 60 * 60 * 1000;

        if (timeDiff >= oneHour) {
            if(this.node_AD.active){
                this.node_AD.active = false;
                this.node_User.active = true;
            }
        } else {
            const remainingTime = oneHour - timeDiff;
            const hours = Math.floor(remainingTime / (60 * 60 * 1000));
            const minutes = Math.floor(remainingTime / (60 * 1000));
            const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
            this.lbSkipTime.string = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    refreshState(){
        var time = new Date().getTime();
        var isSkipUnlock = time - Global.playerData.lastSkipTime >= 60 * 60 * 1000;
        this.node_AD.active = !isSkipUnlock;
        this.node_User.active = isSkipUnlock;
        this.lbDec.string = isSkipUnlock ? this.unLockText : this.lockText;
    }

    btnEvent_btnSkip(){
        Global.reSetLastSkipTime();
        //跳过事件
        cc.game.emit(EventsName.SKIPROLE);

        this.refreshState();
        this.node.active = false;
    }

    btnEvent_btnVideoSkip(){
        PlatformBytedance.Instance.showVideo(() => {
            Global.videoReFreshSkipTime();
        }, () => {
            
        }, () => {

        });
    }
}
