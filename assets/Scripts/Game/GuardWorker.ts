import { EventsName } from "../EventsName";
import { Global } from "../Global";
import HttpSystem from "../Tools/HttpSystem";
import Tool from "../Tools/Tool";
import CheckInForm from "./CheckInForm";
import IDCard from "./ID Card";
import NeighborRole from "./NeighborRole";
import { NeighborsDataManager } from "./NeighborsDataManager";
import Settlement from "./Settlement";
import TelePhone from "./TelePhone";

const {ccclass, property} = cc._decorator;

@ccclass
export default class GuardWorker extends cc.Component {
    @property(cc.Node)
    idCardButton : cc.Node = null;

    @property(cc.Node)
    entryReasonBtn : cc.Node = null;

    @property(NeighborRole)
    neighborRole: NeighborRole = null;

    @property(cc.Node)
    window_VisitorList:cc.Node = null;

    window_IDCard:IDCard = null;
    
    window_CheckInForm:CheckInForm = null;

    @property(cc.Node)
    window_QuestionList:cc.Node = null;

    window_FloorInfo:cc.Node = null;

    window_Telephone: TelePhone = null;

    neighborIndex:number = 0;

    isStop = false;
    onLoad () {
        var canvasNode = cc.Canvas.instance.node;
        this.window_CheckInForm = canvasNode.getComponentInChildren("CheckInForm");
        this.window_CheckInForm.node.active = false;
        this.window_IDCard = canvasNode.getComponentInChildren("ID Card");
        this.window_IDCard.node.active = false;

        this.window_Telephone = canvasNode.getComponentInChildren("TelePhone");

        this.window_FloorInfo = canvasNode.getChildByName("FloorInfro");

        cc.game.on(EventsName.UI_LEAVEGAME,() => {
            this.window_IDCard.node.active = false;
            this.window_VisitorList.active = false;
            this.window_CheckInForm.node.active = false;
            this.window_FloorInfo.active = false;
        },this);
        cc.game.on(EventsName.SKIPROLE, this.skipRole, this);
        cc.game.on(EventsName.UPDATE_VITALITY, () => {
            if(this.isStop) {
                this.isStop = false;
                this.next();   
            } 
        }, this);
    }
    protected start(): void {
        this.makeDecision();
    }

    gameReStart(){
        this.neighborIndex = Global.playerData.gameProgress.roleIndex - 1;

        if(this.neighborIndex >= 0){
            this.next();
            return;
        }
        //展示“第X天”
        var startShowNode = cc.Canvas.instance.node.getChildByName("Game Start");
        startShowNode.active = true;
        var day = Global.playerData.difficultyNo > 2 ?  Global.playerData.gameProgress.levelTimes + 1 : Number(Global.playerData.difficultyNo) + 1;
        startShowNode.getChildByName("lbDay").getComponent(cc.Label).string = "第" + Tool.numberToChinese(day) + "天";
        var startAnima = startShowNode.getComponent(cc.Animation);
        startAnima.play();
        var isClosed = false;
        var closeStartNode = () => {
            if(isClosed) return;

            isClosed = true;
            startAnima.play(startAnima.getClips()[1].name);
            startAnima.on('finished',() => {
                startAnima.off('finished');
                startShowNode.active = false;
                this.next();
            },this);
        }
        startShowNode.on(cc.Node.EventType.TOUCH_START, () => {
            startShowNode.off(cc.Node.EventType.TOUCH_START);
            closeStartNode();
        }, this);
        this.scheduleOnce(() => {
            closeStartNode();
        }, 2);
    }

