// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    initPos:cc.Vec3 = cc.Vec3.ZERO;
    touchStartPos:cc.Vec3;
    onLoad () {
        this.node.on(cc.Node.EventType.TOUCH_START,this.touchStart,this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.touchMove, this);
    }

    protected onEnable(): void {
        this.node.position = this.initPos;
    }

    touchStart(){
        this.touchStartPos = this.node.position;
        this.node.setSiblingIndex(Global.flag_FormIndex);
    }

    touchMove(touch:cc.Touch, event){
        let startPos = touch.getStartLocation();
        let endPos = touch.getLocation();
        let deltaPos = endPos.sub(startPos);
        this.node.position = this.touchStartPos.add(cc.v3(deltaPos));
    }

}
