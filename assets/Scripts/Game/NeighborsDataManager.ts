import { EventsName } from "../EventsName";
import { Global } from "../Global";
import Tool from "../Tools/Tool";

let NeighborsDataManager = {
    pseudoPeoplesConfig:[],
	realPeoplesConfig:[],
    neighborList:[],
    visitorList:[], 
    householdList:[],

    setDataFormServer(){
        this.neighborList = Global.playerData.gameProgress.neighborList;
        this.visitorList = Global.playerData.gameProgress.visitorList;
        this.householdList = Global.playerData.gameProgress.householdList;
        if(this.neighborList.length == 0){
            this.neighborListInit();	
        }
    },

    neighborListInit(){
        if(this.pseudoPeoplesConfig == null || this.realPeoplesConfig == null)
            return;
        
        this.householdList = this.creatHouseholdList();

        this.neighborList = [];
        let trueManRatio = Global.difficultyConfig[2].trueManCount/(Global.difficultyConfig[2].trueManCount + Global.difficultyConfig[2].falseManCount);
        cc.log(Global.playerData.gameProgress.levelNo +"  "+Global.playerData.gameProgress.levelTimes);
        let realCount = Math.round(trueManRatio * Global.levelConfig[Global.playerData.gameProgress.levelNo][Global.playerData.gameProgress.levelTimes].Count);
        let pseudoCount = Global.levelConfig[Global.playerData.gameProgress.levelNo][Global.playerData.gameProgress.levelTimes].Count - realCount;
        var lowDifficulty = Math.round(Global.difficultyConfig[2].difficulty.low/Global.difficultyConfig[2].falseManCount * pseudoCount);
        var middleDifficulty = Math.round(Global.difficultyConfig[2].difficulty.middle/Global.difficultyConfig[2].falseManCount * pseudoCount);
        let pseudoDifficultyCount = [lowDifficulty, middleDifficulty, pseudoCount - lowDifficulty - middleDifficulty];
        if(Global.playerData.difficultyNo < 3){
            realCount = Global.difficultyConfig[Global.playerData.difficultyNo].trueManCount;
            pseudoCount = Global.difficultyConfig[Global.playerData.difficultyNo].falseManCount;
            pseudoDifficultyCount = [Global.difficultyConfig[Global.playerData.difficultyNo].difficulty.low, 
                                    Global.difficultyConfig[Global.playerData.difficultyNo].difficulty.middle,
                                    Global.difficultyConfig[Global.playerData.difficultyNo].difficulty.high];
        }
        let randomPseudoArr = [];
        //需要去掉冲突的
        //如：a在每日列表上，但同一个人b数据不在列表上
        for(let i = 0; i < this.pseudoPeoplesConfig.length; i++){
            this.pseudoPeoplesConfig[i].isReal = false;
            randomPseudoArr.push(this.pseudoPeoplesConfig[i]);
        }
        randomPseudoArr.sort(() => {
            return Math.random() - 0.5;
        });
        
        //randomPseudoArr = randomPseudoArr.splice(0,pseudoCount);
        
        let randomRealArr = [];
        this.realPeoplesConfig.forEach(element => {
            element.isReal = true;
            randomRealArr.push(element);
        });
        randomRealArr.sort(() => {
            return Math.random() - 0.5;
        });
        //去重
        let index = 0;
        while(this.neighborList.length < realCount){
            //var hasNeighbor = this.householdList.indexOf(ele => ele.No == randomRealArr[index].NeighborNo);
            if(!this.checkInHouseholdListByNo(randomRealArr[index].NeighborNo)){
                index++;
                continue;
            }
            if(!this.neighborList.includes(e => e.NeighborNo == randomRealArr[index].NeighborNo)){
                this.neighborList.push(randomRealArr[index]);
            }
            index++;
        }
        // this.neighborList.forEach((element, i) => {
        //     if(element.RequirePeer){
        //         var peerNo = this.getPeerNo(element.NeighborNo, element.ApartmentNo);
        //         //前面有
        //         //前面没有但后面有，不需要室友直接移到前面，需要室友再找一条同一人不需要室友的
        //         //都没有，找一个不需要室友的放到前面
        //         var peerIndexInPre = this.checkHavePeerInPre(i, peerNo);
        //         if(peerIndexInPre > -1){
        //             if(this.neighborList[peerIndexInPre].re)
        //         }
        //     }
        // });
        // let trueManIndex = 0;
        // while(trueManIndex < realCount){
        //     if(this.neighborList[trueManIndex].RequirePeer){
        //         if()
        //     }
        // }
        let pseudoIndex = 0;
        while(this.neighborList.length < pseudoCount + realCount){
            if(pseudoDifficultyCount[randomPseudoArr[pseudoIndex].Difficulty] > 0){
                pseudoDifficultyCount[randomPseudoArr[pseudoIndex].Difficulty]--;
                this.neighborList.push(randomPseudoArr[pseudoIndex]);
            }
            pseudoIndex++;
        }
        //this.neighborList = this.neighborList.concat(randomPseudoArr);
        this.neighborList.sort(() => {
            return Math.random() - 0.5;
        });
        
        this.creatVisitorList();
        cc.log(this.neighborList);
        cc.log(this.visitorList);
        cc.game.emit(EventsName.NEIGHBORS_UPDATE);

        //赋值给PlayerData
        Global.playerData.gameProgress.neighborList = this.neighborList;
        Global.playerData.gameProgress.visitorList = this.visitorList;
        Global.playerData.gameProgress.householdList = this.householdList;
    },
    
    guideNeighborListInit(){
        if(this.pseudoPeoplesConfig == null || this.realPeoplesConfig == null)
            return;
        
        this.householdList = Global.neighborsConfig.slice(0,16);
        var protagonistIndex = this.getHouseholdListIndexByNo(5);
        var protagonist = this.householdList[protagonistIndex];
        this.householdList[protagonistIndex] = this.householdList[0];
        this.householdList[0] = protagonist;
        var doubleRoomsNum = this.householdList.length % 9;
        var roomNoArr = ['101','102','103','201','202','203','301','302','303'];
        var roompeopleCount = {};
        var randomRoomArr = roomNoArr;
        randomRoomArr.forEach((e, index) => {
                roompeopleCount[e] = index < doubleRoomsNum ? 2 : 1;
        });
        var roomIndex = 0;
        this.householdList.forEach(element => {
            element.ApartmentNo = roomNoArr[roomIndex];
            roompeopleCount[roomNoArr[roomIndex]]--;
            if(roompeopleCount[roomNoArr[roomIndex]] < 1) roomIndex++;
        });
        for(let i = 0; i < 9; i++){
            this.visitorList.push(this.householdList[i].No);
        }
    },

    creatVisitorList(){
        this.visitorList = [];
        this.neighborList.forEach(element => {
            if(element.isReal || (element.IsInList && element.ER_ApartmentNoIsRight && this.checkInHouseholdListByNo(element.NeighborNo))){
                if(!this.visitorList.includes(element.NeighborNo)){
                    this.visitorList.push(element.NeighborNo);
                }
            }
        });

        var length = this.visitorList.length;
        if(length > 9){
            let exceedNum = length - 9;
            let intervalIndex = Math.floor(length / exceedNum);
            for(let i = 0; i < exceedNum; i++){
                this.visitorList.splice(this.getExceedVisitor(i * intervalIndex + i), 1);
            }
        }
    },
    creatHouseholdList(){
        var list = Global.neighborsConfig;
        list.sort(() => {
            return Math.random() - 0.5;
        });
        list = list.slice(0, Tool.getRandomNum(12,17));
        //分配房间
        var doubleRoomsNum = list.length % 9;
        var roomNoArr = ['101','102','103','201','202','203','301','302','303'];
        var randomRoomArr = roomNoArr;
        randomRoomArr.sort(() => {
            return Math.random() - 0.5;
        });
        var roompeopleCount = {};
        randomRoomArr.forEach((e, index) => {
                roompeopleCount[e] = index < doubleRoomsNum ? 2 : 1;
        });
        var roomIndex = 0;
        list.forEach(element => {
            element.ApartmentNo = roomNoArr[roomIndex];
            roompeopleCount[roomNoArr[roomIndex]]--;
            if(roompeopleCount[roomNoArr[roomIndex]] < 1) roomIndex++;
        });
        return list;
    },

    getExceedVisitor(index:number){
        return this.checkOnVisitorList(this.visitorList[index]) ? this.getExceedVisitor(index < this.visitorList.length - 1 ? index+1 : 0) : index;
    },

    checkOnVisitorList(neighborNo:number){
        return this.neighborList.filter(e => e.NeighborNo == neighborNo && e.IsInList).length > 0;
    },
    checkInHouseholdListByNo(neighborNo : number) : boolean{
        for(let i = 0; i < this.householdList.length; i++){
            if(this.householdList[i].No == neighborNo)
                return true;
            // else{
            //     cc.log(this.householdList[i].No + "  "+ neighborNo);
            // }
        }
        return false;
    },
    getHouseholdListIndexByNo(neighborNo : number) : number{
        for(let i = 0; i < this.householdList.length; i++){
            if(this.householdList[i].No == neighborNo)
                return i;
            // else{
            //     cc.log(this.householdList[i].No + "  "+ neighborNo);
            // }
        }
        return -1;
    },

    checkHavePeerInPre(index:number, PeerNo:number) : number{
        for(let i = 0; i < index; i++){
            if(this.neighborList[i].NeighborNo == PeerNo){
                return i;
            }
        }
        return -1;
    },
    getPeerNo(neighborNo : number, apartmentNo : number) : number{
        return this.householdList[this.householdList.indexOf(e => e.NeighborNo != neighborNo && e.ApartmentNo == apartmentNo)];
    },

    getHouseholdByNo(no:number){
        var index = -1;
        for(let i = 0; i < this.householdList.length; i++){
            if(this.householdList[i].No == no)
                index = i;
        }
        return this.householdList[index];
    },
    
    getNeighborDataByNo(no:number){
        var index = -1;
        for(let i = 0; i < Global.neighborsConfig.length; i++){
            if(Global.neighborsConfig[i].No == no)
                index = i;
        }	
        return Global.neighborsConfig[index];
    }
};
export {NeighborsDataManager};
