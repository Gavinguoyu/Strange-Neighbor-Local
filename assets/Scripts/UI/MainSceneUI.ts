import { EventsName } from "../EventsName";
import { Global } from "../Global";
import PlatformBytedance from "../Tools/PlatformBytedance";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    @property(cc.Button)
    btnIdentify: cc.Button = null;

    @property(cc.Node)
    roleIdentificationUI: cc.Node = null;

    @property(cc.Button)
    btnSidebarGift: cc.Button = null;

    @property(cc.Node)
    sideGiftUI: cc.Node = null;

    @property(cc.Button)
    btnVitality: cc.Button = null;

    @property(cc.Node)
    VitalityUI: cc.Node = null;

    //btnIdentifyUnlock: boolean = false;
    lbVitality: cc.Label = null;
    lbSkipTime: cc.Label = null;
    private lastLabelText: string = ''; // 新增变量，用于记录上一次的 label 文本
    onLoad () {
        cc.game.on(EventsName.REFRESHGIFTBTN, this.refreshGiftBtn, this);
        cc.game.on(EventsName.UPDATE_VITALITY, this.refreshVitalityBtn, this);
        cc.game.on(EventsName.SHOWUI, this.showUI, this);
        this.lbSkipTime = this.btnIdentify.node.getComponentInChildren(cc.Label);
        this.schedule(this.secondUpdate, 1);

        this.node.getComponentsInChildren(cc.Button).forEach(button => {
            button.node.on('click', () => {
                cc.audioEngine.playEffect(Global.audioClips.effects_click, false);
            }, this);
        });
        //var time = new Date().getTime();
        //this.btnIdentifyUnlock = time - Global.lastSkipTime >= 60 * 60 * 1000;
    }

    start () {
        this.lbVitality = this.btnVitality.node.getComponentInChildren(cc.Label);
        this.roleIdentificationUI.active = false;
        this.sideGiftUI.active = false;
        this.VitalityUI.active = false;
        CC_DEBUG ? this.node.getChildByName("lbDebug").active = true : this.node.getChildByName("lbDebug").active = false;

        this.refreshVitalityBtn();
    }

    // update (dt) {
        
    // }

    secondUpdate(){
        this.refreshGiftBtn();
        this.refreshSkipBtn();
    }

    refreshSkipBtn(){
        if(!Global.guide.isAllGuide){
            this.btnIdentify.node.active = false;
            return;
        }
        this.btnIdentify.node.active = true;
        const currentTime = Global.datetime.getTime();
        const timeDiff = currentTime - Global.playerData.lastSkipTime;
        const oneHour = 60 * 60 * 1000;

        let newLabelText = '';
        if (timeDiff >= oneHour) {
            //this.btnIdentifyUnlock = true;
            newLabelText = "立即跳过";
        } else {
            //this.btnIdentifyUnlock = false;
            const remainingTime = oneHour - timeDiff;
            // 计算小时
            const hours = Math.floor(remainingTime / (60 * 60 * 1000));
            const minutes = Math.floor(remainingTime / (60 * 1000));
            const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);
            newLabelText = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }

        // 只有当新文本和上一次文本不同时才更新 label
        if (newLabelText!== this.lastLabelText) {
            if (this.lbSkipTime) {
                this.lbSkipTime.string = newLabelText;
                this.lastLabelText = newLabelText; // 更新记录的文本
            }
        }
    }

    refreshGiftBtn(){
        if(PlatformBytedance.Instance.canShowSideGift()){
            if(PlatformBytedance.Instance.islaunchFromSide()){
                this.btnSidebarGift.node.active = false;
                this.sideGiftUI.active = true;
            }
            else{
                this.btnSidebarGift.node.active = true;
            } 
        }
        else{
            this.btnSidebarGift.node.active = false;
        }
    }

    refreshVitalityBtn(){
        this.lbVitality.string  = ": " + Global.playerData.vitality.toString() + " / " + Global.maxVitality.toString();
    }

    showUI(name){
        var node = this.node.getChildByName(name);
        if(node){
            node.active = true;
        }
    }

    btnEvent_btnIdentify(){
        if(Global.playerData.vitality <= 0){
           return; 
        }
        this.roleIdentificationUI.active = true;
    }

    btnEvent_btnVitality(){
        this.VitalityUI.active = true;
    }

    btnEvent_sideGift(){
        this.node.getChildByName("SideGiftUI").active = true;
    }
}
