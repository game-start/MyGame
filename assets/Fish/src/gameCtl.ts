
const { ccclass, property } = cc._decorator;

import commonPool from "../../Common/commonPool";
import status from "./model/gameStatus";
import pools from "./model/pools";
import player from "./model/player";
import convert from "../../Common/convertPoint";
import { Buff } from "./model/buffEnum"
import { promises } from "dns";

interface skillRecord{
    number:number,
    curTimes:number,
    maxTimes:number,
    cd:number
}

// enum Buff {
//     "speedUp" = 1,
// }


@ccclass
export default class gameCtl extends cc.Component {

    @property({ type: cc.Node, tooltip: "普通鱼层" })
    fishArea: cc.Node = null;

    @property({ type: cc.Node, tooltip: "精英鱼层" })
    eliteFishArea: cc.Node = null;

    @property({ type: cc.Node, tooltip: "子弹层" })
    bulletArea: cc.Node = null;

    @property({ type: cc.Node, tooltip: "掉落层" })
    dropArea: cc.Node = null;

    @property({ type: cc.Node, tooltip: "点击层" })
    clickArea: cc.Node = null;

    @property({type:cc.Node,tooltip:"提示框层"})
    tipsArea:cc.Node = null;

    @property({ type: cc.Node, tooltip: "商店" })
    shop: cc.Node = null;

    @property({type:cc.Node,tooltip:"技能栏"})
    skillsArea: cc.Node = null;

    @property({ type: cc.Prefab, tooltip: "鱼的预制" })
    fish: cc.Prefab = null;

    @property({ type: cc.Prefab, tooltip: "子弹预制" })
    bullet: cc.Prefab = null;

    @property({ type: cc.Prefab, tooltip: "金币的预制" })
    gold: cc.Prefab = null;

    @property({ type: cc.Prefab, tooltip: "数字列表预制" })
    numList: cc.Prefab = null;

    @property({type:cc.Prefab,tooltip:"cd蒙层预制"})
    cdMask:cc.Prefab = null;

    @property({type:cc.Prefab,tooltip:"信息悬浮框预制"})
    info:cc.Prefab = null;

    @property({type:cc.Prefab,tooltip:"提示框"})
    tips:cc.Prefab = null;

    @property({type:cc.Prefab,tooltip:"大提示框"})
    promptBox:cc.Prefab = null;

    @property({ type: cc.Node, tooltip: "数字列表父节点" })
    mask: cc.Node = null;

    @property({ type: cc.Node, tooltip: "炮台" })
    gun: cc.Node = null;

    @property({ type: cc.JsonAsset, tooltip: "鱼的属性表" })
    fishJson: cc.JsonAsset = null;

    @property({ type: cc.JsonAsset, tooltip: "技能的数据表" })
    skillJson: cc.JsonAsset = null;

    @property({type:cc.Integer,tooltip:"商店刷新间隔(单位/s)"})
    refreshTime: number = 60;

    @property({type:cc.Node,tooltip:"商店的new提示"})
    new:cc.Node = null;

    @property({type:cc.Label,tooltip:"顶部士兵鱼文字"})
    soldierFishLabel:cc.Label = null;

    @property({type:cc.Label,tooltip:"顶部精英鱼文字"})
    eliteFishLabel:cc.Label = null;

    @property({type:cc.Label,tooltip:"顶部子弹伤害文字"})
    bulletHurt:cc.Label = null;

    shopTimer:number = 1;
    shopTotalTime:number = 0;
    
    //精英鱼和技能的数据
    eliteFishData: Array<object> = [];
    skillData: Array<object> = [];
    
    //被buff过的鱼，放在一起方便管理
    buffFish: Array<cc.Node> = [];
    
    //作为判断鱼出生位置的标识
    positionOrder: number = 0;

    //金币飞向的最终位置
    goldEndPosition: cc.Vec2;

    //精英鱼节点，方便管理
    eliteFish: cc.Node = null;
    
    //存入所有cd蒙层，方便重新游戏时放回池中，其他的因为可以通过父节点管理，所以没这样操作
    cdMaskArr: Array<cc.Node> = [];
    
    //记录技能子弹已使用数量
    skillBulletArr:Array<skillRecord> = [];
    
    //所有技能的开始和结束方法
    skillFunctionArr:Array<object> = [
        {beginFunc:this.doubleShoot,endFunc:this.doubleShootEnd},
        {beginFunc:this.punctureShoot,endFunc:this.punctureShootEnd},
        {beginFunc:this.springShoot,endFunc:this.springShootEnd},
        {beginFunc:this.strongShoot,endFunc:this.strongShootEnd}
    ]

