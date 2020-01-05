

const {ccclass, property} = cc._decorator;
import player from "./model/player";
import pools from "./model/pools";

@ccclass
export default class numList extends cc.Component {

    tag:number = 0;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.x = 0
        this.node.y = 0;
    }

    start () {

    }

    update (dt) {
        if(this.node.y<= -this.node.height){
            this.node.y = 0;
            let parent = this.node.parent;
            let nextList = parent.children[this.tag+1];
            if(!nextList){
                nextList = pools.numListPool.get();
                nextList.getComponent("numList").tag = this.tag+1;
                nextList.parent = parent;
            }
            player.addGold(1,this.tag+1);
        }
    }

    reuse(){
        this.node.x = 0
        this.node.y = 0;
    }
}
