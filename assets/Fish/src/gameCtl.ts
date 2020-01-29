
const {ccclass, property} = cc._decorator;

import commonPool from "../../Common/commonPool";
import status from "./model/gameStatus";
import pools from "./model/pools";
import player from "./model/player";
import convert from "../../Common/convertPoint";
import {Buff} from "./model/buffEnum"

// enum Buff {
//     "speedUp" = 1,
// }


@ccclass
export default class gameCtl extends cc.Component {

    @property({type:cc.Node,tooltip:"普通鱼层"})
    fishArea:cc.Node = null;

    @property({type:cc.Node,tooltip:"精英鱼层"})
    eliteFishArea:cc.Node = null;

    @property({type:cc.Node,tooltip:"子弹层"})
    bulletArea:cc.Node = null;

    @property({type:cc.Node,tooltip:"掉落层"})
    dropArea:cc.Node = null;

    @property({type:cc.Node,tooltip:"点击层"})
    clickArea:cc.Node = null;

    @property({type:cc.Prefab,tooltip:"鱼的预制"})
    fish:cc.Prefab = null;

    @property({type:cc.Prefab,tooltip:"子弹预制"})
    bullet:cc.Prefab = null;

    @property({type:cc.Prefab,tooltip:"金币的预制"})
    gold:cc.Prefab = null;
    
    @property({type:cc.Prefab,tooltip:"数字列表预制"})
    numList:cc.Prefab = null;
    
    @property({type:cc.Node,tooltip:"数字列表父节点"})
    mask:cc.Node = null;

    @property({type:cc.Node,tooltip:"炮台"})
    gun:cc.Node = null;

    @property({type:cc.JsonAsset,tooltip:"鱼的属性表"})
    fishJson:cc.JsonAsset = null;

    eliteFishData:Array<object> = [];

    buffFish:Array<cc.Node> = [];

    positionOrder:number = 0;
    goldEndPosition:cc.Vec2;

    eliteFish:cc.Node = null;
    
    onLoad () {
        cc.director.getCollisionManager().enabled = true;
        status.width = cc.winSize.width;
        status.height = cc.winSize.height;
        this.eliteFishData = this.fishJson.json;
        this.goldEndPosition = cc.find("goldFrame",cc.director.getScene().getChildByName("Canvas")).position;
        this.initPools();
        this.initPlayerInfo();
    }

    onEnable(){
        this.schedule(this.createSoldier,3,cc.macro.REPEAT_FOREVER,0.1);
        this.clickArea.on(cc.Node.EventType.TOUCH_START,this.clickStart,this);
        cc.director.on("clearBuff",);
    }

    onDisable(){
        this.unschedule(this.createSoldier);
    }

    start () {

    }

    

    update (dt) {
        if(status.fishNum>status.maxFishNum){
            this.restart();
        }
        if(status.killNum>=status.maxKillNum){
            this.createElite();
            status.killNum = 0;
        }
    }

    /**
     * @function 初始化缓存池
     */
    initPools():void{
        pools.fishPool = new commonPool(10,this.fish,"fish");
        pools.bulletPool = new commonPool(10,this.bullet);
        pools.goldPool = new commonPool(10,this.gold,"gold");
        pools.numListPool = new commonPool(3,this.numList,"numList");
    }
    
    /**
     * @function 初始化玩家配置和信息
     */
        initPlayerInfo():void{
        let barrel:cc.Node = cc.find("barrel",this.gun);
        player.init(barrel,this.mask);
    }
    
    /**
     * @function 生成士兵鱼
     */
    createSoldier():void{
        status.fishNum++;
        let fish = pools.fishPool.get();
        fish.parent = this.fishArea;
        fish.getComponent("fish").initFish(status.stage,status.stage,this.dropGold.bind(this));
        if(status.curBuff){
            fish.addComponent(Buff[status.curBuff]);
            this.buffFish.push(fish);
        }
        cc.log(fish);
        if(this.positionOrder>2){
            this.positionOrder = 0;
        }
        this.initFishPosition(fish);
        this.positionOrder++;
        cc.log(fish);
    }
    
    /**
     * @function 生成精英鱼
     */
    createElite():void{
        //let fish = pools.fishPool.get();
        if(!this.eliteFish){
            this.eliteFish = cc.instantiate(this.fish);
            this.eliteFish.getComponent("fish").isElite = true;
        }
        //this.eliteFish.getComponent("fish").isElite = true;
        this.eliteFish.parent = this.eliteFishArea;
        this.eliteFish.active = true;
        let i = Math.floor(Math.random()*this.eliteFishData.length);
        let item = this.eliteFishData[i];
        this.eliteFish.getComponent(cc.BoxCollider).size.width = item["collisionBox"]["w"];
        this.eliteFish.getComponent(cc.BoxCollider).size.height = item["collisionBox"]["h"];
        let animation = this.eliteFish.getChildByName("bg").getComponent(cc.Animation);
        let clipArr = animation.getClips();
        animation.play(clipArr[item["number"]].name);
        status.curBuff = item["number"];
        this.eliteFish.getComponent("fish").initFish(item["hp"],item["speed"],this.dropGold.bind(this));
        if(this.positionOrder>2){
            this.positionOrder = 0;
        }
        this.initFishPosition(this.eliteFish);
        this.positionOrder++;
        this.addBuff();
    }
    
