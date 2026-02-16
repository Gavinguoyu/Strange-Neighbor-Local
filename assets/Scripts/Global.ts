import { EventsName } from "./EventsName";
import Guide from "./Tools/Guide";
import HttpSystem from "./Tools/HttpSystem";
import Tool from "./Tools/Tool";

let Global = {
	playerData:{
		openId:"",
		coin:0,
		wallets:0,
		lastUpdateVitalityTime:null,
		vitality:0,
		levelUnlock:[true, false, false],
		lastSkipTime:null,
		difficultyNo:0,
		deviceLevel:[0,0,0],
		gameProgress:{
			roleIndex:0,
			householdList:[],
			neighborList:[],
			visitorList:[],
			levelNo:1,
			levelTimes:0,
			score:{
				trueManPass:0,
				falseManPass:0,
				falseManRejected:0,
				tureManRejected:0,
			}
		}
	},

	setCoin(v:number){
		if(v < 0) return;
		this.playerData.coin = v; 
		HttpSystem.uploadPlayerData("coin", v);
		cc.game.emit(EventsName.UPDATE_COIN);
	},
	setWallets(v:number){
		if(v < 0) return;
		this.playerData.wallets = v;
		HttpSystem.uploadPlayerData("wallets", v);
	},
	resetLastUpdateVitalityTime(){
		this.getTime(() => {
			this.playerData.lastUpdateVitalityTime = Global.datetime.getTime();
			cc.log("重置体力时间"+this.playerData.lastUpdateVitalityTime + " "+ Global.datetime.getTime());
			HttpSystem.uploadPlayerData("lastUpdateVitalityTime", this.playerData.lastUpdateVitalityTime);
		});
	},
	setVitality(v: number){
		((v - this.playerData.vitality > 0) || (this._vitality == this.maxVitality)) && this.resetLastUpdateVitalityTime();
		v = v > this.maxVitality? this.maxVitality : v < 0 ? 0 : v;
		this.playerData.vitality = Number(v);
		HttpSystem.uploadPlayerData("vitality", this.playerData.vitality);
		cc.game.emit(EventsName.UPDATE_VITALITY);
	},

	checkVitality(){
		var durationTime = Global.datetime.getTime() - Global.playerData.lastUpdateVitalityTime;
		var vitalityCount = Math.floor(durationTime / (5 * 60 * 1000));
		if(vitalityCount > 0){
			this.setVitality(this.playerData.vitality + vitalityCount);	
			this.resetLastUpdateVitalityTime();
		}
	},
	
	
	reSetLastSkipTime(){
		this.getTime(() => {
			this.playerData.lastSkipTime = Global.datetime.getTime();
			HttpSystem.uploadPlayerData("lastSkipTime", this.playerData.lastSkipTime);
		})
	},
	videoReFreshSkipTime(){
		this.playerData.lastSkipTime -= 60 * 60 * 1000;
		HttpSystem.uploadPlayerData("lastSkipTime", this.playerData.lastSkipTime);
	},

	setUpdateServerTime(){
		this.playerData.serverUpdateTime = Global.datetime.getTime();
	},
	setOpenId(v:string){
		this.playerData.openId = v;	
		HttpSystem.updatePlayerData();
	},

	isGetServerData : false,
	serverDataVersion:0,
	maxVitality: 10,
	
	neighborsConfig:[],
	neighborSprites:[],

	scoreRules:{
		trueManPass:2,
		tureManRejected:-1,
		falseManPass:-5,
		falseManRejected:1,
	},

	scoreGradeRule:{
		S:1,
		A:0.9,
		B:0.8,
		C:0.6,
	},

	getSideGiftTime: 0,//获取侧边栏礼包时间
	levelConfig:[[],[],[]],

	difficultyConfig:[
		{
			trueManCount: 5,
			falseManCount: 3,
			difficulty:{
				low:1,
				middle:2,
				high:0,
			}
		},
		{
			trueManCount: 7, 
			falseManCount: 5,
			difficulty:{
				low:2,
				middle:2,
				high:1,
			}
		},
		{
			trueManCount: 6, 
			falseManCount: 9,
			difficulty:{
				low:1,
				middle:3,
				high:5,
			}
		}
	],

	deviceConfig:[],
	deviceSprites:[],

	flag_FormIndex:0,

	photoAlblum_SpritesConfig:[],

	initGameData(){
		this.checkVitality();
		Guide.checkGuide(); 
	},


	//#region  问题随机回答
	QAContents:{
		Identity:{
			Shown:[],
			NotShown:[],
			NoHave:[],
		},
		Appearance:[],
		EntryReason:{
			Have:[],
			NoHave:[]
		},
		VisitorList:{
			Have:[],
			NoHave:[]
		}
	},

    getRandomQA_Identity_Shown(){
        return this.QAContents.Identity.Shown[Tool.getRandomNum(0, this.QAContents.Identity.Shown.length - 1)].split(";");
    },

	getRandomQA_Identity_NotShown(){
        return this.QAContents.Identity.NotShown[Tool.getRandomNum(0, this.QAContents.Identity.NotShown.length - 1)].split(";");
    },

	getRandomQA_Identity_NoHave(){
        return this.QAContents.Identity.NoHave[Tool.getRandomNum(0, this.QAContents.Identity.NoHave.length - 1)].split(";");
    },

    getRandomQA_Appearance(){
        return this.QAContents.Appearance[Tool.getRandomNum(0, this.QAContents.Appearance.length - 1)].split(";");
    },

    getRandomQA_EntryReason_Have(){
        return this.QAContents.EntryReason.Have[Tool.getRandomNum(0, this.QAContents.EntryReason.Have.length - 1)].split(";");
    },

	getRandomQA_EntryReason_NoHave(){
        return this.QAContents.EntryReason.NoHave[Tool.getRandomNum(0, this.QAContents.EntryReason.NoHave.length - 1)].split(";");
    },

    getRandomQA_VisitorList_Have(){
        return this.QAContents.VisitorList.Have[Tool.getRandomNum(0, this.QAContents.VisitorList.Have.length - 1)].split(";");
    },

	getRandomQA_VisitorList_NoHave(){
        return this.QAContents.VisitorList.NoHave[Tool.getRandomNum(0, this.QAContents.VisitorList.NoHave.length - 1)].split(";");
    },
	//#endregion

	//#region 开场白和结束语
	StartWordsConfig:[],
	EndWordsConfig:{
		pass:[],
		unPass_trueMan:[],
		unpass_falseMan:[],
	},
	getRandomStartWords(){
        return this.StartWordsConfig[Tool.getRandomNum(0, this.StartWordsConfig.length - 1)].Words.split(";");
    },

    getRandomEndWords(wordArr: string[]){
        return wordArr[Tool.getRandomNum(0, wordArr.length - 1)].split(";");
    },
	//#endregion

	//#region  电话回复
	phoneWords:{
		trueMan_Roommate:[],
		falseMan_trueMan:[], 
		falseMan_Roommate_NoTrue:[],
		falseMan_Roommate_TrueAfter:[],
		noOne:[]
	},

	getRandomPhoneWords(wordArr: string[], myName: string = "", hisName: string = ""){
		var word = wordArr[Tool.getRandomNum(0, wordArr.length - 1)];
		word = word.replace("myName", myName);
		word = word.replace("hisName", hisName);
		return word.split(";");
	},
	//#endregion

	guide:{
		isGuideArray:[],
		isAllGuide:false,
		index:0,
		json:[],
	},

	//#region bundle
	remotebundle:null,
	//#endregion

	//#region  时间
	datetime : new Date(),
	intervalId: null, // 用于存储 setInterval 的 ID
	getTime(successFun,failedfun?){
        let url = 'https://quan.suning.com/getSysTime.do';
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () { 
            if (xhr.readyState == 4) {
                if(xhr.status >= 200 && xhr.status < 400){
                    let response = xhr.responseText;
                    let data = JSON.parse(response);
                    Global.datetime = new Date(data.sysTime2);
					if (this.intervalId) {
						clearInterval(this.intervalId);
					}

					// 启动新的定时器，每秒更新一次时间
					this.intervalId = setInterval(() => {
						const currentTimestamp = Global.datetime.getTime();
						Global.datetime = new Date(currentTimestamp + 1000);
						this.checkVitality();
					}, 1000);
                    if(successFun){
                        successFun();
                    }
                }
                else{
                    if(failedfun){
                        failedfun();
                    }
                }
            }
        }.bind(this);
        xhr.open("POST", url, true);
        // xhr.setRequestHeader('Access-Control-Allow-Origin','*');allLevelScore
        // xhr.setRequestHeader('Access-Control-Allow-Headers','Access-Control-Allow-Origin');
        xhr.send();
    },

	isNextDay(e: number){
		if (!e) {
			return true;
		}
		var t = new Date(1e3 * e);
		return t.getDate() != Global.datetime.getDate() || t.getMonth() != Global.datetime.getMonth() || t.getFullYear() != Global.datetime.getFullYear();
	},
	//#endregion

	//#region 音效
	audioClips:{
		effects_Background:null,
		effects_click:null,
		effects_open:null,
		effects_dialogue_man_1:null,
		effects_dialogue_man_2:null,
		effects_dialogue_woman_1: null,
		effects_dialogue_woman_2: null,
		effects_change:null,
		effects_fail:null,
		effects_over:null,
		effects_Game_Victory:null,
		effects_foot:null,
		effects_countdown:null,
	}
	//#endregion
}

export {Global};