    //信息悬浮框
    Info:cc.Node = undefined;

    //新手引导的节点
    firstLoadArea:cc.Node = null;

    onLoad() {
        cc.director.getCollisionManager().enabled = true;
        status.width = cc.winSize.width;
        status.height = cc.winSize.height;
        if(status.height>status.width){
            cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            let canvas = cc.find("Canvas");
            canvas.getComponent(cc.Canvas).fitHeight = false;
            canvas.getComponent(cc.Canvas).fitWidth = true;
        }
        this.eliteFishData = this.fishJson.json;
        this.skillData = this.skillJson.json;
        this.goldEndPosition = cc.find("goldFrame", cc.director.getScene().getChildByName("Canvas")).position;
        this.initPools();
        this.initPlayerInfo();
        this.refreshShop();
        if(cc.sys.localStorage.getItem("first") === null){
            console.log("第一次登陆");
            this.openNewhandPromptBox();
            // cc.director.on("release",this.releaseNewHandRes,this);
            // this.firstLoadingEvent();
            // cc.sys.localStorage.setItem("first",1);
        }else{
            console.log("你是老玩家");
        }
    }

    onEnable() {
        //this.schedule(this.createSoldier, 3, cc.macro.REPEAT_FOREVER, 0.1);
        this.clickArea.on(cc.Node.EventType.TOUCH_START, this.clickStart, this);
        cc.director.on("clearBuff", this.removeBuff, this);
        cc.director.on("updateSoldierFishLabel",this.updateSoldierFishLabel,this);
        cc.director.on("updateEliteFishLabel",this.updateEliteFishLabel,this);
        this.soldierFishLabel.node.on(cc.Node.EventType.MOUSE_ENTER,(event:cc.Event.EventMouse)=>this.showInfo(event.getLocation(),1),this);
        this.soldierFishLabel.node.on(cc.Node.EventType.MOUSE_MOVE,(event:cc.Event.EventMouse)=>this.moveInfo(event.getLocation()),this);
        this.soldierFishLabel.node.on(cc.Node.EventType.MOUSE_LEAVE,(event:cc.Event.EventMouse)=>this.hideInfo(),this);
        this.eliteFishLabel.node.on(cc.Node.EventType.MOUSE_ENTER,(event:cc.Event.EventMouse)=>this.showInfo(event.getLocation(),2),this);
        this.eliteFishLabel.node.on(cc.Node.EventType.MOUSE_MOVE,(event:cc.Event.EventMouse)=>this.moveInfo(event.getLocation()),this);
        this.eliteFishLabel.node.on(cc.Node.EventType.MOUSE_LEAVE,(event:cc.Event.EventMouse)=>this.hideInfo(),this);
    }
    onDisable() {
        this.unschedule(this.createSoldier);
        cc.director.off("clearBuff");
        cc.director.off("updateSoldierFishLabel");
        cc.director.off("updateEliteFishLabel");
    }

    start() {

    }



    update(dt) {
        if(status.canCreateFish){
            if(status.createFishTimer>=3){
                this.createSoldier();
                status.createFishTimer = 0;
            }
            status.createFishTimer += dt;
        }
        if (status.fishNum > status.maxFishNum) {
            this.restart();
            this.openSinglePromptBox("游戏失败","确定");
            //this.restart();
        }

        if (status.killNum >= status.maxKillNum) {
            this.createElite();
            status.killNum = 0;
        }
        
        this.shopTotalTime += dt;
        this.shopTimer += dt;
        if(this.shopTimer>=1){
            this.shopTimer = 0;
            this.updateShopTimer();
        }
        if(this.shopTotalTime>=this.refreshTime){
            //this.shopTotalTime = 0;
            //this.updateShopTimer();
            this.refreshShop();
        }
        
    }
    
    /**
     * @function 是否进行新手指导的提示框
     */
    openNewhandPromptBox(){
        let promptBox = pools.promptBoxPool.get();
        promptBox.parent = cc.find("Canvas");
        let text = promptBox.getChildByName("text");
        text.getComponent(cc.Label).string = "是否进行新手引导";
        let doubleButton = promptBox.getChildByName("doubleButton");
        doubleButton.active = true;
        doubleButton.getChildByName("text1").getComponent(cc.Label).string = "是";
        doubleButton.getChildByName("text2").getComponent(cc.Label).string = "否";
        doubleButton.getChildByName("button1").once(cc.Node.EventType.TOUCH_END,()=>{
            cc.director.resume();
            pools.promptBoxPool.put(promptBox);
            cc.director.on("newhandEnd",this.openSinglePromptBox.bind(this,"新手引导已经结束","确定",this.newhandEndButtonEvent),this);
            this.firstLoadingEvent();
            //cc.sys.localStorage.setItem("first",1);
        });
        doubleButton.getChildByName("button2").once(cc.Node.EventType.TOUCH_END,()=>{
            cc.director.resume();
            //doubleButton.active = false;
            pools.promptBoxPool.put(promptBox);
            cc.sys.localStorage.setItem("first",1);
        });
        this.scheduleOnce(()=>cc.director.pause(),0);
    }
    
