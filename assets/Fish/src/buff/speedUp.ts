

const {ccclass, property} = cc._decorator;
import fish from "../prefab/fish";
import status from "../model/gameStatus";

@ccclass
export default class speedUp extends cc.Component {

    baseFish:fish;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.baseFish = this.node.getComponent("fish");
        // this.baseFish.unBorderSpeed += 0.5;
        // status.SoldierInfo["speed"] = 1.5;
    }

    start () {

    }

    onEnable(){
        this.baseFish.unBorderSpeed += 1;
    }

    onDisable(){
        this.baseFish.unBorderSpeed -= 1;
    }

    // update (dt) {}

    onDestroy(){
        // this.baseFish.unBorderSpeed -= 0.5;
        // status.SoldierInfo["speed"]  = 1;
    }
}