    next(){
        if(Global.playerData.vitality <= 0){
            this.isStop = true;
            cc.game.emit(EventsName.SHOWUI, "VitalityUI");
            return; 
        }
        Global.setVitality(Global.playerData.vitality - 1);
        this.neighborIndex++;
        Global.playerData.gameProgress.roleIndex = this.neighborIndex;
        if(this.neighborIndex < NeighborsDataManager.neighborList.length){
            var nextData = NeighborsDataManager.neighborList[this.neighborIndex];
            nextData.showIDCard = Math.random() > 0.1;
            var currentNeighborData = NeighborsDataManager.getHouseholdByNo(nextData.NeighborNo);
            nextData.ApartmentNo = currentNeighborData == undefined ? this.getFalseApartmentNo("000") : currentNeighborData.ApartmentNo;
            if(nextData.isReal){
                var isInVisitorList = NeighborsDataManager.visitorList.indexOf(e => e == nextData.NeighborNo);
                nextData.HasER = !(isInVisitorList > -1 && Math.random() < 0.1);
            }
            else{
                nextData.showIDCard = nextData.showIDCard && nextData.HasIDCard;
                if(!nextData.ER_ApartmentNoIsRight){
                    nextData.ApartmentNo = this.getFalseApartmentNo(nextData.ApartmentNo);
                }
            }
            this.scheduleOnce(() => {
                this.idCardButton.active = nextData.showIDCard;
                this.entryReasonBtn.active = nextData.isReal || nextData.HasER;
            }, 1);
            this.neighborRole.dataAssignment(nextData);
            this.window_CheckInForm.updateData(nextData);
            this.window_IDCard.updateData(nextData);

            this.window_Telephone.updateData(nextData.ApartmentNo, this.getPhoneWords(nextData));

            if(CC_DEBUG){
                var lbDebug = cc.Canvas.instance.node.getChildByName("lbDebug");
                lbDebug.getComponent(cc.Label).string = "当前邻居：" + nextData.NeighborNo  +"\n数据编号：" + nextData.No + "\n真假：" + nextData.isReal;
            }
            HttpSystem.uploadPlayerData("gameProgress", Global.playerData.gameProgress);
        }
        else{
            Settlement.instance.gameSettle();
        }
    }

    skipRole(){
        NeighborsDataManager.neighborList[this.neighborIndex].isReal ? this.pass() : this.refuse();
    }
    //#region 按钮事件

    pass(){
        if(this.isStop)
            return;
        Settlement.instance.scoreCal(NeighborsDataManager.neighborList[this.neighborIndex].isReal, true);
        NeighborsDataManager.neighborList[this.neighborIndex].isPass = true;
        this.makeDecision();
        this.neighborRole.passInspection(this.next.bind(this));
    }

    refuse(){
        if(this.isStop)
            return;
        Settlement.instance.scoreCal(NeighborsDataManager.neighborList[this.neighborIndex].isReal, false);
        NeighborsDataManager.neighborList[this.neighborIndex].isPass = false;
        this.makeDecision();
        this.neighborRole.rejected(this.next.bind(this));
    }

    showIDCard(){
        this.window_IDCard.node.active = true;
        this.window_IDCard.node.setSiblingIndex(Global.flag_FormIndex);
    }

    showVisitorList(){
        this.window_VisitorList.active = true;
        this.window_VisitorList.setSiblingIndex(Global.flag_FormIndex);
    }

    showCheckInFrom(){
        this.window_CheckInForm.node.active = true;
        this.window_CheckInForm.node.setSiblingIndex(Global.flag_FormIndex);
    }

    showQuestionList(){
        if(this.isStop) return;

        this.window_QuestionList.active = true;
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
    }

    showPhone(){
        if(this.isStop) return;
        this.window_Telephone.node.active = true;
    }

    qa_Identity(){
        this.window_QuestionList.active = false;
        this.neighborRole.qa_Identity();
        var data = NeighborsDataManager.neighborList[this.neighborIndex];
        if(!this.idCardButton.active && (data.isReal || data.HasIDCard)){
            this.idCardButton.active = true;
        }
    }

    qa_Appearance(){
        this.window_QuestionList.active = false;
        this.neighborRole.qa_Appearance();
    }

    qa_EntryReason(){
        this.window_QuestionList.active = false;
        this.neighborRole.qa_EntryReason();
    }

    qa_VisitorList(){
        this.window_QuestionList.active = false;
        this.neighborRole.qa_VisitorList();
    }