    /**
     * @function 游戏结束/新手教程结束提示框
     */
    openSinglePromptBox(text:string,buttonText:string,Event?:Function){
        let promptBox = pools.promptBoxPool.get();
        promptBox.parent = cc.find("Canvas");
        let Text = promptBox.getChildByName("text");
        Text.getComponent(cc.Label).string = text;
        let singleButton = promptBox.getChildByName("singleButton");
        singleButton.active = true;
        singleButton.getChildByName("text").getComponent(cc.Label).string = buttonText;
        singleButton.getChildByName("button").once(cc.Node.EventType.TOUCH_END,()=>{
            //singleButton.active = false;
            //debugger;
            cc.director.resume();
            pools.promptBoxPool.put(promptBox);
            //debugger;
            if(Event){
                Event.call(this);
            }
            //Event.call(this);
        });
        this.scheduleOnce(()=>cc.director.pause(),0);
    }

    newhandEndButtonEvent(){
        debugger;
        this.restart();
        this.releaseNewHandRes();
    }
    
    /**
     * @function 初次进入游戏时的新手提示
     */
    firstLoadingEvent(){
        status.canCreateFish = false;
        this.loadNewHand();
    }

    // step1(){
    //     status.canCreateFish = false;
        
    // }

    // nextStep(area:cc.Node){
    //     this.centerText.getComponent("text").putFlashText("点击屏幕任意位置继续");
    //     return new Promise((resolve, reject)=>{
    //         area.once(cc.Node.EventType.TOUCH_END,()=>{this.hideText(this.centerText);resolve(area)});
    //     })
    // }

    // hideText(textNode:cc.Node){
    //     textNode.active = false;
    // }
    
    /**
     * @function 动态加载新手指导预制
     */
    loadNewHand(){
        cc.loader.loadRes("prefab/firstLoadArea",(err,prefab)=>{//因为只有第一次进游戏需要，所以动态加载
               if(prefab instanceof cc.Prefab){
                   this.firstLoadArea = cc.instantiate(prefab);
                   this.firstLoadArea.parent = cc.find("Canvas");
               }
            // if(prefabs[0] instanceof cc.Prefab){
            //     arrowPrefab = prefabs[0];
            //     this.arrow = cc.instantiate(arrowPrefab);
            // }
            // if(prefabs[1] instanceof cc.Prefab){
            //     textPrefab = prefabs[1];
            //     this.arrowText = cc.instantiate(textPrefab);
            //     this.centerText = cc.instantiate(textPrefab);
            // }
        })
    }
    
    /**
     * @function 释放动态加载的新手指导资源
     */
    releaseNewHandRes(){
        this.firstLoadArea.destroy();
        this.firstLoadArea = null;
        cc.loader.releaseRes("prefab/firstLoadArea");
    }

    
    /**
     * @function 更新商店刷新剩余时间
     */
    updateShopTimer(){
        let insideTimeLabel = this.shop.getChildByName("shop").getChildByName("timeLabel").getComponent(cc.Label);
        let outsideTimeLabel = cc.find("Canvas/bottomBorder/shop/timeLabel").getComponent(cc.Label);
        let time = Math.ceil(this.refreshTime - this.shopTotalTime);
        insideTimeLabel.string = `刷新剩余时间 ：${time}s`;
        outsideTimeLabel.string = `剩余时间 ：${time}s`
    }

    /**
     * @function 初始化缓存池
     */
    initPools(): void {
        pools.fishPool = new commonPool(10, this.fish, "fish");
        pools.bulletPool = new commonPool(10, this.bullet,"bullet");
        pools.goldPool = new commonPool(10, this.gold, "gold");
        pools.numListPool = new commonPool(3, this.numList, "numList");
        pools.cdMaskPool = new commonPool(3,this.cdMask,"cdMask");
        pools.infoPool = new commonPool(1,this.info,"info");
        pools.tipsPool = new commonPool(1,this.tips,"tips");
        pools.promptBoxPool = new commonPool(1,this.promptBox,"promptBox");
    }

