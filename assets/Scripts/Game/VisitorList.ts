import { EventsName } from "../EventsName";
import { Global } from "../Global";
import { NeighborsDataManager } from "./NeighborsDataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    contentNode : cc.Node = null;
    onLoad () {
        this.contentNode = this.node.getChildByName("Content");
        this.updateData();
        cc.game.on(EventsName.NEIGHBORS_UPDATE, this.updateData, this);
    }
    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    updateData(){
        var child0 = this.contentNode.children[0];
        for(let i = 0; i < NeighborsDataManager.visitorList.length; i++){
            var node = this.contentNode.children[i];
            if(node == null){
                node = cc.instantiate(child0);
                this.contentNode.addChild(node);
            }
            var neightorNo = NeighborsDataManager.visitorList[i];
            var neightorData = NeighborsDataManager.getHouseholdByNo(neightorNo);
            node.position = child0.position.add(new cc.Vec3(i%3 * 250,  -Math.floor(i/3) * 360)) ;
            // cc.resources.load('Texture/Role/'+neightorData.No,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
            // });
            node.getChildByName("BG").getChildByName("Photo Mask").getComponentInChildren(cc.Sprite).spriteFrame = Global.neighborSprites[neightorNo - 1];
            node.getChildByName("Name Label").getComponent(cc.Label).string = neightorData.Name;
            node.getChildByName("Apt Label").getComponent(cc.Label).string = neightorData.ApartmentNo;
        }
        for(let i = this.contentNode.childrenCount - 1; i >= NeighborsDataManager.visitorList.length; --i){
            this.contentNode.children[i].destroy();
        }
    }

    close(){
        this.node.active = false;
    }
}
