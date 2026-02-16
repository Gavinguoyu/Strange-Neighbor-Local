import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    walletBtn: cc.Button = null;

    protected onLoad(): void {
        this.walletBtn = this.node.getComponentInChildren(cc.Button);
    }

    protected onEnable(): void {
        this.walletBtn.node.active = Global.wallets > 0;
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    walletBtnEvent(event, customEventData){
        this.walletBtn.interactable = false;
        Global.wallets--;
        this.scheduleOnce(() => {
            if(Global.wallets > 0){
                this.walletBtn.interactable = true;
            }
            else{
                this.walletBtn.node.active = false;
            }
        }, 1);
    }
}