    /**
     * @function 初始化玩家配置和信息
     */
    initPlayerInfo(): void {
        let barrel: cc.Node = cc.find("barrel", this.gun);
        player.init(barrel, this.mask);
    }

    /**
     * @function 生成士兵鱼
     */
    createSoldier(): void {
        status.fishNum++;
        this.updateSoldierFishLabel();
        let fish = pools.fishPool.get();
        fish.parent = this.fishArea;
        fish.getComponent("fish").initFish(status.stage, 1, this.dropGold.bind(this));
        if (status.curBuff) {
            // fish.addComponent(Buff[status.curBuff]);
            // this.buffFish.push(fish);
            fish.getComponent(Buff[status.curBuff]).enabled = true;
        }
        cc.log(fish);
        if (this.positionOrder > 2) {
            this.positionOrder = 0;
        }
        this.initFishPosition(fish);
        this.positionOrder++;
        cc.log(fish);
    }

    /**
     * @function 生成精英鱼
     */
    createElite(): void {
        //let fish = pools.fishPool.get();
        if (!this.eliteFish) {
            this.eliteFish = cc.instantiate(this.fish);
            this.eliteFish.getComponent("fish").isElite = true;
        }
        //this.eliteFish.getComponent("fish").isElite = true;
        this.eliteFish.parent = this.eliteFishArea;
        this.eliteFish.active = true;
        this.eliteFish.getComponent("fish").reuse();
        let i = Math.floor(Math.random() * this.eliteFishData.length);
        let item = this.eliteFishData[i];
        let name = item["name"];
        this.updateEliteFishLabel(name);
        this.eliteFish.getComponent(cc.BoxCollider).size.width = item["collisionBox"]["w"];
        this.eliteFish.getComponent(cc.BoxCollider).size.height = item["collisionBox"]["h"];
        let animation = this.eliteFish.getChildByName("bg").getComponent(cc.Animation);
        let clipArr = animation.getClips();
        animation.play(clipArr[item["number"]].name);
        status.curBuff = Number(item["number"]);
        this.eliteFish.getComponent("fish").initFish(item["hp"], item["speed"], this.dropGold.bind(this));
        if (this.positionOrder > 2) {
            this.positionOrder = 0;
        }
        this.initFishPosition(this.eliteFish);
        this.positionOrder++;
        this.addBuff();
    }

    /**
     * @function 给存活的鱼加buff
     */
    addBuff() {
        this.fishArea.children.forEach(item => {
            // item.addComponent(Buff[status.curBuff]);
            // this.buffFish.push(item);
            item.getComponent(Buff[status.curBuff]).enabled = true;
            //debugger;
        });
        //debugger;
        this.changeFishInfo(1);
    }

    /**
     * @function 移除所有鱼的buff，包括不在场的
     */
    removeBuff() {
        // this.buffFish.forEach(item => { item.removeComponent(Buff[status.curBuff]) });
        // this.buffFish = [];
        if(this.fishArea.children.length > 0){
            this.fishArea.children.forEach(item=>{
                item.getComponent(Buff[status.curBuff]).enabled = false;
            });
        }
        //debugger;
        this.changeFishInfo(0);
    }
    
    /**
     * @function 根据buff状态更改普通鱼的信息
     * 
     * @param 1代表增加buff，0代表去除buff
     */
    changeFishInfo(state:number){
        if(state){
            //let t = status.curBuff;
            switch(status.curBuff){
                case 1:
                    status.SoldierInfo["speed"] += 1;
                    //debugger;
                    break;
                case 2:
                    status.SoldierInfo["hp"] += 2;
                    //debugger;
                    break;
            }
        }else{
            switch (status.curBuff) {
                case 1:
                    status.SoldierInfo["speed"] -= 1;
                    break;
                case 2:
                    status.SoldierInfo["hp"] -= 2;
                    break;
            }
        }
    }
    
    /**
     * @function 更新士兵鱼存活数量的提示文字
     */
    updateSoldierFishLabel() {
        this.soldierFishLabel.string = `存活士兵鱼 ：${status.fishNum}`
    }
    
    /**
     * @function 更新当前精英鱼种类的提示文字
     */
    updateEliteFishLabel(text:string = "无") {
        this.eliteFishLabel.string = `当前精英鱼 ：${text}`
    }

