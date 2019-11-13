import checkerboard from "./checkerboard";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class select extends cc.Component {

    
    @property(checkerboard)
    checkerboard:checkerboard = null;

    canAddChess = false;

    okCount = 0;
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        cc.log(cc.find("white",this.node));
    }

    //update (dt) {}

    onDisable(){
        if(checkerboard.instance.canDown) return;
        let aiArrPosition = checkerboard.instance.getRandomPosition();
        let aiNodeLocation = checkerboard.instance.changeArrayToNode(aiArrPosition);
        checkerboard.instance.addChess(aiArrPosition,aiNodeLocation,checkerboard.Graphics,checkerboard.color);
    }

    public selectBlack():void{
        this.toSmall();
        //this.node.active = false;  
    }

    public selectWhite():void{
        //this.node.active = false;
        checkerboard.instance.canDown = false;
        //this.canAddChess = true;
        this.toSmall();
        // let aiArrPosition = checkerboard.instance.getRandomPosition();
        // let aiNodeLocation = checkerboard.instance.changeArrayToNode(aiArrPosition);
        // checkerboard.instance.addChess(aiArrPosition,aiNodeLocation,checkerboard.Graphics,checkerboard.color);
    }

    private toSmall():void{
        let children:Array<cc.Node> = this.node.children;
        children.forEach((child)=>{cc.tween(child).to(1,{scale:0.1}).call(()=>{this.node.active = false}).start()});
    }
}
