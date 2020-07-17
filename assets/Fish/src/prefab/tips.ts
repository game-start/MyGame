

const {ccclass, property} = cc._decorator;
import pools from "../model/pools";
import status from "../model/gameStatus";

@ccclass
export default class tips extends cc.Component {


    

    onLoad () {

    }

    start () {

    }

    // update (dt) {}
    putText(text:string){
        let Label = this.node.getChildByName("text").getComponent(cc.Label);
        Label.string = text;
    }

    fadeOut(){
        let action = cc.sequence(cc.fadeTo(0.5,0),cc.callFunc(()=>this.hide()));
        this.node.runAction(action);
        //this.node.runAction(cc.fadeOut(1.0));
    }

    hide(){
        this.putText("");
        this.node.opacity = 255;
        status.Tips = undefined;
        pools.tipsPool.put(this.node);
    }

    stopAction(){
        this.node.stopAllActions();
    }

    updateSize(){
        let w = this.node.getChildByName("text").width;
        this.node.getChildByName("bg").width = w;
    }
    
    init(text:string){
        this.putText(text);
        this.scheduleOnce(this.updateSize,0);
        this.fadeOut();
        status.Tips = this.node;
    }
    
    /**
     * @function 当前提示框未完全消失，需要先重置再调用新的提示框
     */
    resetTips(){
        this.stopAction();
        this.hide();
    }

}
