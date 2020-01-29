

const {ccclass, property} = cc._decorator;
import fish from "../fish"

@ccclass
export default class speedUp extends cc.Component {

    baseFish:fish;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.baseFish = this.node.getComponent("fish");
        this.baseFish.speed += 0.5;
    }

    start () {

    }

    // update (dt) {}

    onDestroy(){
        this.baseFish.speed -= 0.5;
    }
}
