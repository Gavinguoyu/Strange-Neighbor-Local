import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class IDCard extends cc.Component {

    photo:cc.Sprite = null;
    nameLabel:cc.Label = null;
    idNoLabel:cc.Label = null;
    periodLable:cc.Label = null;

    start () {
        this.init();
    }

    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    init(){
        if(this.photo)
            return;

        this.photo = this.node.getChildByName("Photo BG").getChildByName("Mask").getComponentInChildren(cc.Sprite);
        this.nameLabel = this.node.getChildByName("Name").getChildByName("Name").getComponentInChildren(cc.Label);
        this.idNoLabel = this.node.getChildByName("ID No").getComponent(cc.Label);
        this.periodLable = this.node.getChildByName("Period").getChildByName("Period Label").getComponent(cc.Label);
    }

    public updateData(data){
        this.init();

        if(data.isReal){
            var roleData = Global.neighborsConfig.find(e => e.No == data.NeighborNo);
            Global.remotebundle.load('res/Texture/Role/'+roleData.SpriteUrl,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
                this.photo.spriteFrame = asset;
            });
            this.nameLabel.string = roleData.Name;
            this.idNoLabel.string = roleData.ID_Number;
            this.periodLable.string = roleData.IDCardValidity;
        }
        else{
            Global.remotebundle.load('res/Texture/Role/'+data.IDCard_SpriteURL,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
                this.photo.spriteFrame = asset;
            });
            this.nameLabel.string = data.IDCard_Name;
            this.idNoLabel.string = data.IDCard_Num;
            this.periodLable.string = data.ID_Validity;
        }
    }

    close(){
        this.node.active = false;
    }
}
