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
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    // update (dt) {}
    public selectBlack():void{
        this.node.active = false;  
    }

    public selectWhite():void{
        this.node.active = false;
        let aiArrPosition = checkerboard.instance.getRandomPosition();
        let aiNodeLocation = checkerboard.instance.changeArrayToNode(aiArrPosition);
        checkerboard.instance.addChess(aiArrPosition,aiNodeLocation,checkerboard.Graphics,checkerboard.color);
    }
}
