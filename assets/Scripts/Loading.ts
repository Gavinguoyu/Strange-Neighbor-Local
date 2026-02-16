import { NeighborsDataManager } from "./Game/NeighborsDataManager";
import { Global } from "./Global";
import HttpSystem from "./Tools/HttpSystem";
import PlatformBytedance from "./Tools/PlatformBytedance";
import { MapSpriteData } from "./UI/Map";
import { PhotoAblumSprites } from "./UI/PhotoAlbum";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property({
        type:cc.ProgressBar,
        displayName:"进度条"
    })
    loadingBar:cc.ProgressBar = null;

    onLoad () {
        cc.macro.ENABLE_MULTI_TOUCH = false;
        Global.getTime(null);
        this.loadLocalStorage();
        cc.assetManager.loadBundle('Remote', function (err, bundle) {
            Global.remotebundle = bundle;
            Global.remotebundle.load('res/Json/Neighbors',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(element => {
                    element.Unlock = element.Unlock == "是";
                    element.Gender = element.Gender == "男" ? 0 : 1;
                });
                Global.neighborsConfig = jsonAsset.json;
            });
            Global.remotebundle.load('res/Json/PseudoPeoples',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                NeighborsDataManager.pseudoPeoplesConfig = jsonAsset.json;
                NeighborsDataManager.pseudoPeoplesConfig.forEach(e => {
                    switch(e.Difficulty){
                        case "低": e.Difficulty = 0; break;
                        case "中": e.Difficulty = 1; break;
                        case "高": e.Difficulty = 2; break;
                    }
                });
            });
            Global.remotebundle.load('res/Json/RealPeoples',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                NeighborsDataManager.realPeoplesConfig = jsonAsset.json;
            });
            Global.remotebundle.load('res/Json/StartWords',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                Global.StartWordsConfig = jsonAsset.json;
            });
            Global.remotebundle.load('res/Json/EndWords',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(e => {
                    if(e.Type == "通过"){
                        Global.EndWordsConfig.pass.push(e.Words);
                    }
                    else if(e.Type == "未通过_伪人"){
                        Global.EndWordsConfig.unpass_falseMan.push(e.Words);
                    }
                    else{
                        Global.EndWordsConfig.unPass_trueMan.push(e.Words);
                    }
                });
            });
            Global.remotebundle.load('res/Json/QA',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(ele => {
                    switch(ele.Type){
                        case "身份证":
                            switch(ele.State){
                                case "已出示":
                                    Global.QAContents.Identity.Shown.push(ele.Content);
                                break;
    
                                case "未出示":
                                    Global.QAContents.Identity.NotShown.push(ele.Content);
                                break;
    
                                case "无证":
                                    Global.QAContents.Identity.NoHave.push(ele.Content);
                                break;
                                default: break;
                            }
                        break;
    
                        case "外貌":
                            Global.QAContents.Appearance.push(ele.Content);
                        break;
    
                        case "入住申请":
                            ele.State == "没有" ? Global.QAContents.EntryReason.NoHave.push(ele.Content) : Global.QAContents.EntryReason.Have.push(ele.Content);
                        break;
    
                        case "访客列表":
                            ele.State == "不在列表中" ? Global.QAContents.VisitorList.NoHave.push(ele.Content) : Global.QAContents.VisitorList.Have.push(ele.Content);
                        break;
    
                        default: break;
                    }
                });
            });
    
            Global.remotebundle.load('res/Json/LevelConfig',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(element => {
                    if(element.LevelNo <= 3){
                        Global.levelConfig[element.LevelNo-1].push(element);
                    }
                });
            });
    
            Global.remotebundle.load('res/Json/SpritesConfig',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(element => {
                    element.Unlock = element.Unlock == "是";
                });
                Global.photoAlblum_SpritesConfig = jsonAsset.json;
            });
    
            Global.remotebundle.load('res/Json/DeviceConfig',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(element => {
                    element.IsUnlock = element.IsUnlock == "是";
                });
                Global.deviceConfig = jsonAsset.json;
            });
            Global.remotebundle.load('res/Json/PhoneWordsConfig',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(item => {
                    switch (item.Type) {
                        case "真人-室友在家": Global.phoneWords.trueMan_Roommate.push(item.Content); break;
                        case "伪人-真人在家": Global.phoneWords.falseMan_trueMan.push(item.Content); break;
                        case "伪人-室友在家-后面无真人": Global.phoneWords.falseMan_Roommate_NoTrue.push(item.Content); break;
                        case "伪人-室友在家-后面有真人": Global.phoneWords.falseMan_Roommate_TrueAfter.push(item.Content); break;
                        case "家里无人": Global.phoneWords.noOne.push(item.Content); break;
                        default:
                            break;
                    }
                });
            });
    
            Global.remotebundle.load('res/Json/Settlement_ScoreCalculation',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(item => {
                    var score = item.Score.charAt(0) == '-' ? -Number(item.Score.slice(1)) : Number(item.Score.slice(1));
                    switch (item.Type) {
                        case "真人通过": Global.scoreRules.trueManPass = score; break;
                        case "真人拒绝": Global.scoreRules.tureManRejected = score; break;
                        case "伪人通过": Global.scoreRules.falseManPass = score; break;
                        case "伪人拒绝": Global.scoreRules.falseManRejected = score; break;
                    }
                });
            });
    
            Global.remotebundle.load('res/Json/Settlement_GradeJudgment',cc.JsonAsset, (err, jsonAsset:cc.JsonAsset) => {
                jsonAsset.json.forEach(item => {
                    Global.scoreGradeRule[item.Grade] = item.ScoreRatio;
                });
            });
    
            Global.remotebundle.loadDir('res/Texture/Role', cc.SpriteFrame, (err, assets:cc.SpriteFrame[]) => {
                assets.sort((a:cc.SpriteFrame,b)=>{
                    var str1 = a.name.replace("jumin_","");
                    var str2 = b.name.replace("jumin_","");
                    return Number(str1)-Number(str2);
                });
                Global.neighborSprites = assets;
            });
    
            Global.remotebundle.loadDir('res/Texture/Device', cc.SpriteFrame, (err, assets:cc.SpriteFrame[]) => {
                assets.sort((a:cc.SpriteFrame,b)=>{
                    var str1 = a.name;
                    var str2 = b.name;
                    return Number(str1)-Number(str2);
                });
                Global.deviceSprites = assets;
            });
            MapSpriteData.loadAssets();
            
            PhotoAblumSprites.loadAssets();

            Global.remotebundle.loadDir('res/audio', cc.AudioClip, (err ,assets: cc.AudioClip[]) => {
                assets.forEach(ele => {
                    Global.audioClips[ele.name] = ele;
                });
                cc.audioEngine.playMusic(Global.audioClips.effects_Background,true);
            });
        });
        setTimeout(() => {
            this.loadScene();
        }, 0.5);
    }
    
    loadLocalStorage(){
        var playerData = cc.sys.localStorage.getItem('PlayerData');
        if(playerData){
            Global.playerData = JSON.parse(playerData); 
        }
        PlatformBytedance.init();
    }

    loadScene(){
        if(Global.remotebundle){
            cc.director.preloadScene('GameScene',(completedCount: number, totalCount: number, item: any) => {
                this.loadingBar.progress = completedCount/totalCount;
                //progressAnima.x = progressBar.x + this.loadingBar.progress*progressBar.width;
            },(error: Error) => {
                //this.loadingBar.node.children[2].active = false;
                Global.initGameData();
                cc.director.loadScene('GameScene');
            });
        }
        else{
            setTimeout(() => {
                this.loadScene();
            }, 0.5);
        }
    }
}
