
const {ccclass, property} = cc._decorator;
import status from "./model/gameStatus";
import pools from "./model/pools";

@ccclass
export default class fish extends cc.Component {

    timer:number = 0;
    canTurn:boolean = false;
    limitTurn:number = 0;
    hp:number;
    speed:number;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initFish();
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
        this.hp = status.stage;
        this.speed = status.stage;
    }

    private rodomTurn(){
        let rodom = Math.random();
        if(rodom<0.1&&this.limitTurn<8){
            this.node.rotation += 10;
            this.limitTurn += 1;
        }else if(rodom<0.2&&this.limitTurn<8){
            this.node.rotation += 20;
            this.limitTurn += 2
        }else if(rodom>=0.9&&this.limitTurn>-8){
            this.node.rotation -= 10;
            this.limitTurn -= 1;
        }else if(rodom>=0.8&&this.limitTurn>-8){
            this.node.rotation -=20;
            this.limitTurn -= 2;
        }
    }

    onCollisionEnter(other:cc.BoxCollider,self:cc.BoxCollider){
        this.node.getChildByName("bg").color = new cc.Color(255,0,0,150);
        setTimeout(()=>this.node.getChildByName("bg").color = new cc.Color(255,255,255,0),0.3);
        this.hp--;
        if(this.hp<=0){
            pools.fishPool.put(this.node);
        }
    }

    
}
