import { EventsName } from "../EventsName";
import { Global } from "../Global";
import Guide from "../Tools/Guide";
import HttpSystem from "../Tools/HttpSystem";
import GuardWorker from "./GuardWorker";
import { NeighborsDataManager } from "./NeighborsDataManager";
import Settlement from "./Settlement";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GameManager extends cc.Component {
    static instance: GameManager;

    @property(GuardWorker)
    guardWorker: GuardWorker = null;

    onLoad () {
        GameManager.instance = this;
        Settlement.instance = this.node.getComponentInChildren("Settlement");
        Settlement.instance.init();

        Global.flag_FormIndex = this.node.getChildByName("Flag_Index").getSiblingIndex();
    }

    start () {
        cc.game.setFrameRate(59.99);
        cc.game.on(EventsName.GAME_RESTART, this.gameReStart, false);
        if(Global.guide.isAllGuide){
            this.gameContinue();
        }
        else{
            NeighborsDataManager.guideNeighborListInit();
            Global.remotebundle.load('res/UI/Guide',cc.Prefab,  (err, data:cc.Prefab)=> {
                let node = cc.instantiate(data);
                cc.Canvas.instance.node.addChild(node);
                this.guardWorker.guideStart(node);
            }); 
        }
    }

    gameContinue(){
        NeighborsDataManager.setDataFormServer();
        this.guardWorker.gameReStart();
    }

    gameReStart(){
        Global.playerData.gameProgress.roleIndex = 0;
        Settlement.instance.resetScore();
        NeighborsDataManager.neighborListInit();
        this.guardWorker.gameReStart();
    }

    checkUnlockLevel(){
        if(!Global.playerData.levelUnlock[Global.playerData.gameProgress.levelNo]){
            Global.playerData.levelUnlock[Global.playerData.gameProgress.levelNo] = true;
            HttpSystem.uploadPlayerData("levelUnlock", Global.playerData.levelUnlock);
            Global.playerData.wallets++;
        }
    }
}