    /**
     * @function 给存活的鱼加buff
     */
    addBuff(){
        this.fishArea.children.forEach(item=>{
            item.addComponent(Buff[status.curBuff]);
            this.buffFish.push(item);
        });
    }
    
    /**
     * @function 移除所有鱼的buff，包括不在场的
     */
    removeBuff(){
        this.buffFish.forEach(item=>{item.removeComponent(Buff[status.curBuff])});
        this.buffFish = [];
    }
    
    /**
     * @function 初始化鱼的出生位置
     * @param fish 
     */
    initFishPosition(fish:cc.Node):void{
        switch (this.positionOrder) {
            case 0:
                fish.x = -status.width/2;
                fish.y = 0.8*(Math.random()-0.5)*status.height;
                fish.rotation = 90;
                fish.scaleX = 1;
                cc.log(fish);
                break;
            case 1:
                fish.x = 0.8*(Math.random()-0.5)*status.width;
                fish.y = status.height/2;
                fish.rotation = 180;
                fish.scaleX = 1;
                cc.log(fish);
                break;
            case 2:
                fish.x = status.width/2;
                fish.y = 0.8*(Math.random()-0.5)*status.height;
                fish.rotation = -90;
                fish.scaleX = -1;
                cc.log(fish);
                break;
        }
    }

    dropGold(position:cc.Vec2):void{
        let gold = pools.goldPool.get();
        gold.parent = this.dropArea;
        gold.position = position;
        let action1 = cc.moveTo(1,this.goldEndPosition);
        let action2 = cc.scaleTo(1,0);
        let action3 = cc.callFunc(()=>{pools.goldPool.put(gold);player.addGold(1)});
        gold.runAction(cc.sequence(cc.spawn(action1,action2),action3));
    }
    
    /**
     * @function 发射子弹
     * @param event 
     */
    clickStart(event:cc.Event.EventTouch):void{
        let worldPosition:cc.Vec2 = event.getLocation();
        let clickPosition:cc.Vec2 = convert.worldToNode(worldPosition,this.clickArea);
        cc.log(clickPosition);
        let gunPosition:cc.Vec2 = this.gun.position;
        this.attack(clickPosition,gunPosition);  
    }

    attack(position1:cc.Vec2,position2:cc.Vec2):void{
        let dir:cc.Vec2 = this.getDir(position1,position2);
        let rotation:number = Math.atan2(dir.x,dir.y)*180/Math.PI;
        this.gun.rotation = rotation;
        let action1 = cc.moveBy(0.1,0,-35);
        let action2 = cc.moveBy(0.1,0,35);
        let action3 = cc.callFunc(()=>{
            let bullet = pools.bulletPool.get();
            bullet.parent = this.bulletArea;
            let nodePositon = cc.find("launch",this.gun).position;
            bullet.position = convert.nodeToNode(nodePositon,this.gun,this.bulletArea);
            bullet.rotation = rotation;
            bullet.getComponent("bullet").init(dir,1);
        });
        player.barrel.runAction(cc.sequence(action1,action2,action3));
    }

    getDir(position1:cc.Vec2,position2:cc.Vec2):cc.Vec2{
        let direction:cc.Vec2 = position1.sub(position2);
        let dir:cc.Vec2 = direction.normalize();
        return dir;
    }
    
    /**
     * @function 清除数据重新开始游戏
     */
    restart():void{
        this.initPlayerInfo();
        status.init();
        // let t = this.fishArea.children;
        // this.dropArea.children.forEach(item=>pools.goldPool.put(item));
        // this.fishArea.children.forEach(item=>pools.fishPool.put(item));
        // this.bulletArea.children.forEach(item=>pools.bulletPool.put(item));
        this.putAllToPool(this.dropArea.children,pools.goldPool);
        this.putAllToPool(this.fishArea.children,pools.fishPool);
        this.putAllToPool(this.bulletArea.children,pools.bulletPool);
        this.putAllToPool(this.mask.children.slice(1),pools.numListPool);
        this.eliteFish.active = false;
        this.eliteFish.parent = null;
        this.mask.children[0].y = 0;
        // this.mask.children.splice(1).forEach(item=>pools.bulletPool.put(item));
        // this.mask.children[0].y = 0;
    }
    
    /**
     * @function 删除数组元素要倒序遍历
     * @param arr 
     * @param pool 
     */
    putAllToPool(arr:Array<cc.Node>,pool:commonPool){
        for(let i = arr.length-1;i>=0;i--){
            pool.put(arr[i]);
        }
    }

}
0