
const {ccclass, property} = cc._decorator;
import status from "./model/gameStatus";
import pools from "./model/pools";
import player from "./model/player";
import { spawn } from "child_process";

@ccclass
export default class fish extends cc.Component {

    timer:number = 0;
    canTurn:boolean = false;
    limitTurn:number = 0;
    hp:number;
    speed:number;
    dropEvent:Function;

    shotTimer:number;
    bgNode:cc.Node;
    clipArr:Array<cc.AnimationClip> = [];
    isElite:boolean = false;

    //goldEndPosition:cc.Vec2 = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.goldEndPosition = cc.find("goldFrame",cc.director.getScene().getChildByName("Canvas")).position;
        //this.initFish(2*status.stage,status.stage) ;
        // this.bgNode = cc.find("bg",this.node);
        // this.clipArr = this.bgNode.getComponent(cc.Animation).getClips();
        this.scheduleOnce(()=>this.canTurn = true,2);
    }

    onEnable (){
        this.scheduleOnce(()=>this.canTurn = true,2);
    }

    start () {
        // this.bgNode = cc.find("bg",this.node);
        // this.clipArr = this.bgNode.getComponent(cc.Animation).getClips();
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
        this.node.position = this.node.position.add(cc.v2(Math.sin(radian),Math.cos(radian)).mul(this.speed));
        // cc.log(this.node.rotation);
        // cc.log(cc.v2(Math.sin(radian),Math.cos(radian)));
    }

    public initFish(hp:number,speed:number,dropEvent:Function):void{
        this.timer = 0;
        this.canTurn = false;
        this.limitTurn = 0;
        this.hp = hp;
        this.speed = speed;
        this.dropEvent = dropEvent;
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
        //status.fishNum--;
        //let dropArea = cc.find("dropArea",cc.director.getScene().getChildByName("Canvas"));
        let diePosition = this.node.position;
        //this.node.parent = null;
        if(!this.isElite){
            pools.fishPool.put(this.node);
            status.fishNum--;
            if(!status.curBuff){
                status.killNum++;
            }
        }else{
            this.node.active = false;
            this.node.parent = null;
            status.curBuff = 0;
             
        }
        this.dropEvent(diePosition);
        // let gold = pools.goldPool.get();
        // gold.parent = dropArea;
        // gold.position = diePosition;
        // let action1 = cc.moveTo(1,this.goldEndPosition);
        // let action2 = cc.scaleTo(1,0);
        // let action3 = cc.callFunc(()=>{pools.goldPool.put(gold);player.addGold(1)});
        // gold.runAction(cc.sequence(cc.spawn(action1,action2),action3));
    }

    reuse(){
        //this.initFish(status.stage,status.stage);
        if(!this.bgNode||!this.clipArr){
            this.bgNode = cc.find("bg",this.node);
            this.clipArr = this.bgNode.getComponent(cc.Animation).getClips();
        }
        this.bgNode.getComponent(cc.Animation).play(this.clipArr[0].name);
        this.scheduleOnce(()=>this.canTurn = true,3);
    }

    unuse(){
        this.unscheduleAllCallbacks();
        this.node.stopAllActions();
        if(this.bgNode&&this.bgNode.getComponent(cc.Animation)){
            this.bgNode.getComponent(cc.Animation).stop(this.clipArr[0].name);
        }
    }


    onCollisionEnter(other:cc.BoxCollider,self:cc.BoxCollider){
        if(other.node.group === "bullet"){
            this.node.getChildByName("bg").color = new cc.Color(255,0,0,0);
            this.scheduleOnce(()=>this.node.getChildByName("bg").color = new cc.Color(255,255,255,0),0.1);
            this.hp--;
            if(this.hp<=0){
                //pools.fishPool.put(this.node);
                this.scheduleOnce(this.fishDie,0.1);
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
