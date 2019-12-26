
const {ccclass, property} = cc._decorator;
import status from "./model/gameStatus"
@ccclass
export default class fish extends cc.Component {

    timer:number = 0;

    hp:number;
    speed:number;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.initFish();
    }

    start () {

    }

    update (dt) {
        this.timer += dt;
        if(this.timer>=0.3){
            this.rodomTurn();
            this.timer = 0;
        }
        let radian = this.node.rotation*Math.PI/180;
        this.node.position = this.node.position.add(cc.v2(Math.sin(radian),Math.cos(radian)));
        cc.log(this.node.rotation);
        cc.log(cc.v2(Math.sin(radian),Math.cos(radian)));
    }

    private initFish():void{
        this.hp = status.stage;
        this.speed = status.stage;
    }

    private rodomTurn(){
        let rodom = Math.random();
        if(rodom<0.2){
            this.node.rotation += 10;
        }else if(rodom<0.3){
            this.node.rotation += 30;
        }else if(rodom>=0.8){
            this.node.rotation -= 10;
        }else if(rodom>=0.7){
            this.node.rotation -=30;
        }
    }


}
