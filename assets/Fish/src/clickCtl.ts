

const {ccclass, property} = cc._decorator;
import convert from "../../Common/convert";
import player from "./model/player";
import commonPool from "../../Common/commonPool"
import pools from "./model/pools"

@ccclass
export default class clickCtl extends cc.Component {

    @property({type:cc.Node})
    clickArea:cc.Node = null;

    @property({type:cc.Node})
    gun:cc.Node = null;

    @property({type:cc.Prefab})
    bullet:cc.Prefab = null;

    @property({type:cc.Node})
    bulletArea:cc.Node = null;

    onLoad () {
        pools.bulletPool = new commonPool(10,this.bullet);
        let barrel:cc.Node = cc.find("barrel",this.gun);
        player.getIns().init(barrel);
        this.clickArea.on(cc.Node.EventType.TOUCH_START,(event)=>{
            let worldPosition:cc.Vec2 = event.getLocation();
            let clickPosition:cc.Vec2 = convert.worldToNode(worldPosition,this.clickArea);
            cc.log(clickPosition);
            let gunPosition:cc.Vec2 = this.gun.position;
            this.click_start(clickPosition,gunPosition);
        });
    }

    start () {

    }

    // update (dt) {}
    
    private getDir(position1:cc.Vec2,position2:cc.Vec2):cc.Vec2{
        let direction:cc.Vec2 = position1.sub(position2);
        let dir:cc.Vec2 = direction.normalize();
        return dir;
    }

    private attack(position1:cc.Vec2,position2:cc.Vec2):void{
        let dir:cc.Vec2 = this.getDir(position1,position2);
        let rotation:number = Math.atan2(dir.x,dir.y)*180/Math.PI;
        this.gun.rotation = rotation;
        let action1 = cc.moveBy(0.1,0,-35);
        let action2 = cc.moveBy(0.1,0,35);
        let action3 = cc.callFunc(()=>{
            let bullet = pools.bulletPool.get();
            bullet.parent = this.bulletArea;
            let nodePositon = cc.find("launch",this.gun).position;
            bullet.position = convert.nodeToNode(nodePositon,this.gun,this.bulletArea);
            bullet.rotation = rotation;
            bullet.getComponent("bulletCtl").init(dir,1);
        });
        player.getIns().barrel.runAction(cc.sequence(action1,action2,action3));
    }

    private click_start(clickPosition:cc.Vec2,gunPosition:cc.Vec2):void{
        this.attack(clickPosition,gunPosition);  
    }
}
