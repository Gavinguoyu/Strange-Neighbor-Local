import { EventsName } from "../EventsName";
import { Global } from "../Global";
import HttpSystem from "../Tools/HttpSystem";
import GameManager from "./GameManager";
import { NeighborsDataManager } from "./NeighborsDataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Settlement extends cc.Component {
    static instance:Settlement;
    winNode: cc.Node = null;
    failNode: cc.Node = null;

    win_Statistics: cc.Node = null;
    win_Statistics_TotalNum: cc.Label = null;
    win_Statistics_TrueManPass:cc.RichText = null;
    win_Statistics_FalseManPass: cc.RichText = null;
    win_Statistics_FalseManRejected:cc.RichText = null;
    win_Rewaird: cc.Node = null;
    win_Rewaird_Grade: cc.Sprite = null;
    win_Rewaird_CoinLable: cc.Label = null;
    win_Rewaird_PositiveScoreLable: cc.Label = null;
    win_Rewaird_NegativeScoreLable: cc.Label = null;

    gradeSprites_S:cc.SpriteFrame = null;
    gradeSprites_A:cc.SpriteFrame = null;
    gradeSprites_B:cc.SpriteFrame = null;
    gradeSprites_C:cc.SpriteFrame = null;
    effect_gameWinID:number = 0;
    init () {
        this.winNode = this.node.getChildByName("Win");
        this.win_Statistics = this.winNode.getChildByName("Statistics");
        this.win_Statistics_TotalNum = this.win_Statistics.getChildByName("Total Number").getComponent(cc.Label);
        this.win_Statistics_TrueManPass = this.win_Statistics.getChildByName("TrueMan Pass Num").getComponent(cc.RichText);
        this.win_Statistics_FalseManPass = this.win_Statistics.getChildByName("FalseMan Pass Num").getComponent(cc.RichText);
        this.win_Statistics_FalseManRejected = this.win_Statistics.getChildByName("FalseMan Rejected Num").getComponent(cc.RichText);
        this.win_Rewaird = this.winNode.getChildByName("Rewaird");
        this.win_Rewaird_Grade = this.win_Rewaird.getChildByName("Grade").getComponent(cc.Sprite);
        this.win_Rewaird_CoinLable = this.win_Rewaird.getChildByName("Coin Label").getComponent(cc.Label);
        this.win_Rewaird_PositiveScoreLable = this.win_Rewaird.getChildByName("Score1").getComponent(cc.Label);
        this.win_Rewaird_NegativeScoreLable = this.win_Rewaird.getChildByName("Score2").getComponent(cc.Label);
        this.failNode  = this.node.getChildByName("Fail");

        Global.remotebundle.loadDir('res/Texture/Settlement/Grade', cc.SpriteFrame, (error, assets: cc.SpriteFrame[]) => {
            assets.forEach( e => {
                switch(e.name){
                    case "S": this.gradeSprites_S = e; break;
                    case "A": this.gradeSprites_A = e; break;
                    case "B": this.gradeSprites_B = e; break;
                    case "C": this.gradeSprites_C = e; break;
                    default: break;
                }
            });
        });

        this.win_Statistics.on(cc.Node.EventType.TOUCH_START,this.showWinScore,this);
        this.win_Rewaird.on(cc.Node.EventType.TOUCH_START, this.close, this);
        this.failNode.on(cc.Node.EventType.TOUCH_START, this.closeFail, this);
    }

    //#region  分数计算

    scoreCal(tureMan:boolean, pass: boolean){
        if(tureMan){
            if(pass)
                Global.playerData.gameProgress.score.trueManPass++;
            else
                Global.playerData.gameProgress.score.tureManRejected++;
        }
        else{
            if(pass)
                Global.playerData.gameProgress.score.falseManPass++;
            else
                Global.playerData.gameProgress.score.falseManRejected++;
        }
    }

    resetScore(){
        Global.playerData.gameProgress.score.trueManPass = 0;
        Global.playerData.gameProgress.score.tureManRejected = 0;
        Global.playerData.gameProgress.score.falseManPass = 0;
        Global.playerData.gameProgress.score.falseManRejected = 0;
    }
    //#endregion

    gameSettle(){
        cc.game.emit(EventsName.BLOCKTOUCH, false);
        this.node.active = true;
        var score = Global.playerData.gameProgress.score;
        let allScore = score.trueManPass * Global.scoreRules.trueManPass + score.tureManRejected * Global.scoreRules.tureManRejected
                        + score.falseManPass * Global.scoreRules.falseManPass + score.falseManRejected * Global.scoreRules.falseManRejected;

        let trueManCount = NeighborsDataManager.neighborList.filter(e => e.isReal).length;
        let falseManCount = NeighborsDataManager.neighborList.length - trueManCount;
        let allRightScore = trueManCount * Global.scoreRules.trueManPass + falseManCount * Global.scoreRules.falseManRejected;
        if(allScore > allRightScore * Global.scoreGradeRule.C)
            this.win(allScore/allRightScore);
        else
            this.fail();
    }
    
    win(scoreLevel:number){
        this.failNode.active = false;
        this.winNode.active = true;
        cc.audioEngine.playEffect(Global.audioClips.effects_over, false);

        this.win_Statistics.active = true;
        this.win_Rewaird.active = false;

        var score = Global.playerData.gameProgress.score;
        var totalCount = NeighborsDataManager.neighborList.length;
        this.win_Statistics_TotalNum.string = "今日" + totalCount + "个人到达公寓";
        this.win_Statistics_TrueManPass.string = "<color=#000000>其中</c><color=#CE3333>" + score.trueManPass + "</c><color=#000000>个住户回到家中</color>"
        this.win_Statistics_FalseManPass.string = "<color=#CE3333>" + score.falseManPass + "</c><color=#000000>个坏人进入公寓</color>"
        this.win_Statistics_FalseManRejected.string = "<color=#CE3333>" + score.falseManRejected + "</c><color=#000000>个坏人被你成功阻止</color>";

        let positiveScore = score.trueManPass * Global.scoreRules.trueManPass + score.falseManRejected * Global.scoreRules.falseManRejected;
        let nagativeScore = score.falseManPass * Global.scoreRules.falseManPass + score.tureManRejected * Global.scoreRules.tureManRejected;
        this.win_Rewaird_NegativeScoreLable.string = nagativeScore + "";
        this.win_Rewaird_PositiveScoreLable.string = positiveScore + ""; 
        
        //cc.log(Global.playerData.gameProgress.levelNo +"  "+Global.playerData.gameProgress.levelTimes);
        //let allCoin = Global.levelConfig[Global.playerData.gameProgress.levelNo - 1][Global.playerData.gameProgress.levelTimes-1].Coin;
        let coinCount = Math.floor(positiveScore + nagativeScore);
        this.win_Rewaird_CoinLable.string = coinCount + "";
        
        this.win_Rewaird_Grade.spriteFrame = scoreLevel >= Global.scoreGradeRule.S ? this.gradeSprites_S : 
                                            scoreLevel >= Global.scoreGradeRule.A ? this.gradeSprites_A :
                                            scoreLevel >= Global.scoreGradeRule.B ? this.gradeSprites_B : this.gradeSprites_C;
        Global.playerData.coin += coinCount;
        this.scheduleOnce(this.showWinScore, 5);
    }

    fail(){
        this.winNode.active = false;
        this.failNode.active = true;
        cc.audioEngine.playEffect(Global.audioClips.effects_fail, false);
    }

    showWinScore(){
        this.unschedule(this.showWinScore);

        this.effect_gameWinID = cc.audioEngine.playEffect(Global.audioClips.effects_Game_Victory, true);
        this.win_Statistics.active = false;
        this.win_Rewaird.active = true;
        this.scheduleOnce(this.close, 5);
    }

    close(){
        this.unschedule(this.close);
        if(Global.playerData.difficultyNo > 2){
            Global.playerData.gameProgress.levelTimes++;
            if(Global.playerData.gameProgress.levelTimes > 4){
                Global.playerData.gameProgress.levelTimes = 0;
                GameManager.instance.checkUnlockLevel();
            }
        }
        else{
            Global.playerData.difficultyNo++;
            HttpSystem.uploadPlayerData("difficultyNo", Global.playerData.difficultyNo);
        }

        cc.audioEngine.stopEffect(this.effect_gameWinID);
        this.node.active = false;
        cc.game.emit(EventsName.BLOCKTOUCH, true);
        GameManager.instance.gameReStart();
    }

    closeFail(){
        this.unschedule(this.closeFail);
        this.node.active = false;
        GameManager.instance.gameReStart();
    }
}
