// Learn TypeScript:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/2.4/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class DataConfig extends cc.Component {

    @property({
        displayName:'侧边栏奖励数值',
    })
    sideGiftValue: number = 10;

    static inst: DataConfig = null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        DataConfig.inst = this;
    }

}
