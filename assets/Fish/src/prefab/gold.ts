

const {ccclass, property} = cc._decorator;

@ccclass
export default class gold extends cc.Component {

    
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.node.getComponent(cc.Animation).play();
        //this.goldEndPosition = cc.find("goldFrame",cc.director.getScene().getChildByName("Canvas")).position;
        // let action1 = cc.moveTo(1,0,0);
        // let action2 = cc.scaleTo(1,0);
        // this.node.runAction(cc.spawn(action1,action2));
    }

    start () {
        //this.goldEndPosition = cc.find("goldFrame",cc.director.getScene().getChildByName("Canvas")).position;
    }

    // update (dt) {}
    reuse(){
        this.node.getComponent(cc.Animation).play();
        this.node.scale = 1;
        // let action1 = cc.moveTo(1,this.goldEndPosition);
        // let action2 = cc.scaleTo(1,0);
        // this.node.runAction(cc.spawn(action1,action2));
    }

    unuse(){
        // this.node.stopAllActions();
    }
}
