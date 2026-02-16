import { EventsName } from "../EventsName";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    modularNodes = {
        map: null,
        album: null,
        device: null,
        wallet: null
    };
    buttons: cc.Button[] = [];

    onLoad () {
        cc.game.on(EventsName.UI_BACKGAME, this.goBackGame, this);
        var canvasNode = cc.Canvas.instance.node;
        this.modularNodes.map = canvasNode.getChildByName("Map");
        this.modularNodes.album = canvasNode.getChildByName("PhotoAlbum");
        this.modularNodes.device = canvasNode.getChildByName("Device Manage");
        this.modularNodes.wallet = canvasNode.getChildByName("Wallet");

        this.buttons = this.node.getComponentsInChildren(cc.Button);
    }

    buttonEvent(event: cc.Event, customEventData){
        if(customEventData != "game"){
            this.modularNodes[customEventData].active = true;
            cc.game.emit(EventsName.UI_LEAVEGAME);
        }
        for (const key in this.modularNodes) {
            if(key != customEventData && this.modularNodes[key].active){
                this.modularNodes[key].active = false;
            }
        }
        this.buttons.forEach(btn => {
            btn.interactable = btn.node != event.currentTarget;
        });
    }

    goBackGame(){
        this.buttons.forEach(btn => {
            btn.interactable = btn.node.name != "Hall Button";
        });
    }
}
