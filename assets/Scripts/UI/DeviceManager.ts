import { EventsName } from "../EventsName";
import { Global } from "../Global";
import HttpSystem from "../Tools/HttpSystem";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    contentNode: cc.Node = null;

    onLoad () {
        this.contentNode = this.node.getChildByName("Content");
        cc.game.on(EventsName.UPDATE_COIN, this.showDevives, this);
    }

    start () {
        this.showDevives();
        Global.playerData.coin = 100;
    }
    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    showDevives(){
        cc.log(Global.deviceConfig);
        cc.log(Global.playerData.deviceLevel);
        var item0 = this.contentNode.children[0];
        Global.playerData.deviceLevel.forEach((e, index) => {
            var item = this.contentNode.children[index];
            if(!item){
                item = cc.instantiate(item0);
                this.contentNode.addChild(item);
            }
            item.y = item0.y - 300 * index;
            var data = e == 0 ? Global.deviceConfig.find(ele => ele.No == index+1) : Global.deviceConfig.find(ele => ele.No == index+1 && ele.Grade == e+1);
            item.getChildByName("Sprite").getComponent(cc.Sprite).spriteFrame = Global.deviceSprites[data.No - 1];
            item.getChildByName("Name").getComponent(cc.Label).string = data.Name;
            item.getChildByName("Func").getComponent(cc.Label).string = data.Function;
            let upGradeBtn = item.getComponentsInChildren(cc.Button);
            let btnBack = upGradeBtn[0].node.getChildByName("Background");
            var lockNode = btnBack.getChildByName("Lock");
            var unLockNode = btnBack.getChildByName("Unlock");
            lockNode.active = !data.IsUnlock;
            unLockNode.active = data.IsUnlock;
            if(data.IsUnlock){
                unLockNode.getChildByName("Coin").getComponent(cc.Label).string = data.Price;
                upGradeBtn.forEach(btn => {
                    btn.interactable = Global.playerData.coin >= data.Price;
                });
            }
            else{
                upGradeBtn.forEach(btn => {
                    btn.interactable = false;
                });
            }
            upGradeBtn[0].clickEvents[0].customEventData = data;
        });
        cc.log(cc.Canvas.instance.node.getChildByName("BlockTouch").active);
    }

    upGradeBtnEvent(event, customEventData){
        Global.playerData.deviceLevel[customEventData.No - 1] = customEventData.Grade;
        HttpSystem.uploadPlayerData("deviceLevel", Global.playerData.deviceLevel);
        Global.playerData.coin -= customEventData.Price;
    }
}
