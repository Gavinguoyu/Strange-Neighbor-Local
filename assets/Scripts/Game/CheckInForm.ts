import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CheckInForm extends cc.Component {

    photo:cc.Sprite = null;
    nameLabel:cc.Label = null;
    roomNoLabel:cc.Label = null;
    careerLable:cc.Label = null;
    reaonLable:cc.Label = null;

    start () {
        this.init();
    }

    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    init(){
        if(this.photo)
            return;

        this.photo = this.node.getChildByName("Photo").getChildByName("Mask").getComponentInChildren(cc.Sprite);
        this.nameLabel = this.node.getChildByName("Name").getChildByName("Name Label").getComponent(cc.Label);
        this.roomNoLabel = this.node.getChildByName("APT No").getChildByName("APT No Label").getComponent(cc.Label);
        this.careerLable = this.node.getChildByName("Job").getChildByName("Job Label").getComponent(cc.Label);
        this.reaonLable = this.node.getChildByName("Reason").getChildByName("Reason Label").getComponent(cc.Label);
    }

    public updateData(data){
        this.init();

        if(data.isReal){
            var roleData = Global.neighborsConfig.find(e => e.No == data.NeighborNo);
            Global.remotebundle.load('res/Texture/Role/'+roleData.SpriteUrl,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
                this.photo.spriteFrame = asset;
            });
            this.nameLabel.string = roleData.Name;
            this.roomNoLabel.string = roleData.ApartmentNo;
            this.careerLable.string = roleData.Career;
        }
        else{
            Global.remotebundle.load('res/Texture/Role/'+data.ER_SpriteURL,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
                this.photo.spriteFrame = asset;
            });
            this.nameLabel.string = data.ER_Name;
            this.roomNoLabel.string = data.ApartmentNo;
            this.careerLable.string = data.ER_Job;
        }
        this.reaonLable.string = data.ER_Reason;
    }

    close(){
        this.node.active = false;
    }
}
