
const {ccclass, property} = cc._decorator;
import status from "../model/gameStatus";
import pools from "../model/pools";
import player from "../model/player";
import { spawn } from "child_process";
import convert from "../../../Common/convertPoint";
import {Buff} from "../model/buffEnum"

@ccclass
export default class fish extends cc.Component {

    timer:number = 0;
    canTurn:boolean = false;
    limitTurn:number = 0;
    maxHp:number;
    hp:number;
    border:boolean;
    unBorderSpeed:number;
    borderSpeed:number = 0.5;//到达边界时减速，避免穿墙发生
    dropEvent:Function;

    shotTimer:number;
    bgNode:cc.Node;
    clipArr:Array<cc.AnimationClip> = [];
    isElite:boolean = false;

    info:cc.Node = undefined;
    

    //goldEndPosition:cc.Vec2 = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //this.goldEndPosition = cc.find("goldFrame",cc.director.getScene().getChildByName("Canvas")).position;
        //this.initFish(2*status.stage,status.stage) ;
        // this.bgNode = cc.find("bg",this.node);
        // this.clipArr = this.bgNode.getComponent(cc.Animation).getClips();
        //console.log(/**鱼的onload */);
        this.scheduleOnce(()=>this.canTurn = true,2);

    }

    onEnable (){
        this.scheduleOnce(()=>this.canTurn = true,2);//因为精英鱼死亡不放回池中，只是将active设为false
        // this.node.on(cc.Node.EventType.MOUSE_ENTER,(event:cc.Event.EventMouse)=>{this.showInfo(event.getLocation())},this);
        // this.node.on(cc.Node.EventType.MOUSE_LEAVE,this.hideInfo,this);
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
        if(!this.border){
            this.node.position = this.node.position.add(cc.v2(Math.sin(radian),Math.cos(radian)).mul(this.unBorderSpeed));
        }else{
            this.node.position = this.node.position.add(cc.v2(Math.sin(radian),Math.cos(radian)).mul(this.borderSpeed));
        }
        // cc.log(this.node.rotation);
        // cc.log(cc.v2(Math.sin(radian),Math.cos(radian)));
        if(this.hp>this.maxHp){
            this.hp = this.maxHp;
        }
    }

    public initFish(maxHp:number,unBorderSpeed:number,dropEvent:Function):void{
        this.timer = 0;
        this.canTurn = false;
        this.limitTurn = 0;
        this.maxHp = maxHp;
        this.hp = maxHp;
        this.unBorderSpeed = unBorderSpeed;
        this.border = false;
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
            cc.director.emit("updateSoldierFishLabel");
            if(!status.curBuff){
                status.killNum++;
            }else{
                this.node.getComponent(Buff[status.curBuff]).enabled = false;
            }
        }else{
            this.unuse();
            this.node.active = false;
            this.node.parent = null;
            cc.director.emit("clearBuff");
            status.curBuff = 0;
            cc.director.emit("updateEliteFishLabel");                                                                                                                                                                       
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

    private boderTest(){

    }

    reuse(){
        //this.initFish(status.stage,status.stage);
        if(!this.bgNode||!this.clipArr){
            this.bgNode = cc.find("bg",this.node);
            this.clipArr = this.bgNode.getComponent(cc.Animation).getClips();
        }
        this.bgNode.getComponent(cc.Animation).play(this.clipArr[0].name);
        this.scheduleOnce(()=>this.canTurn = true,2);
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
            let hurt = other.node.getComponent("bullet").hurt;
            this.hp -= hurt;
            if(this.hp<=0){
                //pools.fishPool.put(this.node);
                this.scheduleOnce(this.fishDie,0.1);
            }
        }
        else if(other.node.group === "border"&&this.canTurn === true){
            this.canTurn = false;
            this.border = true;
            let action2 = cc.callFunc(()=>{this.canTurn = true;this.border = false});
            let rotationArr = [0,-90,-180,90];
            let action1 = cc.rotateTo(1,rotationArr[other.tag]);
            self.node.runAction(cc.sequence(action1,action2));
            // if(other.tag === 0){
            //     //this.canTurn = false;
            //     let action1 = cc.rotateTo(1,0);
            //     self.node.runAction(cc.sequence(action1,action2));
            // }else if(other.tag === 1){
            //     let action1 = cc.rotateTo(1,90);
            //     self.node.runAction(cc.sequence(action1,action2));
            // }
        }
    }

    // showInfo(position){
    //     let info = pools.infoPool.get();
    //     this.info = info;
    //     cc.log("/**信息节点坐标**/");
    //     cc.log(info);
    //     cc.log("/*********/");
    //     info.getComponent("info").updateContent("fish",position);
    // }

    // hideInfo(){
    //     pools.infoPool.put(this.info);
    // }
    
}
