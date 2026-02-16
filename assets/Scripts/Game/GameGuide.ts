import { EventsName } from "../EventsName";

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

     guidedata = {
          NeighborNo:5,
          MainSpriteURL:'jumin_5',
          isReal:true,
          ER_Reason:"",
          QA_Identity:"",
          QA_Appearance:"",
          QA_EntryReason:"",
          QA_VisitorList:"",
          showIDCard: true,
          HasER:true,
          ApartmentNo:"101",
     };
     openPositions = {
          idCard: new cc.Vec3(0, -100),
          visitorList: new cc.Vec3(-200, -800),
          checkInForm: new cc.Vec3(-280, 540),
          floorInfo: new cc.Vec3(-55, 713),
     };
     idcardNode = null;
     visitorListNode = null;
     checkInFormNode = null;
     floorInfoNode = null;
     allClose = false;
     tipsText: cc.RichText = null;
     tipsWordArr = ["Emmm，不明。。。是什么？算了要是真的遇到就赶出去好了！",
          "<color=#00000>如果遇到<color=#FF0000>坏人</c>，可以拒绝他们进入噢！右下角<color=#FF0000>红色按键</c>就是！但是如果不是坏人，也会被赶出去！</c>",
          "好了，准备开始你的旅程吧！！我会一直陪在你身边呦！!"];
     tipsIndex = 0;
     idCardStartTouchPos: cc.Vec2 = cc.Vec2.ZERO;    
     protected start(): void {
          this.tipsText = this.node.getComponentInChildren(cc.RichText);
          this.tipsText.node.parent.active = false;
     }

     protected update(dt: number): void {
          if(this.allClose){
               return;
          }
          if(this.idcardNode && this.visitorListNode && this.checkInFormNode && this.floorInfoNode){
               if(!this.idcardNode.active && !this.visitorListNode.active && !this.checkInFormNode.active && !this.floorInfoNode.active){
                    this.allClose = true;
                    cc.game.emit(EventsName.BLOCKTOUCH, false);
                    var words = ["这么快!!就检查完了？Emmm","那还等什么？？？快让我过去！！"];
                    cc.game.emit(EventsName.ROLE_PLAYTALK, words, () => {
                         cc.game.emit(EventsName.GUIDE, 13);
                    });
               }
          }
     }

     btnEvent_ChangePostion_IDCard(event, customEventData:string){
          this.idcardNode = cc.find(customEventData);
          this.idcardNode.position = this.openPositions.idCard;
     }
     btnEvent_ChangePostion_VisitorList(event, customEventData:string){
          this.visitorListNode = cc.find(customEventData);
          this.visitorListNode.position = this.openPositions.visitorList;
     }
     btnEvent_ChangePostion_CheckInForm(event, customEventData:string){
          this.checkInFormNode = cc.find(customEventData);
          this.checkInFormNode.position = this.openPositions.checkInForm;
     }
     btnEvent_ChangePostion_FloorInfo(event, customEventData:string){
          this.floorInfoNode = cc.find(customEventData);
          this.floorInfoNode.position = this.openPositions.floorInfo;
     }
     showEndTips(){
          this.tipsText.node.parent.active = true;
          this.nextTips();
          this.node.on(cc.Node.EventType.TOUCH_START,this.nextTips,this);
     }
     nextTips(){
          cc.Tween.stopAllByTarget(this.node);
          if(this.tipsIndex >= this.tipsWordArr.length){
               setTimeout(() => {
                    cc.director.loadScene('GameScene');
               }, 1);
               this.node.active = false;
               return;
          }
          this.tipsText.string = this.tipsWordArr[this.tipsIndex];
          this.tipsIndex++;
          cc.tween(this.node)
          .delay(4)
          .call(() => {
               this.nextTips();
          })
          .start();
     }
}