    /**
     * @function 初始化鱼的出生位置
     * @param fish 
     */
    initFishPosition(fish: cc.Node): void {
        switch (this.positionOrder) {
            case 0:
                fish.x = -status.width / 2;
                fish.y = 0.8 * (Math.random() - 0.5) * (status.height - 120);
                fish.rotation = 90;
                fish.scaleX = 1;
                cc.log(fish);
                break;
            case 1:
                fish.x = 0.8 * (Math.random() - 0.5) * status.width;
                fish.y = status.height / 2 - 40;
                fish.rotation = 180;
                fish.scaleX = 1;
                cc.log(fish);
                break;
            case 2:
                fish.x = status.width / 2;
                fish.y = 0.8 * (Math.random() - 0.5) * (status.height - 120);
                fish.rotation = -90;
                fish.scaleX = -1;
                cc.log(fish);
                break;
        }
    }

    dropGold(position: cc.Vec2): void {
        let gold = pools.goldPool.get();
        gold.parent = this.dropArea;
        gold.position = position;
        let action1 = cc.moveTo(1, this.goldEndPosition);
        let action2 = cc.scaleTo(1, 0);
        let action3 = cc.callFunc(() => { pools.goldPool.put(gold); player.addGold(1) });
        gold.runAction(cc.sequence(cc.spawn(action1, action2), action3));
    }

    /**
     * @function 点击屏幕，发射子弹
     * @param event 
     */
    clickStart(event: cc.Event.EventTouch): void {
        let worldPosition: cc.Vec2 = event.getLocation();
        let clickPosition: cc.Vec2 = convert.worldToNode(worldPosition, this.clickArea);
        cc.log(clickPosition);
        let gunPosition: cc.Vec2 = this.gun.position;
        this.attack(clickPosition, gunPosition);
        this.scheduleOnce(this.skillEvent,0.2);
    }
    
    /**
     * @function 技能达到次数限制后开始冷却cd
     */
    skillEvent():void{
        let newSkillBulletArr = this.skillBulletArr.filter(item=>{
            item["curTimes"]++;
            let order = this.getSkillOrder(item["number"]);
            let skillNode = this.skillsArea.children[order];
            let laveBullet = item["maxTimes"] - item["curTimes"];
            let cdMask = skillNode.getChildByName("cdMask").getComponent("cdMask").writeText(`剩余:${laveBullet}枚`);
            if(item["curTimes"]>=item["maxTimes"]){
                let cd = item["cd"];
                //let order = this.getSkillOrder(item["number"]);
                if(skillNode){
                    //let skillNode = this.skillsArea.children[order];
                    this.skillFunctionArr[item["number"]]["endFunc"].call(this);
                    this.cdEvent(cd,skillNode);
                }
                return false;
            }
            return true;
        });
        this.skillBulletArr = newSkillBulletArr;
    }
    
    /**
     * @function 计算技能在哪个格子，不直接绑定是以后技能位置可能改变
     * @param 技能原本的编号
     */
    getSkillOrder(skillNumber:number):number{
        for(let i = 0,len = status.curSkills.length;i<len;i++){
            if(status.curSkills[i]["number"] === skillNumber){
                return i;
            }
        }
        return -1;
    }
    
    /**
     * @function 计算子弹方向
     *
     * @param {cc.Vec2} position1
     * @param {cc.Vec2} position2
     * @memberof gameCtl
     */
    attack(position1: cc.Vec2, position2: cc.Vec2): void {
        let dir: cc.Vec2 = this.positionToDirection(position1, position2);
        let rotation: number = Math.atan2(dir.x, dir.y) * 180 / Math.PI;
        rotation = this.limitRotation(rotation);
        this.gun.rotation = rotation;
        let action1 = cc.moveBy(0.1, 0, -35);
        let action2 = cc.moveBy(0.1, 0, 35);
        let func = function(end:string = ""){
            let bullet = pools.bulletPool.get();
            bullet.parent = this.bulletArea;
            let nodePositon = cc.find("launch"+end, this.gun).position;
            bullet.position = convert.nodeToNode(nodePositon, this.gun, this.bulletArea);
            bullet.rotation = rotation;
            let newDir = this.rotaionToDirection(rotation);
            bullet.getComponent("bullet").init(newDir, 1);
            
        }
        // let action3 = cc.callFunc(() => {
        //     let bullet = pools.bulletPool.get();
        //     bullet.parent = this.bulletArea;
        //     let nodePositon = cc.find("launch", this.gun).position;
        //     bullet.position = convert.nodeToNode(nodePositon, this.gun, this.bulletArea);
        //     bullet.rotation = rotation;
        //     bullet.getComponent("bullet").init(dir, 1);
        // });
        //player.barrel.forEach(item=>item.runAction(cc.sequence(action1,action2,action3)));
        for (let i = 0, len = player.barrel.length; i < len; i++) {
            if(len >1){
                player.barrel[i].runAction(cc.sequence(action1, action2, cc.callFunc(func.bind(this,i.toString()))).clone());
            }else{
                player.barrel[i].runAction(cc.sequence(action1, action2, cc.callFunc(func.bind(this,""))).clone());
            }
        }
    }
    
