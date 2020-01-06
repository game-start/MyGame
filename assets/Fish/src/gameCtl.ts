
const {ccclass, property} = cc._decorator;

import commonPool from "../../Common/commonPool";
import status from "./model/gameStatus";
import pools from "./model/pools";
import player from "./model/player";
import convert from "../../Common/convertPoint";


@ccclass
export default class gameCtl extends cc.Component {

    @property({type:cc.Node,tooltip:"鱼层"})
    fishArea:cc.Node = null;

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

    positionOrder:number = 0;
    
    onLoad () {
        cc.director.getCollisionManager().enabled = true;
        status.width = cc.winSize.width;
        status.height = cc.winSize.height;
        this.initPools();
        this.initPlayerInfo();
    }

    onEnable(){
        this.schedule(this.createSoldier,3,cc.macro.REPEAT_FOREVER,0.1);
        this.clickArea.on(cc.Node.EventType.TOUCH_START,this.clickStart,this);
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
    }

    /**
     * @function 初始化缓存池
     */
    private initPools():void{
        pools.fishPool = new commonPool(10,this.fish,"fish");
        pools.bulletPool = new commonPool(10,this.bullet);
        pools.goldPool = new commonPool(10,this.gold,"gold");
        pools.numListPool = new commonPool(3,this.numList,"numList");
    }
    
    /**
     * @function 初始化玩家配置和信息
     */
    private initPlayerInfo():void{
        let barrel:cc.Node = cc.find("barrel",this.gun);
        player.init(barrel,this.mask);
    }
    
    /**
     * @function 生成士兵鱼
     */
    private createSoldier():void{
        status.fishNum++;
        let fish = pools.fishPool.get();
        fish.parent = this.fishArea;
        //fish.getComponent("fish").initFish(3*status.stage,status.stage);
        cc.log(fish);
        if(this.positionOrder>2){
            this.positionOrder = 0;
        }
        switch (this.positionOrder) {
            case 0:
                fish.x = -status.width/2;
                fish.y = 0.8*(Math.random()-0.5)*status.height;
                fish.rotation = 90;
                //fish.runAction(cc.rotateTo(0,90,90));
                // fish.rotationX = 90;
                // fish.rotationY = 90;
                fish.scaleX = 1;
                cc.log(fish);
                break;
            case 1:
                fish.x = 0.8*(Math.random()-0.5)*status.width;
                fish.y = status.height/2;
                fish.rotation = 180;
                //fish.runAction(cc.rotateTo(0,180,180));
                // fish.rotationX = 180;
                // fish.rotationY = 180;
                fish.scaleX = 1;
                cc.log(fish);
                break;
            case 2:
                fish.x = status.width/2;
                fish.y = 0.8*(Math.random()-0.5)*status.height;
                fish.rotation = -90;
                //fish.runAction(cc.rotateTo(0,-90,-90));
                // fish.rotationX = -90;
                // fish.rotationY = -90;
                fish.scaleX = -1;
                cc.log(fish);
                break;
        }
        this.positionOrder++;
        cc.log(fish);
    }
    
    /**
     * @function 发射子弹
     * @param event 
     */
    private clickStart(event:cc.Event.EventTouch):void{
        let worldPosition:cc.Vec2 = event.getLocation();
            let clickPosition:cc.Vec2 = convert.worldToNode(worldPosition,this.clickArea);
            cc.log(clickPosition);
            let gunPosition:cc.Vec2 = this.gun.position;
        this.attack(clickPosition,gunPosition);  
    }

    private attack(position1:cc.Vec2,position2:cc.Vec2):void{
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

    private getDir(position1:cc.Vec2,position2:cc.Vec2):cc.Vec2{
        let direction:cc.Vec2 = position1.sub(position2);
        let dir:cc.Vec2 = direction.normalize();
        return dir;
    }
    
    /**
     * @function 清除数据重新开始游戏
     */
    private restart():void{
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
        this.mask.children[0].y = 0;
        // this.mask.children.splice(1).forEach(item=>pools.bulletPool.put(item));
        // this.mask.children[0].y = 0;
    }
    
    /**
     * @function 删除数组元素要倒序遍历
     * @param arr 
     * @param pool 
     */
    private putAllToPool(arr:Array<cc.Node>,pool:commonPool){
        for(let i = arr.length-1;i>=0;i--){
            pool.put(arr[i]);
        }
    }

}