    qa_close(){
        this.window_QuestionList.active = false; 
    }
    //#endregion

    makeDecision(){
        this.idCardButton.active  = false;
        this.entryReasonBtn.active = false;
        cc.game.emit(EventsName.BLOCKTOUCH);
        this.window_IDCard.node.active = false;
        this.window_VisitorList.active = false;
        this.window_CheckInForm.node.active = false;
        this.window_QuestionList.active = false;
        this.window_FloorInfo.active = false;
        cc.game.emit(EventsName.FLOORINFO_CLOSE);
    }

    getPhoneWords(data){
        var currentNeightorEnterInfo = NeighborsDataManager.neighborList[this.neighborIndex];
        var currentNeighborData =  Global.neighborsConfig.find(e => e.No == currentNeightorEnterInfo.NeighborNo);
        if(data.isReal){
            for(let i = 0; i < this.neighborIndex; i++){
                var neighborEnterInfo = NeighborsDataManager.neighborList[i];
                if(neighborEnterInfo.NeighborNo == currentNeightorEnterInfo.NeighborNo)
                    continue;

                var neighborData = Global.neighborsConfig.find(e => e.No == neighborEnterInfo.NeighborNo);
                if(neighborEnterInfo.isReal && neighborData.ApartmentNo == currentNeighborData.ApartmentNo && neighborEnterInfo.isPass){
                    return Global.getRandomPhoneWords(Global.phoneWords.trueMan_Roommate, neighborData.Name, currentNeighborData.Name);
                }
            }
        }
        else{
            for(let i = 0; i < this.neighborIndex; i++){
                var neighborEnterInfo = NeighborsDataManager.neighborList[i];
                if(neighborEnterInfo.isReal && currentNeightorEnterInfo.NeighborNo == neighborEnterInfo.NeighborNo && neighborEnterInfo.isPass){
                    return Global.getRandomPhoneWords(Global.phoneWords.falseMan_trueMan, currentNeighborData.Name);
                }
            }

            for(let i = 0; i < this.neighborIndex; i++){
                var neighborEnterInfo = NeighborsDataManager.neighborList[i];
                if(neighborEnterInfo.NeighborNo == currentNeightorEnterInfo.NeighborNo)
                    continue;

                var neighborData = Global.neighborsConfig.find(e => e.No == neighborEnterInfo.NeighborNo);
                if(neighborEnterInfo.isReal && neighborData.ApartmentNo == currentNeighborData.ApartmentNo && neighborEnterInfo.isPass){
                    return this.isHaveTrueManAfterCurrent() ? Global.getRandomPhoneWords(Global.phoneWords.falseMan_Roommate_TrueAfter, neighborData.Name, currentNeighborData.Name) : 
                    Global.getRandomPhoneWords(Global.phoneWords.falseMan_Roommate_NoTrue, neighborData.Name, currentNeighborData.Name);
                }
            }
        }
        return Global.getRandomPhoneWords(Global.phoneWords.noOne);
    }

    getFalseApartmentNo(no:string){
        var noNum = Number(no);
        var floor = Math.floor(noNum/100);
        var room = noNum % 10;
        var randomFloor = Tool.getRandomNum(1,3);
        var randomRoom = Tool.getRandomNum(1,3);
        if(randomFloor == floor && randomRoom == room){
            return this.getFalseApartmentNo(no);
        }
        return randomFloor +"0"+randomRoom;
    }

    isHaveTrueManAfterCurrent() : boolean{
        var currentNeightorEnterInfo = NeighborsDataManager.neighborList[this.neighborIndex];
        for(let i = this.neighborIndex + 1; i < NeighborsDataManager.neighborList.length; i++){
            var neighborEnterInfo = NeighborsDataManager.neighborList[i];
            if(neighborEnterInfo.isReal && currentNeightorEnterInfo.NeighborNo == neighborEnterInfo.ApartmentNo){
                return true;
            }
        }
        return false;
    }