    limitRotation(rotation:number):number{
        let newRotation = rotation;
        if(player.barrel.length === 1){
            if(newRotation>45){
                this.setTips("超出射击范围");
                newRotation = 45;
            }
            if(newRotation<-45){
                this.setTips("超出射击范围");
                newRotation = -45;
            }
        }else if(player.barrel.length === 2){
            if(newRotation>25){
                this.setTips("超出射击范围");
                newRotation = 25;
            }
            if(newRotation<-25){
                this.setTips("超出射击范围");
                newRotation = -25;
            }
        }
        return newRotation;
    }
    
    /**
     * @function 通过角度获得方向(单位向量)
     * @param {number} rotation
     * @returns {cc.Vec2}
     * @memberof gameCtl
     */
    rotaionToDirection(rotation:number):cc.Vec2{
        let radian = rotation*Math.PI/180;
        let x = Math.sin(radian),y = Math.cos(radian);
        let dir = new cc.Vec2(x,y);
        return dir;
    }
    
    /**
     * @function 通过点击位置获得方向(单位向量)
     * @param {cc.Vec2} position1
     * @param {cc.Vec2} position2
     * @returns {cc.Vec2}
     * @memberof gameCtl
     */
    positionToDirection(position1: cc.Vec2, position2: cc.Vec2): cc.Vec2 {
        let direction: cc.Vec2 = position1.sub(position2);
        let dir: cc.Vec2 = direction.normalize();
        return dir;
    }

    /**
     * @function 清除数据重新开始游戏
     */
    restart(): void {
        this.gun.rotation = 0;
        if(this.eliteFish&&this.eliteFish.active === true){
            this.eliteFish.active = false;
            this.eliteFish.parent = null;
            this.removeBuff();
        }
        if(status.shop){
            this.closeShopEvent();
        }
        this.initPlayerInfo();
        status.init();
        this.updateSoldierFishLabel();
        this.updateEliteFishLabel();
        // let t = this.fishArea.children;
        // this.dropArea.children.forEach(item=>pools.goldPool.put(item));
        // this.fishArea.children.forEach(item=>pools.fishPool.put(item));
        // this.bulletArea.children.forEach(item=>pools.bulletPool.put(item));
        this.putAllToPool(this.dropArea.children, pools.goldPool);
        this.putAllToPool(this.fishArea.children, pools.fishPool);
        this.putAllToPool(this.bulletArea.children, pools.bulletPool);
        this.putAllToPool(this.mask.children.slice(1), pools.numListPool);
        this.putAllToPool(this.cdMaskArr,pools.cdMaskPool);
        // if(this.eliteFish){
        //     this.eliteFish.active = false;
        //     this.eliteFish.parent = null;
        //     this.removeBuff();
        // }
        this.mask.children[0].y = 0;
        // this.mask.children.splice(1).forEach(item=>pools.bulletPool.put(item));
        // this.mask.children[0].y = 0;
        this.clearSkillEffect();
        this.putSkillData();
        this.refreshShop();
    }
    
    /**
     * @function 清除技能效果
     */
    clearSkillEffect(){
        this.skillBulletArr.forEach(item=>{
            let number = item["number"];
            this.skillFunctionArr[number]["endFunc"].call(this);
        });
        this.skillBulletArr = [];
    }

    /**
     * @function 删除数组元素要倒序遍历
     * @param arr 
     * @param pool 
     */
    putAllToPool(arr: Array<cc.Node>, pool: commonPool) {
        for (let i = arr.length - 1; i >= 0; i--) {
            pool.put(arr[i]);
        }
    }

    /**
     * @function 商店打开按钮
     */
    openShopEvent() {
        if(this.new.active){
            this.new.active = false;
        }
        this.shop.active = true;
        status.shop = true;
        //cc.director.pause();
    }

    /**
     * @function 商店关闭按钮
     */
    closeShopEvent() {
        this.shop.active = false;
        status.shop = false;
        //cc.director.resume();
    }

