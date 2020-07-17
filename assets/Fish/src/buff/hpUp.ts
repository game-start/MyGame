

const {ccclass, property} = cc._decorator;
import fish from "../prefab/fish";
import status from "../model/gameStatus";

@ccclass
export default class hpUp extends cc.Component {

    baseFish:fish;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.baseFish = this.node.getComponent("fish");
        // this.baseFish.hp += 2;
        // status.SoldierInfo["hp"] = 3;
    }

    start () {

    }

    onEnable(){
        this.baseFish.maxHp += 2;
        this.baseFish.hp += 2;
    }

    onDisable(){
        this.baseFish.maxHp -= 2;
    }

    update (dt) {}

    onDestroy(){
        // this.baseFish.hp = 1;
        // status.SoldierInfo["hp"] = 1;
    }
}
