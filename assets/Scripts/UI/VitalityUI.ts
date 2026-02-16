// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { EventsName } from "../EventsName";
import { Global } from "../Global";
import PlatformBytedance from "../Tools/PlatformBytedance";
import Tool from "../Tools/Tool";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    btnVideo:cc.Button = null;
    lbValue:cc.Label = null;
    lbTime:cc.Label = null;
    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START, () => {
            this.node.active = false;
        }, this);
        this.node_recover = this.node.getChildByName("recover");;
        this.btnVideo = this.node_recover.getChildByName("btnVideo").getComponent(cc.Button);
        this.lbValue = this.node.getChildByName("lbValue").getComponent(cc.Label);
        this.lbTime = this.node_recover.getChildByName("lbTime").getComponent(cc.Label);
        cc.game.on(EventsName.UPDATE_VITALITY, this.refreshVitality, this);
    }

    node_recover:cc.Node = null;
    start () {
        this.refreshVitality();
    }

    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
        this.schedule(this.secondUpdate, 1);
    }

    protected onDisable(): void {
        this.unschedule(this.secondUpdate);
    }

    // update (dt) {}
    secondUpdate(){
        if(Global.playerData.vitality >= Global.maxVitality) return;

        var durationTime = 5*60*1000 - (Global.datetime.getTime() - Global.playerData.lastUpdateVitalityTime);
        this.lbTime.string = Tool.formatDateToMinutesAndSeconds(durationTime);
    }

    refreshVitality(){
        this.lbValue.string = Global.playerData.vitality.toString();
        this.node_recover.active = Global.playerData.vitality < Global.maxVitality;
    }

    btnEvent_Video(){
        var t = this;
        PlatformBytedance.Instance.showVideo(() => {
            this.node.active = false;
            Global.setVitality(Global.playerData.vitality + 5);
        },null, null);
    }
}
