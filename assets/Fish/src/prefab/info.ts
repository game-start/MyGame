
import convert from "../../../Common/convertPoint";
import status from "../model/gameStatus";

const {ccclass, property} = cc._decorator;

let Size = {
    fish:[100,100]
}

@ccclass
export default class info extends cc.Component {

    @property({type:cc.JsonAsset,tooltip:"精英鱼数据"})
    fishJson: cc.JsonAsset = null;

    infoArea:cc.Node = undefined;
    
    type:number = 0;//1为普通鱼的信息，2为精英鱼的信息

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        // this.infoArea = cc.find("Canvas/infoArea");
        // console.log(/****提示框 */);
        // console.log(this.infoArea);
        // this.node.parent = this.infoArea;
    }

    start () {

    }

    update (dt) {
        this.updateContent();
    }

    updateContent(){
        if(this.type === 1){
            let fishInfo = status.SoldierInfo;
            this.putString("hp","hp:"+status.SoldierInfo["hp"]);
            this.putString("sp","spd:"+status.SoldierInfo["speed"]);
            this.putString("text","普通的鱼");
        }else if(this.type === 2){
            if(status.curBuff){
                let eliteFishInfo = this.fishJson.json[status.curBuff - 1];
                this.putString("hp","hp:"+eliteFishInfo["hp"]);
                this.putString("sp","spd:"+eliteFishInfo["speed"]);
                this.putString("text",eliteFishInfo["text"]);
            }else{
                this.putString("hp","");
                this.putString("sp","");
                this.putString("text","");
            }
        }
    }

    putString(name:string,info:string){
        this.node.getChildByName(name).getComponent(cc.Label).string = info;
    }

    updatePosition(position:cc.Vec2){
        let nodePosition = this.infoArea.convertToNodeSpaceAR(position);
        this.node.setPosition(nodePosition.x,nodePosition.y);
    }

    decideType(type:number){
        this.type = type;
    }

    private resize(width:number,height:number){
        this.node.width = width;
        this.node.height = height;
    }

    reuse(){
        if(!this.infoArea){
            this.infoArea = cc.find("Canvas/infoArea");
        }
        this.node.parent = this.infoArea;
    }
}