    /**
     * @function 商店按钮绑定事件
     */
    shopClickEvent(event, customEventData) {
        // let node:cc.Node = event.target;
        // let button = node.getComponent(cc.Button);
        // button.interactable = false;
        // node.getChildByName("label").getComponent(cc.Label).string = "已售空";
        let goodsPrice = status.curGoods[customEventData]["price"];
        if(goodsPrice<=player.gold){
            player.addGold(-goodsPrice);
            status.curGoods[customEventData]["exist"] = false;
            let number = status.curGoods[customEventData]["number"];
            status.curGoods.forEach(item=>{
                if(item["number"] === number){
                    item["price"] += 5;
                }
            })
            this.putShopData();
            for(let i = 0,len = status.curSkills.length;i<len;i++){
                if(status.curSkills[i]["number"] == number){
                    status.curSkills[i]["lv"]++;
                    this.skillUp(status.curSkills[i]);
                    this.putSkillData();
                    return;
                }
            }
            if(status.curSkills.length<3){
                let newSkill = {number:number,lv:1,cdChange:0,timesChange:0};
                status.curSkills.push(newSkill);
                this.putSkillData();
            }else{
                this.setTips("技能栏已满");
            }
        }else{
            this.setTips("金币不足");
        }
    }
    
    /**
     * @function 提示框
     */
    setTips(text:string){
        // if(!status.isTips){
        //     status.isTips = true;
        //     let tips = pools.tipsPool.get();
        //     let component = tips.getComponent("tips");
        //     component.putText(text);
        //     component.fadeOut();
        // }
        if(status.Tips){
            status.Tips.getComponent("tips").resetTips();
        }
        let tips = pools.tipsPool.get();
        tips.parent = this.tipsArea;
        tips.getComponent("tips").init(text);
    }
    
    /**
     * @function 技能升级效果
     */
    skillUp(skill){
        let random = Math.random();
        if(random<=0.3){
            skill["cdChange"]++;
        }else{
            skill["timesChange"]++;
        }
    }
    
    /**
     * @function 给技能节点填充数据
     */
    putSkillData(){
        for(let i = 0,len = 3;i<len;i++){
            let name = this.skillsArea.children[i].getChildByName("name");
            let lv = this.skillsArea.children[i].getChildByName("lv");
            if(status.curSkills[i]){
                // let name = this.skillsArea.children[i].getChildByName("name");
                // let lv = this.skillsArea.children[i].getChildByName("lv");
                name.active = true;
                name.getComponent(cc.Label).string = this.skillData[status.curSkills[i]["number"]]["name"];
                lv.active = true;
                lv.getComponent(cc.Label).string = "LV " + status.curSkills[i]["lv"];
            }else{
                name.getComponent(cc.Label).string = "";
                lv.getComponent(cc.Label).string = "";
                name.active = false;
                lv.active = false;
            }
        }
    }

    /**
     * @function 刷新商店
     */
    refreshShop() {
        let MaxSkillsArr = this.getMaxSkills();
        for (let i = 0; i < 2; i++) {
            let number = Math.floor(Math.random() * this.skillData.length);
            number = this.excludeMaxSkill(number,MaxSkillsArr);
            let order = this.getSkillOrder(number);
            let price = this.skillData[number]["price"];
            if(order!=-1){
                let lv = status.curSkills[order]["lv"];
                price += 5*lv;
            }
            status.curGoods[i] = { number: number , price : price , exist: true };
        }
        this.putShopData();
        this.shopTimer = 1;
        this.shopTotalTime = 0;
        this.updateShopTimer();
        if(!this.new.active){
            this.new.active = true;
        }
    }
    
    /**
     * @function 刷新按钮绑定事件
     */
    quickRefresh(){
        if(player.gold>=5){
            player.addGold(-5);
            this.refreshShop();
            this.setTips("刷新成功");
        }else{
            this.setTips("金币不足");
        }  
    }
    
    /**
     * @function 商店刷新时排除掉已经升满级的技能
     */
    excludeMaxSkill(oldSkill:number,MaxSkillsArr:Array<number>):number{
        if(MaxSkillsArr.includes(oldSkill)){
            let newSkill = oldSkill + 1;
            if(newSkill>=this.skillData.length){
                newSkill = 0;
            }
            this.excludeMaxSkill(newSkill,MaxSkillsArr);
        }else{
            return oldSkill;
        }
    }

    getMaxSkills():Array<number>{
        let MaxSkillsArr = [];
        status.curSkills.forEach(item=>{
            if(item["lv"] === status.MaxLv){
                MaxSkillsArr.push(item["number"]);
            }
        })
        return MaxSkillsArr;
    }

