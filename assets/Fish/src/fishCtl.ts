

const {ccclass, property} = cc._decorator;
import commonPool from "../../Common/commonPool";
import pools from "./model/pools";

@ccclass
export default class fishCtl extends cc.Component {


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
        fish.parent = this.fishArea;
    }
}
