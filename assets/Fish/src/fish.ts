
const {ccclass, property} = cc._decorator;
import status from "./model/gameStatus";
import pools from "./model/pools";
import player from "./model/player";

@ccclass
export default class fish extends cc.Component {

    timer:number = 0;
    canTurn:boolean = false;
    limitTurn:number = 0;
    hp:number;
    speed:number;

    shotTimer:number;

    goldEndPosition:cc.Vec2 = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.goldEndPosition = cc.find("goldFrame",cc.director.getScene().getChildByName("Canvas")).position;
        this.initFish() ;
        this.scheduleOnce(()=>this.canTurn = true,3);
    }

    start () {

    }

    update (dt) {
        if(this.canTurn){
            this.timer += dt;
            if(this.timer>=0.3){
                this.rodomTurn();
                this.timer = 0;
            }
        }
        let radian = this.node.rotation*Math.PI/180;
        this.node.position = this.node.position.add(cc.v2(Math.sin(radian),Math.cos(radian)));
        // cc.log(this.node.rotation);
        // cc.log(cc.v2(Math.sin(radian),Math.cos(radian)));
    }

    private initFish():void{
        this.timer = 0;
        this.canTurn = false;
        this.limitTurn = 0;
        this.hp = status.stage;
        this.speed = status.stage;
    }

    private rodomTurn(){
        let rodom = Math.random();
        if(rodom<0.1&&this.limitTurn<8){
            //this.node.rotation += 10;
            this.node.runAction(cc.rotateBy(0.2,10));
            this.limitTurn += 1;
        }else if(rodom<0.2&&this.limitTurn<8){
            //this.node.rotation += 20;
            this.node.runAction(cc.rotateBy(0.2,20));
            this.limitTurn += 2
        }else if(rodom>=0.9&&this.limitTurn>-8){
            //this.node.rotation -= 10;
            this.node.runAction(cc.rotateBy(0.2,-10));
            this.limitTurn -= 1;
        }else if(rodom>=0.8&&this.limitTurn>-8){
            //this.node.rotation -=20;
            this.node.runAction(cc.rotateBy(0.2,-20));
            this.limitTurn -= 2;
        }
    }

    private fishDie(){
        status.fishNum--;
        let dropArea = cc.find("dropArea",cc.director.getScene().getChildByName("Canvas"));
        let diePosition = this.node.position;
        pools.fishPool.put(this.node);
        let gold = pools.goldPool.get();
        gold.parent = dropArea;
        gold.position = diePosition;
        let action1 = cc.moveTo(1,this.goldEndPosition);
        let action2 = cc.scaleTo(1,0);
        let action3 = cc.callFunc(()=>{pools.goldPool.put(gold);player.addGold(1)});
        gold.runAction(cc.sequence(cc.spawn(action1,action2),action3));
    }

    reuse(){
        this.initFish();
        this.scheduleOnce(()=>this.canTurn = true,3);
    }

    unuse(){
        this.unscheduleAllCallbacks();
    }


    onCollisionEnter(other:cc.BoxCollider,self:cc.BoxCollider){
        if(other.node.group === "bullet"){
            this.node.getChildByName("bg").color = new cc.Color(255,0,0,150);
            clearTimeout(this.shotTimer);
            this.shotTimer = setTimeout(()=>this.node.getChildByName("bg").color = new cc.Color(255,255,255,0),0.3);
            this.hp--;
            if(this.hp<=0){
                //pools.fishPool.put(this.node);
                this.fishDie();
            }
        }
        else if(other.node.group === "border"&&this.canTurn === true){
            this.canTurn = false;
            let action2 = cc.callFunc(()=>this.canTurn = true);
            if(other.tag === 0){
                this.canTurn = false;
                let action1 = cc.rotateTo(0.5,180-self.node.rotation);
                self.node.runAction(cc.sequence(action1,action2));
            }else if(other.tag === 1){
                 let action1 = cc.rotateTo(0.5,-self.node.rotation);
                 self.node.runAction(cc.sequence(action1,action2));
            }
        }
    }

    
}
