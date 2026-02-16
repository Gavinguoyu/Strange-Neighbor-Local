import { EventsName } from "../EventsName";
import DataConfig from "../Game/DataConfig";
import { Global } from "../Global";
import PlatformBytedance from "../Tools/PlatformBytedance";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    
    goNode:cc.Node = null;
    rewardNode:cc.Node = null;

    btnGo:cc.Button = null;
    btnOk:cc.Button = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.goNode = this.node.getChildByName("go");
        this.rewardNode = this.node.getChildByName("reward");
        this.btnGo = this.goNode.getChildByName("btnGo").getComponent(cc.Button);
        this.btnOk = this.goNode.getChildByName("btnOk").getComponent(cc.Button);

        this.rewardNode.getChildByName("lbCoin").getComponentInChildren(cc.Label).string = "X" + DataConfig.inst.sideGiftValue.toString();
    }

    // update (dt) {}

    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
        
        if(PlatformBytedance.Instance.islaunchFromSide()){
            this.goNode.active = false;
            this.rewardNode.active = true;
        }
        else{
            this.goNode.active = true;
            this.rewardNode.active = false;
            var canJumpToSide = PlatformBytedance.Instance.canJumpToSide();
            this.btnGo.node.active = canJumpToSide;
            this.btnOk.node.active = !canJumpToSide;
        }
    }

    btnEvent_btnGo(){
        console.log("btnGo click1");
        if (PlatformBytedance.Instance.islaunchFromSide() && PlatformBytedance.Instance.canJumpToSide()) {
            console.log("btnGo click2");
            this.node.active = false;
            return PlatformBytedance.Instance.navigateToScene();
        }
        console.log("btnGo click3");
        this.node.active = false;
    }

    btnEvent_Close(){
        this.node.active = false;
    }

    btnEvent_Reward(){
        Global.getTime(() => {
            Global.playerData.coin += DataConfig.inst.sideGiftValue;
            Global.getSideGiftTime = Global.datetime.getTime();
            cc.game.emit(EventsName.REFRESHGIFTBTN);
        });
        this.node.active = false;
    }
}
