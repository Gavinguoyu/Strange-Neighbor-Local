import { Global } from "../Global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class TelePhone extends cc.Component {

    @property({
        displayName:'电话回复每局间隔时长'
    })
    wordIntervalTime: number = 2;

    roomNo: number = 0;

    busyTips: cc.Node = null;
    conversation: cc.Node = null;
    conversation_RoomNo: cc.Label = null;
    conversation_WordBox: cc.Label = null;

    phoneNode: cc.Node = null;

    wordArr: string[] = [];
    wordIndex = 0;

    onLoad () {
        this.busyTips = this.node.getChildByName("Busy Tips");
        this.conversation = this.node.getChildByName("Conversation");
        this.conversation_RoomNo = this.conversation.getChildByName("Room No").getComponent(cc.Label);
        this.conversation_WordBox = this.conversation.getChildByName("Word Box").getComponent(cc.Label);
        this.phoneNode = this.node.getChildByName("Phone");

        this.busyTips.on(cc.Node.EventType.TOUCH_START,() => {
            this.busyTips.active = false;
        },this);

        this.conversation.on(cc.Node.EventType.TOUCH_START, this.nextWord, this);

        this.busyTips.active = false;
    }

    protected onEnable(): void {
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
        
        this.phoneNode.active = true;
        this.conversation.active = false;
    }

    updateData(roomNo: number, wordArr: string[]){
        this.roomNo = roomNo;
        this.wordArr = wordArr;
        this.wordIndex = 0;
    }

    roomBtnEvent(event, customEventData){
        var roomNo = Number(customEventData);
        if(roomNo == this.roomNo){
            this.showConversation();
        }
        else{
            this.showBusyTips();
        }
    }

    showConversation(){
        this.phoneNode.active = false;
        this.conversation.active = true;
        this.conversation_RoomNo.string = this.roomNo.toString();
        this.wordIndex = 0;
        this.conversation_WordBox.string = this.wordArr[this.wordIndex];
        this.scheduleOnce(this.nextWord, this.wordIntervalTime);
    }

    nextWord(){
        this.unschedule(this.nextWord);
        this.wordIndex++;
        if(this.wordIndex >= this.wordArr.length){
            return;
        }

        this.conversation_WordBox.string = this.wordArr[this.wordIndex];
    }

    closeConversation(){
        this.conversation.active = false;
        this.phoneNode.active = true;
    }

    showBusyTips(){
        this.busyTips.active = true;
        this.scheduleOnce(() => {
            this.busyTips.active = false;
        },3);
    }

    close(){
        this.node.active = false;
    }
}