    //#region Guide
    gameGuideNode: cc.Node = null;
    gameGuideScript = null;
    
    guideStart(guideNode:cc.Node){
        this.gameGuideNode = guideNode;
        this.gameGuideScript = guideNode.getComponent("GameGuide");
        this.buttonsEventOverride();
        this.neighborIndex = -1;
        var nextData = this.gameGuideScript.guidedata;
        this.scheduleOnce(() => {
            this.idCardButton.active = true;
            this.entryReasonBtn.active = true;
        }, 1);
        this.neighborRole.guide_dataAssignment(nextData);
        this.window_CheckInForm.updateData(nextData);
        this.window_IDCard.updateData(nextData);
        this.window_Telephone.updateData(101, ["Hello!!"]);
    }

    buttonsEventOverride(){
        this.idCardButton.getComponent(cc.Button).clickEvents.push(this.getButtonEvent(this.gameGuideNode,"GameGuide","btnEvent_ChangePostion_IDCard", this.window_IDCard.node));
        this.entryReasonBtn.getComponent(cc.Button).clickEvents.push(this.getButtonEvent(this.gameGuideNode,"GameGuide","btnEvent_ChangePostion_CheckInForm", this.window_CheckInForm.node));
        this.node.getChildByName("Record").getComponent(cc.Button).clickEvents.push(this.getButtonEvent(this.gameGuideNode,"GameGuide","btnEvent_ChangePostion_VisitorList", this.window_VisitorList));
        var canvasNode = cc.Canvas.instance.node;
        canvasNode.getChildByName("Floor").getChildByName("First").getComponent(cc.Button).clickEvents.push(this.getButtonEvent(this.gameGuideNode,"GameGuide","btnEvent_ChangePostion_FloorInfo",this.window_FloorInfo));

        this.node.getChildByName("Choose Buttons").getChildByName("Pass").getComponent(cc.Button).clickEvents[0] = this.getButtonEvent(this.node,"GuardWorker","guidePassBtnEvent",this.node);
    }

    getButtonEvent(node:cc.Node, scriptName : string, funcName: string, openNode:cc.Node) : cc.Component.EventHandler{
        var clickEventHandler = new cc.Component.EventHandler();
        clickEventHandler.target = node; // 这个 node 节点是你的事件处理代码组件所属的节点
        clickEventHandler.component = scriptName;// 这个是代码文件名
        clickEventHandler.handler = funcName;
        clickEventHandler.customEventData = Tool.getNodePath(openNode);
        //newBtn.clickEvents.push(clickEventHandler);
        return clickEventHandler;
    }

    guidePassBtnEvent(){
        this.makeDecision();
        
        var words1 = ["好的，谢谢啦！看来你挺不错的！"];
        let callbackFunc1 = () => {
            cc.tween(this.neighborRole.node)
            .to(0.1,{x: this.neighborRole.node.x + 30})
            .call(() => {
                cc.Tween.stopAllByTarget(this.neighborRole.node.children[0]);
                var words2 = ["哦，对了，听说最近有一群奇奇怪怪的不明物在附近瞎逛！！！","不知道，它们想干嘛！不会是惦记我阳台上的花吧！！我要赶紧回去"];
                let callbackFunc2 = () => {
                    cc.tween(this.neighborRole.node)
                    .delay(0.1)
                    .to(0.5,{x: this.neighborRole.node.x + 1000})
                    .call(() => {
                        cc.game.emit(EventsName.BLOCKTOUCH,true);
                        cc.Tween.stopAllByTarget(this.neighborRole.node.children[0]);
                        this.gameGuideScript.showEndTips();
                    })
                    .start();
                    this.neighborRole.playWalk();
                }
                cc.game.emit(EventsName.ROLE_PLAYTALK,words2, callbackFunc2.bind(this));
            })
            .start();
            this.neighborRole.playWalk();
        }
        cc.game.emit(EventsName.ROLE_PLAYTALK,words1,callbackFunc1.bind(this));
    }
    //#endregion
}
