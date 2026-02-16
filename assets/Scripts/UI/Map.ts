import { EventsName } from "../EventsName";
import GameManager from "../Game/GameManager";
import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Button)
    levelButtons: cc.Button[] = [];
    
    buttonsSprite: cc.Sprite[] = [];

    infoWindow: cc.Node = null;
    info_Logo: cc.Sprite = null;
    info_Name: cc.Label = null;
    info_Intro: cc.Label = null;
    info_other: cc.Label = null;
    info_Lock: cc.Node = null;
    info_Unlock: cc.Node = null;

    levelNo = 1;

    
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //Global.levelUnlock[1] = true;
        LevelDataConfig.loadData();
        this.levelButtons.forEach((e, index) => {
            this.buttonsSprite.push(e.node.getComponentInChildren(cc.Sprite));
            
            var clickEventHandler = new cc.Component.EventHandler();
            clickEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点，这里就是Button2
            clickEventHandler.component = "Map";//这个是脚本文件名
            clickEventHandler.handler = "levelButtonEvent"; //回调函名称
            clickEventHandler.customEventData = index.toString(); //用户数据
            e.clickEvents.push(clickEventHandler);
        });

        this.infoWindow = this.node.getChildByName("Info Window");
        this.infoWindow.active = false;
        this.info_Logo = this.infoWindow.getChildByName("Logo").getComponent(cc.Sprite);

        this.info_Unlock = this.infoWindow.getChildByName("Unlock");
        this.info_Lock = this.infoWindow.getChildByName("Lock");
        this.info_Name = this.infoWindow.getChildByName("Place Name").getComponent(cc.Label);
        this.info_Intro = this.infoWindow.getChildByName("Introduce").getComponent(cc.Label);
        this.info_other = this.infoWindow.getChildByName("NPC And Sprites").getComponentInChildren(cc.Label);
        this.infoWindow.on(cc.Node.EventType.TOUCH_START, this.closeInfo, this);
    }

    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
        Global.playerData.levelUnlock.forEach((e, index) => {
            this.buttonsSprite[index].spriteFrame = e ? MapSpriteData.unlock[index] : MapSpriteData.lock[index];
        });
    }

    levelButtonEvent(event, customEventData: string){
        this.infoWindow.active = true;
        let index = Number(customEventData);
        this.levelNo = index + 1;
        this.info_Unlock.active = Global.playerData.levelUnlock[index] && Global.playerData.gameProgress.levelNo != this.levelNo;
        this.info_Lock.active = !Global.playerData.levelUnlock[index];
        this.info_Logo.spriteFrame = Global.playerData.levelUnlock[index] ? MapSpriteData.unlock[index] : MapSpriteData.lock[index];
        this.info_Name.string = LevelDataConfig.levelData[index].Name + "\n";
        this.info_Intro.string = LevelDataConfig.levelData[index].Intro;
        this.info_other.string = LevelDataConfig.levelData[index].Hide;
    }

    enterBtnEvent(){
        Global.playerData.gameProgress.levelNo = this.levelNo;
        this.infoWindow.active = false;
        this.node.active = false;
        cc.game.emit(EventsName.UI_BACKGAME);
        GameManager.instance.gameReStart();
    }

    close(){
        this.node.active = false;
        cc.game.emit(EventsName.UI_BACKGAME);
    }
    
    closeInfo(){
        this.infoWindow.active = false;
    }
}

let MapSpriteData = {
    lock:[],
    unlock:[],
    loadAssets(){
        Global.remotebundle.loadDir("res/Texture/Map/Lock", cc.SpriteFrame, (err, assets: cc.SpriteFrame[]) => {
            assets.sort((a:cc.SpriteFrame,b)=>{
                var str1 = a.name;
                var str2 = b.name;
                return Number(str1)-Number(str2);
            });
            this.lock = assets;
        });

        Global.remotebundle.loadDir("res/Texture/Map/UnLock", cc.SpriteFrame, (err, assets: cc.SpriteFrame[]) => {
            assets.sort((a:cc.SpriteFrame,b)=>{
                var str1 = a.name;
                var str2 = b.name;
                return Number(str1)-Number(str2);
            });
            this.unlock = assets;
        });
    },
};
export {MapSpriteData};

let LevelDataConfig = {
    levelData : [],
    loadData(){
        Global.remotebundle.load('res/Json/LevelDataConfig',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
            this.levelData = jsonAsset.json;
        });
    },
}
export {LevelDataConfig};
