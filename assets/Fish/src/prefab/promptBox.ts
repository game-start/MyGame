

const {ccclass, property} = cc._decorator;

@ccclass
export default class promptBox extends cc.Component {

    

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
    reuse(){
        //cc.director.pause();
    }

    unuse(){
        //cc.director.resume();
        if(this.node.getChildByName("singleButton").active){
            this.node.getChildByName("singleButton").active = false;
        }
        if(this.node.getChildByName("doubleButton").active){
            this.node.getChildByName("doubleButton").active = false;
        }
    }
}