    /**
     * @function 给商店节点填充数据
     */
    putShopData() {
        let shopList = this.shop.getChildByName("shop").getChildByName("layout").children;
        for (let i = 0; i < 2; i++) {
            shopList[i].children[0].getComponent(cc.Label).string = this.skillData[status.curGoods[i]["number"]]["name"];
            shopList[i].children[1].getComponent(cc.Label).string = status.curGoods[i]["price"].toString();
            if(status.curGoods[i]["exist"]){
                shopList[i].children[2].getComponent(cc.Button).interactable = true;
                shopList[i].children[2].getChildByName("label").getComponent(cc.Label).string = "购买";
            }else{
                shopList[i].children[2].getComponent(cc.Button).interactable = false;
                shopList[i].children[2].getChildByName("label").getComponent(cc.Label).string = "已售空";
            }
        }
    }

    /**
     * @function 技能按键绑定事件
     */
    skillClickEvent(event, customEventData) {
        let skill = status.curSkills[customEventData];
        if(skill){
            let number = skill["number"];
            let maxTimes = this.skillData[number]["times"] + skill["timesChange"];
            let cd = this.skillData[number]["cd"] - skill["cdChange"]
            this.skillBulletArr.push({number:number,curTimes:0,maxTimes:maxTimes,cd:cd});
            this.putCdMask(this.skillsArea.children[customEventData],maxTimes);
            this.useSkill(parseInt(customEventData));
        }else{
            this.setTips("此技能栏没有技能");
        }
    }

    putCdMask(skillNode:cc.Node,bulletNumber:number){
        let mask = pools.cdMaskPool.get();
        mask.getComponent("cdMask").writeText(`剩余:${bulletNumber}枚`);
        mask.parent = skillNode;
        this.cdMaskArr.push(mask);
    }
    
    /**
     * @function 根据技能栏绑定的技能序号调用相应的技能方法
     * @param {number} position
     * @memberof gameCtl
     */
    useSkill(position:number){
        let number = status.curSkills[position]["number"];
        this.skillFunctionArr[number]["beginFunc"].call(this);
    }

    /**
     * @function 双重射击
     */
    doubleShoot() {
        let barrel = cc.find("barrel",this.gun),doubleBarrel = cc.find("doubleBarrel",this.gun);
        barrel.active = false;
        doubleBarrel.active = true;
        player.barrel = doubleBarrel.children;
    }
    
    /**
     * @function 双重射击结束
     */
    doubleShootEnd(){
        let barrel = cc.find("barrel",this.gun),doubleBarrel = cc.find("doubleBarrel",this.gun);
        barrel.active = true;
        doubleBarrel.active = false;
        player.barrel = barrel.children;
    }
    
    /**
     * @function 穿刺子弹
     */
    punctureShoot(){
        player.isPuncture = true;
        player.bulletHurt ++;
        this.bulletHurt.string = `子弹伤害: ${player.bulletHurt}`;
    }
    
    /**
     * @function 穿刺子弹结束
     */
    punctureShootEnd(){
        player.isPuncture = false;
        player.bulletHurt --;
        this.bulletHurt.string = `子弹伤害: ${player.bulletHurt}`;
    }
    
    /**
     * @function 弹簧子弹
     */
    springShoot(){
        player.isSpring = true;
    }
    
    /**
     * @function 弹簧子弹结束
     */
    springShootEnd(){
        player.isSpring = false;
    }
    
    /**
     * @function 强力子弹
     */
    strongShoot(){
        player.bulletHurt += 2;
        this.bulletHurt.string = `子弹伤害: ${player.bulletHurt}`;
    }
    
    /**
     * @function 强力子弹结束
     */
    strongShootEnd(){
        player.bulletHurt -= 2;
        this.bulletHurt.string = `子弹伤害: ${player.bulletHurt}`;
    }
    
    /**
     * @function 技能栏进入cd状态
     * @param {number} cd
     * @param {cc.Node} skillNode
     * @memberof gameCtl
     */
    cdEvent(cd:number,skillNode:cc.Node){
        skillNode.getChildByName("cdMask").getComponent("cdMask").startCd(cd);
    }
    
    //信息框相关
    showInfo(position:cc.Vec2,type:number){
        let info = pools.infoPool.get();
        this.Info = info;
        this.Info.getComponent("info").updatePosition(position);
        this.Info.getComponent("info").decideType(type);
    }

    moveInfo(position:cc.Vec2){
        if(this.Info){
            this.Info.getComponent("info").updatePosition(position);
        }
    }

    hideInfo(){
        pools.infoPool.put(this.Info);
        this.Info.getComponent("info").decideType(0);
    }

}
