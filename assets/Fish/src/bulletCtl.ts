

const {ccclass, property} = cc._decorator;
import pools from "./model/pools";

@ccclass
export default class bulletCtl extends cc.Component {

    dir:cc.Vec2;
    speed:number;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) {
        this.node.position = this.node.position.add(this.dir.mul(this.speed));
    }

    public init(dir:cc.Vec2,speed:number){
        this.dir = dir;
        this.speed = speed;
    }

    private ruin(){
        if(pools.bulletPool){
            pools.bulletPool.put(this.node);
        }else{
            this.node.destroy();
        }
    }
}
