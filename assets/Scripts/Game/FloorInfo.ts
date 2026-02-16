import { EventsName } from "../EventsName";
import { Global } from "../Global";
import { NeighborsDataManager } from "./NeighborsDataManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FloorInfo extends cc.Component {

    public floorNo : number = 1;

    roomArr:cc.Node[] = [null, null, null];
    roomLableArr : cc.Label[] = [];
    peopleKuangArr:cc.Node[] = [null, null];
    floorRoomData = [[[], [], []], [[], [], []], [[], [], []]];
    onLoad(){
        this.resetFloorRoomsData();
        cc.game.on(EventsName.NEIGHBORS_UPDATE, this.resetFloorRoomsData, this);
        for(let i = 0; i < this.roomArr.length; i++){
            let roomNo = i+1;
            this.roomArr[i] = this.node.getChildByName("Room" + roomNo);
            this.roomLableArr.push(this.roomArr[i].getComponentInChildren(cc.Label));
        }

        this.peopleKuangArr[0] = this.node.getChildByName("Neighbor1");
        this.peopleKuangArr[1] = this.node.getChildByName("Neighbor2");
    }
    onEnable(){
        cc.audioEngine.playEffect(Global.audioClips.effects_open, false);
        for(let i = 0; i < this.roomArr.length; i++){
            let roomNo = i+1
            this.roomLableArr[i].string = this.floorNo + "0" + roomNo;
        }
        this.roomButton(null,1);
    }

    roomButton(event, customEventData){
        this.roomArr[customEventData - 1].setSiblingIndex(2);
        this.showRoomPeopleInfo(customEventData);
    }

    showRoomPeopleInfo(roomNo:number){
        var peoples = this.floorRoomData[this.floorNo - 1][roomNo - 1];
        for(let i = 0; i < 2; i++){
            if(peoples[i]){
                this.peopleKuangArr[i].active = true;
                Global.remotebundle.load('res/Texture/Role/'+peoples[i].SpriteUrl,cc.SpriteFrame, (err, asset:cc.SpriteFrame) => {
                    this.peopleKuangArr[i].getChildByName("PhotoBG").getChildByName("Mask").getComponentInChildren(cc.Sprite).spriteFrame = asset;
                });
                this.peopleKuangArr[i].getChildByName("Name").getComponent(cc.Label).string = peoples[i].Name;
                this.peopleKuangArr[i].getChildByName("Job").getComponentInChildren(cc.Label).string = peoples[i].Career;
                this.peopleKuangArr[i].getChildByName("IDCard").getComponentInChildren(cc.Label).string = peoples[i].ID_Number + "";
                this.peopleKuangArr[i].getChildByName("Appearance").getComponentInChildren(cc.Label).string = peoples[i].Appearance;
            }
            else{
                this.peopleKuangArr[i].active = false;
            }
        }
    }

    resetFloorRoomsData(){
        this.floorRoomData = [[[], [], []], [[], [], []], [[], [], []]];
        NeighborsDataManager.householdList.forEach(ele => {
            var no = ele.ApartmentNo;
            var floorNo = Math.floor(no / 100);
            var roomNo = no % 10;
            this.floorRoomData[floorNo-1][roomNo-1].push(ele);
        });
    }

    close(){
        this.node.active = false;
        cc.game.emit(EventsName.FLOORINFO_CLOSE);
    }
}
