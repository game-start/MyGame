

const {ccclass, property} = cc._decorator;
import commonPool from "../../Common/commonPool";
import status from "./model/gameStatus";
import pools from "./model/pools";

@ccclass
export default class fishCtl extends cc.Component {

    positionOrder:number = 0;
    // LIFE-CYCLE CALLBACKS:
    @property({type:cc.Prefab})
    fish:cc.Prefab = null;

    @property({type:cc.Node})
    fishArea:cc.Node = null;


    onLoad () {
        pools.fishPool = new commonPool(10,this.fish);
    }

    start () {
        this.schedule(this.createSoldier,3,cc.macro.REPEAT_FOREVER,0.1);
    }

    // update (dt) {}

    private createSoldier(){
        let fish = pools.fishPool.get();
        switch (this.positionOrder) {
            case 0:
                fish.x = -status.width/2;
                fish.y = 0.8*(Math.random()-0.5)*status.height;
                fish.rotation = 90;
                fish.scaleX = 1;
                break;
            case 1:
                fish.x = 0.8*(Math.random()-0.5)*status.width;
                fish.y = status.height/2;
                fish.rotation = 180;
                fish.scaleX = 1;
                break;
            case 2:
                fish.x = status.width/2;
                fish.y = 0.8*(Math.random()-0.5)*status.height;
                fish.rotation = -90;
                fish.scaleX = -1;
                break;
        }
        if(this.positionOrder>=2){
            this.positionOrder = 0;
        }else{
            this.positionOrder++;
        }
        fish.parent = this.fishArea;
    }
}
