import { EventsName } from "../EventsName";
import { Global } from "../Global";
import Guide from "../Tools/Guide";
import Tool from "../Tools/Tool";
import { NeighborsDataManager } from "./NeighborsDataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NeighborRole extends cc.Component {

    @property(cc.Node)
    talkBox:cc.Node = null;
    @property({
        displayName:'对话框出现时长',
    })
    talkBoxCloseTime: number = 4;

    @property({
        displayName:'入场时间',
    })
    entranceTime: number = 2;

    @property({
        displayName:'离场时间',
    })
    leaveTime: number = 2;

    talkLable:cc.Label = null;
    talkAnima:cc.Animation = null;

    wordArr: string[] = [];
    wordIndex: number = 0;
    talkCallBack: Function = null;

    no:number = 0;
    isTrue: boolean = false;
    isSprite: boolean = false;
    //mainSprite:cc.SpriteFrame = null;
    qaWords_Identity:string[] = [];
    qaWords_Appearance:string[] = [];
    qaWords_EntryReason:string[] = [];
    qaWords_VisitorList:string[] = [];
    //phoneContent:string[] = [];

    roleSprite:cc.Sprite = null;
    roleAnima: sp.Skeleton = null;
    spriteSprite: cc.SpriteFrame = null;
    spriteAnima: sp.SkeletonData = null;
    walkNode:cc.Node = null;

    onLoad () {
        this.roleSprite = this.node.getComponentInChildren(cc.Sprite);
        this.roleAnima = this.node.getComponentInChildren(sp.Skeleton);
        this.talkLable = this.talkBox.getComponentInChildren(cc.Label);
        this.talkAnima = this.talkBox.getComponentInChildren(cc.Animation);
        this.talkBox.active = false;
        cc.game.on(EventsName.NEIGHBORS_UPDATE,() => {
            this.node.active = false;
        }, this);
        cc.game.on(EventsName.ROLE_PLAYTALK, (wordArr: string[], callBack: Function) => {
            this.wordArr = wordArr;
            this.StartNewTalk();
            this.talkCallBack = callBack;
        },this);
        this.node.active = false;
    }
    
    dataAssignment(data){
        this.node.active = true;
        this.posInit();
        this._dataAssignment(data, () => {
            this.roleEntance();
        });

    }
    _dataAssignment(data, finshCallBack: Function = null){
        this.no = data.NeighborNo;
        this.isTrue = data.isReal;
        this.isSprite = !data.isReal && data.IsSprite;
        Global.remotebundle.load('res/Spine/Role/jumin_' + this.no + '/' + data.MainSpriteURL,sp.SkeletonData, (err, asset:sp.SkeletonData) => {
            if(!err){
                this.walkNode = this.roleAnima.node;
                this.roleAnima.node.active = true;
                this.roleSprite.node.active = false;
                this.roleAnima.skeletonData = asset;
                this.roleAnima.setAnimation(0, 'animation', true);
                finshCallBack();
            }
            else{
                this.walkNode = this.roleSprite.node;
                this.roleAnima.node.active = false;
                this.roleSprite.node.active = true;
                Global.remotebundle.load('res/Texture/Role/' + data.MainSpriteURL,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
                    this.roleSprite.spriteFrame = asset;
                    finshCallBack();
                });
            }
        });
    
        if(this.isSprite){
            var spriteData = this.getRandomOpenSprite();
            if(spriteData.SkeUrl != ""){
                Global.remotebundle.load('res/Spine/Role/' + spriteData.SkeUrl,sp.SkeletonData, (err, asset:sp.SkeletonData) => {
                    this.spriteAnima = asset;
                });
            }
            else{
                this.spriteAnima = null;
                Global.remotebundle.load('res/Texture/PhotoAlbum/Sprites/Photos/'+spriteData.SpriteUrl,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
                    this.spriteSprite = asset;
                });
            }
        }

        var noHaveIdCard = !data.isReal && !data.HasIDCard;
        this.qaWords_Identity = data.QA_Identity != "" ? data.QA_Identity.split(";") : 
                                noHaveIdCard ? Global.getRandomQA_Identity_NoHave() : 
                                data.showIDCard ? Global.getRandomQA_Identity_Shown() : Global.getRandomQA_Identity_NotShown();
        this.qaWords_Appearance = data.QA_Appearance == "" ? Global.getRandomQA_Appearance() : data.QA_Appearance.split(";");
        this.qaWords_EntryReason = data.QA_EntryReason != "" ? data.QA_EntryReason.split(";") : (data.isReal || data.HasER) ? Global.getRandomQA_EntryReason_Have() : Global.getRandomQA_EntryReason_NoHave();
        
        var isInVisitorList = NeighborsDataManager.visitorList.includes(data.NeighborNo);
        this.qaWords_VisitorList = data.QA_VisitorList != "" ? data.QA_VisitorList.split(";") : isInVisitorList ? Global.getRandomQA_VisitorList_Have() : Global.getRandomQA_VisitorList_NoHave();
    }

    roleEntance(){
        cc.tween(this.node)
        .to(this.entranceTime, {position: cc.Vec3.ZERO})
        .call(() => {
            cc.game.emit(EventsName.BLOCKTOUCH, false);
            cc.Tween.stopAllByTarget(this.walkNode);
            //对话
            this.wordArr = Global.getRandomStartWords();
            this.StartNewTalk();
        })
        .start();

        this.playWalk();
    }

    passInspection(callBack: Function){
        //对话
        this.wordArr = Global.getRandomEndWords(Global.EndWordsConfig.pass);
        this.StartNewTalk();
        this.talkCallBack = () => {
            cc.game.emit(EventsName.BLOCKTOUCH, true);
            this.playWalk();
            cc.tween(this.node)
            .to(this.leaveTime, {position: new cc.Vec3(2000, 0)})
            .call(() => {
                cc.Tween.stopAllByTarget(this.walkNode);
                callBack();
            })
            .start();
        };
    }

    rejected(callBack: Function){
        this.wordArr = Global.getRandomEndWords(this.isTrue ? Global.EndWordsConfig.unPass_trueMan : Global.EndWordsConfig.unpass_falseMan);
        if(this.isSprite){
            //变身
            cc.audioEngine.playEffect(Global.audioClips.effects_change, false);
            if(this.spriteAnima){
                this.roleAnima.node.active = true;
                this.roleSprite.node.active = false;
                this.roleAnima.skeletonData = this.spriteAnima;
                this.roleAnima.setAnimation(0, 'animation', true);
            }
            else{
                this.roleAnima.node.active = false;
                this.roleSprite.node.active = true;
                this.roleSprite.spriteFrame = this.spriteSprite;
            }
        }
        this.StartNewTalk();
        this.talkCallBack = () => {
            cc.game.emit(EventsName.BLOCKTOUCH, true);
            this.playWalk();
            cc.tween(this.node)
            .to(this.leaveTime, {position: new cc.Vec3(-2000, 0)})
            .call(() => {
                cc.Tween.stopAllByTarget(this.walkNode);
                callBack();
            })
            .start();
        };
    }

    qa_Identity(){
        this.wordArr = this.qaWords_Identity;
        this.StartNewTalk();
    }

    qa_Appearance(){
        this.wordArr = this.qaWords_Appearance;
        this.StartNewTalk();
    }

    qa_EntryReason(){
        this.wordArr = this.qaWords_EntryReason;
        this.StartNewTalk();
    }

    qa_VisitorList(){
        this.wordArr = this.qaWords_VisitorList;
        this.StartNewTalk();
    }

    playWalk(){
        cc.audioEngine.playEffect(Global.audioClips.effects_foot, false);
        
        cc.tween(this.walkNode)
        .repeatForever(cc.tween(this.walkNode)
                        .to(0.2,{y: this.node.y + 100})
                        .to(0.2,{y: this.node.y}))
        .start();
    }

    playTalk(){
        cc.Tween.stopAllByTarget(this.talkBox);
        if(this.wordIndex >= this.wordArr.length){
            if(this.talkCallBack) {
                this.talkCallBack();
                this.talkCallBack = null;
            }
            this.talkBox.off(cc.Node.EventType.TOUCH_START);
            this.talkBox.active = false;
            return;
        }
        this.talkAnima.play();
        this.talkLable.string = this.wordArr[this.wordIndex];
        
        this.wordIndex++;
        cc.tween(this.talkBox)
        .delay(this.talkBoxCloseTime)
        .call(() => {
            this.playTalk();
        }) 
        .start();

        let randomNo = Math.random() > 0.5 ? 1 : 2;
        var audioName = NeighborsDataManager.getNeighborDataByNo(this.no).Gender == 0 ? "effects_dialogue_man_" : "effects_dialogue_woman_";
        cc.audioEngine.playEffect(Global.audioClips[audioName + randomNo], false);
        //this.scheduleOnce(this.playTalk, this.talkBoxCloseTime);
        //cc.log("Sche:" + this.wordIndex + " " + this.wordArr.length);
    }

    StartNewTalk(){
        if(this.talkBox.active){
            if(this.talkCallBack) {
                this.talkCallBack();
                this.talkCallBack = null;
            }
        }
        else{
            this.talkCallBack = null;
            this.talkBox.active = true;
            this.talkBox.on(cc.Node.EventType.TOUCH_START, this.playTalk,this);
        }

        this.wordIndex = 0;
        this.playTalk();
    }

    posInit(){
        this.node.position = new cc.Vec3(-2000, 0);
    }
    
    getRandomOpenSprite(){
        //var openSprires = Global.photoAlblum_SpritesConfig.filter(e => e.Unlock);
        return Global.photoAlblum_SpritesConfig[Tool.getRandomNum(0, Global.photoAlblum_SpritesConfig.length - 1)];
    }

    //#region  Guide
    guide_dataAssignment(data){
        this.posInit();
        this._dataAssignment(data, () => {
            this.node.active = true;
            this.guide_roleEntance();
        });
    }
    guide_roleEntance(){
        cc.game.emit(EventsName.BLOCKTOUCH, true);
        cc.tween(this.node)
        .to(this.entranceTime, {position: cc.Vec3.ZERO})
        .call(() => {
            cc.game.emit(EventsName.BLOCKTOUCH, false);
            cc.Tween.stopAllByTarget(this.walkNode);
            //对话
            this.wordArr = ["Emmm.......你好！","新来的？？"];
            this.StartNewTalk();
            this.talkCallBack = () => {
                Guide.init();
            };
        })
        .start();

        this.playWalk();
    }
    //#endregion
}
