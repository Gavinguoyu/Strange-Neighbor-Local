// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { EventsName } from "../EventsName";
import FloorInfo from "../Game/FloorInfo";
import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    floorInfoClass: FloorInfo = null;
    protected onLoad(): void {
        this.floorInfoClass = cc.Canvas.instance.getComponentInChildren(FloorInfo);
        cc.game.on(EventsName.FLOORINFO_CLOSE,() => {
            this.node.getComponentsInChildren(cc.Button).forEach(btn => {
                btn.interactable = true;
            });
        }, this);
    }

    floorButtonEvent(event, customEventData){
        this.floorInfoClass.floorNo = customEventData;
        this.floorInfoClass.node.active = true;
        this.floorInfoClass.node.setSiblingIndex(Global.flag_FormIndex);
        this.node.getComponentsInChildren(cc.Button).forEach(btn => {
            btn.interactable = false;
        });
    }
}
