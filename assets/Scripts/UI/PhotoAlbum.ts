import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {
    normalTitleBtns: cc.Node[] = [];
    pressedTitleBtns: cc.Node[] = [];
    neighborsNode: cc.Node = null;
    neighborsBox: cc.ScrollView = null;
    spritesNode: cc.Node = null;
    spritesBox: cc.ScrollView = null;
    storyNode: cc.Node = null;
    gradeBtnsNode: cc.Node = null;
    grayMateral: cc.Material = null;
    defaultMaterail: cc.Material = null;
    onLoad () {
        this.neighborsNode = this.node.getChildByName("Neighbors");
        this.neighborsBox = this.neighborsNode.getComponentInChildren(cc.ScrollView);
        this.spritesNode = this.node.getChildByName("Sprites");
        this.spritesBox = this.spritesNode.getComponentInChildren(cc.ScrollView);
        this.storyNode = this.node.getChildByName("Story");
        this.gradeBtnsNode = this.node.getChildByName("Grade");
        this.normalTitleBtns = this.node.getChildByName("Normal Title Buttons").children;
        this.pressedTitleBtns = this.node.getChildByName("Pressed Title Buttons").children;

        this.tipsInit();

        this.grayMateral = cc.Material.getBuiltinMaterial("2d-gray-sprite");
        this.defaultMaterail = cc.Material.getBuiltinMaterial("2d-sprite");
        this.titleBtnEvent(null, "0");
    }

    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    titleBtnEvent(event, eventData){
        let index = Number(eventData);
        this.normalTitleBtns.forEach((btn, i) => {
            btn.active = i != index;
        });
        this.pressedTitleBtns.forEach((btn, i) => {
            btn.active = i == index;
        });

        this.neighborsNode.active = false;
        this.spritesNode.active = false;
        this.storyNode.active = false;
        switch(index){
            case 0: this.showNeighbors(Global.neighborsConfig); break;
            case 1: this.showSprites(Global.photoAlblum_SpritesConfig); break;
            case 2: 
                this.storyNode.active = true; 
                this.gradeBtnsNode.active = false;
            break;
            default: break;
        }
    }

    showNeighbors(dataArr){
        this.neighborsNode.active = true;
        this.gradeBtnsNode.active = true;
        this.gradeBtnsNode.getChildByName("SS").active = false;
        var boxContent = this.neighborsBox.content;
        boxContent.y = 0.5 * boxContent.parent.height;
        let child0 = boxContent.children[0];
        dataArr.forEach((neig, index) => {
            var copyNode = boxContent.children[index];
            if(!copyNode){
                copyNode = cc.instantiate(child0);
                boxContent.addChild(copyNode);
            }
            copyNode.position = child0.position.add(new cc.Vec3((index % 3) * 320, -Math.floor(index / 3) * 420));
            copyNode.active = true;
            var btn = copyNode.getComponent(cc.Button);
            btn.clickEvents[0].customEventData = neig;
            btn.interactable = neig.Unlock;
            var bg = copyNode.getChildByName("BG");
            var photoSprite = bg.getChildByName("Mask").getComponentInChildren(cc.Sprite);
            photoSprite.spriteFrame = Global.neighborSprites[neig.No - 1];
7
            var bgSprite = bg.getComponent(cc.Sprite);
            var gradeSprite = copyNode.getChildByName("Grade").getComponent(cc.Sprite);
            if(neig.Grade == "普通"){
                gradeSprite.node.active = false;
                bgSprite.spriteFrame = PhotoAblumSprites.neighbor.bg.T;
            }
            else{
                gradeSprite.node.active = true;
                gradeSprite.spriteFrame = PhotoAblumSprites.gradeSprites[neig.Grade];
                bgSprite.spriteFrame = neig.Unlock ? PhotoAblumSprites.neighbor.bg[neig.Grade] : PhotoAblumSprites.neighbor.bg.Lock; 
            }

            var materials = neig.Unlock ? this.defaultMaterail : this.grayMateral;
            photoSprite.setMaterial(0, materials);
            gradeSprite.setMaterial(0, materials);
        });
        for(let i = dataArr.length; i < boxContent.childrenCount; i++){
            boxContent.children[i].active = false;
        }
        boxContent.height = Math.ceil(dataArr.length / 3) * 420; 
    }

    showSprites(dataArr){
        this.spritesNode.active = true;
        this.gradeBtnsNode.active = true;
        this.gradeBtnsNode.getChildByName("SS").active = true;
        var boxContent = this.spritesBox.content;
        boxContent.y = 0.5 * boxContent.parent.height;
        var child0 = boxContent.children[0];
        dataArr.forEach((spr, index) => {
            var copyNode = boxContent.children[index];
            if(!copyNode){
                copyNode = cc.instantiate(child0);
                boxContent.addChild(copyNode);
            }
            copyNode.position = child0.position.add(new cc.Vec3((index % 2) * 460, -Math.floor(index / 2) * 420));
            copyNode.active = true;
            var btn = copyNode.getComponent(cc.Button);
            btn.clickEvents[0].customEventData = spr;
            btn.interactable = spr.Unlock;
            var bg = copyNode.children[0].getChildByName("BG");
            var photoSprite = bg.getChildByName("Mask").getComponentInChildren(cc.Sprite);
            var bgSprite = bg.getComponent(cc.Sprite);
            if(spr.Unlock){
                photoSprite.node.scale = 0.6;
                photoSprite.spriteFrame = PhotoAblumSprites.sprites.photos[spr.No - 1]
                bgSprite.spriteFrame = PhotoAblumSprites.sprites.bg[spr.Grade];
            }
            else{
                photoSprite.node.scale = 1;
                photoSprite.spriteFrame = PhotoAblumSprites.sprites.lockSprite;
                bgSprite.spriteFrame = PhotoAblumSprites.sprites.bg.Lock;
            }
            var gradeSprite = copyNode.children[0].getChildByName("Grade").getComponent(cc.Sprite);
            gradeSprite.spriteFrame = PhotoAblumSprites.gradeSprites[spr.Grade];
        });
        for(let i = dataArr.length; i < boxContent.childrenCount; i++){
            boxContent.children[i].active = false;
        }
        boxContent.height = Math.ceil(dataArr.length / 2) * 420; 
    }

    gradeFilterButtonEvent(event, customEventData){
        if(this.neighborsNode.active){
            this.showNeighbors(Global.neighborsConfig.filter(e => e.Grade == customEventData));
        }
        else if(this.spritesNode.active)
            this.showSprites(Global.photoAlblum_SpritesConfig.filter(e => e.Grade == customEventData));
    }


    //#region Tips
    tipsNode_Neighbor: cc.Node = null;
    tips_Neighbor_NameLabel: cc.Label = null;
    tips_Neighbor_JobLabel: cc.Label = null;
    tips_Neighbor_IntroLabel: cc.Label = null;
    tips_Neighbor_Sprite: cc.Sprite = null;
    tipsNode_Sprite: cc.Node = null;
    tips_Sprite_BG: cc.Sprite = null;
    tips_Sprite_NameLablel: cc.Label = null;
    tips_Sprite_NameLable_Outline: cc.LabelOutline = null;
    tips_Sprite_Grade: cc.Sprite = null;
    tips_Sprite_Photo: cc.Sprite = null;
    lableColor = {
        A:{
            text: cc.color(255,241,198,255),
            outline: cc.color(168,96,82,255),
        },
        S:{
            text: cc.color(251,63,227,255),
            outline: cc.color(63,255,208,255),
        },
        SSS:{
            text: cc.color(250, 255,101,255),
            outline: cc.color(65,255,60,255),
        },
    }
    tipsInit(){
        var canvasNode = cc.Canvas.instance.node;
        this.tipsNode_Neighbor = canvasNode.getChildByName("Neighbor Tips");
        this.tips_Neighbor_Sprite = this.tipsNode_Neighbor.getChildByName("Photo").getComponent(cc.Sprite);
        var biography = this.tipsNode_Neighbor.getChildByName("Biography");
        this.tips_Neighbor_NameLabel = biography.getChildByName("Name").getComponentInChildren(cc.Label);
        this.tips_Neighbor_JobLabel = biography.getChildByName("Job").getComponentInChildren(cc.Label);
        this.tips_Neighbor_IntroLabel = biography.getChildByName("Intro").getComponent(cc.Label);

        this.tipsNode_Sprite = canvasNode.getChildByName("Sprite Tips");
        this.tips_Sprite_BG = this.tipsNode_Sprite.getChildByName("BG").getComponent(cc.Sprite);
        this.tips_Sprite_Photo = this.tipsNode_Sprite.getChildByName("Mask").getComponentInChildren(cc.Sprite);
        this.tips_Sprite_Grade = this.tipsNode_Sprite.getChildByName("Grade").getComponent(cc.Sprite);
        this.tips_Sprite_NameLablel = this.tipsNode_Sprite.getChildByName("Name").getComponent(cc.Label);
        this.tips_Sprite_NameLable_Outline = this.tips_Sprite_NameLablel.node.getComponent(cc.LabelOutline);
        this.tipsNode_Sprite.on(cc.Node.EventType.TOUCH_START, this.closeSpriteTips, this);
    }
    tips_Neighbor(event, customEventData){
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
        
        this.tipsNode_Neighbor.active = true;
        this.tips_Neighbor_Sprite.spriteFrame = Global.neighborSprites[customEventData.No - 1];
        this.tips_Neighbor_NameLabel.string = customEventData.Name;
        this.tips_Neighbor_JobLabel.string = customEventData.Career;
        this.tips_Neighbor_IntroLabel.string = customEventData.Intro;
    }

    tips_Sprite(event, customEventData){
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
        
        this.tipsNode_Sprite.active = true;
        this.tips_Sprite_BG.spriteFrame = PhotoAblumSprites.sprites.tipsBG[customEventData.Grade];
        this.tips_Sprite_Photo.spriteFrame = PhotoAblumSprites.sprites.photos[customEventData.No - 1];
        this.tips_Sprite_Grade.spriteFrame = PhotoAblumSprites.gradeSprites[customEventData.Grade];
        this.tips_Sprite_NameLablel.string = customEventData.Name + "\n";
        this.tips_Sprite_NameLablel.node.color = this.lableColor[customEventData.Grade].text;
        this.tips_Sprite_NameLable_Outline.color = this.lableColor[customEventData.Grade].outline;
    }

    closeNeighborTips(){
        this.tipsNode_Neighbor.active = false;
    }

    closeSpriteTips(){
        this.tipsNode_Sprite.active = false;
    }
    //#endregion
}

