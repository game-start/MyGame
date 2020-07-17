import pools from "../model/pools"
const {ccclass, property} = cc._decorator;

@ccclass
export default class cdMask extends cc.Component {

    cd:number = 0;
    passedTime:number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) {
        if(this.cd>0){
            this.passedTime += dt;
            if(this.node.getComponent(cc.Sprite).fillRange<=0){
                this.node.getComponent(cc.Sprite).fillRange = 0;
                this.cd = 0;
                this.passedTime = 0;
                pools.cdMaskPool.put(this.node);
            }else{
                this.node.getComponent(cc.Sprite).fillRange = 1 - this.passedTime/this.cd;
            }
            let laveCd = (this.cd - this.passedTime).toFixed(1);
            this.writeText(`${laveCd}s`);
        }
    }

    unuse(){
        this.node.getComponent(cc.Sprite).fillRange = 1;
        this.writeText("");
    }
    
    startCd(cd:number){
        this.cd = cd;
    }

    writeText(text:string){
        this.node.getChildByName("label").getComponent(cc.Label).string = text;
    }
}