let PhotoAblumSprites = {
    neighbor:{
        bg:{
            Lock:null,
            A:null,
            S:null,
            T:null,
        },
    },
    sprites:{
        photos:[],
        bg:{
            Lock:null,
            A:null,
            S:null,
            SSS:null,
        },
        tipsBG:{
            A:null,
            S:null,
            SSS:null,
        },
        lockSprite:null,
    },
    gradeSprites:{
        A:null,
        S:null,
        SSS:null,
    },
    loadAssets(){
        Global.remotebundle.loadDir('res/Texture/PhotoAlbum/Neighbors/BG', cc.SpriteFrame, (err, assets: cc.SpriteFrame[]) => {
            assets.forEach(e => {
                this.neighbor.bg[e.name] = e;
            });
        });

        Global.remotebundle.loadDir('res/Texture/PhotoAlbum/Sprites/Photos', cc.SpriteFrame, (err, assets:cc.SpriteFrame[]) => {
            assets.sort((a:cc.SpriteFrame,b)=>{
                var str1 = a.name.replace("jingling_","");
                var str2 = b.name.replace("jingling_","");
                return Number(str1)-Number(str2);
            });
            this.sprites.photos = assets;
        });

        Global.remotebundle.loadDir('res/Texture/PhotoAlbum/Sprites/BG', cc.SpriteFrame, (err, assets: cc.SpriteFrame[]) => {
            assets.forEach(e => {
                this.sprites.bg[e.name] = e;
            });
        });

        Global.remotebundle.loadDir('res/Texture/PhotoAlbum/Sprites/TipsBG', cc.SpriteFrame, (err, assets: cc.SpriteFrame[]) => {
            assets.forEach(e => {
                this.sprites.tipsBG[e.name] = e;
            });
        });

        Global.remotebundle.loadDir('res/Texture/PhotoAlbum/Grade', cc.SpriteFrame, (err, assets: cc.SpriteFrame[]) => {
            assets.forEach(e => {
                this.gradeSprites[e.name] = e;
            });
        });

       Global.remotebundle.load('res/Texture/PhotoAlbum/Sprites/Lock', cc.SpriteFrame, (err, asset: cc.SpriteFrame) => {
            this.sprites.lockSprite = asset;
        });
    }
};
export {PhotoAblumSprites};
